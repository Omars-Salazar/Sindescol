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

// CORS configurado (en producción limitar a dominios específicos)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));

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