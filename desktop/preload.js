/**
 * SINDESCOL - Preload Script
 * 
 * Archivo: desktop/preload.js
 * Descripción: Puente seguro entre el main process y el renderer
 * Expone APIs de comunicación con el main process (auto-updater, file system, etc)
 * 
 * @author Omar Santiago Salazar
 * @version 1.1.0
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // ========================================
  // Información de la aplicación
  // ========================================
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  
  // ========================================
  // APIs de Actualizaciones
  // ========================================
  
  // Escuchadores de eventos de actualización
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
    return () => ipcRenderer.removeListener('update-available', callback);
  },
  
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
    return () => ipcRenderer.removeListener('update-downloaded', callback);
  },

  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-download-progress', callback);
    return () => ipcRenderer.removeListener('update-download-progress', callback);
  },

  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', callback);
    return () => ipcRenderer.removeListener('update-error', callback);
  },

  onUpdateInstalled: (callback) => {
    ipcRenderer.on('update-installed', callback);
    return () => ipcRenderer.removeListener('update-installed', callback);
  },

  // Métodos para controlar actualizaciones
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  
  restartApp: () => {
    ipcRenderer.send('restart-app');
  },

  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  getUpdateHistory: () => ipcRenderer.invoke('get-update-history'),

  getLastUpdateInfo: () => ipcRenderer.invoke('get-last-update-info'),
  
  // ========================================
  // Navegación de archivos
  // ========================================
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  // ========================================
  // Comandos del sistema
  // ========================================
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // ========================================
  // Control de ventana principal
  // ========================================
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window')
});
