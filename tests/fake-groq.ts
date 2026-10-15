import { createServer } from 'node:http';
let mode = '', transcriptions = 0, generations = 0;
createServer(async (req, res) => {
  let body = ''; for await (const chunk of req) { if (req.url === '/control' || req.url === '/openai/v1/chat/completions') body += chunk; }
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/control') { mode = JSON.parse(body || '{}').mode || ''; transcriptions = 0; generations = 0; res.end('{}'); return; }
  if (req.url === '/counts') { res.end(JSON.stringify({ transcriptions, generations })); return; }
  const audio = req.url === '/openai/v1/audio/transcriptions';
  if (audio) transcriptions++; else generations++;
  if (mode === 'network') { req.socket.destroy(); return; }
  if (mode === 'timeout') { await new Promise(resolve => setTimeout(resolve, 21000)); res.end('{}'); return; }
  await new Promise(resolve => setTimeout(resolve, mode === 'slow' ? 3000 : 900));
  if ((audio && mode === 'audio-failure') || (!audio && mode === 'text-failure')) { res.statusCode = 503; res.end('{}'); return; }
  if (mode === 'quota') { res.statusCode = 429; res.setHeader('Retry-After', '3'); res.end('{}'); return; }
  if (audio) res.end(JSON.stringify({ text: mode === 'no-speech' ? '' : 'Um, send the report Thursday, sorry, Friday at three.' }));
  else if (req.url === '/openai/v1/chat/completions') {
    const instructions = JSON.parse(body).messages[0].content as string;
    const content = instructions.includes('target language: Simplified Chinese') ? '星期五三点发送报告。' : instructions.includes('target language: Malay') ? 'Hantar laporan pada hari Jumaat pukul tiga.' : 'Send the report Friday at three.';
    res.end(JSON.stringify({ choices: [{ message: { content } }] }));
  }
  else { res.statusCode = 404; res.end('{}'); }
}).listen(Number(process.env.FAKE_GROQ_PORT || 9797), '127.0.0.1');
