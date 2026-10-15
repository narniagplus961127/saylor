import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// Exercise the public Web Request/Response function entry in an isolated process.
// Only fetch to the external AI provider is controlled; no live requests or credentials.
test('hosted function fails closed, trusts exact configured addresses and keeps provider configuration server-only', () => {
  const code = `
    import assert from 'node:assert/strict';
    const { default: handler } = await import('./api/[route].ts');
    const configNames = ['SAYLOR_WEB_ORIGIN', 'VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL', 'GROQ_API_KEY', 'GROQ_BASE_URL', 'VERCEL'];
    const good = { VERCEL: '1', GROQ_API_KEY: 'test-only-key', VERCEL_URL: 'saylor-preview.vercel.app', VERCEL_PROJECT_PRODUCTION_URL: 'saylor.vercel.app' };
    const invoke = async (env, url, init) => {
      for (const name of configNames) delete process.env[name];
      Object.assign(process.env, env);
      return handler.fetch(new Request(url, init));
    };
    const address = 'https://saylor-preview.vercel.app';
    for (const env of [{}, { ...good, GROQ_API_KEY: '' }, { ...good, VERCEL_URL: '', VERCEL_PROJECT_PRODUCTION_URL: '' }, { ...good, SAYLOR_WEB_ORIGIN: 'https://*.vercel.app' }, { ...good, SAYLOR_WEB_ORIGIN: 'http://127.0.0.1:5773' }, { ...good, SAYLOR_WEB_ORIGIN: 'https://saylor.example/path' }, { ...good, VERCEL_URL: 'saylor.example@evil.example' }]) {
      const r = await invoke(env, address + '/api/health');
      assert.equal(r.status, 503); assert.equal(r.headers.get('cache-control'), 'no-store');
      const text = await r.text(); assert.ok(!text.includes('test-only-key')); assert.ok(!text.includes('evil.example'));
    }
    for (const host of ['saylor-preview.vercel.app', 'saylor.vercel.app']) {
      const r = await invoke(good, 'https://' + host + '/api/health');
      assert.equal(r.status, 200); assert.equal((await r.json()).status, 'ok');
    }
    const other = await invoke(good, 'https://unrelated.vercel.app/api/health', { headers: { 'x-forwarded-host': 'saylor.vercel.app' } });
    assert.equal(other.status, 403);
    const spoofed = await invoke(good, address + '/api/health', { headers: { host: 'unrelated.vercel.app' } });
    assert.equal(spoofed.status, 403);
    const crossAlias = await invoke(good, address + '/api/process', { method: 'POST', headers: { Origin: 'https://saylor.vercel.app', 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: 'Hello.', output: 'en' }) });
    assert.equal(crossAlias.status, 403);
    let providerCalls = 0;
    globalThis.fetch = async (url, init) => {
      providerCalls++;
      assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
      assert.equal(init.headers.Authorization, 'Bearer test-only-key');
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: 'Hello.' } }] });
    };
    const r = await invoke({ ...good, GROQ_BASE_URL: 'https://untrusted-provider.example' }, address + '/api/process', { method: 'POST', headers: { Origin: address, 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: 'Hello.', output: 'en' }) });
    assert.equal(r.status, 200); assert.equal(providerCalls, 1);
    const text = await r.text(); assert.equal(JSON.parse(text).result, 'Hello.'); assert.ok(!text.includes('test-only-key'));
  `;
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], { encoding: 'utf8', timeout: 20000, env: { ...process.env, GROQ_API_KEY: 'test-only-key', NODE_ENV: 'test' } });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
