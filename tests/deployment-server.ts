// Local platform simulation: built frontend + the actual Vercel fetch entry point.
// This does not simulate or attest Vercel Authentication or its routing service.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import handler from '../api/[route].js';

const root = resolve('apps/web/dist');
const port = Number(process.env.WEB_PORT || 5773);
createServer(async (req, res) => {
  try {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) if (value) headers.set(name, Array.isArray(value) ? value.join(',') : value);
      const response = await handler.fetch(new Request(url, { method: req.method, headers, ...(!['GET', 'HEAD'].includes(req.method!) ? { body: Buffer.concat(chunks) } : {}) }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    const file = resolve(root, '.' + (url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)));
    if (!file.startsWith(root + '/') && !file.startsWith(root + '\\')) { res.writeHead(404); res.end(); return; }
    const content = await readFile(file);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' } as Record<string, string>)[extname(file)] || 'application/octet-stream');
    res.end(content);
  } catch { res.writeHead(500); res.end('Local deployment simulation failed.'); }
}).listen(port, '127.0.0.1');
