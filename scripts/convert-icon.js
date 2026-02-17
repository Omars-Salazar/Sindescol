#!/usr/bin/env node

const Ico = require('ico');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = path.resolve(__dirname, '../frontend/public/escudo_sindescol.png');
const outputPath = path.resolve(__dirname, '../frontend/public/icon.ico');

console.log('🔄 Convirtiendo PNG a ICO...');
console.log('📥 Entrada:', inputPath);
console.log('📤 Salida:', outputPath);

(async () => {
  try {
    // Leer la imagen PNG
    const pngData = fs.readFileSync(inputPath);
    
    // Convertir a buffer de imagen usando sharp
    const buffer = await sharp(pngData)
      .resize(256, 256)
      .png()
      .toBuffer();
    
    // Crear ICO
    const icoData = await Ico.encode([buffer]);
    
    // Escribir archivo ICO
    fs.writeFileSync(outputPath, icoData);
    
    console.log('✅ Conversión completada:', outputPath);
    console.log('📦 Tamaño:', (icoData.length / 1024).toFixed(2), 'KB');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
