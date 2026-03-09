/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: config/db.js
 * Descripción: Configuración de pool de conexiones MySQL optimizado para Railway
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Cargar .env desde rutas candidatas sin depender de import.meta (compatible con build exe CJS).
const envCandidates = [
  process.env.DOTENV_CONFIG_PATH,
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend", ".env")
].filter(Boolean);

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);

// Configuración optimizada para Railway Hobby Plan
// Railway Hobby: ~500MB RAM, max 20-30 conexiones MySQL
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = !!process.env.DATABASE_URL;
const sslRejectUnauthorizedEnv = process.env.DB_SSL_REJECT_UNAUTHORIZED;
const sslRejectUnauthorized = sslRejectUnauthorizedEnv
  ? sslRejectUnauthorizedEnv === 'true'
  : isProduction && isRailway;

// Configuración adaptativa según el ambiente
const poolConfig = {
  waitForConnections: true,
  // Railway Hobby: max 15 conexiones (deja margen para otros procesos)
  // Local: 10 conexiones es suficiente
  connectionLimit: isRailway && isProduction ? 15 : 10,
  // Limitar cola a 50 para prevenir saturación de RAM
  queueLimit: 50,
  // Timeout de conexión: 10 segundos
  connectTimeout: 10000,
  // Mantener conexión activa (evita "MySQL server has gone away")
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Manejo de zona horaria
  timezone: 'Z'
};

let pool;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL for Railway
  const url = new URL(process.env.DATABASE_URL);
  pool = mysql.createPool({
    host: url.hostname,
    port: url.port,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading /
    ...poolConfig,
    ssl: {
      rejectUnauthorized: sslRejectUnauthorized,
      // Railway usa certificados gestionados por proxy; en dev/local suele requerir bypass de CA.
      servername: url.hostname,
      minVersion: 'TLSv1.2'
    }
  });
} else {
  // Fallback to individual env vars (desarrollo local)
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    // Compatibilidad: aceptar DB_PASS o DB_PASSWORD
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...poolConfig,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: sslRejectUnauthorized,
      servername: process.env.DB_HOST,
      minVersion: 'TLSv1.2'
    } : undefined
  });
}

// Event listeners para monitoreo del pool
pool.on('acquire', (connection) => {
  console.log(`🔗 Conexión adquirida: ${connection.threadId}`);
});

pool.on('connection', (connection) => {
  console.log(`✅ Nueva conexión creada: ${connection.threadId}`);
});

pool.on('enqueue', () => {
  console.log('⏳ Esperando conexión disponible en la cola...');
});

pool.on('release', (connection) => {
  console.log(`🔓 Conexión liberada: ${connection.threadId}`);
});

// Verificar conexión al inicializar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Pool de conexiones MySQL inicializado correctamente');
    console.log(`📊 Configuración: ${poolConfig.connectionLimit} conexiones máximas, cola: ${poolConfig.queueLimit}`);
    connection.release();
  } catch (error) {
    console.error('❌ Error al inicializar pool de conexiones:', error.message);
  }
})();

export default pool;
