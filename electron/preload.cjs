const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,

  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  invoke: (channel, data) => {
    const validChannels = ['app:get-version', 'app:quit'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },

  on: (channel, callback) => {
    const validChannels = ['app:update-available'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  off: (channel, callback) => {
    const validChannels = ['app:update-available'];
    if (validChannels.includes(channel)) {
      ipcRenderer.off(channel, callback);
    }
  }
});

contextBridge.exposeInMainWorld('appInfo', {
  isElectron: true,
  platform: process.platform,
  arch: process.arch,
  nodeVersion: process.versions.node,
  electronVersion: process.versions.electron
});
