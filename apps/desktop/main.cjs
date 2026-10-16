const { app, BrowserWindow, Menu, Tray, nativeImage, globalShortcut, ipcMain, dialog, clipboard, Notification, session, protocol } = require('electron');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const { createDictationController } = require('./controller.cjs');
const { createProtocolHandler, APP_URL, API_ORIGIN } = require('./protocol.cjs');
const exec = promisify(execFile);
const HOTKEY = 'Control+Alt+Space';
const testMode = !app.isPackaged && process.env.NODE_ENV === 'test' && process.argv.includes('--saylor-test');
if (testMode) {
  app.setPath('userData', path.join(app.getPath('temp'), 'saylor-desktop-test-' + process.pid));
  app.commandLine.appendSwitch('use-fake-ui-for-media-stream');
  app.commandLine.appendSwitch('use-fake-device-for-media-stream');
}
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
app.setName('SayLor');
app.setAppUserModelId('personal.saylor.desktop');
let win, tray, controller, quitting = false, rendererReady = false, audioAllowed = false;
const notice = message => { if (Notification.isSupported()) new Notification({ title: 'SayLor', body: message }).show(); };
const handle = () => { const bytes = win.getNativeWindowHandle(); return (bytes.length === 8 ? bytes.readBigUInt64LE() : BigInt(bytes.readUInt32LE())).toString(); };
const trusted = event => Boolean(win && event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame && event.senderFrame.url === APP_URL);
const stages = ['idle', 'permission', 'recording', 'transcribing', 'cleaning', 'translating', 'ready', 'error'];

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });
  app.on('before-quit', () => { quitting = true; controller?.cancel(); });
  app.on('will-quit', () => globalShortcut.unregisterAll());
  app.whenReady().then(async () => {
    if (process.platform !== 'win32') { await dialog.showMessageBox({ type: 'error', message: 'This SayLor desktop build supports Windows only.' }); app.quit(); return; }
    const helper = app.isPackaged ? path.join(process.resourcesPath, 'app.asar.unpacked', 'native', 'SayLorInput.exe') : path.join(__dirname, 'native', 'bin', 'SayLorInput.exe');
    const native = async (action, target) => {
      if (testMode && target && target.handle !== app.saylorTestTarget) { console.error('Native test target mismatch'); throw Error('Only the test-owned paste target is allowed'); }
      const args = [action, ...(target ? [target.handle, String(target.pid)] : []), ...(action === 'focus' ? [handle()] : [])];
      try {
        const { stdout } = await exec(helper, args, { windowsHide: true, timeout: 4000, maxBuffer: 2048 });
        return JSON.parse(stdout);
      } catch (error) { if (testMode) console.error('Native test operation failed:', action, error.code); throw error; }
    };
    const localSession = session.fromPartition('persist:saylor-desktop');
    const root = app.isPackaged ? path.join(app.getAppPath(), 'web') : path.resolve(__dirname, '../web/dist');
    let apiOrigin = API_ORIGIN;
    if (testMode && process.env.SAYLOR_DESKTOP_TEST_API) {
      const url = new URL(process.env.SAYLOR_DESKTOP_TEST_API);
      if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.pathname !== '/') throw Error('Invalid test API');
      apiOrigin = url.origin;
    }
    localSession.protocol.handle('app', createProtocolHandler(root, apiOrigin));
    win = new BrowserWindow({ title: 'SayLor', width: 1120, height: 850, minWidth: 720, minHeight: 600, show: false,
      webPreferences: { session: localSession, preload: path.join(__dirname, 'preload.cjs'), sandbox: true, contextIsolation: true, nodeIntegration: false, webSecurity: true, backgroundThrottling: false }
    });
    win.setMenuBarVisibility(false);
    localSession.setPermissionCheckHandler((contents, permission, origin, details) => contents === win.webContents && origin === 'app://saylor' && contents.getURL() === APP_URL && details.isMainFrame !== false && (permission === 'clipboard-sanitized-write' || (permission === 'media' && details.mediaType === 'audio' && (audioAllowed || testMode))));
    localSession.setPermissionRequestHandler(async (contents, permission, callback, details) => {
      if (contents === win.webContents && contents.getURL() === APP_URL && permission === 'clipboard-sanitized-write' && details.isMainFrame !== false) { callback(true); return; }
      const audioOnly = details.mediaTypes?.length && details.mediaTypes.every(type => type === 'audio');
      if (contents !== win.webContents || contents.getURL() !== APP_URL || permission !== 'media' || !audioOnly || details.isMainFrame === false) { callback(false); return; }
      if (!audioAllowed && !testMode) {
        const choice = await dialog.showMessageBox(win, { type: 'question', title: 'SayLor microphone', message: 'Allow SayLor to record your microphone?', detail: 'Audio is sent to your configured cloud AI service after you stop. No recording history is saved.', buttons: ['Allow microphone', 'Cancel'], cancelId: 1, defaultId: 1 });
        audioAllowed = choice.response === 0;
      }
      callback(testMode || audioAllowed);
    });
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    win.webContents.on('will-navigate', event => { if (event.url !== APP_URL) event.preventDefault(); });
    win.webContents.on('will-frame-navigate', event => { if (event.url !== APP_URL) event.preventDefault(); });
    win.webContents.on('will-attach-webview', event => event.preventDefault());
    localSession.on('will-download', event => event.preventDefault());
    controller = createDictationController({
      capture: () => native('capture'), isOwnTarget: target => target.handle === handle(),
      show: () => { win.setAlwaysOnTop(true); win.showInactive(); }, hide: () => { win.setAlwaysOnTop(false); win.hide(); },
      send: command => win.webContents.send('saylor:command', command), notify: notice,
      focus: target => native('focus', target), paste: target => native('paste', target), writeClipboard: text => clipboard.writeText(text),
      active: value => {
        if (value) globalShortcut.register('Escape', () => controller.cancel());
        else { globalShortcut.unregister('Escape'); win?.setAlwaysOnTop(false); }
      }
    });
    ipcMain.on('saylor:ready', event => { if (trusted(event)) rendererReady = true; });
    ipcMain.on('saylor:stage', (event, value) => { if (trusted(event) && stages.includes(value)) { controller.updateStage(value); tray?.setToolTip('SayLor · ' + value); } });
    ipcMain.on('saylor:cancel', event => { if (trusted(event)) controller.cancel(); });
    ipcMain.handle('saylor:complete', (event, id, text) => {
      if (!trusted(event) || typeof id !== 'string') return { ok: false, message: 'Automatic paste is unavailable.' };
      return controller.complete(id, text);
    });
    win.webContents.on('render-process-gone', () => { rendererReady = false; controller.cancel(); });
    win.webContents.on('did-start-loading', () => { rendererReady = false; controller.cancel(); });
    win.on('close', event => { if (!quitting) { event.preventDefault(); controller.cancel(); win.webContents.send('saylor:command', { kind: 'cancel', id: '' }); win.hide(); } });
    const pixels = Buffer.alloc(32 * 32 * 4);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const offset = (y * 32 + x) * 4; const microphone = (x >= 13 && x <= 18 && y >= 5 && y <= 19) || (y >= 22 && y <= 24 && x >= 9 && x <= 22) || (x >= 15 && x <= 16 && y >= 22 && y <= 28);
      pixels[offset] = microphone ? 230 : 61; pixels[offset + 1] = microphone ? 240 : 95; pixels[offset + 2] = microphone ? 230 : 74; pixels[offset + 3] = 255;
    }
    const icon = nativeImage.createFromBitmap(pixels, { width: 32, height: 32 });
    win.setIcon(icon); tray = new Tray(icon); tray.setToolTip('SayLor');
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open SayLor', click: () => { win.show(); win.focus(); } },
      { label: 'Automatic paste after shortcut dictation', type: 'checkbox', checked: true, click: item => controller.setAutoPaste(item.checked) },
      { type: 'separator' }, { label: 'Quit SayLor', click: () => app.quit() }
    ]));
    tray.on('double-click', () => { win.show(); win.focus(); });
    const registered = globalShortcut.register(HOTKEY, () => { if (rendererReady) void controller.toggle(); else notice('SayLor is still loading. Open it from the tray and try again.'); });
    if (!registered) await dialog.showMessageBox(win, { type: 'warning', message: 'Ctrl+Alt+Space is already in use.', detail: 'Close the other app using this shortcut, then restart SayLor. You can still record and copy with the window buttons.' });
    await win.loadURL(APP_URL);
    win.show();
    // Main-process test hook; never exposed to a renderer or a packaged release.
    if (testMode) app.saylorTestController = controller;
  }).catch(() => { dialog.showErrorBox('SayLor could not start', 'Check that the complete app folder is present, then launch SayLor again.'); app.quit(); });
}
