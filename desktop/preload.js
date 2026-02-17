/**
 * SINDESCOL - Preload Script
 * 
 * Archivo: desktop/preload.js
 * Descripción: Puente seguro entre el main process y el renderer
 * 
 * @author Omar Santiago Salazar
 * @version 1.0.0
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Información de la aplicación
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  
  // Actualizaciones
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  
  restartApp: () => {
    ipcRenderer.send('restart-app');
  },
  
  // Navegación de archivos
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  
  // Comandos del sistema
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getAppPath: () => ipcRenderer.invoke('get-app-path')
});
