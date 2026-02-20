/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: config/cache.js
 * Descripción: Servicio de caché en memoria para datos estáticos y frecuentes
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import NodeCache from 'node-cache';

// Configuración del caché
// stdTTL: tiempo de vida por defecto en segundos
// checkperiod: frecuencia de verificación de expiración
// useClones: false para mejor performance (datos inmutables)
const cache = new NodeCache({
  stdTTL: 300, // 5 minutos por defecto
  checkperiod: 60, // Verificar cada minuto
  useClones: false, // Mejor performance, asume datos inmutables
  deleteOnExpire: true,
  maxKeys: 1000 // Máximo 1000 keys en caché
});

/**
 * Configuración de TTL por tipo de dato
 * Datos más estáticos = TTL más largo
 */
export const CACHE_TTL = {
  // Datos muy estáticos (cambian raramente)
  CARGOS: 3600,              // 1 hora
  MUNICIPIOS: 3600,          // 1 hora
  DEPARTAMENTOS: 3600,       // 1 hora
  RELIGIONES: 3600,          // 1 hora
  ENTIDADES: 3600,           // 1 hora (EPS, ARL, Pensión, Cesantías)
  SALARIOS: 1800,            // 30 minutos
  
  // Datos semi-estáticos
  INSTITUCIONES: 900,        // 15 minutos
  MENSAJES_DIA: 300,         // 5 minutos
  RECTORES: 900,             // 15 minutos
  
  // Datos dinámicos (caché corto)
  AFILIADOS_LIST: 180,       // 3 minutos
  CUOTAS: 120,               // 2 minutos
  USUARIOS: 300,             // 5 minutos
  
  // Stats y reportes
  STATS: 60,                 // 1 minuto
};

/**
 * Keys de caché predefinidas
 */
export const CACHE_KEYS = {
  ALL_CARGOS: 'all_cargos',
  ALL_MUNICIPIOS: 'all_municipios',
  ALL_DEPARTAMENTOS: 'all_departamentos',
  ALL_RELIGIONES: 'all_religiones',
  ALL_EPS: 'all_eps',
  ALL_ARL: 'all_arl',
  ALL_PENSION: 'all_pension',
  ALL_CESANTIAS: 'all_cesantias',
  ALL_INSTITUCIONES: 'all_instituciones',
  MENSAJE_DIA: 'mensaje_dia',
  MUNICIPIOS_BY_DEPTO: (depto) => `municipios_depto_${depto}`,
  SALARIO_CARGO_MUN: (cargo, municipio) => `salario_${cargo}_${municipio}`,
  AFILIADOS_BY_DEPTO: (depto) => `afiliados_depto_${depto}`,
  COUNT_AFILIADOS: 'count_afiliados',
  COUNT_USUARIOS: 'count_usuarios',
};

/**
 * Helpers para gestión de caché
 */

// Obtener valor del caché
export const getCache = (key) => {
  try {
    const value = cache.get(key);
    if (value) {
      console.log(`✅ Cache hit: ${key}`);
    } else {
      console.log(`❌ Cache miss: ${key}`);
    }
    return value;
  } catch (error) {
    console.error(`Error al obtener cache para key ${key}:`, error);
    return undefined;
  }
};

// Guardar en caché
export const setCache = (key, value, ttl = null) => {
  try {
    const success = cache.set(key, value, ttl || CACHE_TTL.DEFAULT);
    if (success) {
      console.log(`💾 Cache set: ${key} (TTL: ${ttl || 'default'}s)`);
    }
    return success;
  } catch (error) {
    console.error(`Error al guardar cache para key ${key}:`, error);
    return false;
  }
};

// Eliminar del caché
export const deleteCache = (key) => {
  try {
    const count = cache.del(key);
    console.log(`🗑️  Cache delete: ${key} (${count} keys eliminadas)`);
    return count;
  } catch (error) {
    console.error(`Error al eliminar cache para key ${key}:`, error);
    return 0;
  }
};

// Limpiar caché completo
export const flushCache = () => {
  try {
    cache.flushAll();
    console.log('🧹 Cache completamente limpiado');
    return true;
  } catch (error) {
    console.error('Error al limpiar cache:', error);
    return false;
  }
};

// Limpiar caché por patrón (ej: todos los afiliados)
export const flushCacheByPattern = (pattern) => {
  try {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));
    keysToDelete.forEach(key => cache.del(key));
    console.log(`🧹 Cache limpiado por patrón "${pattern}": ${keysToDelete.length} keys eliminadas`);
    return keysToDelete.length;
  } catch (error) {
    console.error(`Error al limpiar cache por patrón ${pattern}:`, error);
    return 0;
  }
};

// Obtener estadísticas del caché
export const getCacheStats = () => {
  try {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      ksize: cache.getStats().ksize,
      vsize: cache.getStats().vsize
    };
  } catch (error) {
    console.error('Error al obtener stats del cache:', error);
    return null;
  }
};

// Event listeners para monitoreo
cache.on('set', (key, value) => {
  // Solo loggear en desarrollo para evitar spam
  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 Cache set event: ${key}`);
  }
});

cache.on('del', (key, value) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🗑️  Cache del event: ${key}`);
  }
});

cache.on('expired', (key, value) => {
  console.log(`⏰ Cache expired: ${key}`);
});

cache.on('flush', () => {
  console.log('🧹 Cache flushed');
});

export default cache;
