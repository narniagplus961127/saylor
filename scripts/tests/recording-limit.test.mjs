import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('hosted recording allowance admits 20 shared submissions, blocks before the provider and resets after an hour', () => {
  const code = `
    import assert from 'node:assert/strict';
    let time = Date.UTC(2026, 9, 16, 12);
    Date.now = () => time;
    Object.assign(process.env, { VERCEL: '1', GROQ_API_KEY: 'test-only-key', VERCEL_URL: 'saylor.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'saylor.vercel.app' });
    delete process.env.SAYLOR_WEB_ORIGIN;
    const { default: handler } = await import('./api/[route].ts');
    const { createRecordingLimit } = await import('./apps/api/src/recording-limit.ts');
    const origin = 'https://saylor.vercel.app';
    const wav = Buffer.alloc(32044);
    wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(16000, 24); wav.writeUInt32LE(32000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
    wav.write('data', 36); wav.writeUInt32LE(32000, 40);
    for (let i = 44; i < wav.length; i += 2) wav.writeInt16LE(500, i);
    let audioCalls = 0, textCalls = 0, failNext = false;
    globalThis.fetch = async url => {
      if (url.endsWith('/audio/transcriptions')) {
        audioCalls++;
        if (failNext) { failNext = false; return Response.json({}, { status: 503 }); }
        return Response.json({ text: 'Hello.' });
      }
      assert.ok(url.endsWith('/chat/completions'));
      textCalls++;
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: 'Hello.' } }] });
    };
    const record = (ip = '192.0.2.1', body = wav, from = origin) => handler.fetch(new Request(origin + '/api/transcribe', {
      method: 'POST', headers: { origin: from, 'content-type': 'audio/wav', 'x-forwarded-for': ip, 'x-vercel-forwarded-for': ip }, body
    }));
    // Invalid requests do not reserve slots, even at a window boundary.
    for (let i = 0; i < 25; i++) assert.equal((await record('192.0.2.1', Buffer.from('invalid'))).status, 400);
    const silence = Buffer.from(wav); silence.fill(0, 44);
    assert.equal((await record('192.0.2.1', silence)).status, 422);
    assert.equal((await record('192.0.2.1', wav, '')).status, 403);
    assert.equal((await record('192.0.2.1', wav, 'https://unrelated.example')).status, 403);
    assert.equal(audioCalls, 0);
    const responses = await Promise.all(Array.from({ length: 25 }, (_, i) => record('192.0.2.' + (i + 1))));
    assert.equal(responses.filter(r => r.status === 200).length, 20);
    assert.equal(responses.filter(r => r.status === 429).length, 5);
    assert.equal(audioCalls, 20);
    const denied = responses.find(r => r.status === 429);
    assert.equal(denied.headers.get('retry-after'), '3600');
    assert.equal(denied.headers.get('cache-control'), 'no-store');
    const error = await denied.json();
    assert.equal(error.error.code, 'recording_limit');
    assert.equal(error.error.retryAfter, 3600);
    assert.match(error.error.message, /shared 20-recording/);
    assert.ok(!JSON.stringify(error).includes('test-only-key'));
    const text = await handler.fetch(new Request(origin + '/api/process', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ transcript: 'Hello.', output: 'en' }) }));
    assert.equal(text.status, 200); assert.equal(textCalls, 1);
    assert.equal((await handler.fetch(new Request(origin + '/api/health'))).status, 200);
    time += 3_599_999;
    assert.equal((await record()).headers.get('retry-after'), '1');
    time++;
    assert.equal((await record('192.0.2.1', Buffer.from('invalid'))).status, 400);
    time += 1_800_000;
    // A new valid submission, not the invalid request, starts the next hour.
    failNext = true;
    assert.equal((await record()).status, 502);
    for (let i = 0; i < 19; i++) assert.equal((await record()).status, 200);
    assert.equal((await record()).status, 429);
    assert.equal(audioCalls, 40); // The failed provider attempt also consumes one slot.
    time += 1_800_000;
    assert.equal((await record()).status, 429);
    time += 1_800_000;
    assert.equal((await record()).status, 200);
    assert.equal(audioCalls, 41);
    const segmented = Buffer.alloc(44 + 9 * 32000);
    wav.copy(segmented, 0, 0, 44);
    segmented.writeUInt32LE(segmented.length - 8, 4); segmented.writeUInt32LE(segmented.length - 44, 40);
    for (let i = 0; i < 9 * 16000; i++) segmented.writeInt16LE(i >= 4.2 * 16000 && i < 4.8 * 16000 ? 0 : 500, 44 + i * 2);
    time += 3_600_000;
    for (let i = 0; i < 20; i++) assert.equal((await record('192.0.2.1', segmented)).status, 200);
    assert.equal(audioCalls, 81); // Two provider segments per recording, one recording slot.
    assert.equal((await record()).status, 429);
    assert.equal(audioCalls, 81);
    // Different function instances have independent best-effort allowances.
    const first = createRecordingLimit(() => time), second = createRecordingLimit(() => time);
    for (let i = 0; i < 20; i++) { first(); second(); }
    assert.throws(first, error => error.code === 'recording_limit');
    assert.throws(second, error => error.code === 'recording_limit');
    createRecordingLimit(() => time)(); // A restart starts with an empty counter.
  `;
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], { encoding: 'utf8', timeout: 20000, env: { ...process.env, NODE_ENV: 'test', GROQ_API_KEY: 'test-only-key' } });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
