#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputFile = path.join(__dirname, '../frontend/public/escudo_sindescol.png');
const outputFile = path.join(__dirname, '../frontend/public/icon.ico');

// Verificar que el archivo existe
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Archivo no encontrado: ${inputFile}`);
  process.exit(1);
}

console.log('📦 Leyendo:', inputFile);

// Crear icono de 256x256
sharp(inputFile)
  .resize(256, 256, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  })
  .toFile(outputFile)
  .then(info => {
    console.log('✅ Conversion completada');
    console.log('📄 Archivo:', outputFile);
    console.log('📏 Dimensiones:', info.width, 'x', info.height);
    console.log('💾 Tamaño:', (info.size / 1024).toFixed(2), 'KB');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
