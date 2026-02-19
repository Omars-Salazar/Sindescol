 /**
 * SINDESCOL - Auto Updater
 * 
 * Archivo: desktop/auto-updater.js
 * Descripción: Módulo de actualización automática usando GitHub Releases
 * 
 * @author Omar Santiago Salazar
 * @version 1.0.4
 */

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { dialog } = require('electron');

// Configurar electron-updater para GitHub Releases
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'OmarSsalazar',
  repo: 'Sindescol'
});

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

let updateDownloaded = false;

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
    
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate
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
    console.error('[AutoUpdater] ❌ Error:', err?.message || err);
    log.error(`[AutoUpdater] Error: ${err?.message || err}`);
  });

  // Evento: Descargando actualización
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(
      '[AutoUpdater] 📥 Descargando:',
      Math.round((progressObj.transferred / progressObj.total) * 100) + '%'
    );

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-download-progress', {
        percent: Math.round((progressObj.transferred / progressObj.total) * 100),
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total
      });
    }
  });

  // Evento: Actualización descargada (lista para instalar)
  autoUpdater.on('update-downloaded', (info) => {
    updateDownloaded = true;
    console.log('[AutoUpdater] ✅ Actualización descargada:', info.version);
    console.log('[AutoUpdater] Se instalará al cerrar la aplicación');

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', {
        version: info.version,
        releaseDate: info.releaseDate
      });
    }

    log.info(`[AutoUpdater] Update downloaded: ${info.version}`);

    // Mostrar notificación
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Actualización Lista',
        message: `SINDESCOL ${info.version} está listo para instalar`,
        detail: 'Se instalará cuando cierre la aplicación',
        buttons: ['OK', 'Instalar Ahora']
      }).then((result) => {
        if (result.response === 1) {
          // El usuario quiere instalar ahora
          installUpdate();
        }
      });
    }
  });

  // Buscar actualizaciones cada 10 minutos
  setInterval(() => {
    console.log('[AutoUpdater] 🔍 Verificando actualizaciones...');
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000); // 10 minutos

  // Buscar actualizaciones al iniciar
  console.log('[AutoUpdater] 🔍 Buscando actualizaciones...');
  autoUpdater.checkForUpdates();
}

/**
 * Instalar la actualización y reiniciar
 */
function installUpdate() {
  console.log('[AutoUpdater] 🔄 Instalando actualización...');
  autoUpdater.quitAndInstall();
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
  handleAppClose,
  isUpdateDownloaded: () => updateDownloaded
};
