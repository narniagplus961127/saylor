import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const temporaryRoot = resolve(root, '.scratch/saylor/private/tool-tests');
async function removePrivate(path) {
  assert.ok(resolve(path).startsWith(resolve(root, '.scratch/saylor/private') + sep));
  await rm(path, { recursive: true, force: true });
}
function cli(script, args, cwd = root, extraEnv = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [resolve(root, script), ...args], { cwd, env: { ...process.env, GROQ_API_KEY: 'test-only-key', ...extraEnv } });
    let output = '';
    child.stdout.on('data', value => { output += value; }); child.stderr.on('data', value => { output += value; });
    child.on('error', reject); child.on('close', code => resolveResult({ code, output }));
  });
}
async function evaluation(t) {
  await mkdir(temporaryRoot, { recursive: true });
  const directory = await mkdtemp(resolve(temporaryRoot, 'run-'));
  const run = `test-${randomUUID()}`;
  const resultDirectory = resolve(root, '.scratch/saylor/private/runs', run);
  t.after(async () => { await removePrivate(directory); await removePrivate(resultDirectory); });
  // Independently specified, one-second canonical PCM WAV fixture.
  const bytes = Buffer.alloc(32044);
  bytes.write('RIFF'); bytes.writeUInt32LE(32036, 4); bytes.write('WAVE', 8); bytes.write('fmt ', 12); bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(16000, 24); bytes.writeUInt32LE(32000, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(32000, 40);
  for (let offset = 44; offset < bytes.length; offset += 2) bytes.writeInt16LE(offset % 4 ? 400 : -400, offset);
  await writeFile(resolve(directory, 'speech.wav'), bytes);
  const manifest = [{ number: 1, file: 'speech.wav', sha256: createHash('sha256').update(bytes).digest('hex'), transcript: 'Reference, not model output.', expectedMeaning: 'Keep this reference frozen.', criticalChecks: 'Preserve meaning.', suggestedOutput: 'English' }];
  const manifestPath = resolve(directory, 'manifest.json'); await writeFile(manifestPath, JSON.stringify(manifest));
  const counts = { transcribe: 0, process: 0 }; let quota = true;
  const server = createServer(async (request, response) => {
    for await (const chunk of request) { /* Drain upload, never log payloads. */ }
    response.setHeader('Content-Type', 'application/json');
    if (request.url === '/api/transcribe') { counts.transcribe++; response.end(JSON.stringify({ transcript: 'Recognized speech.' })); }
    else if (request.url === '/api/process') {
      counts.process++;
      if (quota) { response.statusCode = 429; response.setHeader('Retry-After', '0'); response.setHeader('x-ratelimit-remaining-requests', '0'); response.setHeader('x-secret', 'never-copy'); response.end('{}'); }
      else response.end(JSON.stringify({ result: 'Completed result.' }));
    } else { response.statusCode = 404; response.end('{}'); }
  });
  await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
  t.after(() => new Promise(resolveClosed => { server.closeAllConnections(); server.close(resolveClosed); }));
  const args = ['--run', run, '--manifest', manifestPath, '--audio-dir', directory, '--api', `http://127.0.0.1:${server.address().port}`];
  return { directory, run, args, manifest, manifestPath, counts, resultDirectory, allow: () => { quota = false; }, report: () => readFile(resolve(resultDirectory, 'report.json'), 'utf8').then(JSON.parse) };
}

test('evaluation saves quota progress, requires explicit retry, and resumes only failed text stage', async t => {
  const fixture = await evaluation(t);
  const first = await cli('scripts/evaluate.mjs', fixture.args);
  assert.equal(first.code, 2, first.output);
  assert.deepEqual(fixture.counts, { transcribe: 1, process: 1 });
  let report = await fixture.report();
  assert.equal(report.cases[0].state, 'failed');
  assert.equal(report.cases[0].reference.transcript, 'Reference, not model output.');
  assert.equal(report.cases[0].attempts[1].rateLimits['x-ratelimit-remaining-requests'], '0');
  assert.equal(report.cases[0].attempts[1].rateLimits['x-secret'], undefined);
  report.cases[0].review.notes = 'Human note must survive retry.';
  await writeFile(resolve(fixture.resultDirectory, 'report.json'), JSON.stringify(report));
  fixture.allow();
  assert.equal((await cli('scripts/evaluate.mjs', fixture.args)).code, 1);
  assert.deepEqual(fixture.counts, { transcribe: 1, process: 1 });
  report.cases[0].notBefore = new Date(Date.now() + 60000).toISOString();
  await writeFile(resolve(fixture.resultDirectory, 'report.json'), JSON.stringify(report));
  assert.equal((await cli('scripts/evaluate.mjs', [...fixture.args, '--retry-failed'])).code, 1);
  assert.deepEqual(fixture.counts, { transcribe: 1, process: 1 });
  delete report.cases[0].notBefore;
  await writeFile(resolve(fixture.resultDirectory, 'report.json'), JSON.stringify(report));
  assert.equal((await cli('scripts/evaluate.mjs', [...fixture.args, '--retry-failed'])).code, 0);
  assert.deepEqual(fixture.counts, { transcribe: 1, process: 2 });
  report = await fixture.report();
  assert.equal(report.cases[0].result, 'Completed result.');
  assert.equal(report.cases[0].review.final, null);
  assert.equal(report.cases[0].review.notes, 'Human note must survive retry.');
  assert.equal((await cli('scripts/evaluate.mjs', fixture.args)).code, 0);
  assert.deepEqual(fixture.counts, { transcribe: 1, process: 2 });
  assert.ok(!first.output.includes('Recognized speech.'));
});

test('evaluation validates frozen bytes offline and rejects changed references and overlapping runs', async t => {
  const fixture = await evaluation(t);
  assert.equal((await cli('scripts/evaluate.mjs', [...fixture.args, '--dry-run'])).code, 0);
  assert.equal((await cli('scripts/evaluate.mjs', [...fixture.args, '--api', 'https://example.com'])).code, 1);
  assert.deepEqual(fixture.counts, { transcribe: 0, process: 0 });
  await mkdir(fixture.resultDirectory, { recursive: true }); await writeFile(resolve(fixture.resultDirectory, 'run.lock'), '');
  assert.equal((await cli('scripts/evaluate.mjs', fixture.args)).code, 1);
  await rm(resolve(fixture.resultDirectory, 'run.lock'));
  fixture.allow(); assert.equal((await cli('scripts/evaluate.mjs', fixture.args)).code, 0);
  fixture.manifest[0].expectedMeaning = 'Changed reference'; await writeFile(fixture.manifestPath, JSON.stringify(fixture.manifest));
  assert.equal((await cli('scripts/evaluate.mjs', fixture.args)).code, 1);
  assert.deepEqual(fixture.counts, { transcribe: 1, process: 1 });
  await writeFile(resolve(fixture.directory, 'speech.wav'), 'altered bytes');
  assert.equal((await cli('scripts/evaluate.mjs', [...fixture.args, '--dry-run'])).code, 1);
});

test('credential scan detects an untracked key and built-asset leaks without printing values', async t => {
  await mkdir(temporaryRoot, { recursive: true }); const directory = await mkdtemp(resolve(temporaryRoot, 'scan-')); t.after(() => removePrivate(directory));
  execFileSync('git', ['init', '--quiet'], { cwd: directory });
  const token = 'gsk_' + 'a'.repeat(48);
  await writeFile(resolve(directory, 'leak.txt'), token);
  const leaked = await cli('scripts/check-secrets.mjs', [], directory);
  assert.equal(leaked.code, 1); assert.ok(leaked.output.includes('leak.txt')); assert.ok(!leaked.output.includes(token));
  await rm(resolve(directory, 'leak.txt')); await mkdir(resolve(directory, 'apps/web/dist'), { recursive: true });
  await writeFile(resolve(directory, 'apps/web/dist/app.js'), 'not-a-pattern-but-a-known-secret');
  const built = await cli('scripts/check-secrets.mjs', ['--build'], directory, { GROQ_API_KEY: 'not-a-pattern-but-a-known-secret' });
  assert.equal(built.code, 1); assert.ok(!built.output.includes('not-a-pattern-but-a-known-secret'));
  await writeFile(resolve(directory, 'apps/web/dist/app.js'), 'safe browser content');
  assert.equal((await cli('scripts/check-secrets.mjs', ['--build'], directory)).code, 0);
});
