const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveKey: (v) => ipcRenderer.send('saveKey',v),
    saveFile: (v) => ipcRenderer.send('saveFile',v),
    readFile: () => {
        return ipcRenderer.invoke('readFile')
    },
});