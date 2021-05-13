const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', {
    addLocaleListener: (listener) => {
        return ipcRenderer.on('get-locale', listener);
    },
    removeLocaleListener: () => {
        return ipcRenderer.removeAllListeners('get-locale');
    },
    getPort: () => {
        return ipcRenderer.invoke('get-port');
    },
    getFileName: (filePath) => {
        return ipcRenderer.invoke('get-filename', filePath);
    },
    showDialog: () => {
        return ipcRenderer.invoke('show-dialog');
    },
});
