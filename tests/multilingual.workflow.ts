import { test, expect } from '@playwright/test';

function recording(amplitudes: number[], seconds = 5, gap = 0.4) {
  const samples: number[] = [];
  amplitudes.forEach((amplitude, index) => {
    for (let i = 0; i < seconds * 16000; i++) samples.push(i % 2 ? amplitude : -amplitude);
    if (index < amplitudes.length - 1) for (let i = 0; i < gap * 16000; i++) samples.push(0);
  });
  const bytes = Buffer.alloc(44 + samples.length * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(16000, 24); bytes.writeUInt32LE(32000, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => bytes.writeInt16LE(sample, 44 + index * 2));
  return bytes;
}

test('mixed-language recording preserves all original segments in order through the local API', async ({ request, baseURL }) => {
  const response = await request.post('/api/transcribe', { headers: { Origin: baseURL!, 'Content-Type': 'audio/wav' }, data: recording([4000, 8000, 12000]) });
  expect(response.ok()).toBeTruthy();
  const { transcript } = await response.json();
  expect(transcript).toBe('嗯，明天三点，不对，四点见。\nJumpa pukul tiga, maaf pukul empat.\n明天 meeting kita pukul tiga. Do not cancel order 42.');
  const processed = await request.post('/api/process', { headers: { Origin: baseURL! }, data: { transcript, output: 'original' } });
  expect(processed.ok()).toBeTruthy();
  expect((await processed.json()).result).toBe('明天四点见。\nJumpa pukul empat.\n明天 meeting kita pukul tiga. Do not cancel order 42.');
});

test('quiet valid recording reaches transcription while digital silence is rejected', async ({ request, baseURL }) => {
  const headers = { Origin: baseURL!, 'Content-Type': 'audio/wav' };
  const quiet = await request.post('/api/transcribe', { headers, data: recording([20]) });
  expect(quiet.ok()).toBeTruthy();
  expect((await quiet.json()).transcript).toBe('Quiet speech is still speech.');
  const silent = await request.post('/api/transcribe', { headers, data: recording([0]) });
  expect(silent.status()).toBe(422);
  expect((await silent.json()).error.code).toBe('no_speech');
});

for (const volume of [1, 0.1]) test(`quiet speech inside an utterance keeps its context at volume ${volume}`, async ({ request, baseURL }) => {
  await request.get(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || '9997'}/scenario?language=soft-span`);
  try {
    const loud = recording([4000 * volume], 4), soft = recording([100 * volume], 0.4);
    const bytes = Buffer.concat([loud, soft.subarray(44), loud.subarray(44)]);
    bytes.writeUInt32LE(bytes.length - 8, 4); bytes.writeUInt32LE(bytes.length - 44, 40);
    const response = await request.post('/api/transcribe', { headers: { Origin: baseURL!, 'Content-Type': 'audio/wav' }, data: bytes });
    expect(response.ok()).toBeTruthy();
    expect((await response.json()).transcript).toBe('The quiet middle span kept both surrounding words.');
  } finally { await request.get(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || '9997'}/scenario`); }
});

for (const [language, original, result] of [
  ['Mandarin', '嗯，明天三点，不对，四点见。', '明天四点见。'],
  ['Malay', 'Jumpa pukul tiga, maaf pukul empat.', 'Jumpa pukul empat.'],
  ['mixed', '明天 meeting kita pukul tiga. Do not cancel order 42.', '明天 meeting kita pukul tiga. Do not cancel order 42.']
]) {
  test(`${language} recording displays the original and editable result separately`, async ({ page, request }) => {
    await request.get(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || '9997'}/scenario?language=${language}`);
    try {
      await page.goto('/');
      await page.getByRole('button', { name: 'Start recording' }).click();
      await expect(page.getByText('Recording', { exact: true })).toBeVisible();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: 'Stop recording' }).click();
      await expect(page.getByLabel('Original transcription')).toHaveValue(original);
      await expect(page.getByLabel('Your result')).toHaveValue(result);
      await page.getByLabel('Your result').fill(`${result}\nReviewed`);
      await expect(page.getByLabel('Original transcription')).toHaveValue(original);
    } finally { await request.get(`http://127.0.0.1:${process.env.FAKE_GROQ_PORT || '9997'}/scenario`); }
  });
}
