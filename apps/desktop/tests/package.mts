import { _electron, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { resolve, join } from 'node:path';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const profile = await mkdtemp(join(tmpdir(), 'saylor-packaged-check-'));
const desktop = await _electron.launch({ executablePath: resolve('apps/desktop/dist/releases/SayLor-win32-x64/SayLor.exe'), args: ['--user-data-dir=' + profile], env: { ...process.env, NODE_ENV: 'production' } });
try {
  const page = await desktop.firstWindow();
  await expect(page.getByRole('heading', { name: 'Speak naturally. Make it yours.' })).toBeVisible();
  assert.equal(page.url(), 'app://saylor/');
  assert.equal(await desktop.evaluate(({ app }) => app.isPackaged), true);
  const preferences = await desktop.evaluate(({ BrowserWindow }) => {
    const prefs = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
    return { sandbox: prefs.sandbox, contextIsolation: prefs.contextIsolation, nodeIntegration: prefs.nodeIntegration };
  });
  assert.deepEqual(preferences, { sandbox: true, contextIsolation: true, nodeIntegration: false });
  assert.equal(await page.evaluate(async () => (await fetch('/api/health')).status), 404);
  assert.equal(await page.evaluate(async () => {
    try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }); stream.getTracks().forEach(track => track.stop()); return 'granted'; }
    catch { return 'denied'; }
  }), 'denied');
  assert.equal(await desktop.evaluate(({ app }) => 'saylorTestController' in app), false);
  const capture = JSON.parse(execFileSync(resolve('apps/desktop/dist/releases/SayLor-win32-x64/resources/app.asar.unpacked/native/SayLorInput.exe'), ['capture'], { windowsHide: true, encoding: 'utf8' }));
  assert.match(capture.handle, /^\d+$/); assert.equal(typeof capture.pid, 'number');
  console.log('Packaged startup passed without local servers: bundled UI, sandbox/isolation, no Node access, blocked camera/unknown API and no test controller. No live provider request.');
} finally { await desktop.close(); }
