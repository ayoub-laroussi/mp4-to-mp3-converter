const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls (used on Windows; macOS uses native traffic lights)
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),

  // Platform detection – lets the renderer hide/show the custom title bar
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Get the real filesystem path from a File object (drag-and-drop)
  getFilePath: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (e) {
      return file.path || null;
    }
  },

  // File operations
  selectFiles:        ()                           => ipcRenderer.invoke('select-files'),
  selectOutputFolder: ()                           => ipcRenderer.invoke('select-output-folder'),
  convertFile:        (filePath, outputDir, bitrate) => ipcRenderer.invoke('convert-file', filePath, outputDir, bitrate),
  openInExplorer:     (filePath)                   => ipcRenderer.send('open-in-explorer', filePath),

  // Events from main process
  onConversionStart:    (cb) => ipcRenderer.on('conversion-start',    (_, d) => cb(d)),
  onConversionProgress: (cb) => ipcRenderer.on('conversion-progress', (_, d) => cb(d)),
});
