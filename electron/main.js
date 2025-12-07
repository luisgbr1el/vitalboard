import { app, BrowserWindow, Menu, shell, dialog, ipcMain } from 'electron';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import waitOn from 'wait-on';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const port = process.env.PORT || 3000;
const vitePort = process.env.VITE_PORT || 5173;

const userDataPath = app.getPath('userData');
const appDataDir = join(userDataPath, 'app-data');
const serverDataDir = join(appDataDir, 'data');
const uploadsDir = join(appDataDir, 'uploads');

let mainWindow;
let serverProcess;

function initializeAppData() {
  try {
    if (!existsSync(appDataDir)) {
      mkdirSync(appDataDir, { recursive: true });
    }
    
    if (!existsSync(serverDataDir)) {
      mkdirSync(serverDataDir, { recursive: true });
    }
    
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const settingsPath = join(serverDataDir, 'settings.json');
    const charactersPath = join(serverDataDir, 'characters.json');

    if (!existsSync(settingsPath)) {
      const defaultSettings = {
        general: { language: "en-US" },
        overlay: {
          show_icon: true,
          show_character_icon: true,
          show_health: true,
          show_name: true,
          font_size: 14,
          font_family: "Arial",
          font_color: "#000000",
          icons_size: 64,
          character_icon_size: 170,
          health_icon_file_path: null
        }
      };
      writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    }

    if (!existsSync(charactersPath)) {
      const defaultCharacters = [];
      writeFileSync(charactersPath, JSON.stringify(defaultCharacters, null, 2));
    }
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: join(__dirname, 'preload.cjs'),
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    icon: join(__dirname, '../build/icon.png'),
    frame: false,
    backgroundColor: '#212121'
  });

  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${vitePort}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://localhost:${port}`);
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

async function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = join(__dirname, '../server/server.js');

    serverProcess = spawn('node', [serverPath], {
      cwd: join(__dirname, '..'),
      env: { 
        ...process.env, 
        NODE_ENV: isDev ? 'development' : 'production',
        USER_DATA_PATH: appDataDir,
        SETTINGS_PATH: join(serverDataDir, 'settings.json'),
        CHARACTERS_PATH: join(serverDataDir, 'characters.json'),
        UPLOADS_DIR: uploadsDir
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let resolved = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if ((output.includes('Server running on') || output.includes('listening on')) && !resolved) {
        resolved = true;
        setTimeout(() => resolve(), 1000);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
      if (!resolved) {
        resolved = true;
        reject(error);
      }
    });

    serverProcess.on('close', (code) => {
      if (code !== 0 && !resolved) {
        resolved = true;
        reject(new Error(`Server process exited with code ${code}`));
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 8000);
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

app.whenReady().then(async () => {
  try {
    initializeAppData();
    await startServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (!isDev) {
      await waitOn({
        resources: [`http://localhost:${port}/api/characters`],
        delay: 2000,
        interval: 500,
        timeout: 30000,
        verbose: true
      });
    } else {
      await waitOn({
        resources: [
          `http://localhost:${port}/api/characters`,
          `http://localhost:${vitePort}`
        ],
        delay: 2000,
        interval: 500,
        timeout: 30000,
        verbose: true
      });
    }
    
    createWindow();

  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox(
      'Erro de Inicialização',
      `Falha ao iniciar a aplicação: ${error.message}`
    );
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopServer();
});

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