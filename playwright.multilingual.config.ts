import { defineConfig } from '@playwright/test';
const webPort = process.env.WEB_PORT || '5373', providerPort = process.env.FAKE_GROQ_PORT || '9997';
export default defineConfig({
  testDir: './tests', fullyParallel: false,
  testMatch: '**/multilingual.workflow.ts',
  use: { baseURL: `http://127.0.0.1:${webPort}`, permissions: ['microphone'], launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] } },
  webServer: [
    { command: 'pnpm exec tsx tests/multilingual-provider.ts', port: Number(providerPort), env: { FAKE_GROQ_PORT: providerPort } },
    { command: 'pnpm dev', url: `http://127.0.0.1:${webPort}`, env: { WEB_PORT: webPort, API_PORT: process.env.API_PORT || '8987', GROQ_API_KEY: 'test-only-key', GROQ_BASE_URL: `http://127.0.0.1:${providerPort}/openai/v1`, NODE_ENV: 'test' }, timeout: 60000 }
  ]
});
