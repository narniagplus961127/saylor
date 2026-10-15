import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Dedicated servers keep each boundary fake deterministic and avoid default dev ports.
const suites = [
  ['dictation', 'playwright.config.ts', 5373, 8987, 9997],
  ['translation', 'playwright.translation.config.ts', 5473, 9087, 10097],
  ['multilingual', 'playwright.multilingual.config.ts', 5573, 9187, 10197],
  ['recovery', 'playwright.recovery.config.ts', 5673, 9287, 10297],
  ['deployment', 'playwright.deployment.config.ts', 5773, 9387, 10397],
];
const cli = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url));
const cwd = fileURLToPath(new URL('../', import.meta.url));
for (const [name, config, web, api, provider] of suites) {
  console.log(`\nRunning ${name} workflow checks`);
  const result = spawnSync(process.execPath, [cli, 'test', '--config', config, ...process.argv.slice(2)], {
    cwd, stdio: 'inherit',
    env: { ...process.env, WEB_PORT: String(web), API_PORT: String(api), FAKE_GROQ_PORT: String(provider), NODE_ENV: 'test', GROQ_API_KEY: 'test-only-key' },
  });
  if (result.error) { console.error(result.error.message); process.exit(1); }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
