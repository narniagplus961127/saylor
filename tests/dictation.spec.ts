import { test, expect } from '@playwright/test';
test('dictation captures audio without browser call-processing effects', async ({ page }) => {
  await page.addInitScript(() => {
    const get = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      const stream = await get(constraints);
      (window as typeof window & { captureSettings?: MediaTrackSettings }).captureSettings = stream.getAudioTracks()[0].getSettings();
      return stream;
    };
  });
  await page.goto('/'); await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('button', { name: 'Stop recording' })).toBeVisible();
  const settings = await page.evaluate(() => (window as typeof window & { captureSettings?: MediaTrackSettings }).captureSettings);
  expect(settings?.echoCancellation).toBe(false);
  expect(settings?.noiseSuppression).toBe(false);
  expect(settings?.autoGainControl).toBe(false);
  await page.getByRole('button', { name: 'Cancel recording' }).click();
});
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

test('Cancel discards capture without submitting audio', async ({ page }) => {
  const submitted: string[] = [];
  page.on('request', request => { if (request.url().includes('/api/transcribe')) submitted.push(request.url()); });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByText('Recording', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel recording' }).click();
  await expect(page.getByText('Recording discarded.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeEnabled();
  expect(submitted).toHaveLength(0);
});

test('the recording cap follows the normal Stop workflow', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByText('Recording', { exact: true })).toBeVisible();
  // Native microphone capture is real time; only the application clock is accelerated.
  await page.waitForTimeout(1200);
  await page.clock.fastForward(60_100);
  await expect(page.getByLabel('Original transcription')).toHaveValue('Um, send the report Thursday, sorry, Friday at three.');
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeEnabled();
});

test('the local API rejects another origin and invalid audio without exposing configuration', async ({ request, baseURL }) => {
  const rejected = await request.post('/api/process', { headers: { Origin: 'https://another.example' }, data: { transcript: 'Hello.', output: 'original' } });
  expect(rejected.status()).toBe(403);
  expect((await rejected.json()).error.code).toBe('forbidden');
  const invalid = await request.post('/api/transcribe', { headers: { Origin: baseURL!, 'Content-Type': 'audio/wav' }, data: Buffer.from('not a WAV') });
  expect(invalid.status()).toBe(400);
  expect((await invalid.json()).error.code).toBe('invalid_input');
  expect(await invalid.text()).not.toContain('test-only-key');
  expect(invalid.headers()['cache-control']).toBe('no-store');
});
