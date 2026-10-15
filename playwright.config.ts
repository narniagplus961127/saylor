import { defineConfig } from '@playwright/test';
const webPort = process.env.WEB_PORT || '5173', providerPort = process.env.FAKE_GROQ_PORT || '9797';
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts', fullyParallel: false,
  use: { baseURL: `http://127.0.0.1:${webPort}`, permissions: ['microphone', 'clipboard-read', 'clipboard-write'], launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } },
  webServer: [
    { command: 'pnpm exec tsx tests/fake-groq.ts', port: Number(providerPort) },
    { command: 'pnpm dev', url: `http://127.0.0.1:${webPort}`, env: { GROQ_API_KEY: 'test-only-key', GROQ_BASE_URL: `http://127.0.0.1:${providerPort}/openai/v1`, NODE_ENV: 'test' }, timeout: 60000 }
  ]
});
