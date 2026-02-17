/**
 * SINDESCOL - Configuración de API
 * 
 * Archivo: src/config/api.config.js
 * Descripción: Configuración centralizada de la URL del API
 * Detecta automáticamente el entorno (desarrollo/producción)
 * 
 * @version 1.0.0
 * @license MIT
 */

/**
 * Obtiene la URL base del API según el entorno
 * - En desarrollo (Vite): http://localhost:4000
 * - En producción (Electron/Instalador): http://localhost:4000
 * - En navegador externo: usa window.location.hostname
 */
export function getApiBaseUrl() {
  // En desarrollo (cuando se ejecuta con npm run dev)
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }

  // En producción empaquetada, siempre usar localhost:4000
  // El backend corre internamente en el instalador Electron
  return 'http://localhost:4000';
}

/**
 * Obtiene la URL completa del endpoint API
 * @param {string} endpoint - El endpoint (ej: '/auth/login')
 * @returns {string} - La URL completa del API
 */
export function getApiUrl(endpoint) {
  const baseUrl = getApiBaseUrl();
  // Asegurar que endpoint empiece con /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${path}`;
}

// URL base del API
export const API_BASE_URL = getApiBaseUrl();

// URL completa del API con /api incluido
export const API_URL = `${API_BASE_URL}/api`;

export default {
  API_BASE_URL,
  API_URL,
  getApiBaseUrl,
  getApiUrl
};
