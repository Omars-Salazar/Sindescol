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

import "dotenv/config.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 4000;

try {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("❌ Error al iniciar servidor:", error);
  process.exit(1);
}
