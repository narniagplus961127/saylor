const { readFile } = require('node:fs/promises');
const path = require('node:path');
const APP_URL = 'app://saylor/';
const API_ORIGIN = 'https://qw-saylor.vercel.app';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'none'; frame-src 'none'; form-action 'none'";

function createProtocolHandler(root, apiOrigin = API_ORIGIN, fetcher = fetch) {
  const failure = (status, code, message) => Response.json({ error: { code, message } }, { status, headers: { 'Cache-Control': 'no-store' } });
  return async request => {
    try {
      const url = new URL(request.url);
      if (url.protocol !== 'app:' || url.host !== 'saylor' || url.username || url.password || url.search) return failure(403, 'forbidden', 'Use SayLor itself.');
      if (url.pathname.startsWith('/api/')) {
        if (!['/api/transcribe', '/api/process'].includes(url.pathname) || request.method !== 'POST') return failure(404, 'invalid_input', 'Unsupported operation.');
        const initiator = request.initiatorOrigin ?? request.headers.get('origin');
        if (initiator !== 'app://saylor') return failure(403, 'forbidden', 'Use SayLor itself.');
        const max = url.pathname === '/api/transcribe' ? 1_920_044 : 100_000;
        const reader = request.body?.getReader();
        if (!reader) return failure(400, 'invalid_input', 'Provide a recording or transcription.');
        let size = 0;
        const chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > max) { await reader.cancel(); return failure(413, 'invalid_input', 'This submission is too large.'); }
          chunks.push(Buffer.from(value));
        }
        const response = await fetcher(apiOrigin + url.pathname, {
          method: 'POST', headers: { Origin: apiOrigin, 'Content-Type': request.headers.get('content-type') ?? '' },
          body: Buffer.concat(chunks), redirect: 'error', signal: AbortSignal.any([request.signal, AbortSignal.timeout(65_000)])
        });
        const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        const retry = response.headers.get('retry-after');
        if (retry && /^\d+$/.test(retry)) headers.set('Retry-After', retry);
        if (!response.headers.get('content-type')?.includes('application/json')) return failure(503, 'unavailable', 'SayLor is temporarily unavailable. Try again later.');
        return new Response(response.body, { status: response.status, headers });
      }
      if (!['GET', 'HEAD'].includes(request.method)) return failure(405, 'invalid_input', 'Unsupported operation.');
      const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
      const filename = path.resolve(root, '.' + pathname);
      const relative = path.relative(root, filename);
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || pathname.includes('\\')) return failure(403, 'forbidden', 'Unsupported path.');
      const content = await readFile(filename);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(filename)] || 'application/octet-stream';
      return new Response(request.method === 'HEAD' ? null : content, { headers: { 'Content-Type': type, 'Content-Security-Policy': CSP, 'X-Content-Type-Options': 'nosniff' } });
    } catch {
      return failure(503, 'unavailable', 'Cannot reach SayLor. Check your connection and try again.');
    }
  };
}

module.exports = { createProtocolHandler, APP_URL, API_ORIGIN };
