import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { _electron, expect } from '@playwright/test';
import { createApp } from '../../api/src/app.js';
import type { Provider } from '../../api/src/groq.js';

let transcriptions = 0, generations = 0;
const provider: Provider = {
  async transcribe() { transcriptions++; return 'Send the report Friday at three.'; },
  async process(_text, output) { generations++; return output === 'ms' ? 'Hantar laporan pada hari Jumaat pukul tiga.' : 'Send the report Friday at three.'; }
};
let api: ReturnType<typeof createApp>;
const server = createServer(async (req, res) => {
  try {
    const chunks = []; for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const headers = new Headers(); for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(',') : value);
    const response = await api.fetch(new Request('http://' + req.headers.host + req.url, { method: req.method, headers, ...(!['GET', 'HEAD'].includes(req.method!) ? { body: Buffer.concat(chunks) } : {}) }));
    res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end('{}'); }
});
await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address(); if (!address || typeof address === 'string') throw Error('Missing test address');
api = createApp(provider, address.port, address.port);
const require = createRequire(import.meta.url);
const executablePath = require('../node_modules/electron');
const desktop = await _electron.launch({ executablePath, args: [resolve('apps/desktop'), '--saylor-test'], env: { ...process.env, NODE_ENV: 'test', SAYLOR_DESKTOP_TEST_API: 'http://127.0.0.1:' + address.port }, timeout: 30000 });
try {
  let nativeTargetMismatch = false;
  desktop.process().stderr?.on('data', data => { if (data.toString().includes('Native test target mismatch')) nativeTargetMismatch = true; });
  const page = await desktop.firstWindow();
  page.on('pageerror', error => console.error('Desktop page error: ' + error.message));
  await expect(page.getByRole('heading', { name: 'Speak naturally. Make it yours.' })).toBeVisible();
  assert.equal(await page.evaluate(() => typeof (window as unknown as { require?: unknown }).require), 'undefined');
  assert.equal(await desktop.evaluate(({ globalShortcut }) => globalShortcut.isRegistered('Control+Alt+Space')), true);
  await page.getByRole('button', { name: 'Start recording' }).click(); await page.waitForTimeout(1100);
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.getByLabel('Your result')).toHaveValue('Send the report Friday at three.');
  await page.getByLabel('Output language').selectOption('ms');
  await expect(page.getByLabel('Your result')).toHaveValue('Hantar laporan pada hari Jumaat pukul tiga.');
  await page.getByRole('button', { name: 'Copy result' }).click(); await expect(page.getByText('Copied to clipboard.', { exact: true })).toBeVisible();
  // Invoke the registered callback's controller with automatic paste disabled.
  // This verifies real native target capture and IPC without typing into a user's app.
  const control = async (method: 'toggle' | 'cancel', autoPaste = false) => desktop.evaluate(async ({ app }, { action, autoPaste }) => {
    const controller = (app as unknown as { saylorTestController: { setAutoPaste(value: boolean): void; toggle(): Promise<void>; cancel(): void } }).saylorTestController;
    controller.setAutoPaste(autoPaste);
    await controller[action]();
  }, { action: method, autoPaste });
  await control('toggle'); await expect(page.getByRole('status').filter({ hasText: /^Recording$/ })).toBeVisible();
  await page.waitForTimeout(1100); await control('toggle');
  await expect(page.getByText('Ready to review and copy.', { exact: true })).toBeVisible();
  const beforeCancel = transcriptions;
  await control('toggle'); await expect(page.getByRole('status').filter({ hasText: /^Recording$/ })).toBeVisible();
  await control('cancel'); await expect(page.getByText('Recording discarded.', { exact: true })).toBeVisible();
  assert.equal(transcriptions, beforeCancel); assert.equal(transcriptions, 2); assert.equal(generations, 3);
  // This separate, test-owned window is the only destination for real SendInput.
  // Never put fixture text into an existing user application.
  const targetReady = desktop.waitForEvent('window');
  await desktop.evaluate(async ({ app, BrowserWindow }) => {
    const target = new BrowserWindow({ title: 'SayLor controlled paste target', width: 500, height: 300, webPreferences: { preload: app.getAppPath() + '/preload.cjs', sandbox: true, contextIsolation: true, nodeIntegration: false } });
    await target.loadURL('data:text/html,<title>Controlled paste target</title><textarea aria-label="Paste target" autofocus></textarea>');
    target.show(); target.focus();
    (app as unknown as { saylorTestTarget: string }).saylorTestTarget = target.getNativeWindowHandle().readBigUInt64LE().toString();
  });
  const target = await targetReady;
  assert.deepEqual(await target.evaluate(() => window.saylorDesktop!.complete('untrusted-window', 'Never insert this')), { ok: false, message: 'Automatic paste is unavailable.' });
  await target.bringToFront(); await target.getByRole('textbox').click();
  await control('toggle', true);
  await expect(page.getByRole('status').filter({ hasText: /^Recording$/ })).toBeVisible();
  await page.waitForTimeout(1100); await control('toggle', true);
  await expect(page.getByRole('status').filter({ hasText: /^Ready to review$/ })).toBeVisible();
  if (nativeTargetMismatch) {
    await expect(target.getByRole('textbox')).toHaveValue('');
    await expect(page.getByText('Automatic paste was unavailable or focus changed. Review and copy the result.', { exact: true })).toBeVisible();
    console.log('Native paste not verified: Windows did not foreground the test-owned target; injection was blocked. Owner check required.');
  } else {
    await expect(target.getByRole('textbox')).toHaveValue('Hantar laporan pada hari Jumaat pukul tiga.');
    await expect(page.getByText('Pasted into your original app. The result is also on your clipboard.', { exact: true })).toBeVisible();
    console.log('Real native paste verified into the separate test-owned target.');
  }
  await target.close();
  await desktop.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].show());
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.getByRole('status').filter({ hasText: /^Recording$/ })).toBeVisible();
  const requestsBeforeClose = transcriptions;
  await desktop.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].close());
  assert.equal(await desktop.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), false);
  await expect(page.getByText('Recording discarded.', { exact: true })).toBeVisible();
  assert.equal(transcriptions, requestsBeforeClose);
  console.log('Desktop workflow smoke passed: local bundle → restricted proxy → controlled API → result; microphone fixture, translation, manual copy, native capture, shortcut registration/IPC, cancellation and tray hide. Native paste evidence is reported separately above. Actual microphone and another Windows application remain owner checks.');
} finally {
  await desktop.close(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
