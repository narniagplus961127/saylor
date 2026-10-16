const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createProtocolHandler, API_ORIGIN } = require('../protocol.cjs');

test('desktop proxy allows only bounded same-origin API operations and forwards no credentials/cookies', async () => {
  const calls = [];
  const handler = createProtocolHandler(__dirname, API_ORIGIN, async (url, init) => {
    calls.push({ url, init }); return Response.json({ error: { code: 'recording_limit', retryAfter: 12 } }, { status: 429, headers: { 'Retry-After': '12', 'x-secret': 'hidden' } });
  });
  const post = (url, origin, body = '{}') => handler(new Request(url, { method: 'POST', headers: { origin, cookie: 'never-forward', authorization: 'never-forward', 'content-type': 'application/json' }, body }));
  assert.equal((await post('app://saylor/api/process', 'https://evil.example')).status, 403);
  assert.equal((await post('app://other/api/process', 'app://saylor')).status, 403);
  assert.equal((await post('app://saylor/api/unknown', 'app://saylor')).status, 404);
  assert.equal((await post('app://saylor/api/process', 'app://saylor', 'x'.repeat(100001))).status, 413);
  assert.equal(calls.length, 0);
  const response = await post('app://saylor/api/process', 'app://saylor');
  assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '12'); assert.equal(response.headers.get('x-secret'), null);
  assert.equal(calls[0].url, API_ORIGIN + '/api/process');
  assert.deepEqual(calls[0].init.headers, { Origin: API_ORIGIN, 'Content-Type': 'application/json' });
  assert.equal(calls[0].init.redirect, 'error');
});
test('bundled UI is served with a restrictive CSP, paths cannot escape the bundle, and failures are safe', async () => {
  const handler = createProtocolHandler(path.resolve(__dirname, '..'));
  const response = await handler(new Request('app://saylor/preload.cjs'));
  assert.equal(response.status, 200); assert.match(response.headers.get('content-security-policy'), /frame-src 'none'/);
  assert.equal((await handler(new Request('file:///private'))).status, 403);
  assert.equal((await handler(new Request('app://saylor/%2e%2e%5cpackage.json'))).status, 403);
  const offline = createProtocolHandler(__dirname, API_ORIGIN, async () => { throw Error('secret transport details'); });
  const failure = await offline(new Request('app://saylor/api/process', { method: 'POST', headers: { origin: 'app://saylor' }, body: '{}' }));
  assert.equal(failure.status, 503); assert.ok(!(await failure.text()).includes('secret transport'));
});
