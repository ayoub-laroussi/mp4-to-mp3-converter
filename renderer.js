/* ═══════════════════════════════════════════════════════
   Renderer – MP4 → MP3 Converter (macOS-optimised)
   ═══════════════════════════════════════════════════════ */

// ─── DOM Elements ──────────────────────────────────────
const dropZone         = document.getElementById('drop-zone');
const fileInput        = document.getElementById('file-input');
const fileList         = document.getElementById('file-list');
const actionBar        = document.getElementById('action-bar');
const btnConvert       = document.getElementById('btn-convert');
const btnClear         = document.getElementById('btn-clear');
const btnOutputFolder  = document.getElementById('btn-output-folder');
const outputFolderText = document.getElementById('output-folder-text');
const bitrateSelect    = document.getElementById('bitrate-select');
const fileCountNumber  = document.getElementById('file-count-number');
const titlebarControls = document.getElementById('titlebar-controls');

// ─── State ─────────────────────────────────────────────
let files         = []; // { id, path, name, size, status, progress, outputPath, errorMsg }
let outputFolder  = null;
let isConverting  = false;
let fileIdCounter = 0;
let platform      = 'win32'; // updated async below

// ─── Platform Detection ───────────────────────────────
// Adapt the UI depending on whether we're on macOS or Windows.
(async () => {
  platform = await window.electronAPI.getPlatform();
  if (platform === 'darwin') {
    // macOS: hide custom title-bar buttons (native traffic lights are used)
    document.body.classList.add('platform-darwin');
    // Reserve space for traffic lights (approx. 72 px on standard displays)
    document.documentElement.style.setProperty('--mac-traffic-light-width', '60px');
  }
})();

// ─── Window Controls (Windows only) ───────────────────
document.getElementById('btn-minimize').addEventListener('click', () => window.electronAPI.minimize());
document.getElementById('btn-maximize').addEventListener('click', () => window.electronAPI.maximize());
document.getElementById('btn-close').addEventListener('click',    () => window.electronAPI.close());

// ─── Output Folder ────────────────────────────────────
btnOutputFolder.addEventListener('click', async () => {
  const folder = await window.electronAPI.selectOutputFolder();
  if (folder) {
    outputFolder = folder;
    const parts = folder.split(/[\\/]/);
    // Show last 2 path segments so it stays readable at any width
    outputFolderText.textContent = parts.slice(-2).join('/');
    outputFolderText.title = folder;
  }
});

// ─── Clear All ────────────────────────────────────────
btnClear.addEventListener('click', () => {
  if (isConverting) return;
  files = [];
  updateUI();
});

// ─── Drop Zone ────────────────────────────────────────
dropZone.addEventListener('click', async () => {
  if (isConverting) return;
  const selected = await window.electronAPI.selectFiles();
  if (selected && selected.length > 0) addFilesFromDialog(selected);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
  const dropped = Array.from(e.dataTransfer.files).filter(isVideoFile);
  addFilesFromDrop(dropped);
});

// Hidden file input kept for completeness, not actively used
fileInput.addEventListener('change', () => { fileInput.value = ''; });

// ─── File Helpers ─────────────────────────────────────
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv'];

function isVideoFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

function formatSize(bytes) {
  if (bytes < 1024)              return bytes + ' B';
  if (bytes < 1024 * 1024)      return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 ** 3)        return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

// Drag-and-drop: resolve paths via webUtils
function addFilesFromDrop(droppedFiles) {
  for (const f of droppedFiles) {
    const filePath = window.electronAPI.getFilePath(f);
    if (!filePath) { console.warn('Could not resolve path for:', f.name); continue; }
    if (files.some((e) => e.path === filePath)) continue;
    files.push({ id: ++fileIdCounter, path: filePath, name: f.name, size: f.size, status: 'waiting', progress: 0, outputPath: null, errorMsg: null });
  }
  updateUI();
}

// Native dialog: paths already resolved by main process
function addFilesFromDialog(dialogFiles) {
  for (const f of dialogFiles) {
    if (!f.path) continue;
    if (files.some((e) => e.path === f.path)) continue;
    files.push({ id: ++fileIdCounter, path: f.path, name: f.name, size: f.size, status: 'waiting', progress: 0, outputPath: null, errorMsg: null });
  }
  updateUI();
}

function removeFile(id) {
  files = files.filter((f) => f.id !== id);
  updateUI();
}

// ─── UI Rendering ─────────────────────────────────────
function updateUI() {
  // Drop zone compact mode
  dropZone.classList.toggle('compact', files.length > 0);

  // Action bar
  if (files.length > 0) {
    actionBar.classList.remove('hidden');
    fileCountNumber.textContent = files.length;
  } else {
    actionBar.classList.add('hidden');
  }

  // Clear button state
  btnClear.disabled = isConverting;

  // Convert button state
  const allDone = files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error');

  if (allDone) {
    btnConvert.disabled = true;
    btnConvert.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Terminé !
    `;
  } else if (isConverting) {
    btnConvert.disabled = true;
    btnConvert.innerHTML = `
      <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Conversion en cours…
    `;
  } else {
    btnConvert.disabled = files.length === 0;
    btnConvert.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      Convertir tout
    `;
  }

  renderFileList();
}

