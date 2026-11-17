const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const PORT = process.env.PORT || 3001;
const SERVER_URL = `http://localhost:${PORT}`;

// Single instance lock (prevent opening multiple desktop instances)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

/**
 * Checks if the local Cockpit API & UI server is responding
 */
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${SERVER_URL}/api/db/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Starts the local server if not already running
 */
async function ensureServerRunning() {
  const isRunning = await checkServerRunning();
  if (isRunning) {
    console.log('[Desktop] Cockpit server already online at', SERVER_URL);
    return;
  }

  console.log('[Desktop] Starting background Cockpit engine...');
  const isDev = !app.isPackaged;
  const projectRoot = app.isPackaged ? app.getAppPath() : path.join(__dirname, '..');

  if (isDev) {
    serverProcess = spawn('npx.cmd', ['tsx', 'server.ts'], {
      cwd: projectRoot,
      shell: true,
      stdio: 'pipe',
      env: { ...process.env, PORT: String(PORT), NODE_ENV: 'development' }
    });
    serverProcess.stdout?.on('data', (data) => console.log(`[Server] ${data}`));
    serverProcess.stderr?.on('data', (data) => console.error(`[Server Error] ${data}`));
  } else {
    // In packaged app, dynamically import the production server bundle directly in-process
    try {
      const serverPath = path.join(projectRoot, 'api', 'index.js');
      const { pathToFileURL } = require('url');
      await import(pathToFileURL(serverPath).href);
      console.log('[Desktop] Packaged server initialized in-process!');
    } catch (err) {
      console.error('[Desktop] In-process server import failed, falling back to child process:', err);
      serverProcess = spawn(process.execPath, [path.join(projectRoot, 'api', 'index.js')], {
        cwd: projectRoot,
        stdio: 'pipe',
        env: {
          ...process.env,
          ELECTRON_RUN_AS_NODE: '1',
          PORT: String(PORT),
          NODE_ENV: 'production'
        }
      });
      serverProcess.stdout?.on('data', (data) => console.log(`[Server] ${data}`));
      serverProcess.stderr?.on('data', (data) => console.error(`[Server Error] ${data}`));
    }
  }

  // Wait for server to become responsive (up to 15 seconds)
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await checkServerRunning()) {
      console.log('[Desktop] Cockpit server successfully started!');
      return;
    }
  }
}

/**
 * Creates the primary native Windows application window
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 700,
    title: 'Transformer19 — 100K Trading Execution Cockpit',
    backgroundColor: '#0a0e17',
    show: false, // Prevent white flash before render
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: true
    }
  });

  // Native Windows Application Menu
  const template = [
    {
      label: '&File',
      submenu: [
        {
          label: 'Reload Cockpit',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow.reload()
        },
        {
          label: 'Force Hard Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => mainWindow.webContents.reloadIgnoringCache()
        },
        { type: 'separator' },
        {
          label: 'Export Cockpit Backup (JSON)...',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (window.exportBackupJson) {
                const data = window.exportBackupJson();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'transformer19-backup-' + new Date().toISOString().slice(0, 10) + '.json';
                a.click();
              }
            `);
          }
        },
        {
          label: 'Sync with Website Cloud (transformer19.vercel.app)...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              if (window.triggerCloudSync) {
                window.triggerCloudSync();
              }
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Exit Transformer19',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '&Navigation',
      submenu: [
        {
          label: 'Execution Matrix & Daily Sessions',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.hash = '#quarter-matrix-section'`)
        },
        {
          label: 'Daily Trading Journal (Sticky Notes)',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.hash = '#daily-trading-journal-section'`)
        },
        {
          label: 'Live MT5 Execution Bridge',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.hash = '#mt5-journal-section'`)
        },
        {
          label: '48-Week Objectives & Milestones',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.hash = '#weekly-objectives-section'`)
        },
        {
          label: 'Interactive Growth & Compounding Chart',
          accelerator: 'CmdOrCtrl+5',
          click: () => mainWindow.webContents.executeJavaScript(`window.location.hash = '#growth-chart-section'`)
        }
      ]
    },
    {
      label: '&View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
        }
      ]
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'Rule 01 // Spiritual Devotion Foundation',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Rule 01 Spiritual Foundation Gate',
              message: 'Rule 01: 1-Hour Morning Devotion & Prayer Gate',
              detail: 'Zero trading before 1 full hour of Bible reading, meditation, and prayer. Platform stays shut until spirit and mind are fully centered.\n\nVerify your devotion gate daily in the top action bar before taking setups.'
            });
          }
        },
        {
          label: 'Rule 05 // 50% Risk Demotion Protocol',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'warning',
              title: 'Rule 05 Mechanical Circuit Breaker',
              message: 'Rule 05: 50% Risk Demotion on 2 Losses',
              detail: 'If two consecutive losses occur in a single day, risk is mechanically cut in half (50% lot reduction) for subsequent days to protect capital.'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'About Transformer19 Desktop',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Transformer19 Cockpit',
              message: 'Transformer19 — 100K Trading Execution Cockpit',
              detail: 'Version 1.0.0 (Windows Native Edition)\n\n48-Week Master Compounding Framework from $50 Seed to $49,000 Working Equity + $9,990 Offline Cash Sweeps ($58,990 Total Value).\n\nPowered by LibSQL / SQLite high-performance database & React 19.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Smooth appearance when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in default web browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Load the running application
  mainWindow.loadURL(SERVER_URL).catch((err) => {
    console.error('Failed to load Cockpit URL:', err);
    // Retry once after 2 seconds
    setTimeout(() => {
      mainWindow.loadURL(SERVER_URL);
    }, 2000);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});
ipcMain.on('open-external', (_event, url) => {
  if (url && (url.startsWith('http:') || url.startsWith('https:'))) {
    shell.openExternal(url);
  }
});

// App Lifecycle
app.whenReady().then(async () => {
  await ensureServerRunning();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On Windows, quit app when all windows are closed
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      try {
        serverProcess.kill();
      } catch {
        // ignore
      }
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch {
      // ignore
    }
  }
});
