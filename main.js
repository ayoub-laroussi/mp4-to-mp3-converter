const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Resolve ffmpeg path – works both in dev and in packaged app
let ffmpegPath = require('ffmpeg-static');
if (ffmpegPath && ffmpegPath.includes('app.asar')) {
  ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
}
ffmpeg.setFfmpegPath(ffmpegPath);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    minWidth: 700,
    minHeight: 550,
    frame: false,
    transparent: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ── Window controls ──────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow.close());

// ── Select files via dialog ─────────────────────────────────────
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Sélectionner des fichiers vidéo',
    filters: [
      { name: 'Vidéos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv'] },
    ],
  });
  if (result.canceled) return [];
  // Return file info for each selected file
  return result.filePaths.map((fp) => ({
    path: fp,
    name: path.basename(fp),
    size: fs.statSync(fp).size,
  }));
});

// ── Select output folder ────────────────────────────────────────
ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Choisir le dossier de sortie',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// ── Convert MP4 → MP3 ───────────────────────────────────────────
ipcMain.handle('convert-file', async (event, filePath, outputDir, bitrate) => {
  // Validate inputs
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Chemin du fichier invalide');
  }
  if (!outputDir || typeof outputDir !== 'string') {
    throw new Error('Dossier de sortie invalide');
  }

  return new Promise((resolve, reject) => {
    const baseName = path.basename(filePath, path.extname(filePath));
    let outputPath = path.join(outputDir, `${baseName}.mp3`);

    // Avoid overwriting – add suffix
    let counter = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(outputDir, `${baseName} (${counter}).mp3`);
      counter++;
    }

    const command = ffmpeg(filePath)
      .toFormat('mp3')
      .audioBitrate(bitrate || 192)
      .on('start', () => {
        mainWindow.webContents.send('conversion-start', filePath);
      })
      .on('progress', (progress) => {
        mainWindow.webContents.send('conversion-progress', {
          filePath,
          percent: Math.round(progress.percent || 0),
        });
      })
      .on('end', () => {
        resolve({ success: true, outputPath });
      })
      .on('error', (err) => {
        reject({ success: false, error: err.message });
      })
      .save(outputPath);
  });
});

// ── Open file in explorer ────────────────────────────────────────
ipcMain.on('open-in-explorer', (event, filePath) => {
  const { shell } = require('electron');
  shell.showItemInFolder(filePath);
});
