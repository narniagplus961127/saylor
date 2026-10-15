import { createServer } from 'node:http';
let failNext = false;
createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/fail-next') { failNext = true; res.end('{}'); return; }
  await new Promise(resolve => setTimeout(resolve, 400));
  if (req.url === '/openai/v1/audio/transcriptions') res.end(JSON.stringify({ text: 'Um, send the report Thursday, sorry, Friday at three.' }));
  else if (req.url === '/openai/v1/chat/completions') {
    if (failNext) { failNext = false; res.statusCode = 503; res.end('{}'); return; }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const instructions = body.messages[0].content as string;
    const content = instructions.includes('Simplified Chinese') ? '星期五三点发送报告。' : instructions.includes('target language: Malay') ? 'Hantar laporan pada hari Jumaat pukul tiga.' : 'Send the report Friday at three.';
    res.end(JSON.stringify({ choices: [{ message: { content } }] }));
  } else { res.statusCode = 404; res.end('{}'); }
}).listen(Number(process.env.FAKE_GROQ_PORT || 9897), '127.0.0.1');
