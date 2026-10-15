import { test, expect } from '@playwright/test';
test('quota diagnostics expose only safe retry metadata through the local API', async ({ request, baseURL }) => {
  await request.post(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || 10097}/control`, { data: { mode: 'quota' } });
  const response = await request.post('/api/process', { headers: { Origin: baseURL! }, data: { transcript: 'Non-sensitive text.', output: 'original' } });
  expect(response.status()).toBe(429);
  expect(response.headers()['retry-after']).toBe('3');
  expect(response.headers()['x-ratelimit-remaining-requests']).toBe('0');
  expect(response.headers()['x-ratelimit-reset-requests']).toBe('3s');
  expect(response.headers()['x-provider-secret']).toBeUndefined();
  expect(await response.text()).not.toContain('test-only-key');
});
const provider = `http://127.0.0.1:${process.env.FAKE_GROQ_PORT || 9797}`;
async function record(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Start recording' }).click();
  await page.waitForTimeout(1100);
  await page.getByRole('button', { name: 'Stop recording' }).click();
}
test('text processing retry preserves transcription and manual edits without repeating transcription', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: {} });
  await page.goto('/'); await record(page);
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  await page.getByLabel('Your result').fill('My manual edit.');
  await request.post(`${provider}/control`, { data: { mode: 'text-failure' } });
  await record(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByLabel('Your result')).toHaveValue('My manual edit.');
  page.once('dialog', dialog => dialog.accept());
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await request.post(`${provider}/control`, { data: {} });
  await page.getByRole('button', { name: 'Retry text processing' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 0, generations: 1 });
});
test('failed transcription is retried explicitly from memory, quota waits, and discarded clips cannot be retried', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: { mode: 'quota' } });
  await page.goto('/'); await record(page);
  await expect(page.getByRole('alert')).toContainText('free service limit');
  await expect(page.getByRole('button', { name: 'Retry transcription' })).toBeDisabled();
  await page.waitForTimeout(1200);
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 1, generations: 0 });
  await request.post(`${provider}/control`, { data: {} });
  await expect(page.getByRole('button', { name: 'Retry transcription' })).toBeEnabled();
  await page.getByRole('button', { name: 'Retry transcription' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 1, generations: 1 });
  await expect(page.getByRole('button', { name: 'Retry transcription' })).toHaveCount(0);
  await request.post(`${provider}/control`, { data: { mode: 'audio-failure' } });
  await record(page); await expect(page.getByRole('button', { name: 'Retry transcription' })).toBeVisible();
  await page.getByRole('button', { name: 'Discard failed attempt' }).click();
  await expect(page.getByRole('button', { name: 'Retry transcription' })).toHaveCount(0);
  await page.reload(); await expect(page.getByRole('button', { name: 'Retry transcription' })).toHaveCount(0);
});
test('capture failures explain permission and device recovery', async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError'); }; });
  await page.goto('/'); await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('alert')).toContainText('Allow microphone access');
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeEnabled();
});
test('an unavailable microphone explains how to recover', async ({ page }) => {
  await page.addInitScript(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Missing', 'NotFoundError'); }; });
  await page.goto('/'); await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('alert')).toContainText('Connect a microphone');
});
for (const [mode, message, retry] of [['no-speech', 'No speech', false], ['audio-failure', 'could not complete', true], ['network', 'could not be reached', true], ['timeout', 'took too long', true]] as const) {
  test(`${mode} fails clearly without generating text or automatic retries`, async ({ page, request }) => {
    test.setTimeout(45000);
    await request.post(`${provider}/control`, { data: { mode } });
    await page.goto('/'); await record(page);
    await expect(page.getByRole('alert')).toContainText(message, { timeout: 25000 });
    await expect(page.getByLabel('Your result')).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Retry transcription' })).toHaveCount(retry ? 1 : 0);
    await page.waitForTimeout(1100);
    expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 1, generations: 0 });
  });
}
test('invalid and oversized recordings are rejected by the local API before any provider request', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: {} }); await page.goto('/');
  for (const size of [10, 1920045]) {
    const failure = await page.evaluate(async bytes => {
      const response = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'audio/wav' }, body: new Uint8Array(bytes) }).catch(error => { throw new Error('Upload bytes ' + bytes + ': ' + error.message); });
      return { ok: response.ok, data: await response.json() };
    }, size);
    expect(failure.ok).toBe(false); expect(failure.data.error.code).toBe('invalid_input');
  }
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 0, generations: 0 });
});
test('cancelled in-flight processing cannot overwrite newer manual work and duplicate stop clicks submit once', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: { mode: 'slow' } }); await page.goto('/');
  await page.getByRole('button', { name: 'Start recording' }).click(); await page.waitForTimeout(1100);
  await page.getByRole('button', { name: 'Stop recording' }).evaluate(button => { (button as HTMLButtonElement).click(); (button as HTMLButtonElement).click(); });
  await expect(page.getByText('Transcribing', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel processing' }).click();
  await page.getByLabel('Your result').fill('Keep my manual work.');
  await page.waitForTimeout(6500);
  await expect(page.getByLabel('Your result')).toHaveValue('Keep my manual work.');
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 1, generations: 0 });
});
test('failed translation retries its selected output even when the preference changes', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: { mode: 'text-failure' } });
  await page.goto('/'); await page.getByLabel('Output language').selectOption('zh'); await record(page);
  await expect(page.getByRole('button', { name: 'Retry text processing' })).toBeVisible();
  await page.getByLabel('Output language').selectOption('ms');
  await request.post(`${provider}/control`, { data: {} });
  await page.getByRole('button', { name: 'Retry text processing' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('星期五三点发送报告。');
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 0, generations: 2 });
});


test('text retry warns before replacing edits made after failed regeneration', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: {} }); await page.goto('/'); await record(page);
  await request.post(`${provider}/control`, { data: { mode: 'text-failure' } });
  await page.getByRole('button', { name: 'Generate again' }).click();
  await expect(page.getByRole('button', { name: 'Retry text processing' })).toBeVisible();
  await page.getByLabel('Your result').fill('Keep these later edits.');
  await request.post(`${provider}/control`, { data: {} });
  let warned = false;
  page.once('dialog', async dialog => { warned = true; await dialog.dismiss(); });
  await page.getByRole('button', { name: 'Retry text processing' }).click();
  expect(warned).toBe(true);
  await expect(page.getByLabel('Your result')).toHaveValue('Keep these later edits.');
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 0, generations: 0 });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Retry text processing' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
});
test('truncated provider output is a retryable text failure and cannot replace useful work', async ({ page, request }) => {
  await request.post(`${provider}/control`, { data: {} }); await page.goto('/'); await record(page);
  await page.getByLabel('Your result').fill('Preserve this completed edit.');
  await request.post(`${provider}/control`, { data: { mode: 'truncated-text' } });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Generate again' }).click();
  await expect(page.getByRole('alert')).toContainText('incomplete');
  await expect(page.getByLabel('Your result')).toHaveValue('Preserve this completed edit.');
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await request.post(`${provider}/control`, { data: {} });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Retry text processing' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  expect(await (await request.get(`${provider}/counts`)).json()).toEqual({ transcriptions: 0, generations: 1 });
});
