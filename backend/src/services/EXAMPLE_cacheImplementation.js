/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: services/cargosService.EXAMPLE.js
 * Descripción: EJEMPLO de implementación de caché en servicios
 * 
 * Este archivo muestra cómo integrar el caché en servicios existentes.
 * Para aplicar en otros servicios, seguir este patrón.
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 */

import db from "../config/db.js";
import { getCache, setCache, deleteCache, CACHE_KEYS, CACHE_TTL } from "../config/cache.js";
import { getErrorMessage } from "../utils/errorMessages.js";

// ============================================
// OBTENER TODOS LOS CARGOS (CON CACHÉ)
// ============================================
export const getAllCargosConCache = async () => {
  // Intentar obtener del caché primero
  const cached = getCache(CACHE_KEYS.ALL_CARGOS);
  if (cached) {
    console.log('✅ Cargos obtenidos del caché');
    return cached;
  }

  // Si no está en caché, consultar BD
  console.log('❌ Caché miss - consultando BD');
  const [cargos] = await db.query(`
    SELECT c.id_cargo, c.nombre_cargo,
           COUNT(DISTINCT a.id_afiliado) as total_afiliados
    FROM cargos c
    LEFT JOIN afiliados a ON c.id_cargo = a.id_cargo
    GROUP BY c.id_cargo, c.nombre_cargo
    ORDER BY c.nombre_cargo
  `);

  // Guardar en caché
  setCache(CACHE_KEYS.ALL_CARGOS, cargos, CACHE_TTL.CARGOS);
  
  return cargos;
};

// ============================================
// OBTENER CARGOS POR DEPARTAMENTO (CON CACHÉ)
// ============================================
export const getCargosByDepartamentoConCache = async (departamento) => {
  // Key de caché específica por departamento
  const cacheKey = `cargos_depto_${departamento}`;
  
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`✅ Cargos de ${departamento} obtenidos del caché`);
    return cached;
  }

  console.log(`❌ Caché miss - consultando cargos de ${departamento}`);
  const [cargos] = await db.query(`
    SELECT DISTINCT c.id_cargo, c.nombre_cargo,
           COUNT(DISTINCT a.id_afiliado) as total_afiliados
    FROM cargos c
    LEFT JOIN salarios_municipios sm ON c.id_cargo = sm.id_cargo
    LEFT JOIN municipios m ON sm.id_municipio = m.id_municipio
    LEFT JOIN afiliados a ON c.id_cargo = a.id_cargo 
      AND a.municipio_trabajo = m.id_municipio
    WHERE m.departamento = ?
    GROUP BY c.id_cargo, c.nombre_cargo
    ORDER BY c.nombre_cargo
  `, [departamento]);

  // Caché más corto para datos filtrados
  setCache(cacheKey, cargos, CACHE_TTL.CARGOS / 2); // 30 minutos
  
  return cargos;
};

// ============================================
// CREAR NUEVO CARGO (INVALIDA CACHÉ)
// ============================================
export const crearCargoConCache = async (nombreCargo) => {
  // Crear el cargo
  const [result] = await db.query(
    'INSERT INTO cargos (nombre_cargo) VALUES (?)',
    [nombreCargo]
  );

  // IMPORTANTE: Invalidar caché relacionado
  deleteCache(CACHE_KEYS.ALL_CARGOS);
  
  // También invalidar todos los cargos por departamento
  // (o mejor, usar flushCacheByPattern('cargos_depto_'))
  console.log('🗑️  Caché de cargos invalidado después de crear');

  return { id_cargo: result.insertId, nombre_cargo: nombreCargo };
};

// ============================================
// ACTUALIZAR CARGO (INVALIDA CACHÉ)
// ============================================
export const actualizarCargoConCache = async (id, nombreCargo) => {
  const [result] = await db.query(
    'UPDATE cargos SET nombre_cargo = ? WHERE id_cargo = ?',
    [nombreCargo, id]
  );

  // Invalidar caché
  deleteCache(CACHE_KEYS.ALL_CARGOS);
  console.log('🗑️  Caché de cargos invalidado después de actualizar');

  return result;
};

// ============================================
// ELIMINAR CARGO (INVALIDA CACHÉ)
// ============================================
export const eliminarCargoConCache = async (id) => {
  const [result] = await db.query(
    'DELETE FROM cargos WHERE id_cargo = ?',
    [id]
  );

  // Invalidar caché
  deleteCache(CACHE_KEYS.ALL_CARGOS);
  console.log('🗑️  Caché de cargos invalidado después de eliminar');

  return result;
};

// ============================================
// PATRÓN GENERAL PARA IMPLEMENTAR CACHÉ
// ============================================

/**
 * PATRÓN 1: Datos Estáticos (raramente cambian)
 * 
 * 1. Definir key en CACHE_KEYS (cache.js)
 * 2. Definir TTL en CACHE_TTL (cache.js)
 * 3. En función GET:
 *    - Intentar getCache() primero
 *    - Si miss, consultar BD
 *    - setCache() con resultado
 * 4. En funciones CREATE/UPDATE/DELETE:
 *    - Ejecutar operación
 *    - deleteCache() o flushCacheByPattern()
 */

/**
 * PATRÓN 2: Datos Semi-Dinámicos (consultas frecuentes pero datos cambian)
 * 
 * - Usar TTL más corto (60-300 segundos)
 * - Implementar "cache stampede prevention":
 */
export const ejemploCacheStampede = async () => {
  const cacheKey = 'datos_pesados';
  
  // Check caché
  let datos = getCache(cacheKey);
  if (datos) return datos;

  // Si no está, obtener con lock (evitar múltiples queries simultáneos)
  const lockKey = `${cacheKey}_lock`;
  if (getCache(lockKey)) {
    // Otro proceso está cargando, esperar un momento
    await new Promise(resolve => setTimeout(resolve, 100));
    return getCache(cacheKey) || []; // Retry
  }

  // Establecer lock
  setCache(lockKey, true, 10); // Lock por 10 segundos

  try {
    // Query pesado
    const [result] = await db.query('SELECT * FROM tabla_grande LIMIT 1000');
    
    // Guardar en caché
    setCache(cacheKey, result, 300); // 5 minutos
    
    return result;
  } finally {
    // Liberar lock
    deleteCache(lockKey);
  }
};

/**
 * PATRÓN 3: Datos con Parámetros Dinámicos
 * 
 * - Usar función para generar keys únicas
 * - Ejemplo: CACHE_KEYS.MUNICIPIOS_BY_DEPTO(depto)
 */

/**
 * MEJORES PRÁCTICAS:
 * 
 * 1. ✅ Cachea datos que se consultan frecuentemente
 * 2. ✅ USA TTLs apropiados según frecuencia de cambio
 * 3. ✅ SIEMPRE invalida caché después de writes
 * 4. ✅ Loggea cache hits/misses para monitoreo
 * 5. ✅ No cachees datos sensibles (passwords, tokens)
 * 6. ✅ Considera paginación para datasets grandes
 * 7. ✅ Usa flushCacheByPattern() para limpiezas masivas
 * 8. ⚠️  CUIDADO con usar demasiada RAM en caché
 * 9. ⚠️  Monitorea getCacheStats() regularmente
 * 10. ⚠️ En caso de duda, TTL más corto es mejor
 */
