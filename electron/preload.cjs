const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop capabilities to window.electron
contextBridge.exposeInMainWorld('electron', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
  appVersion: '1.0.0',
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onDatabaseSynced: (callback) => ipcRenderer.on('db-synced', (_event, data) => callback(data))
});
