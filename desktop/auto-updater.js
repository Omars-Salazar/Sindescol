 /**
 * SINDESCOL - Auto Updater
 * 
 * Archivo: desktop/auto-updater.js
 * Descripción: Módulo de actualización automática usando GitHub Releases
 * Maneja: Detección, descarga, instalación y reinicio para aplicar actualizaciones
 * 
 * @author Omar Santiago Salazar
 * @version 1.1.0
 */

const { autoUpdater } = require('electron-updater');
const { app } = require('electron');
const log = require('electron-log');
const path = require('path');
const fs = require('fs');

// Configurar electron-updater para GitHub Releases
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'OmarSsalazar',
  repo: 'Sindescol'
});

// Configurar para usar solo el instalador NSIS (no portable)
autoUpdater.allowDowngrade = false;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

let updateDownloaded = false;
let downloadInProgress = false;
let lastUpdateInfo = null;

// Ruta para almacenar información de versiones descargadas
const getUpdateHistoryPath = () => path.join(app.getPath('userData'), 'update-history.json');

/**
 * Inicializar el sistema de actualizaciones automáticas
 * @param {BrowserWindow} mainWindow - Ventana principal de Electron
 */
function initAutoUpdater(mainWindow) {
  console.log('[AutoUpdater] Inicializando actualizador automático...');
  console.log('[AutoUpdater] Repo: github.com/OmarSsalazar/Sindescol');

  // Evento: Actualización disponible
  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] ✅ Nueva versión disponible:', info.version);
    console.log('[AutoUpdater] Release date:', info.releaseDate);
    downloadInProgress = false;
    lastUpdateInfo = info;
    
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        files: info.files,
        sha512: info.sha512,
        releaseName: info.releaseName
      });
    }

    log.info(`[AutoUpdater] Update available: ${info.version}`);
  });

  // Evento: No hay actualización disponible
  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] ℹ️ App está actualizada');
    log.info('[AutoUpdater] App is up to date');
  });

  // Evento: Error al buscar actualización
  autoUpdater.on('error', (err) => {
    const errorMessage = err?.message || err?.toString() || 'Error desconocido';
    const errorCode = err?.code || 'UNKNOWN';
    
    // Solo mostrar error si no es un error común de "no hay actualizaciones"
    const isNetworkError = errorCode === 'ENOTFOUND' || errorCode === 'ERR_UPDATER_LATEST_VERSION_NOT_FOUND';
    
    if (!isNetworkError) {
      console.error('[AutoUpdater] ❌ Error:', errorMessage);
      log.error(`[AutoUpdater] Error: ${errorMessage}`);
    }
    
    const wasDownloading = downloadInProgress;
    downloadInProgress = false;

    // Solo notificar al frontend si estaba en medio de una descarga
    if (mainWindow && !mainWindow.isDestroyed() && wasDownloading) {
      mainWindow.webContents.send('update-error', errorMessage);
    }
  });

  // Evento: Descargando actualización
  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round((progressObj.transferred / progressObj.total) * 100);
    console.log('[AutoUpdater] 📥 Descargando:', percent + '%');
    downloadInProgress = true;

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-download-progress', {
        percent: percent,
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total,
        remainingTime: progressObj.remainingTime
      });
    }
  });

  // Evento: Actualización descargada (lista para instalar)
  autoUpdater.on('update-downloaded', (info) => {
    updateDownloaded = true;
    downloadInProgress = false;
    lastUpdateInfo = info;
    
    console.log('[AutoUpdater] ✅ Actualización descargada:', info.version);
    console.log('[AutoUpdater] Se instalará al cerrar/reiniciar la aplicación');
    
    // Guardar información de versión descargada
    saveUpdateHistory(info);

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
        releaseDate: info.releaseDate,
        files: info.files,
        releaseName: info.releaseName
      });
    }

    log.info(`[AutoUpdater] Update downloaded: ${info.version}`);
  });

  // Buscar actualizaciones cada 10 minutos
  setInterval(() => {
    console.log('[AutoUpdater] 🔍 Verificando actualizaciones...');
    autoUpdater.checkForUpdates().catch(err => {
      console.error('[AutoUpdater] Check failed:', err?.message || err);
    });
  }, 10 * 60 * 1000); // 10 minutos

  // Buscar actualizaciones al iniciar (después de 5 segundos)
  setTimeout(() => {
    console.log('[AutoUpdater] 🔍 Buscando actualizaciones...');
    autoUpdater.checkForUpdates().catch(err => {
      console.error('[AutoUpdater] Initial check failed:', err?.message || err);
    });
  }, 5000);
}

/**
 * Guardar información de versión actualizada
 * @param {Object} updateInfo - Información de la actualización
 */
function saveUpdateHistory(updateInfo) {
  try {
    const updateHistoryPath = getUpdateHistoryPath();
    const historyDir = path.dirname(updateHistoryPath);
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    let history = [];
    if (fs.existsSync(updateHistoryPath)) {
      try {
        const data = fs.readFileSync(updateHistoryPath, 'utf-8');
        history = JSON.parse(data);
      } catch (parseErr) {
        console.warn('[AutoUpdater] Could not parse update history:', parseErr.message);
      }
    }

    history.push({
      version: updateInfo.version,
      downloadDate: new Date().toISOString(),
      releaseDate: updateInfo.releaseDate,
      installed: false
    });

    // Mantener solo los últimos 10 registros
    if (history.length > 10) {
      history = history.slice(-10);
    }

    fs.writeFileSync(updateHistoryPath, JSON.stringify(history, null, 2));
    console.log('[AutoUpdater] Update history saved');
  } catch (err) {
    console.error('[AutoUpdater] Error saving update history:', err.message);
  }
}

/**
 * Obtener información del último actualización descargada
 * @returns {Object|null} Información de la última actualización o null
 */
function getLastUpdateInfo() {
  return lastUpdateInfo;
}

/**
 * Obtener historial de actualizaciones
 * @returns {Array} Array con el historial de actualizaciones
 */
function getUpdateHistory() {
  try {
    const updateHistoryPath = getUpdateHistoryPath();
    if (fs.existsSync(updateHistoryPath)) {
      const data = fs.readFileSync(updateHistoryPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('[AutoUpdater] Error reading update history:', err.message);
  }
  return [];
}

/**
 * Instalar la actualización y reiniciar
 */
function installUpdate() {
  console.log('[AutoUpdater] 🔄 Instalando actualización...');
  autoUpdater.quitAndInstall();
}

/**
 * Solicitar descarga de actualización
 */
function requestUpdateDownload() {
  if (downloadInProgress || updateDownloaded) {
    return;
  }

  console.log('[AutoUpdater] 📥 Iniciando descarga de actualización...');
  autoUpdater.downloadUpdate();
}

/**
 * Manejar cierre de la app para instalar actualización si está disponible
 */
function handleAppClose() {
  if (updateDownloaded) {
    console.log('[AutoUpdater] 🔄 Instalando actualización al cerrar...');
    autoUpdater.quitAndInstall();
    return true;
  }
  return false;
}

module.exports = {
  initAutoUpdater,
  installUpdate,
  requestUpdateDownload,
  handleAppClose,
  isUpdateDownloaded: () => updateDownloaded,
  getLastUpdateInfo,
  getUpdateHistory,
  saveUpdateHistory
};
