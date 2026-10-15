import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { ProcessRequest } from '@saylor/contracts';
import { AppError } from './errors.js';
import type { Provider } from './groq.js';
import { MAX_AUDIO_BYTES, readWav } from './wav.js';

export function createApp(provider: Provider, webPort = 5173, apiPort = 8787) {
  const app = new Hono();
  app.use('/api/*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    c.header('X-Content-Type-Options', 'nosniff');
    if (![ `127.0.0.1:${apiPort}`, `127.0.0.1:${webPort}` ].includes(c.req.header('host') ?? '')) throw new AppError('forbidden', 'Local requests only.', 403);
    if (c.req.method !== 'GET' && c.req.header('origin') !== `http://127.0.0.1:${webPort}`) throw new AppError('forbidden', `Open SayLor at http://127.0.0.1:${webPort}.`, 403);
    await next();
  });
  app.get('/api/health', c => c.json({ status: 'ok' }));
  app.use('/api/transcribe', bodyLimit({ maxSize: MAX_AUDIO_BYTES, onError: () => { throw new AppError('invalid_input', 'Recording is too large. The limit is 60 seconds.', 413); } }));
  app.post('/api/transcribe', async c => {
    if (c.req.header('content-type')?.split(';')[0] !== 'audio/wav') throw new AppError('invalid_input', 'The recording must be WAV audio.');
    const audio = readWav(new Uint8Array(await c.req.arrayBuffer()));
    return c.json({ transcript: await provider.transcribe(audio.bytes) });
  });
  app.use('/api/process', bodyLimit({ maxSize: 100_000, onError: () => { throw new AppError('invalid_input', 'The transcription is too long.', 413); } }));
  app.post('/api/process', async c => {
    if (!c.req.header('content-type')?.startsWith('application/json')) throw new AppError('invalid_input', 'Expected a transcription.');
    let body: Partial<ProcessRequest>;
    try { body = await c.req.json(); } catch { throw new AppError('invalid_input', 'The transcription could not be read.'); }
    if (!body || typeof body.transcript !== 'string' || !body.transcript.trim() || body.transcript.length > 12000 || body.output !== 'original') throw new AppError('invalid_input', 'Provide a transcription and supported output choice.');
    return c.json({ result: await provider.process(body.transcript, body.output) });
  });
  app.onError((error, c) => {
    const safe = error instanceof AppError ? error : new AppError('unavailable', 'The request could not be completed.', 500);
    if (safe.retryAfter) c.header('Retry-After', String(safe.retryAfter));
    return c.json({ error: { code: safe.code, message: safe.message, ...(safe.retryAfter ? { retryAfter: safe.retryAfter } : {}) } }, safe.status);
  });
  return app;
}
