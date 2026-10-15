import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir, open, rename, unlink } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const choices = { 'Keep original languages': 'original', English: 'en', 'Simplified Chinese': 'zh', Malay: 'ms' };
const safeHeaders = ['retry-after', 'x-ratelimit-limit-requests', 'x-ratelimit-remaining-requests', 'x-ratelimit-reset-requests', 'x-ratelimit-limit-tokens', 'x-ratelimit-remaining-tokens', 'x-ratelimit-reset-tokens'];
class EvaluationError extends Error {}
const help = `Usage: pnpm evaluate --run <name> [--count 1..5] [--dry-run] [--retry-failed]
  --manifest <file>   Frozen JSON references (default: .scratch/saylor/evaluation-manifest.json)
  --audio-dir <dir>   Local WAV files (default: .scratch/saylor/private/evaluation)
  --api <url>         Loopback API (default: http://127.0.0.1:8787)
  --origin <url>      Frontend origin (default: http://127.0.0.1:5173)
Outputs stay under .scratch/saylor/private/runs/<name>/. Reusing a run resumes it.
An explicit --retry-failed retries only its failed stage. No automatic retries.
Dry run validates all source hashes without network requests or result writes.`;

function parse(args) {
  const options = { count: 5, manifest: '.scratch/saylor/evaluation-manifest.json', 'audio-dir': '.scratch/saylor/private/evaluation', api: 'http://127.0.0.1:8787', origin: 'http://127.0.0.1:5173' };
  for (let i = 0; i < args.length; i++) {
    const name = args[i].replace(/^--/, '');
    if (!args[i].startsWith('--')) throw new EvaluationError('Use named options; see --help.');
    if (['dry-run', 'retry-failed'].includes(name)) options[name] = true;
    else if (['run', 'count', 'manifest', 'audio-dir', 'api', 'origin'].includes(name) && args[i + 1] && !args[i + 1].startsWith('--')) options[name] = args[++i];
    else throw new EvaluationError('Unknown or missing option; see --help.');
  }
  options.count = Number(options.count);
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(options.run ?? '')) throw new EvaluationError('Supply --run with a simple name (letters, numbers, underscores, hyphens).');
  if (!Number.isInteger(options.count) || options.count < 1 || options.count > 5) throw new EvaluationError('--count must be 1 through 5.');
  for (const name of ['api', 'origin']) {
    const url = new URL(options[name]);
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new EvaluationError('API and origin must be plain HTTP 127.0.0.1 origins.');
    options[name] = url.origin;
  }
  return options;
}

function within(parent, path) {
  const result = resolve(parent, path);
  if (!result.startsWith(resolve(parent) + sep)) throw new EvaluationError('File path escapes its directory.');
  return result;
}

