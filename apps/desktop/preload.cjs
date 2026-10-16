const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('saylorDesktop', {
  onCommand(callback) {
    const listener = (_event, command) => {
      if (command && ['start', 'stop', 'cancel'].includes(command.kind) && typeof command.id === 'string') callback(command);
    };
    ipcRenderer.on('saylor:command', listener);
    ipcRenderer.send('saylor:ready');
    return () => ipcRenderer.removeListener('saylor:command', listener);
  },
  updateStage(stage) { ipcRenderer.send('saylor:stage', stage); },
  complete(id, text) { return ipcRenderer.invoke('saylor:complete', id, text); },
  cancel() { ipcRenderer.send('saylor:cancel'); }
});
