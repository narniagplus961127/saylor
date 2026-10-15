import base from './playwright.config.js';
export default { ...base, testMatch: '**/translation.spec.ts', webServer: [
  { command: 'pnpm exec tsx tests/translation-provider.ts', port: Number(process.env.FAKE_GROQ_PORT || 9897) },
  ...(Array.isArray(base.webServer) ? base.webServer.slice(1) : [])
] };
