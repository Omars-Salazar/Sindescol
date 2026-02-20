/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: routes/healthRoutes.js
 * Descripción: Rutas para health checks, métricas y monitoreo
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import express from 'express';
import pool from '../config/db.js';
import { getCacheStats } from '../config/cache.js';

const router = express.Router();

/**
 * GET /health - Health check básico
 * Respuesta rápida para verificar que el servidor está vivo
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /health/detailed - Health check detallado
 * Incluye verificación de BD, caché y recursos del sistema
 */
router.get('/health/detailed', async (req, res) => {
  const health = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unknown' },
      cache: { status: 'unknown' },
      memory: { status: 'unknown' }
    }
  };

  // Check database
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    health.checks.database = {
      status: 'healthy',
      message: 'Conexión a BD exitosa'
    };
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      message: error.message
    };
    health.success = false;
    health.status = 'unhealthy';
  }

  // Check cache
  try {
    const cacheStats = getCacheStats();
    health.checks.cache = {
      status: 'healthy',
      stats: cacheStats
    };
  } catch (error) {
    health.checks.cache = {
      status: 'warning',
      message: 'Cache stats no disponibles'
    };
  }

  // Check memory
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  // Warning si usa más de 400MB (Railway Hobby tiene 500MB)
  const memoryStatus = memUsageMB.heapUsed > 400 ? 'warning' : 'healthy';
  health.checks.memory = {
    status: memoryStatus,
    usage: memUsageMB,
    unit: 'MB'
  };

  if (memoryStatus === 'warning') {
    health.status = 'warning';
  }

  res.json(health);
});

/**
 * GET /metrics - Métricas del sistema
 * Información detallada sobre performance y uso de recursos
 */
router.get('/metrics', async (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: process.uptime(),
      formatted: formatUptime(process.uptime())
    },
    memory: {
      ...process.memoryUsage(),
      formatted: formatMemory(process.memoryUsage())
    },
    database: {
      poolSize: pool.pool._allConnections?.length || 0,
      freeConnections: pool.pool._freeConnections?.length || 0,
      queueLength: pool.pool._connectionQueue?.length || 0
    },
    cache: getCacheStats(),
    process: {
      pid: process.pid,
      node_version: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  // Agregar estadísticas de BD si es posible
  try {
    const [statusResult] = await pool.query('SHOW STATUS WHERE Variable_name IN ("Threads_connected", "Max_used_connections", "Uptime", "Queries")');
    metrics.database.mysql_stats = statusResult.reduce((acc, row) => {
      acc[row.Variable_name] = row.Value;
      return acc;
    }, {});
  } catch (error) {
    metrics.database.mysql_stats = { error: 'No disponible' };
  }

  res.json(metrics);
});

/**
 * GET /metrics/db - Métricas específicas de base de datos
 * Solo para usuarios administradores con rol presidencia_nacional
 */
router.get('/metrics/db', async (req, res) => {
  try {
    // Obtener conteo de registros por tabla
    const tables = [
      'afiliados',
      'usuarios',
      'cuotas',
      'cargos',
      'municipios',
      'instituciones_educativas',
      'salarios_municipios'
    ];

    const counts = {};
    for (const table of tables) {
      try {
        const [result] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = result[0].count;
      } catch (error) {
        counts[table] = { error: error.message };
      }
    }

    // Tamaño de la BD
    const [sizeResult] = await pool.query(`
      SELECT 
        table_schema as 'database',
        SUM(data_length + index_length) / 1024 / 1024 AS 'size_mb'
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
      GROUP BY table_schema
    `);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        name: sizeResult[0]?.database || 'railway',
        size_mb: Math.round(sizeResult[0]?.size_mb || 0),
        record_counts: counts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas de BD',
      details: error.message
    });
  }
});

// Helpers

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatMemory(mem) {
  return {
    rss_mb: Math.round(mem.rss / 1024 / 1024),
    heapTotal_mb: Math.round(mem.heapTotal / 1024 / 1024),
    heapUsed_mb: Math.round(mem.heapUsed / 1024 / 1024),
    external_mb: Math.round(mem.external / 1024 / 1024)
  };
}

export default router;
