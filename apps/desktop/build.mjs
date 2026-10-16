import { mkdir, cp, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packager } from '@electron/packager';
import { buildNative } from './build-native.mjs';

const here = dirname(fileURLToPath(import.meta.url));
if (process.platform !== 'win32' || process.arch !== 'x64') throw Error('Build this portable release on Windows x64.');
const output = resolve(here, 'dist');
const stage = resolve(output, 'staging');
const stageRelative = relative(output, stage);
if (!stageRelative || stageRelative.startsWith('..') || isAbsolute(stageRelative)) throw Error('Invalid staging path');
await rm(stage, { recursive: true, force: true });
const native = await buildNative();
await mkdir(stage, { recursive: true });
// Explicit allowlist: never copy the checkout, .env, provider keys or evaluation artifacts.
for (const file of ['main.cjs', 'preload.cjs', 'controller.cjs', 'protocol.cjs']) await cp(resolve(here, file), resolve(stage, file));
await cp(resolve(native, 'SayLorInput.exe'), resolve(stage, 'native/SayLorInput.exe'), { recursive: true });
await cp(resolve(here, '../web/dist'), resolve(stage, 'web'), { recursive: true });
await writeFile(resolve(stage, 'package.json'), JSON.stringify({ name: 'saylor-desktop', productName: 'SayLor', version: '0.1.0', main: 'main.cjs', private: true }));
const folders = await packager({ dir: stage, out: resolve(output, 'releases'), name: 'SayLor', platform: 'win32', arch: 'x64', electronVersion: '44.8.0', overwrite: true, prune: true, asar: { unpackDir: 'native' }, appBundleId: 'personal.saylor.desktop' });
console.log('Portable Windows app: ' + folders[0]);
