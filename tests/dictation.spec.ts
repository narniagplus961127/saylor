import { test, expect } from '@playwright/test';
test('dictation goes from explicit recording to an editable result and copies only the current edit', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Speak naturally. Make it yours.' })).toBeVisible();
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByText('Recording', { exact: true })).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.getByText('Transcribing', { exact: true })).toBeVisible();
  await expect(page.getByText('Cleaning', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  await page.getByLabel('Your result').fill('Send the report Friday at four.');
  await page.getByRole('button', { name: 'Copy result' }).click();
  await expect(page.getByText('Copied to clipboard.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('Send the report Friday at four.');
  await page.reload();
  await expect(page.getByLabel('Your result')).toHaveValue('');
});
