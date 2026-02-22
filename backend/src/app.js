/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: app.js
 * Descripción: Configuración principal de Express
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import healthRoutes from "./routes/healthRoutes.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Control de logs por nivel (debug, info, warn, error)
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LOG_LEVELS[logLevel] ?? LOG_LEVELS.info;
const baseConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  debug: console.debug ? console.debug.bind(console) : console.log.bind(console)
};

const shouldLog = (level) => LOG_LEVELS[level] <= currentLevel;

console.log = (...args) => { if (shouldLog('info')) baseConsole.log(...args); };
console.info = (...args) => { if (shouldLog('info')) baseConsole.info(...args); };
console.debug = (...args) => { if (shouldLog('debug')) baseConsole.debug(...args); };
console.warn = (...args) => { if (shouldLog('warn')) baseConsole.warn(...args); };
console.error = (...args) => { if (shouldLog('error')) baseConsole.error(...args); };

// CORS configurado (en producción limitar a dominios específicos)
const isProduction = process.env.NODE_ENV === 'production';
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const allowedOrigins = isProduction
  ? Array.from(new Set(['http://localhost:3000', ...envOrigins]))
  : Array.from(new Set([...devOrigins, ...envOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, apps internas, Electron en algunos casos)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS: Origin no permitido'));
  },
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

// Headers básicos de seguridad
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Trust proxy (necesario para Railway y rate limiting por IP)
app.set('trust proxy', 1);

// Rate limiting general para todas las rutas
app.use(generalLimiter);

// Aumentar el límite de tamaño del payload para manejar archivos Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check básico (sin rate limit estricto)
app.get("/", (req, res) => {
  res.json({ 
    message: "Servidor SINDESCOL funcionando correctamente",
    version: "1.0.0",
    status: "online"
  });
});

// Rutas de health check y métricas
app.use("/api", healthRoutes);

// Rutas API
app.use("/api", routes);

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Ruta no encontrada" });
});

// Manejo de errores de payload demasiado grande
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ 
      success: false, 
      error: 'El archivo es demasiado grande. El límite es 50MB.' 
    });
  }
  
  // Error de rate limit
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas peticiones. Intenta de nuevo más tarde.'
    });
  }

  // Error genérico
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

export default app;