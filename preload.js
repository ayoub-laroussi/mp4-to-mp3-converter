const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Get the real filesystem path from a File object (works with contextIsolation)
  getFilePath: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (e) {
      return file.path || null;
    }
  },

  // File operations
  selectFiles: () => ipcRenderer.invoke('select-files'),
  selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),
  convertFile: (filePath, outputDir, bitrate) =>
    ipcRenderer.invoke('convert-file', filePath, outputDir, bitrate),
  openInExplorer: (filePath) => ipcRenderer.send('open-in-explorer', filePath),

  // Listen to events from main
  onConversionStart: (callback) =>
    ipcRenderer.on('conversion-start', (_, data) => callback(data)),
  onConversionProgress: (callback) =>
    ipcRenderer.on('conversion-progress', (_, data) => callback(data)),
});
