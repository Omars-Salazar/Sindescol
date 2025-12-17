// ==========================================
// frontend/src/utils/procesadorArchivos.js
// ==========================================

// Importar XLSX desde CDN si no está disponible
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
        const response = await fetch(`/api/afiliados/cedula/${cuota.cedula}`);
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
    
    console.log("📊 Datos Excel leídos (completos):", jsonData);
    console.log("📊 Primera fila de ejemplo:", jsonData[0]);
    
    const filas = [];
    
    // Detectar si tiene encabezados (primera fila no es número)
    const tieneEncabezados = jsonData.length > 0 && isNaN(jsonData[0][0]);
    const inicio = tieneEncabezados ? 1 : 0;
    
    console.log(`🔍 Tiene encabezados: ${tieneEncabezados}, Inicio desde fila: ${inicio}`);
    
    for (let i = inicio; i < jsonData.length; i++) {
      const fila = jsonData[i];
      
      console.log(`📋 Fila ${i} completa:`, fila);
      
      if (!fila || fila.length === 0) {
        console.warn(`⚠️ Fila ${i} vacía, saltando...`);
        continue;
      }
      
      // Buscar cédula y valor en todas las columnas disponibles
      let cedula = null;
      let valor = null;
      
      // Intentar encontrar cédula (primera columna con valor)
      for (let col = 0; col < fila.length; col++) {
        if (fila[col] !== null && fila[col] !== undefined && fila[col] !== '') {
          if (!cedula) {
            cedula = String(fila[col]).trim();
          } else {
            // El siguiente valor no vacío es el valor de la cuota
            valor = fila[col];
            break;
          }
        }
      }
      
      console.log(`🔎 Fila ${i}: Encontrado Cédula="${cedula}", Valor="${valor}"`);
      
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
      
      console.log(`✓ Fila ${i}: Cédula="${cedula}", Valor procesado=${valor}`);
      
      // Validar que tengamos datos válidos
      if (cedula && !isNaN(valor)) {
        filas.push({ 
          cedula: cedula, 
          valor: valor 
        });
        console.log(`✅ Fila ${i} agregada exitosamente`);
      } else {
        console.warn(`⚠️ Fila ${i} ignorada - Cédula: "${cedula}", Valor: ${valor}`);
      }
    }
    
    console.log("✅ Total de cuotas extraídas del Excel:", filas.length);
    console.log("📊 Cuotas finales:", filas);
    return filas;
    
  } catch (error) {
    console.error("❌ Error procesando Excel:", error);
    throw new Error("Error al procesar archivo Excel: " + error.message);
  }
}

async function procesarCSV(file) {
  const contenido = await leerArchivoComoTexto(file);
  const lineas = contenido.split(/\r?\n/).filter(l => l.trim());
  
  console.log("📊 Total de líneas en CSV/TXT:", lineas.length);
  console.log("📊 Primera línea:", lineas[0]);
  
  if (lineas.length === 0) return [];
  
  // Detectar separador
  const primeraLinea = lineas[0];
  let separador = ',';
  if (primeraLinea.includes(';')) separador = ';';
  else if (primeraLinea.includes('\t')) separador = '\t';
  else if (primeraLinea.includes('|')) separador = '|';

  console.log(`🔍 Separador detectado: "${separador === '\t' ? '\\t (tabulación)' : separador}"`);

  // Determinar si tiene encabezados
  const primeraColumna = lineas[0].split(separador)[0]?.trim().replace(/['"]/g, '');
  const tieneEncabezados = isNaN(primeraColumna);
  const inicio = tieneEncabezados ? 1 : 0;

  console.log(`🔍 Tiene encabezados: ${tieneEncabezados}, Inicio desde línea: ${inicio}`);

  const filas = [];
  
  for (let i = inicio; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    
    if (!linea) {
      console.warn(`⚠️ Línea ${i} vacía, saltando...`);
      continue;
    }
    
    const campos = linea.split(separador).map(c => c.trim().replace(/['"]/g, ''));
    
    console.log(`📋 Línea ${i} completa:`, campos);
    
    if (campos.length < 2) {
      console.warn(`⚠️ Línea ${i} tiene menos de 2 columnas:`, campos);
      continue;
    }
    
    // Buscar primera columna con valor (cédula)
    let cedula = null;
    let valor = null;
    
    for (let col = 0; col < campos.length; col++) {
      const campo = campos[col];
      
      if (campo && campo !== '') {
        if (!cedula) {
          cedula = campo;
        } else {
          valor = campo;
          break;
        }
      }
    }
    
    console.log(`🔎 Línea ${i}: Cédula="${cedula}", Valor="${valor}"`);
    
    if (!cedula) {
      console.warn(`⚠️ Línea ${i} sin cédula, saltando...`);
      continue;
    }
    
    // Convertir valor a número
    let valorNumerico = 0;
    
    if (valor !== null && valor !== undefined && valor !== '') {
      // Limpiar el valor (quitar símbolos de moneda, espacios, etc.)
      const valorLimpio = valor.replace(/[$\s,]/g, '');
      valorNumerico = parseFloat(valorLimpio);
      
      if (isNaN(valorNumerico)) {
        console.warn(`⚠️ Línea ${i}: No se pudo convertir "${valor}" a número`);
        valorNumerico = 0;
      }
    }
    
    console.log(`✓ Línea ${i}: Cédula="${cedula}", Valor procesado=${valorNumerico}`);
    
    if (cedula) {
      filas.push({ 
        cedula: cedula, 
        valor: valorNumerico 
      });
      console.log(`✅ Línea ${i} agregada exitosamente`);
    }
  }

  console.log("✅ Total de cuotas extraídas del CSV/TXT:", filas.length);
  console.log("📊 Cuotas finales:", filas);
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