import { createApp } from './app.js';
import { groqProvider } from './groq.js';
import { createRecordingLimit } from './recording-limit.js';

// Keep counters across requests even though the hosted app is constructed for each request.
const reserveRecording = createRecordingLimit();

// These values come from deployment configuration, never request/forwarded headers.
export function createHostedApp(env: NodeJS.ProcessEnv) {
  if (!env.GROQ_API_KEY) throw new Error('Configure the server-only provider credential.');
  const configured = [env.SAYLOR_WEB_ORIGIN, ...[env.VERCEL_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(host => `https://${host}`)].filter((value): value is string => Boolean(value));
  if (!configured.length) throw new Error('Configure a hosted SayLor origin.');
  const origins = configured.map(value => {
    const url = new URL(value);
    const localSimulation = env.VERCEL !== '1' && url.protocol === 'http:' && url.hostname === '127.0.0.1';
    if ((!localSimulation && url.protocol !== 'https:') || url.username || url.password || url.pathname !== '/' || url.search || url.hash || url.hostname.includes('*')) throw new Error('Invalid hosted SayLor origin.');
    return url.origin;
  });
  const baseUrl = env.NODE_ENV === 'test' && env.VERCEL !== '1' ? env.GROQ_BASE_URL : undefined;
  return createApp(groqProvider(env.GROQ_API_KEY, baseUrl), undefined, undefined, [...new Set(origins)], env.VERCEL === '1' ? reserveRecording : undefined);
}
