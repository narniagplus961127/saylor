import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export async function buildNative() {
  if (process.platform !== 'win32' || process.arch !== 'x64') throw Error('Build the native helper on Windows x64.');
  const native = resolve(here, 'native/bin');
  await mkdir(native, { recursive: true });
  const compiler = resolve(process.env.SystemRoot || 'C:/Windows', 'Microsoft.NET/Framework64/v4.0.30319/csc.exe');
  execFileSync(compiler, ['/nologo', '/target:exe', '/platform:x64', '/optimize+', '/out:' + resolve(native, 'SayLorInput.exe'), resolve(here, 'native/Input.cs')], { windowsHide: true, stdio: 'inherit' });
  return native;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildNative();
