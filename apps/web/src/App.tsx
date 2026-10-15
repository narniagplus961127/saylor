import { useEffect, useRef, useState } from 'react';
import { ApiError, transcribe, processText } from './api.js';
import { startRecorder, type Recording } from './recorder.js';
import type { OutputChoice } from '@saylor/contracts';
type Stage = 'idle' | 'permission' | 'recording' | 'transcribing' | 'cleaning' | 'translating' | 'ready' | 'error';
const labels: Record<Stage, string> = { idle: 'Ready when you are', permission: 'Waiting for microphone permission', recording: 'Recording', transcribing: 'Transcribing', cleaning: 'Cleaning', translating: 'Translating', ready: 'Ready to review', error: 'Needs your attention' };
function savedOutput(): OutputChoice {
  try { const saved = localStorage.getItem('saylor.output'); return saved === 'en' || saved === 'zh' || saved === 'ms' ? saved : 'original'; } catch { return 'original'; }
}
export function App() {
  const [stage, setStage] = useState<Stage>('idle');
  const [seconds, setSeconds] = useState(0), [transcript, setTranscript] = useState(''), [result, setResult] = useState('');
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [output, setOutput] = useState<OutputChoice>(savedOutput), [generatedResult, setGeneratedResult] = useState('');
  const pendingOutput = useRef<OutputChoice>('original');
  function chooseOutput(value: OutputChoice) {
    if (value === output || busy.current || Date.now() < retryAt) return;
    if (transcript && !regenerate(value)) return;
    setOutput(value); try { localStorage.setItem('saylor.output', value); } catch { /* Preference storage is optional. */ }
  }
  const [failedStage, setFailedStage] = useState<'transcription' | 'text' | null>(null);
  const [retryAt, setRetryAt] = useState(0), [now, setNow] = useState(Date.now());
  const pendingAudio = useRef<Blob | null>(null), pendingText = useRef(''), editVersion = useRef(0);
  const recording = useRef<Recording | null>(null), busy = useRef(false), attempt = useRef(0), request = useRef<AbortController | null>(null);
  const busyStage = stage === 'permission' || stage === 'transcribing' || stage === 'cleaning' || stage === 'translating';
  useEffect(() => {
    const dispose = () => { attempt.current++; pendingAudio.current = null; pendingText.current = ''; recording.current?.cancel(); recording.current = null; request.current?.abort(); };
    window.addEventListener('pagehide', dispose);
    return () => { dispose(); window.removeEventListener('pagehide', dispose); };
  }, []);
  useEffect(() => { if (!retryAt) return; const timer = window.setInterval(() => setNow(Date.now()), 250); return () => clearInterval(timer); }, [retryAt]);
  useEffect(() => {
    if (stage !== 'recording') return;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - start) / 1000; setSeconds(Math.min(60, Math.floor(elapsed)));
      if (elapsed >= 60) void stop();
    }, 100);
    return () => clearInterval(timer);
  }, [stage]);
  async function start() {
    if (busy.current || Date.now() < retryAt) return; busy.current = true;
    pendingAudio.current = null; pendingText.current = ''; setFailedStage(null); setRetryAt(0);
    const id = ++attempt.current; setError(''); setNotice(''); setSeconds(0); setStage('permission');
    try {
      const capture = await startRecorder();
      if (id !== attempt.current) { capture.cancel(); return; }
      recording.current = capture; setStage('recording');
    } catch (cause) { if (id !== attempt.current) return; setError(cause instanceof DOMException && cause.name === 'NotAllowedError' ? 'Microphone access was denied. Allow microphone access in your browser, then try again.' : cause instanceof DOMException && cause.name === 'NotFoundError' ? 'No microphone was found. Connect a microphone and try again.' : cause instanceof DOMException && cause.name === 'NotReadableError' ? 'Your microphone is unavailable. Close other apps using it and try again.' : cause instanceof Error ? cause.message : 'Could not start recording.'); setStage('error'); busy.current = false; }
  }
  async function stop() {
    const capture = recording.current; if (!capture) return; recording.current = null;
    const id = attempt.current;
    setStage('transcribing');
    try {
      const wav = await capture.stop();
      if (id !== attempt.current) return;
      pendingAudio.current = wav; pendingOutput.current = output;
      await run('transcription', id);
    } catch (cause) { if (id === attempt.current) { fail(cause, null); busy.current = false; } }
  }
  function fail(cause: unknown, failed: 'transcription' | 'text' | null) {
    setError(cause instanceof Error ? cause.message : 'Processing failed. Please try again.');
    const detail = cause instanceof ApiError ? cause.detail : undefined;
    const retryable = !detail || !['invalid_input', 'no_speech', 'forbidden', 'configuration'].includes(detail.code);
    if (!retryable) pendingAudio.current = null;
    setFailedStage(retryable ? failed : null); setRetryAt(detail?.retryAfter ? Date.now() + detail.retryAfter * 1000 : 0); setNow(Date.now()); setStage('error');
  }
  async function run(from: 'transcription' | 'text', id: number) {
    const controller = new AbortController(); request.current = controller;
    let failed = from; const version = editVersion.current;
    setError(''); setNotice(''); setFailedStage(null);
    try {
      if (from === 'transcription') {
        setStage('transcribing');
        const original = await transcribe(pendingAudio.current!, controller.signal);
        if (id !== attempt.current) return;
        pendingAudio.current = null; pendingText.current = original.transcript; setTranscript(original.transcript);
      }
      failed = 'text'; setStage(pendingOutput.current === 'original' ? 'cleaning' : 'translating');
      const cleaned = await processText({ transcript: pendingText.current, output: pendingOutput.current }, controller.signal);
      if (id !== attempt.current) return;
      if (version === editVersion.current) { setResult(cleaned.result); setGeneratedResult(cleaned.result); }
      else setNotice('Your edits were preserved. Retry generation when ready.');
      pendingAudio.current = null; setStage('ready');
    } catch (cause) { if (id === attempt.current) fail(cause, failed); }
    finally { if (id === attempt.current) { busy.current = false; request.current = null; } }
  }
  function regenerate(target: OutputChoice = output): boolean {
    if (busy.current || !transcript || Date.now() < retryAt) return false;
    if (result !== generatedResult && !window.confirm('Generating a new result will replace your manual edits. Continue?')) return false;
    pendingAudio.current = null; pendingText.current = transcript; pendingOutput.current = target;
    busy.current = true; void run('text', ++attempt.current);
    return true;
  }
  function retry() { if (busy.current || !failedStage || Date.now() < retryAt) return; if (failedStage === 'text' && result !== generatedResult && !window.confirm('Retry text processing will replace your manual edits. Continue?')) return; busy.current = true; void run(failedStage, ++attempt.current); }
  function cancel() { attempt.current++; request.current?.abort(); request.current = null; pendingAudio.current = null; pendingText.current = ''; recording.current?.cancel(); recording.current = null; busy.current = false; setFailedStage(null); setError(''); setStage(transcript || result ? 'ready' : 'idle'); setSeconds(0); setNotice('Recording discarded.'); }
  async function copy() { try { await navigator.clipboard.writeText(result); setNotice('Copied to clipboard.'); } catch { setNotice('Copy failed. Select the result and copy it manually.'); } }
  return <main>
    <header className="topbar"><a className="brand" href="/" aria-label="SayLor home"><span className="brand-icon">〰</span> SayLor</a><span className="local-badge"><span /> Personal workspace</span></header>
    <section className="intro"><p className="eyebrow">A LITTLE LESS TYPING. A LITTLE MORE YOU.</p><h1>Speak naturally.<br /><em>Make it yours.</em></h1><p className="subtitle">Your thoughts, turned into clear writing.<br />Record a moment. Review the words. Keep your voice.</p></section>
    <section className="recorder" aria-label="Voice recording">
      <div className={`record-symbol ${stage === 'recording' ? 'active' : ''}`} aria-hidden="true"><svg viewBox="0 0 32 32"><rect x="12" y="4" width="8" height="16" rx="4"/><path d="M8 15v2a8 8 0 0 0 16 0v-2M16 25v4M11 29h10"/></svg></div>
      <div className="record-status"><p role="status" aria-live="polite">{labels[stage]}</p><span>{stage === 'recording' ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} / 01:00` : busyStage ? 'One moment, your words are on their way.' : 'Up to 60 seconds · Your microphone, your control'}</span></div>
      <div className="record-controls">{stage === 'recording' ? <><button className="secondary" onClick={cancel}>Cancel recording</button><button className="primary stop" onClick={() => void stop()}>Stop recording</button></> : <button className="primary" disabled={busyStage || now < retryAt} onClick={() => void start()}>{busyStage ? 'Processing…' : 'Start recording'}<span aria-hidden="true"> ↗</span></button>}</div>
    </section>
    {busyStage && <button className="secondary" onClick={cancel}>Cancel processing</button>}
    {error && <div className="error"><p role="alert">{error}</p>{failedStage && <button onClick={retry} disabled={busyStage || now < retryAt}>Retry {failedStage === 'text' ? 'text processing' : 'transcription'}</button>}{now < retryAt && <p>Retry available in {Math.ceil((retryAt - now) / 1000)} seconds.</p>}<button onClick={cancel}>Discard failed attempt</button></div>}
    <div className="output-controls"><div><label htmlFor="output-language">Output language</label><select id="output-language" value={output} disabled={busyStage || stage === 'recording' || now < retryAt} onChange={event => chooseOutput(event.target.value as OutputChoice)}><option value="original">Keep original languages</option><option value="en">English</option><option value="zh">Simplified Chinese</option><option value="ms">Malay</option></select></div><p>Choose a language to translate your words.</p><button className="secondary" disabled={!transcript || busyStage || stage === 'recording' || now < retryAt} onClick={() => void regenerate()}>Generate again</button></div>
    <div className="workspace">
      <section className="text-panel original"><div className="panel-header"><label htmlFor="original">Original transcription</label><span>AS YOU SAID IT</span></div><textarea id="original" aria-label="Original transcription" readOnly value={transcript} placeholder="Your spoken words will appear here…" /><p className="panel-note">A reference to help you review.</p></section>
      <section className="text-panel result"><div className="panel-header"><label htmlFor="result">Your result</label><span>LIGHTLY POLISHED</span></div><textarea id="result" aria-label="Your result" value={result} onChange={event => { editVersion.current++; setResult(event.target.value); setNotice(''); }} placeholder="A little clearer. Still entirely you." disabled={busyStage} /><div className="result-footer"><span>Make any edits before copying.</span><button className="copy" disabled={!result || busyStage} onClick={() => void copy()}>Copy result <span aria-hidden="true">⧉</span></button></div></section>
    </div>
    <p className="notice" role="status" aria-live="polite">{notice}</p>
    <footer><span className="privacy-icon" aria-hidden="true">◇</span> No saved history. Audio is sent to your configured AI provider after Stop.<span className="footer-right">Speak. Review. Carry on.</span></footer>
  </main>;
}
