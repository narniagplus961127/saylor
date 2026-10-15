import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { Server } from 'node:http';
import { createApp } from './app.js';
import { groqProvider } from './groq.js';
// Relative to this module, not the shell's cwd. Existing process env takes priority.
config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)), quiet: true });
const baseUrl = process.env.NODE_ENV === 'test' ? process.env.GROQ_BASE_URL : undefined;
const apiPort = Number(process.env.API_PORT || 8787), webPort = Number(process.env.WEB_PORT || 5173);
if (![apiPort, webPort].every(port => Number.isInteger(port) && port >= 1024 && port <= 65535)) throw new Error('Use valid local API_PORT and WEB_PORT values.');
const app = createApp(groqProvider(process.env.GROQ_API_KEY, baseUrl), webPort, apiPort);
const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: apiPort });
if (server instanceof Server) { server.requestTimeout = 70_000; server.headersTimeout = 10_000; }
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => { server.close(); if (server instanceof Server) server.closeAllConnections(); });
