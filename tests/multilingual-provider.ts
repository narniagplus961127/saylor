import { createServer } from 'node:http';
let language = '';
// Synthetic tones encode controlled provider responses; this checks orchestration,
// not speech recognition quality. Multi-tone uploads intentionally fail.
createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  res.setHeader('Content-Type', 'application/json');
  if (req.url?.startsWith('/scenario')) {
    language = new URL(req.url, 'http://127.0.0.1').searchParams.get('language') || '';
    res.end('{}'); return;
  }
  if (req.url === '/openai/v1/audio/transcriptions') {
    const form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': req.headers['content-type']! } }).formData();
    if (form.has('language')) { res.statusCode = 400; res.end('{}'); return; }
    const file = form.get('file') as File;
    const wav = new DataView(await file.arrayBuffer());
    const identities = new Set<number>();
    for (let i = 44; i + 1 < wav.byteLength; i += 2) {
      const sample = Math.abs(wav.getInt16(i, true));
      if (sample > 1000) identities.add(Math.round(sample / 4000));
    }
    if (!language && identities.size > 1) { res.statusCode = 400; res.end('{}'); return; }
    const id = language === 'Mandarin' ? 1 : language === 'Malay' ? 2 : language === 'mixed' ? 3 : [...identities][0];
    const text = id === undefined ? 'Quiet speech is still speech.' : id === 1 ? '嗯，明天三点，不对，四点见。' : id === 2 ? 'Jumpa pukul tiga, maaf pukul empat.' : '明天 meeting kita pukul tiga. Do not cancel order 42.';
    res.end(JSON.stringify({ text }));
  } else if (req.url === '/openai/v1/chat/completions') {
    const input = JSON.parse(Buffer.concat(chunks).toString()).messages.at(-1).content as string;
    const result = input.replace('嗯，明天三点，不对，四点见。', '明天四点见。').replace('Jumpa pukul tiga, maaf pukul empat.', 'Jumpa pukul empat.');
    res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: result } }] }));
  } else { res.statusCode = 404; res.end('{}'); }
}).listen(Number(process.env.FAKE_GROQ_PORT || 9997), '127.0.0.1');
