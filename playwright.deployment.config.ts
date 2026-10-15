import base from './playwright.config.js';
const port = process.env.WEB_PORT || '5773';
export default { ...base, testMatch: '**/deployment.spec.ts', webServer: [
  { command: 'pnpm exec tsx tests/translation-provider.ts', port: Number(process.env.FAKE_GROQ_PORT || 10397) },
  { command: 'pnpm --filter @saylor/web build && pnpm exec tsx tests/deployment-server.ts', url: `http://127.0.0.1:${port}`, env: {
    GROQ_API_KEY: 'test-only-key', GROQ_BASE_URL: `http://127.0.0.1:${process.env.FAKE_GROQ_PORT || 10397}/openai/v1`,
    NODE_ENV: 'test', SAYLOR_WEB_ORIGIN: `http://127.0.0.1:${port}`
  }, timeout: 60000 }
] };
