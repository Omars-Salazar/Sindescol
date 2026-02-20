/**
 * SINDESCOL - Aplicación de Escritorio
 * 
 * Archivo: desktop/main.js
 * Descripción: Punto de entrada de Electron - Inicia Backend + Frontend
 * 
 * @author Omar Santiago Salazar
 * @version 1.0.0
 */

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const { initAutoUpdater, handleAppClose, requestUpdateDownload, getUpdateHistory, getLastUpdateInfo } = require('./auto-updater');

// Verificar si está en modo desarrollo
// app.isPackaged es true cuando está empacado/instalado
// Será false cuando ejecutamos desde npm start en desarrollo
let isDev = !app.isPackaged;

console.log('[Main] Process ENV NODE_ENV:', JSON.stringify(process.env.NODE_ENV));
console.log('[Main] app.isPackaged:', app.isPackaged);
console.log('[Main] isDev:', isDev);

// Configurar logging
log.transports.file.level = 'debug';
autoUpdater.logger = log;

let mainWindow;
let backendProcess;
let frontendServer;
const BACKEND_PORT = 4000;
const FRONTEND_PORT = 3000;

/**
 * Crea la ventana principal de Electron
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    icon: path.join(__dirname, '../frontend/public/escudo_sindescol.png')
  });

  // Cargar la aplicación
  if (isDev) {
    // En desarrollo: Vite dev server
    const devUrl = 'http://localhost:5173';
    console.log('[Window] Loading dev URL:', devUrl);
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // En producción: servir desde servidor local
    const prodUrl = `http://localhost:${FRONTEND_PORT}`;
    console.log('[Window] Loading production URL:', prodUrl);
    mainWindow.loadURL(prodUrl);
  }

  // Logging de carga
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('[Window] Started loading');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Window] Finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.log('[Window] Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendProcess) {
      backendProcess.kill();
    }
  });
}

/**
 * Inicia el servidor backend Node.js (desarrollo) o backend.exe (producción)
 */
function startBackend() {
  return new Promise((resolve, reject) => {
    try {
      let backendCommand;
      let backendArgs = [];
      let backendCwd;

      if (isDev) {
        // Desarrollo: ejecutar con Node
        backendCommand = 'node';
        backendArgs = [path.resolve(__dirname, '../backend/server.js')];
        backendCwd = path.resolve(__dirname, '../backend');
        console.log('[Backend] Development mode: Running with Node');
      } else {
        // Producción: ejecutar el EXE empaquetado
        // Los extraResources de electron-builder se copian a process.resourcesPath
        const backendPath = path.join(process.resourcesPath, 'backend.exe');
        
        backendCommand = backendPath;
        backendCwd = process.resourcesPath;
        console.log('[Backend] Production mode: Running backend.exe');
      }

      console.log('[Backend] Command:', backendCommand);
      console.log('[Backend] Working directory:', backendCwd);
      console.log('[Backend] File exists:', fs.existsSync(backendCommand));

      backendProcess = spawn(backendCommand, backendArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: backendCwd,
        env: {
          ...process.env,
          PORT: BACKEND_PORT,
          NODE_ENV: isDev ? 'development' : 'production'
        }
      });

      let backendReady = false;

      backendProcess.stdout?.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          console.log('[Backend]', message);
          log.info(`Backend: ${message}`);
          
          // Detectar servidor listo
          if (!backendReady && (message.toLowerCase().includes('server') || message.toLowerCase().includes('port') || message.toLowerCase().includes('listening'))) {
            backendReady = true;
            console.log('[Backend] ✅ Backend is ready!');
            resolve();
          }
        }
      });

      backendProcess.stderr?.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          console.error('[Backend ERROR]', message);
          log.error(`Backend: ${message}`);
        }
      });

      backendProcess.on('error', (error) => {
        console.error('[Backend] Failed to start:', error.message);
        log.error(`Backend Start Error: ${error}`);
        if (!backendReady) {
          reject(error);
        }
      });

      backendProcess.on('exit', (code, signal) => {
        console.log(`[Backend] Exited with code ${code} and signal ${signal}`);
        if (!backendReady && code !== 0) {
          reject(new Error(`Backend exited with code ${code}`));
        }
      });

      // Timeout de 15 segundos
      const timeout = setTimeout(() => {
        if (!backendReady) {
          backendReady = true;
          console.log('[Backend] ⚠️ Timeout after 15s - continuing anyway');
          resolve();
        }
      }, 15000);

      // Limpiar timeout si se resuelve antes
      const originalResolve = resolve;
      resolve = (value) => {
        clearTimeout(timeout);
        originalResolve(value);
      };

    } catch (error) {
      console.error('[Backend] Exception:', error.message);
      reject(error);
    }
  });
}

/**
 * Inicia servidor HTTP para servir los archivos dist en producción
 */