// Accept the frozen FLEURS float32 format and the app's canonical PCM16 format.
function pcm16(source) {
  const invalid = () => Error('Expected a bounded mono 16 kHz float32 or PCM16 WAV.');
  if (source.length < 44 || source.length > 3_840_256 || source.toString('ascii', 0, 4) !== 'RIFF' || source.toString('ascii', 8, 12) !== 'WAVE' || source.readUInt32LE(4) + 8 !== source.length) throw invalid();
  let format, data;
  for (let offset = 12; offset + 8 <= source.length;) {
    const name = source.toString('ascii', offset, offset + 4), size = source.readUInt32LE(offset + 4), end = offset + 8 + size;
    if (end > source.length) throw invalid();
    if (name === 'fmt ') {
      if (format || size < 16) throw invalid();
      format = { code: source.readUInt16LE(offset + 8), channels: source.readUInt16LE(offset + 10), rate: source.readUInt32LE(offset + 12), bits: source.readUInt16LE(offset + 22) };
    }
    if (name === 'data') { if (data) throw invalid(); data = source.subarray(offset + 8, end); }
    offset = end + size % 2;
  }
  if (!format || !data || format.channels !== 1 || format.rate !== 16000 || !((format.code === 3 && format.bits === 32) || (format.code === 1 && format.bits === 16))) throw invalid();
  const width = format.bits / 8, samples = data.length / width;
  if (!Number.isInteger(samples) || samples < 160 || samples > 960000) throw invalid();
  const pcm = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) {
    if (width === 2) pcm.writeInt16LE(data.readInt16LE(i * 2), i * 2);
    else {
      const sample = data.readFloatLE(i * 4);
      if (!Number.isFinite(sample)) throw invalid();
      pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), i * 2);
    }
  }
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(pcm.length + 36, 4); header.write('WAVE', 8); header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22); header.writeUInt32LE(16000, 24);
  header.writeUInt32LE(32000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function main() {
  if (process.argv.includes('--help')) { console.log(help); return; }
  const options = parse(process.argv.slice(2));
  const manifestBytes = await readFile(resolve(root, options.manifest));
  const manifest = JSON.parse(manifestBytes);
  if (!Array.isArray(manifest) || !manifest.length) throw new EvaluationError('Manifest must contain reference cases.');
  const ids = new Set(), cases = [];
  for (const item of manifest) {
    if (!Number.isInteger(item.number) || ids.has(item.number) || !/^[a-f0-9]{64}$/i.test(item.sha256 ?? '') || !choices[item.suggestedOutput] || typeof item.file !== 'string' || !['transcript', 'expectedMeaning', 'criticalChecks'].every(key => typeof item[key] === 'string' && item[key].trim())) throw new EvaluationError('Invalid or duplicate manifest case.');
    ids.add(item.number);
    const source = await readFile(within(resolve(root, options['audio-dir']), item.file));
    if (hash(source) !== item.sha256.toLowerCase()) throw new EvaluationError('Frozen source hash mismatch; no requests sent.');
    const wav = pcm16(source);
    cases.push({ reference: item, wav, evaluatedSha256: hash(wav) });
  }
  if (options['dry-run']) { console.log(`Validated ${cases.length} frozen recordings; no requests sent.`); return; }
  const configFiles = ['apps/api/src/groq.ts', 'apps/api/src/wav.ts', 'apps/api/src/app.ts', 'scripts/evaluate.mjs'];
  const sourceHashes = Object.fromEntries(await Promise.all(configFiles.map(async name => [name, hash(await readFile(resolve(root, name)))])));
  const providerSource = await readFile(resolve(root, 'apps/api/src/groq.ts'), 'utf8');
  const sourceModels = [...providerSource.matchAll(/(?:set\('model',\s*|model:\s*)'([^']+)'/g)].map(match => match[1]);
  const configuration = { api: options.api, origin: options.origin, manifestSha256: hash(manifestBytes), sourceModels, sourceHashes };
  const directory = within(resolve(root, '.scratch/saylor/private/runs'), options.run);
  await mkdir(directory, { recursive: true });
  let lock;
  try { lock = await open(resolve(directory, 'run.lock'), 'wx'); } catch { throw new EvaluationError('Run is locked. Check for another evaluator before removing a stale run.lock.'); }
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }) + '\n');
    const path = resolve(directory, 'report.json');
    let report;
    try { report = JSON.parse(await readFile(path, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw new EvaluationError('Existing report cannot be read; refusing to overwrite.'); }
    if (report && JSON.stringify(report.configuration) !== JSON.stringify(configuration)) throw new EvaluationError('Frozen manifest or application configuration changed. Use a new run name.');
    report ??= { version: 1, run: options.run, createdAt: new Date().toISOString(), gitCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), configuration, timingScope: 'Local API only; excludes browser Stop-to-visible-result latency.', acceptance: 'Pending human semantic review; HTTP success is not quality acceptance.', cases: [] };
    const save = async () => { report.updatedAt = new Date().toISOString(); await writeFile(path + '.tmp', JSON.stringify(report, null, 2) + '\n'); await rename(path + '.tmp', path); };
    let completed = 0;
    for (const item of cases) {
      let record = report.cases.find(value => value.number === item.reference.number);
      if (record?.state === 'inference_complete') continue;
      if (completed >= options.count) break;
      if (record?.state === 'failed' && !options['retry-failed']) throw new EvaluationError('Run stopped at a failed case. Use --retry-failed for an explicit stage retry.');
      if (record?.notBefore && Date.now() < Date.parse(record.notBefore)) throw new EvaluationError('Saved retry guidance has not expired; no requests sent.');
      if (!record) {
        record = { number: item.reference.number, reference: item.reference, output: choices[item.reference.suggestedOutput], evaluatedSha256: item.evaluatedSha256, state: 'pending', attempts: [], review: { transcription: null, final: null, criticalErrors: [], notes: '' } };
        report.cases.push(record);
      }
      const stage = record.transcript ? 'process' : 'transcribe';
      record.state = 'pending'; await save();
      for (const operation of stage === 'process' ? ['process'] : ['transcribe', 'process']) {
        const attempt = { stage: operation, startedAt: new Date().toISOString() };
        const start = performance.now();
        record.attempts.push(attempt); await save();
        try {
          const response = await fetch(`${options.api}/api/${operation}`, { method: 'POST', headers: { Origin: options.origin, 'Content-Type': operation === 'transcribe' ? 'audio/wav' : 'application/json' }, body: operation === 'transcribe' ? item.wav : JSON.stringify({ transcript: record.transcript, output: record.output }), signal: AbortSignal.timeout(65000), redirect: 'error' });
          attempt.status = response.status;
          attempt.rateLimits = Object.fromEntries(safeHeaders.flatMap(name => response.headers.has(name) ? [[name, response.headers.get(name).slice(0, 128)]] : []));
          const retry = attempt.rateLimits['retry-after'];
          const wait = retry && (Number.isFinite(Number(retry)) ? Number(retry) * 1000 : Date.parse(retry) - Date.now());
          if (wait > 0) record.notBefore = new Date(Date.now() + wait).toISOString();
          if (!response.ok) throw new EvaluationError('http');
          const data = await response.json();
          const field = operation === 'transcribe' ? 'transcript' : 'result';
          if (typeof data[field] !== 'string' || !data[field].trim()) throw new EvaluationError('invalid_response');
          record[field] = data[field];
        } catch {
          attempt.failure = attempt.status && attempt.status !== 200 ? 'http_error' : 'network_timeout_or_invalid_response';
          record.state = 'failed'; record.stopReason = `${operation}:${attempt.failure}`;
        } finally { attempt.ms = Math.round(performance.now() - start); await save(); }
        if (record.state === 'failed') {
          console.log(`Case ${record.number}: stopped at ${operation}; status ${attempt.status ?? 'unavailable'}. Progress saved privately. No automatic retry.`);
          process.exitCode = 2; return;
        }
      }
      record.state = 'inference_complete'; delete record.stopReason; delete record.notBefore; await save(); completed++;
      console.log(`Case ${record.number}: inference complete; human review pending.`);
    }
    console.log(`Saved private report for ${options.run}. ${completed} cases completed this invocation.`);
  } finally { await lock.close(); await unlink(resolve(directory, 'run.lock')); }
}

main().catch(error => { console.error(error instanceof EvaluationError ? error.message : 'Evaluation stopped: input/report file could not be read or parsed. Check paths and file permissions; see --help.'); process.exitCode = 1; });
