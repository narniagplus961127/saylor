import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Reports paths only. Never echo a matching line or credential value.
async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--build')) throw Error('Use pnpm check:secrets [--build].');
  const root = process.cwd();
  const files = new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean));
  let localEnv = '';
  try { localEnv = await readFile(resolve(root, '.env'), 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const envKey = localEnv.match(/^\s*(?:export\s+)?GROQ_API_KEY\s*=\s*(?:"([^"\r\n]+)"|'([^'\r\n]+)'|([^#\s\r\n]+))/m);
  const known = [process.env.GROQ_API_KEY, envKey && (envKey[1] ?? envKey[2] ?? envKey[3])].filter(value => value && !['test-only-key', 'your-free-plan-api-key'].includes(value));
  if (args.includes('--build')) {
    async function collect(path) {
      for (const entry of await readdir(resolve(root, path), { withFileTypes: true })) {
        const name = `${path}/${entry.name}`;
        if (entry.isSymbolicLink()) throw Error('Unexpected link in browser build.');
        if (entry.isDirectory()) await collect(name); else files.add(name);
      }
    }
    await collect('apps/web/dist');
  }
  const findings = [];
  for (const name of files) {
    const bytes = await readFile(resolve(root, name));
    const text = bytes.toString('utf8');
    const sensitivePath = /(^|\/)\.env(?:\.[^/]+)?$/.test(name) && name !== '.env.example';
    if (sensitivePath || /(^|\/)\.scratch\/.*\/private\//.test('/' + name) || known.some(key => bytes.includes(Buffer.from(key))) || /\bgsk_[A-Za-z0-9]{32,}\b/.test(text) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text)) findings.push(name);
  }
  if (findings.length) { console.error('Credential or private-file exposure in:\n' + findings.map(name => `- ${name}`).join('\n')); process.exitCode = 1; }
  else console.log(`Credential scan passed (${files.size} source/build files).`);
}
main().catch(() => { console.error('Credential scan could not complete. Check Git access, readable files and required browser build.'); process.exitCode = 1; });
