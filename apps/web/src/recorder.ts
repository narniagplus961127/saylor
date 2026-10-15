export interface Recording { stop(): Promise<Blob>; cancel(): void; }
export async function startRecorder(): Promise<Recording> {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('This browser cannot record audio. Open SayLor in a current Chrome or Edge browser.');
  // Preserve the dictation signal; voice-call processing distorted language switches in replay.
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  let recorder: MediaRecorder;
  try { recorder = new MediaRecorder(stream); } catch (error) { stream.getTracks().forEach(track => track.stop()); throw error; }
  let chunks: Blob[] = [], discarded = false;
  const release = () => stream.getTracks().forEach(track => track.stop());
  const ended = new Promise<Blob>((resolve, reject) => {
    recorder.ondataavailable = event => { if (!discarded && event.data.size) chunks.push(event.data); };
    recorder.onerror = () => { discarded = true; chunks = []; release(); reject(new Error('Recording failed. Please try again.')); };
    recorder.onstop = () => { release(); const blob = new Blob(chunks, { type: recorder.mimeType }); chunks = []; resolve(blob); };
  });
  // Attach rejection handling before the user stops to avoid an unhandled recorder error.
  void ended.catch(() => undefined);
  try { recorder.start(); } catch (error) { discarded = true; chunks = []; release(); throw error; }
  return {
    async stop() { if (recorder.state !== 'inactive') recorder.stop(); release(); return normalize(await ended); },
    cancel() { discarded = true; chunks = []; if (recorder.state !== 'inactive') recorder.stop(); release(); }
  };
}
async function normalize(blob: Blob): Promise<Blob> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    if (decoded.duration > 60.25) throw new Error('Recording exceeded 60 seconds. Please record a shorter clip.');
    // MediaRecorder can flush a final codec frame beyond the cap. Limit capture output to 60 seconds.
    const length = Math.min(Math.ceil(decoded.duration * 16000), 960000);
    if (length < 160) throw new Error('The recording was too short. Try speaking for a little longer.');
    const offline = new OfflineAudioContext(1, length, 16000);
    const source = offline.createBufferSource(); source.buffer = decoded; source.connect(offline.destination); source.start();
    const pcm = (await offline.startRendering()).getChannelData(0);
    const buffer = new ArrayBuffer(44 + pcm.length * 2), view = new DataView(buffer);
    const tag = (offset: number, text: string) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
    tag(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); tag(8, 'WAVE'); tag(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, 16000, true); view.setUint32(28, 32000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    tag(36, 'data'); view.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) { const sample = Math.max(-1, Math.min(1, pcm[i])); view.setInt16(44 + i * 2, Math.round(sample * (sample < 0 ? 32768 : 32767)), true); }
    return new Blob([buffer], { type: 'audio/wav' });
  } finally { await context.close(); }
}