function startFrontendServer() {
  return new Promise((resolve, reject) => {
    const distPath = path.join(app.getAppPath(), 'frontend', 'dist');
    
    console.log('[Frontend Server] Starting from:', distPath);
    
    // Verificar que exista la carpeta
    if (!fs.existsSync(distPath)) {
      reject(new Error('Frontend dist folder not found: ' + distPath));
      return;
    }

    const server = http.createServer((req, res) => {
      const requestUrl = new URL(req.url, 'http://localhost');
      const safePath = decodeURIComponent(requestUrl.pathname || '/');
      const normalizedPath = path.normalize(path.join(distPath, safePath));

      // Evitar path traversal
      if (!normalizedPath.startsWith(distPath)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400 Bad Request');
        return;
      }

      let filePath = normalizedPath;
      const exists = fs.existsSync(filePath);
      const isDir = exists && fs.statSync(filePath).isDirectory();
      const isRoot = safePath === '/';

      // Si es un directorio, root o ruta SPA, servir index.html
      if (isRoot || isDir || !exists) {
        filePath = path.join(distPath, 'index.html');
      }
      
      // Leer y servir archivo
      fs.readFile(filePath, (err, content) => {
        if (err) {
          // Si no existe el archivo, servir index.html (SPA fallback)
          fs.readFile(path.join(distPath, 'index.html'), (err2, content2) => {
            if (err2) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content2);
            }
          });
        } else {
          // Determinar content-type
          let contentType = 'text/plain';
          if (filePath.endsWith('.html')) contentType = 'text/html';
          else if (filePath.endsWith('.js')) contentType = 'application/javascript';
          else if (filePath.endsWith('.css')) contentType = 'text/css';
          else if (filePath.endsWith('.json')) contentType = 'application/json';
          else if (filePath.endsWith('.png')) contentType = 'image/png';
          else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
          else if (filePath.endsWith('.gif')) contentType = 'image/gif';
          else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
          else if (filePath.endsWith('.ico')) contentType = 'image/x-icon';
          
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    server.listen(FRONTEND_PORT, '127.0.0.1', () => {
      console.log(`[Frontend Server] Running on http://localhost:${FRONTEND_PORT}`);
      frontendServer = server;
      resolve();
    });

    server.on('error', (err) => {
      console.error('[Frontend Server] Error:', err);
      reject(err);
    });
  });
}

/**
 * Evento: cuando Electron ha finalizadoinitialization
 */
app.on('ready', async () => {
  try {
    console.log('[App] Starting SINDESCOL...');
    
    // Iniciar backend (desarrollo o producción)
    console.log('[App] Starting backend...');
    try {
      await startBackend();
      console.log('[App] Backend ready!');
    } catch (error) {
      console.warn('[App] Backend error (non-fatal):', error.message);
    }
    
    // En desarrollo, esperar a que Vite esté listo
    if (isDev) {
      console.log('[App] In dev mode, waiting for Vite...');
      await waitForVite();
      console.log('[App] Vite ready!');
    } else {
      // En producción, iniciar servidor frontend
      console.log('[App] In production mode, starting frontend server...');
      await startFrontendServer();
      console.log('[App] Frontend server ready!');
    }
    
    // Crear ventana
    console.log('[App] Creating window...');
    createWindow();
    console.log('[App] Window created!');
    
    // Configurar menú
    setupMenu();
    
    // Inicializar sistema de actualización automática
    initAutoUpdater(mainWindow);

  } catch (error) {
    console.error('[App] Error during startup:', error);
    log.error('Error al iniciar aplicación:', error);
    dialog.showErrorBox(
      'Error de Inicio',
      'No se pudo iniciar SINDESCOL. Por favor, intenta de nuevo.\n\nError: ' + error.message
    );
    app.quit();
  }
});

/**
 * Espera a que Vite esté listo en puerto 5173
 */
function waitForVite() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 intentos = ~30 segundos

    const checkVite = () => {
      console.log(`[Vite] Checking attempt ${attempts + 1}/${maxAttempts}...`);
      
      const http = require('http');
      const req = http.get('http://localhost:5173', (res) => {
        if (res.statusCode === 200) {
          console.log('[Vite] Ready!');
          resolve();
        } else {
          attemptAgain();
        }
      });

      req.on('error', () => {
        attemptAgain();
      });

      req.setTimeout(1000);
    };

    const attemptAgain = () => {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkVite, 1000);
      } else {
        console.log('[Vite] Timeout waiting for Vite, continuing anyway...');
        resolve();
      }
    };

    checkVite();
  });
}

/**
 * Evento: cuando todas las ventanas se cierran
 */
app.on('window-all-closed', () => {
  // Cerrar servidor frontend si está corriendo
  if (frontendServer) {
    frontendServer.close();
  }
  // Cerrar backend si está corriendo
  if (backendProcess) {
    backendProcess.kill();
  }

  // Manejar actualización si está descargada
  if (handleAppClose()) {
    // La actualización se instalará automáticamente
    return;
  }

  // Salir en Windows, pero no en macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Evento: cuando la app se reactiva en macOS
 */
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * IPC: Escuchar eventos desde el frontend
 */
ipcMain.on('app-version', (event) => {
  event.reply('app-version', { version: app.getVersion() });
});

ipcMain.handle('app-version', () => ({ version: app.getVersion() }));

ipcMain.handle('download-update', () => {
  requestUpdateDownload();
  return { started: true };
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { 
      updateAvailable: result?.updateInfo?.version !== app.getVersion(),
      currentVersion: app.getVersion(),
      updateVersion: result?.updateInfo?.version
    };
  } catch (error) {
    console.error('[IPC] Check updates error:', error.message);
    return { error: error.message };
  }
});

ipcMain.handle('get-update-history', () => {
  const history = getUpdateHistory();
  return history;
});

ipcMain.handle('get-last-update-info', () => {
  const updateInfo = getLastUpdateInfo();
  return updateInfo || null;
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) mainWindow.close();
});


/**
 * Configurar menú de la aplicación
 */
function setupMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            if (frontendServer) {
              frontendServer.close();
            }
            if (backendProcess) {
              backendProcess.kill();
            }
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de SINDESCOL',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de SINDESCOL',
              message: 'SINDESCOL v' + app.getVersion(),
              detail: 'Sistema de Gestión Sindical para Colombia'
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

module.exports = { mainWindow, backendProcess };
