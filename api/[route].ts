import { createHostedApp } from '../apps/api/src/hosted.js';

export default {
  async fetch(request: Request) {
    try { return await createHostedApp(process.env).fetch(request); }
    catch {
      return Response.json({ error: { code: 'configuration', message: 'SayLor hosting is not configured. Contact the owner.' } }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
    }
  }
};
