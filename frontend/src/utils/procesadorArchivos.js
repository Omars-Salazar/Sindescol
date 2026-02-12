/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: utils/procesadorArchivos.js
 * Descripción: Procesamiento de archivos Excel/CSV para carga masiva
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import { fetchWithAuth } from './fetchWithAuth';
let XLSX;

async function cargarXLSX() {
  if (typeof window.XLSX !== 'undefined') {
    XLSX = window.XLSX;
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      XLSX = window.XLSX;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function procesarArchivoCuotas(file, extension) {
  const cuotasExtraidas = await procesarArchivo(file, extension);
  
  if (cuotasExtraidas.length === 0) {
    return [];
  }

  const cuotasConInfo = await Promise.all(
    cuotasExtraidas.map(async (cuota) => {
      try {
        const response = await fetchWithAuth(`/api/afiliados/cedula/${cuota.cedula}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          return {
            ...cuota,
            nombres: data.data.nombres,
            apellidos: data.data.apellidos,
            existe: true
          };
        } else {
          return {
            ...cuota,
            nombres: "NO ENCONTRADO",
            apellidos: "",
            existe: false
          };
        }
      } catch (error) {
        return {
          ...cuota,
          nombres: "ERROR AL BUSCAR",
          apellidos: "",
          existe: false
        };
      }
    })
  );

  return cuotasConInfo;
}

async function procesarArchivo(file, extension) {
  if (['xls', 'xlsx'].includes(extension)) {
    return await procesarExcel(file);
  } else {
    return await procesarCSV(file);
  }
}

async function procesarExcel(file) {
  try {
    // Cargar librería XLSX si no está disponible
    await cargarXLSX();

    const data = await leerArchivoComoArrayBuffer(file);
    const workbook = XLSX.read(data, { type: 'array' });
    
    // Obtener la primera hoja
    const primerHoja = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[primerHoja];
    
    // Convertir a JSON con todas las opciones
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null,
      blankrows: false
    });
    
    const filas = [];
    
    // Detectar si tiene encabezados (primera fila no es número)
    const tieneEncabezados = jsonData.length > 0 && isNaN(jsonData[0][0]);
    const inicio = tieneEncabezados ? 1 : 0;
    
    for (let i = inicio; i < jsonData.length; i++) {
      const fila = jsonData[i];
      
      if (!fila || fila.length === 0) {
        continue;
      }
      
      // Buscar cédula y valor en todas las columnas disponibles
      let cedula = null;
      let valor = null;
      let valorEncontrado = false;
      
      // Intentar encontrar cédula (primera columna con valor)
      for (let col = 0; col < fila.length; col++) {
        if (fila[col] !== null && fila[col] !== undefined && fila[col] !== '') {
          if (!cedula) {
            cedula = String(fila[col]).trim();
          } else {
            // El siguiente valor no vacío es el valor de la cuota
            valor = fila[col];
            valorEncontrado = true;
            break;
          }
        }
      }
      
      // Si no se encontró valor, marcar como sin valor
      if (!valorEncontrado) {
        if (cedula) {
          filas.push({ 
            cedula: cedula, 
            valor: null, // Valor null indica que no hay valor
            sinValor: true
          });
        }
        continue;
      }
      
      // Convertir valor a número
      if (valor !== null && valor !== undefined) {
        if (typeof valor === 'string') {
          valor = parseFloat(valor.replace(/[^\d.-]/g, ''));
        } else if (typeof valor === 'number') {
          // Ya es número, mantenerlo
        } else {
          valor = 0;
        }
      } else {
        valor = 0;
      }
      
      // Validar que tengamos datos válidos
      if (cedula && !isNaN(valor)) {
        filas.push({ 
          cedula: cedula, 
          valor: valor,
          sinValor: false
        });
      }
    }
    
    return filas;
    
  } catch (error) {
    throw new Error("Error al procesar archivo Excel: " + error.message);
  }
}

async function procesarCSV(file) {
  const contenido = await leerArchivoComoTexto(file);
  const lineas = contenido.split(/\r?\n/).filter(l => l.trim());
  
  if (lineas.length === 0) return [];
  
  // Detectar separador
  const primeraLinea = lineas[0];
  let separador = ',';
  if (primeraLinea.includes(';')) separador = ';';
  else if (primeraLinea.includes('\t')) separador = '\t';
  else if (primeraLinea.includes('|')) separador = '|';

  // Determinar si tiene encabezados
  const primeraColumna = lineas[0].split(separador)[0]?.trim().replace(/['"]/g, '');
  const tieneEncabezados = isNaN(primeraColumna);
  const inicio = tieneEncabezados ? 1 : 0;

  const filas = [];
  
  for (let i = inicio; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    
    if (!linea) {
      continue;
    }
    
    const campos = linea.split(separador).map(c => c.trim().replace(/['"]/g, ''));
    
    if (campos.length < 1) {
      continue;
    }
    
    // Buscar primera columna con valor (cédula)
    let cedula = null;
    let valor = null;
    let valorEncontrado = false;
    
    for (let col = 0; col < campos.length; col++) {
      const campo = campos[col];
      
      if (campo && campo !== '') {
        if (!cedula) {
          cedula = campo;
        } else {
          valor = campo;
          valorEncontrado = true;
          break;
        }
      }
    }
    
    if (!cedula) {
      continue;
    }
    
    // Si no se encontró valor, marcar como sin valor
    if (!valorEncontrado) {
      filas.push({ 
        cedula: cedula, 
        valor: null, // Valor null indica que no hay valor
        sinValor: true
      });
      continue;
    }
    
    // Convertir valor a número
    let valorNumerico = 0;
    
    if (valor !== null && valor !== undefined && valor !== '') {
      // Limpiar el valor (quitar símbolos de moneda, espacios, etc.)
      const valorLimpio = valor.replace(/[$\s,]/g, '');
      valorNumerico = parseFloat(valorLimpio);
      
      if (isNaN(valorNumerico)) {
        valorNumerico = 0;
      }
    }
    
    if (cedula) {
      filas.push({ 
        cedula: cedula, 
        valor: valorNumerico,
        sinValor: false
      });
    }
  }

  return filas;
}

function leerArchivoComoTexto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function leerArchivoComoArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(new Uint8Array(e.target.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}