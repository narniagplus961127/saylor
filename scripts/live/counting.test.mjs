// Optional live quality checks: consumes free-provider quota through the running local API.
// Excluded from pnpm check; uses fictional, non-sensitive text and never reads credentials.
import test from 'node:test';
import assert from 'node:assert/strict';
let providerFailed = false;
async function processText(transcript, output) {
  assert.ok(!providerFailed, 'An earlier provider failure stopped live requests; explicitly rerun after resolving it.');
  const response = await fetch('http://127.0.0.1:8787/api/process', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(25000),
    headers: { Origin: 'http://127.0.0.1:5173', 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, output })
  });
  if (!response.ok) providerFailed = true;
  assert.equal(response.status, 200, 'Live processing must succeed; do not automatically retry quota failures.');
  const { result } = await response.json();
  assert.equal(typeof result, 'string');
  return result;
}
function assertRestart(result) {
  const compact = result.replace(/[\s,，、.。]/g, '');
  assert.ok(compact.includes('1234567890'), 'Retain the complete replacement sequence.');
  assert.ok(!compact.includes('1231234567890'), 'Remove the superseded counting prefix.');
}
await test('Chinese counting restart replaces the earlier sequence across an English correction marker', async () => {
  assertRestart(await processText('现在是晚上10点31分。我现在数123,sorry,1234567890', 'zh'));
});
await test('counting restart also works without the Chinese translation pass', async () => {
  assertRestart(await processText('我现在数123,sorry,1234567890', 'original'));
});
await test('Malay keeps the counting statement while removing the abandoned count', async () => {
  const result = await processText('Nama saya Amir. Sekarang pukul 10.32 malam. Sekarang saya mengira 1, 2, 3, 4. Sorry, 1, 2, 3, 4, 5, 6, 7, 8.', 'ms');
  assert.match(result, /mengira|menghitung|kira/i);
  assert.match(result, /Amir/);
  assert.match(result, /10[.:]32/);
  assert.ok(!result.replace(/[\s,，、.。]/g, '').includes('123412345678'));
});
await test('a genuine quoted apology does not erase surrounding numbers', async () => {
  const result = await processText('订单123和订单456都要保留。他说“sorry”，这是道歉，不是更正订单。', 'zh');
  assert.match(result, /123/); assert.match(result, /456/);
});
await test('Chinese source becomes English with its corrected appointment and negation', async () => {
  const result = await processText('明天下午三点，不对，四点在吉隆坡见。不要取消会议。', 'en');
  assert.match(result, /4|four/i); assert.doesNotMatch(result, /3\s*(?:pm|p\.m\.)|three/i);
  assert.match(result, /Kuala Lumpur/i); assert.match(result, /(?:not|don't|never).*cancel/i);
  assert.doesNotMatch(result, /[\u3400-\u9fff]/);
});
