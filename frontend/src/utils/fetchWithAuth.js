/**
 * Wrapper de fetch que incluye automáticamente el token de autenticación
 */
import { getApiBaseUrl } from '../config/api.config.js';

export async function fetchWithAuth(url, options = {}) {
  // Obtener token de localStorage o sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Si no hay token, redirigir al login
  if (!token) {
    window.location.href = '/login';
    throw new Error('No hay token de autenticación');
  }

  // Construir URL completa si es relativa
  const apiBase = getApiBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;

  // Agregar headers de autenticación
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });

    // Si hay error 401, el token expiró o es inválido
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    if (!response.ok) {
      let message = response.statusText || 'Error de solicitud';
      try {
        const data = await response.clone().json();
        message = data?.message || data?.error || message;
      } catch (parseError) {
        // Si no hay JSON, mantener el mensaje por defecto
      }
      throw new Error(message);
    }

    return response;
  } catch (error) {
    // Si es un error de red, lanzarlo
    if (error.message === 'Sesión expirada' || error.message === 'No hay token de autenticación') {
      throw error;
    }
    
    // Para otros errores, también lanzarlos
    console.error('Error en fetchWithAuth:', error);
    throw error;
  }
}
