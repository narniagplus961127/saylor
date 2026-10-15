import { test, expect } from '@playwright/test';

test('output selection is explicit, protects edits, and regenerates from the original transcription', async ({ page }) => {
  await page.goto('/');
  const output = page.getByLabel('Output language');
  await expect(output).toHaveValue('original');
  await page.getByRole('button', { name: 'Start recording' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  const submissions: unknown[] = [];
  page.on('request', request => { if (request.url().endsWith('/api/process')) submissions.push(request.postDataJSON()); });
  await page.getByLabel('Your result').fill('My private edit.');
  await output.selectOption('zh');
  await page.waitForTimeout(150);
  expect(submissions).toEqual([]);
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Generate again' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('My private edit.');
  expect(submissions).toEqual([]);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Generate again' }).click();
  await expect(page.getByText('Translating', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Your result')).toHaveValue('星期五三点发送报告。');
  expect(submissions).toEqual([{ transcript: 'Um, send the report Thursday, sorry, Friday at three.', output: 'zh' }]);
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await page.getByLabel('Your result').fill('星期五四点发送报告。');
  await page.getByRole('button', { name: 'Copy result' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('星期五四点发送报告。');
  await page.reload();
  await expect(output).toHaveValue('zh');
  await expect(page.getByLabel('Original transcription')).toHaveValue('');
  await expect(page.getByLabel('Your result')).toHaveValue('');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({ 'saylor.output': 'zh' });
});

test('all output choices reach the local API and failed regeneration retains the previous text', async ({ page, request }) => {
  await page.goto('/');
  await page.getByLabel('Output language').selectOption('en');
  await page.getByRole('button', { name: 'Start recording' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  for (const [output, expected] of [['ms', 'Hantar laporan pada hari Jumaat pukul tiga.'], ['original', 'Send the report Friday at three.'], ['en', 'Send the report Friday at three.']]) {
    await page.getByLabel('Output language').selectOption(output);
    await page.getByRole('button', { name: 'Generate again' }).click();
    await expect(page.getByText('Ready to review', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Your result')).toHaveValue(expected);
  }
  await page.getByLabel('Your result').fill('My carefully edited report.');
  await request.post(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || 9897}/fail-next`);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Generate again' }).click();
  await expect(page.getByRole('alert')).toContainText('could not complete');
  await expect(page.getByLabel('Your result')).toHaveValue('My carefully edited report.');
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await page.getByRole('button', { name: 'Copy result' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('My carefully edited report.');
});

test('unsupported output choices fail safely at the public API', async ({ page }) => {
  await page.goto('/');
  const response = await page.evaluate(async () => {
    const response = await fetch('/api/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: 'Hello', output: 'fr' }) });
    return { status: response.status, body: await response.json() };
  });
  expect(response).toEqual({ status: 400, body: { error: { code: 'invalid_input', message: 'Provide a transcription and supported output choice.' } } });
});
