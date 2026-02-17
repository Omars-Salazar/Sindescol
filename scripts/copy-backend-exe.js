#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crear carpeta resources si no existe
const resourcesDir = path.join(__dirname, '..', 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Mover backend.exe de backend/ a resources/
const srcFile = path.join(__dirname, '..', 'backend', 'server.exe');
const destFile = path.join(resourcesDir, 'backend.exe');

if (fs.existsSync(srcFile)) {
  fs.copyFileSync(srcFile, destFile);
  console.log(`✅ Backend executable copied to: ${destFile}`);
  
  // Limpiar archivos temporales
  try {
    fs.unlinkSync(path.join(__dirname, '..', 'backend', 'server-bundled.js'));
    console.log(`✅ Cleaned up temporary files`);
  } catch (e) {
    // Ignorar si no existen
  }
} else {
  console.warn(`⚠️ Warning: server.exe not found at ${srcFile}`);
}

// También copiar .env si existe
const envSrc = path.join(__dirname, '..', 'backend', '.env');
const envDest = path.join(resourcesDir, '.env');
if (fs.existsSync(envSrc)) {
  fs.copyFileSync(envSrc, envDest);
  console.log(`✅ .env copied to: ${envDest}`);
}

