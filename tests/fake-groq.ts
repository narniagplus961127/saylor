import { createServer } from 'node:http';
createServer(async (req, res) => {
  for await (const _chunk of req) { /* Consume uploads without saving sensitive material. */ }
  await new Promise(resolve => setTimeout(resolve, 900));
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/openai/v1/audio/transcriptions') res.end(JSON.stringify({ text: 'Um, send the report Thursday, sorry, Friday at three.' }));
  else if (req.url === '/openai/v1/chat/completions') res.end(JSON.stringify({ choices: [{ message: { content: 'Send the report Friday at three.' } }] }));
  else { res.statusCode = 404; res.end('{}'); }
}).listen(Number(process.env.FAKE_GROQ_PORT || 9797), '127.0.0.1');
