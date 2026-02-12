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

const app = express();

app.use(cors());

// Aumentar el límite de tamaño del payload para manejar archivos Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

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
  next(err);
});

export default app;