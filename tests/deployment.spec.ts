import { test, expect } from '@playwright/test';

test('built web app records, translates and recovers through the hosted function entry without a local API server', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
  await page.getByRole('button', { name: 'Start recording' }).click(); await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  await page.getByLabel('Output language').selectOption('ms');
  await expect(page.getByLabel('Your result')).toHaveValue('Hantar laporan pada hari Jumaat pukul tiga.');
  await page.getByLabel('Your result').fill('Keep my reviewed wording.');
  const submissions: string[] = [];
  page.on('request', req => { if (/\/api\/(process|transcribe)$/.test(req.url())) submissions.push(req.url().split('/').at(-1)!); });
  await request.post(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || 10397}/fail-next`);
  page.once('dialog', dialog => dialog.accept());
  await page.getByLabel('Output language').selectOption('en');
  await expect(page.getByRole('alert')).toContainText('could not complete');
  await expect(page.getByLabel('Your result')).toHaveValue('Keep my reviewed wording.');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Retry text processing' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  expect(submissions).toEqual(['process', 'process']);
});

test('hosted function rejects other origins, missing origin and invalid uploads with safe errors', async ({ request, baseURL }) => {
  for (const origin of ['https://another.vercel.app', 'null', '']) {
    const response = await request.post('/api/process', { headers: origin ? { Origin: origin } : {}, data: { transcript: 'Hello.', output: 'en' } });
    expect(response.status()).toBe(403);
    expect((await response.json()).error.code).toBe('forbidden');
  }
  const response = await request.post('/api/transcribe', { headers: { Origin: baseURL!, 'Content-Type': 'audio/wav' }, data: Buffer.from('invalid') });
  expect(response.status()).toBe(400);
  expect(response.headers()['cache-control']).toBe('no-store');
  expect(await response.text()).not.toContain('test-only-key');
  const invalid = await request.post('/api/process', { headers: { Origin: baseURL! }, data: { transcript: 'Hello.', output: 'unsupported' } });
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error.code).toBe('invalid_input');
});
