import { createServer } from 'node:http';
let failNext = false, failAfter = 0, generations = 0, chineseSource = false;
createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/source-chinese') { chineseSource = true; res.end('{}'); return; }
  if (req.url === '/source-default') { chineseSource = false; res.end('{}'); return; }
  if (req.url === '/fail-next') { failNext = true; res.end('{}'); return; }
  if (req.url === '/fail-after-draft') { failAfter = 2; res.end('{}'); return; }
  if (req.url === '/reset-counts') { generations = 0; res.end('{}'); return; }
  if (req.url === '/counts') { res.end(JSON.stringify({ generations })); return; }
  await new Promise(resolve => setTimeout(resolve, 400));
  if (req.url === '/openai/v1/audio/transcriptions') res.end(JSON.stringify({ text: chineseSource ? '明天下午三点，不对，四点在吉隆坡见。不要取消会议。' : 'Um, send the report Thursday, sorry, Friday at three.' }));
  else if (req.url === '/openai/v1/chat/completions') {
    generations++;
    if (failAfter && --failAfter === 0) { res.statusCode = 503; res.end('{}'); return; }
    if (failNext) { failNext = false; res.statusCode = 503; res.end('{}'); return; }
    const body = JSON.parse(Buffer.concat(chunks).toString());
    const instructions = body.messages[0].content as string;
    const input = body.messages.at(-1).content as string;
    if (input.includes('吉隆坡')) {
      const content = instructions.includes('target language: English') ? 'Meet in Kuala Lumpur tomorrow at 4 pm. Do not cancel the meeting.' : '明天下午四点在吉隆坡见。不要取消会议。';
      res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content } }] })); return;
    }
    if (input.includes('Afrika Barat') || input.includes('West Africa')) {
      const content = instructions.includes('target language: English') ? 'I am not sure whether goods from West Africa arrive tomorrow.' : input.includes('West Africa') ? '我不确定来自西非的货物是否明天到达。' : '我不确定来自非洲的货物是否明天到达。';
      res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content } }] })); return;
    }
    if (input.includes('郝玥')) { res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: '郝玥明天下午四点见，费用42令吉。不要取消。' } }] })); return; }
    const content = instructions.includes('Simplified Chinese') ? '星期五三点发送报告。' : instructions.includes('target language: Malay') ? 'Hantar laporan pada hari Jumaat pukul tiga.' : 'Send the report Friday at three.';
    res.end(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content } }] }));
  } else { res.statusCode = 404; res.end('{}'); }
}).listen(Number(process.env.FAKE_GROQ_PORT || 9897), '127.0.0.1');