function renderFileList() {
  fileList.innerHTML = '';

  for (const file of files) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.id = `file-${file.id}`;

    const iconSvg = file.status === 'done'
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;

    // Status badge
    const statusMap = {
      waiting:    `<div class="status-badge waiting"><span class="status-dot"></span>En attente</div>`,
      converting: `<div class="status-badge converting"><span class="status-dot"></span>${file.progress}%</div>`,
      done:       `<div class="status-badge done"><span class="status-dot"></span>Terminé</div>`,
      error:      `<div class="status-badge error" title="${file.errorMsg || ''}"><span class="status-dot"></span>Erreur</div>`,
    };
    const statusHTML = statusMap[file.status] || '';

    // Action buttons
    let actionsHTML = '';
    if (file.status === 'done' && file.outputPath) {
      // Label adapts to platform
      const finderLabel = platform === 'darwin' ? 'Afficher dans le Finder' : "Ouvrir dans l'explorateur";
      actionsHTML += `
        <button class="btn-open-folder" data-path="${file.outputPath}" title="${finderLabel}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
        </button>`;
    }
    if (!isConverting) {
      actionsHTML += `
        <button class="file-item-remove" data-id="${file.id}" title="Retirer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;
    }

    // Progress bar
    const progressHTML = file.status === 'converting'
      ? `<div class="file-progress-bar" style="width:${file.progress}%"></div>`
      : file.status === 'done'
      ? `<div class="file-progress-bar" style="width:100%;opacity:0.4"></div>`
      : '';

    item.innerHTML = `
      <div class="file-item-icon">${iconSvg}</div>
      <div class="file-item-info">
        <div class="file-item-name" title="${file.path}">${file.name}</div>
        <div class="file-item-size">${formatSize(file.size)}</div>
      </div>
      <div class="file-item-status">${statusHTML}</div>
      ${actionsHTML}
      ${progressHTML}
    `;

    fileList.appendChild(item);
  }

  // Remove buttons
  fileList.querySelectorAll('.file-item-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFile(parseInt(btn.dataset.id));
    });
  });

  // Open in Finder / Explorer buttons
  fileList.querySelectorAll('.btn-open-folder').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.electronAPI.openInExplorer(btn.dataset.path);
    });
  });
}

// ─── Conversion ───────────────────────────────────────
btnConvert.addEventListener('click', startConversion);

async function startConversion() {
  if (isConverting || files.length === 0) return;

  isConverting = true;
  const bitrate = parseInt(bitrateSelect.value);

  // Reset non-done files
  for (const file of files) {
    if (file.status !== 'done') {
      file.status   = 'waiting';
      file.progress = 0;
    }
  }
  updateUI();

  // Sequential conversion (avoids FFmpeg resource contention)
  for (const file of files) {
    if (file.status === 'done') continue;

    file.status   = 'converting';
    file.progress = 0;
    updateUI();

    try {
      const lastSep = Math.max(file.path.lastIndexOf('\\'), file.path.lastIndexOf('/'));
      const dir     = outputFolder || (lastSep > 0 ? file.path.substring(0, lastSep) : '.');
      const result  = await window.electronAPI.convertFile(file.path, dir, bitrate);

      file.status     = 'done';
      file.progress   = 100;
      file.outputPath = result.outputPath;
    } catch (err) {
      file.status   = 'error';
      file.errorMsg = err.error || 'Erreur inconnue';
      console.error('Conversion error:', err);
    }

    updateUI();
  }

  isConverting = false;
  updateUI();
  showCompletionBanner();
}

// ─── Progress Listener ───────────────────────────────
window.electronAPI.onConversionProgress((data) => {
  const file = files.find((f) => f.path === data.filePath);
  if (!file) return;
  file.progress = data.percent;

  // Lightweight partial update – avoid full re-render for perf
  const item = document.getElementById(`file-${file.id}`);
  if (item) {
    const bar = item.querySelector('.file-progress-bar');
    if (bar) bar.style.width = data.percent + '%';
    const badge = item.querySelector('.status-badge');
    if (badge) badge.innerHTML = `<span class="status-dot"></span>${data.percent}%`;
  }
});

// ─── Completion Banner ────────────────────────────────
function showCompletionBanner() {
  const doneCount  = files.filter((f) => f.status === 'done').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  if (doneCount === 0 && errorCount === 0) return;

  document.querySelector('.completion-banner')?.remove();

  const banner = document.createElement('div');
  banner.className = 'completion-banner';

  if (errorCount === 0) {
    banner.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${doneCount} fichier(s) converti(s) avec succès !</span>`;
  } else {
    banner.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>${doneCount} converti(s), ${errorCount} erreur(s)</span>`;
  }

  actionBar.parentNode.insertBefore(banner, actionBar);

  // Auto-dismiss after 5 s
  setTimeout(() => {
    if (!banner.parentNode) return;
    banner.style.transition = 'opacity 0.3s ease';
    banner.style.opacity    = '0';
    setTimeout(() => banner.remove(), 300);
  }, 5000);
}
