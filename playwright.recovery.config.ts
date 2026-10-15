import base from './playwright.config.js';
export default { ...base, testMatch: '**/recovery.spec.ts', webServer: [
  { command: 'pnpm exec tsx tests/fake-groq.ts', port: Number(process.env.FAKE_GROQ_PORT || 10097) },
  ...(Array.isArray(base.webServer) ? base.webServer.slice(1) : [])
] };
