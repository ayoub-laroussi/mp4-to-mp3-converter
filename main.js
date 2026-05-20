const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// ── FFmpeg path – dev & packaged (asar.unpacked) ─────────────────
let ffmpegPath = require('ffmpeg-static');
if (ffmpegPath && ffmpegPath.includes('app.asar')) {
  ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
}
ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;

function createWindow() {
  // Force dark appearance on macOS
  nativeTheme.themeSource = 'dark';

  const isMac = process.platform === 'darwin';

  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 700,
    minHeight: 550,

    // ── macOS: use native traffic lights, hide the titlebar frame ──
    // ── Windows: keep frameless with custom controls ───────────────
    frame: isMac,
    titleBarStyle: isMac ? 'hiddenInset' : undefined,
    trafficLightPosition: isMac ? { x: 16, y: 12 } : undefined,

    transparent: false,
    backgroundColor: '#0a0a0f',
    vibrancy: isMac ? 'under-window' : undefined, // subtle macOS blur effect

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);

  // macOS: re-create window when dock icon is clicked
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Set app name (shows in macOS menu bar & dock tooltip)
  app.name = 'MP4 to MP3 Converter';
  createWindow();
});

app.on('window-all-closed', () => {
  // macOS convention: keep app running until Cmd+Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── Window controls (used on Windows only; macOS has native traffic lights) ──
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());

// ── Select video files ────────────────────────────────────────────
ipcMain.handle('select-files', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Sélectionner des fichiers vidéo',
    filters: [
      { name: 'Vidéos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv'] },
    ],
  });
  if (result.canceled) return [];
  return result.filePaths.map((fp) => ({
    path: fp,
    name: path.basename(fp),
    size: fs.statSync(fp).size,
  }));
});

// ── Select output folder ──────────────────────────────────────────
ipcMain.handle('select-output-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'], // createDirectory is macOS-specific
    title: 'Choisir le dossier de sortie',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// ── Convert video → MP3 ───────────────────────────────────────────
ipcMain.handle('convert-file', async (event, filePath, outputDir, bitrate) => {
  if (!filePath || typeof filePath !== 'string') throw new Error('Chemin du fichier invalide');
  if (!outputDir || typeof outputDir !== 'string') throw new Error('Dossier de sortie invalide');

  return new Promise((resolve, reject) => {
    const baseName = path.basename(filePath, path.extname(filePath));
    let outputPath = path.join(outputDir, `${baseName}.mp3`);

    // Avoid overwriting existing files
    let counter = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(outputDir, `${baseName} (${counter}).mp3`);
      counter++;
    }

    ffmpeg(filePath)
      .toFormat('mp3')
      .audioBitrate(bitrate || 192)
      .on('start', () => {
        mainWindow?.webContents.send('conversion-start', filePath);
      })
      .on('progress', (progress) => {
        mainWindow?.webContents.send('conversion-progress', {
          filePath,
          percent: Math.round(Math.min(progress.percent || 0, 100)),
        });
      })
      .on('end', () => resolve({ success: true, outputPath }))
      .on('error', (err) => reject({ success: false, error: err.message }))
      .save(outputPath);
  });
});

// ── Reveal file in Finder (macOS) / Explorer (Windows) ───────────
ipcMain.on('open-in-explorer', (_event, filePath) => {
  shell.showItemInFolder(filePath);
});

// ── macOS: send platform info to renderer so it can adapt the UI ──
ipcMain.handle('get-platform', () => process.platform);
