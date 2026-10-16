import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const run = (command, args) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
};
// Use pnpm's JS entrypoint rather than shell-dependent command chaining.
const pnpm = process.env.npm_execpath;
if (!pnpm) { console.error('Run this command through pnpm check.'); process.exit(1); }
const javascript = /\.(?:c?js|mjs)$/i.test(pnpm);
for (const task of ['test:tools', 'test:desktop', 'typecheck', 'test', 'build']) run(javascript ? process.execPath : pnpm, [...(javascript ? [pnpm] : []), 'run', task]);
run(process.execPath, ['scripts/check-secrets.mjs', '--build']);
