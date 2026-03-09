/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: server.js
 * Descripción: Punto de entrada del servidor backend
 * 
 * @author [Omar Santiago Salazar]
 * @email [ossy2607@gmail.com]
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import app from "./src/app.js";

// Cargar .env desde rutas candidatas sin depender de import.meta (compatible con build exe CJS).
const envCandidates = [
  process.env.DOTENV_CONFIG_PATH,
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend", ".env")
].filter(Boolean);

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);

const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("❌ Error al iniciar servidor:", error);
  process.exit(1);
}
