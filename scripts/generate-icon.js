#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');
const sharp = require('sharp');

/**
 * Convierte PNG a ICO con dimensiones correctas para electron-builder
 */

const inputFile = path.join(__dirname, '../frontend/public/escudo_sindescol.png');
const outputFile = path.join(__dirname, '../frontend/public/icon.ico');

// Verificar que el archivo de entrada existe
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Archivo no encontrado: ${inputFile}`);
  process.exit(1);
}

console.log('📦 Leyendo archivo PNG:', inputFile);

async function generateIcon() {
  try {
    // Generar tamaño 256x256 principal
    console.log(`⚙️ Generando tamaño 256x256...`);
    const tempPng = path.join(__dirname, '../frontend/public/temp-256.png');
    
    await sharp(inputFile)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(tempPng);
    
    // Convertir a ICO
    console.log('🔄 Convirtiendo a formato ICO...');
    const icoBuffer = await pngToIco(tempPng);
    
    // Guardar archivo
    fs.writeFileSync(outputFile, icoBuffer);
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempPng);
    
    console.log('✅ ICO generado correctamente:', outputFile);
    console.log(`📏 Tamaño: 256x256`);
  } catch (error) {
    console.error('❌ Error al generar ICO:', error);
    process.exit(1);
  }
}

generateIcon();
