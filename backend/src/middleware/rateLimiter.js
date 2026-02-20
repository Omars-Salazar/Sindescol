/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: middleware/rateLimiter.js
 * Descripción: Middleware de rate limiting para prevenir abuso de API
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import rateLimit from 'express-rate-limit';

// Rate limiter ESTRICTO para autenticación (prevenir ataques de fuerza bruta)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Saltar rate limit para IPs confiables (opcional)
  skip: (req) => {
    // Lista blanca de IPs (opcional - configurar según necesidad)
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip);
  }
});

// Rate limiter GENERAL para todas las APIs
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 peticiones por minuto por IP
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP. Intenta de nuevo en un minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
    return whitelist.includes(req.ip);
  }
});

// Rate limiter MODERADO para operaciones de lectura
export const readLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // 200 peticiones por minuto (lecturas son más frecuentes)
  message: {
    success: false,
    error: 'Demasiadas peticiones de lectura. Intenta de nuevo en un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter ESTRICTO para operaciones de escritura/modificación
export const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 operaciones por minuto (escrituras son más costosas)
  message: {
    success: false,
    error: 'Demasiadas operaciones de escritura. Intenta de nuevo en un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para upload de archivos (muy estricto)
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 uploads cada 15 minutos
  message: {
    success: false,
    error: 'Demasiadas subidas de archivos. Intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para reportes/consultas pesadas
export const heavyQueryLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 consultas pesadas cada 5 minutos
  message: {
    success: false,
    error: 'Demasiadas consultas complejas. Intenta de nuevo en 5 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  authLimiter,
  generalLimiter,
  readLimiter,
  writeLimiter,
  uploadLimiter,
  heavyQueryLimiter
};
