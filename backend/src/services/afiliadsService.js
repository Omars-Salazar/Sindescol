import db from "../config/db.js";

// OPTIMIZACIÓN: Query más ligera para listado (sin BLOB de fotos)
export const getAfiliados = async (departamento) => {
  const query = `
    SELECT a.id_afiliado, a.cedula, a.nombres, a.apellidos,
           a.id_cargo, a.id_institucion,
           c.nombre_cargo, ie.nombre_institucion,
           m.departamento
    FROM afiliados a
    LEFT JOIN cargos c ON a.id_cargo = c.id_cargo
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
    LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
    WHERE m.departamento = ?
    ORDER BY a.id_afiliado DESC
  `;
  
  const [afiliados] = await db.query(query, [departamento]);
  return afiliados;
};

export const getAfiliadoById = async (id) => {
  const query = `
    SELECT a.*, 
           c.nombre_cargo,
           r.nombre_religion,
           md.nombre_municipio as municipio_domicilio_nombre,
           mr.nombre_municipio as municipio_residencia_nombre,
           mt.nombre_municipio as municipio_trabajo_nombre,
           e.nombre_eps,
           ar.nombre_arl,
           p.nombre_pension,
           ce.nombre_cesantias,
           ie.nombre_institucion,
           ie.correo_institucional,
           ie.telefono_institucional,
           ie.direccion_institucion
    FROM afiliados a
    LEFT JOIN cargos c ON a.id_cargo = c.id_cargo
    LEFT JOIN religiones r ON a.religion_id = r.id_religion
    LEFT JOIN municipios md ON a.municipio_domicilio = md.id_municipio
    LEFT JOIN municipios mr ON a.municipio_residencia = mr.id_municipio
    LEFT JOIN municipios mt ON a.municipio_trabajo = mt.id_municipio
    LEFT JOIN entidades_eps e ON a.id_eps = e.id_eps
    LEFT JOIN entidades_arl ar ON a.id_arl = ar.id_arl
    LEFT JOIN entidades_pension p ON a.id_pension = p.id_pension
    LEFT JOIN entidades_cesantias ce ON a.id_cesantias = ce.id_cesantias
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
    WHERE a.id_afiliado = ?
  `;
  const [afiliados] = await db.query(query, [id]);
  
  if (afiliados[0] && afiliados[0].foto_afiliado) {
    afiliados[0].foto_afiliado = afiliados[0].foto_afiliado.toString('base64');
  }
  
  return afiliados[0];
};

export const getAfiliadoByCedula = async (cedula) => {
  const query = `
    SELECT a.*, 
           c.nombre_cargo,
           r.nombre_religion,
           md.nombre_municipio as municipio_domicilio_nombre,
           mr.nombre_municipio as municipio_residencia_nombre,
           mt.nombre_municipio as municipio_trabajo_nombre,
           e.nombre_eps,
           ar.nombre_arl,
           p.nombre_pension,
           ce.nombre_cesantias,
           ie.nombre_institucion,
           ie.correo_institucional,
           ie.telefono_institucional,
           ie.direccion_institucion
    FROM afiliados a
    LEFT JOIN cargos c ON a.id_cargo = c.id_cargo
    LEFT JOIN religiones r ON a.religion_id = r.id_religion
    LEFT JOIN municipios md ON a.municipio_domicilio = md.id_municipio
    LEFT JOIN municipios mr ON a.municipio_residencia = mr.id_municipio
    LEFT JOIN municipios mt ON a.municipio_trabajo = mt.id_municipio
    LEFT JOIN entidades_eps e ON a.id_eps = e.id_eps
    LEFT JOIN entidades_arl ar ON a.id_arl = ar.id_arl
    LEFT JOIN entidades_pension p ON a.id_pension = p.id_pension
    LEFT JOIN entidades_cesantias ce ON a.id_cesantias = ce.id_cesantias
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
    WHERE a.cedula = ?
  `;
  const [afiliados] = await db.query(query, [cedula]);
  
  if (afiliados[0] && afiliados[0].foto_afiliado) {
    afiliados[0].foto_afiliado = afiliados[0].foto_afiliado.toString('base64');
  }
  
  return afiliados[0];
};

// ============================================
// FUNCIÓN OPTIMIZADA DE CREACIÓN
// ============================================
export const createAfiliado = async (data) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      // Datos personales
      cedula, nombres, apellidos, religion_id, fecha_nacimiento, fecha_afiliacion,
      direccion_domicilio, municipio_domicilio, municipio_residencia, direccion_residencia,
      foto_afiliado,
      
      // Seguridad social
      id_cargo, id_eps, id_arl, id_pension, id_cesantias, 
      
      // Datos laborales
      municipio_trabajo, id_institucion, correo_institucional, 
      telefono_institucional, direccion_institucion,
      
      // Actas
      tipo_documento, numero_resolucion, fecha_resolucion, archivo_nombramiento,
      numero_acta, fecha_acta, archivo_posesion,
      
      // Rector
      nombre_rector,
      
      // Otros cargos
      otros_cargos
    } = data;

    // Convertir Base64 a Buffer solo si existe y es válido
    const fotoBuffer = (foto_afiliado && typeof foto_afiliado === 'string' && foto_afiliado.length > 0) 
      ? Buffer.from(foto_afiliado, 'base64') 
      : null;
    
    console.log('📷 Procesando foto afiliado:', {
      existe: !!foto_afiliado,
      tipo: typeof foto_afiliado,
      longitud: foto_afiliado?.length || 0,
      buffer: fotoBuffer ? 'creado' : 'null'
    });

    // 1. Insertar afiliado
    const queryAfiliado = `
      INSERT INTO afiliados 
      (cedula, nombres, apellidos, religion_id, fecha_nacimiento, fecha_afiliacion,
       direccion_domicilio, municipio_domicilio, municipio_residencia, direccion_residencia,
       foto_afiliado, id_cargo, id_eps, id_arl, id_pension, id_cesantias, id_institucion, municipio_trabajo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultAfiliado] = await connection.query(queryAfiliado, [
      cedula, nombres, apellidos, religion_id || null, fecha_nacimiento || null, 
      fecha_afiliacion || null, direccion_domicilio || null, municipio_domicilio || null, 
      municipio_residencia || null, direccion_residencia || null, fotoBuffer,
      id_cargo, id_eps || null, id_arl || null, id_pension || null, id_cesantias || null, 
      id_institucion, municipio_trabajo || null
    ]);

    const idAfiliado = resultAfiliado.insertId;

    // ============================================
    // OPTIMIZACIÓN: TODAS LAS OPERACIONES EN PARALELO
    // ============================================
    const insertPromises = [];

    // 2. Actualizar institución educativa (si se proporcionan datos)
    if (id_institucion && (correo_institucional || telefono_institucional || direccion_institucion)) {
      const queryUpdateInstitucion = `
        UPDATE instituciones_educativas 
        SET correo_institucional = COALESCE(?, correo_institucional),
            telefono_institucional = COALESCE(?, telefono_institucional),
            direccion_institucion = COALESCE(?, direccion_institucion)
        WHERE id_institucion = ?
      `;
      insertPromises.push(
        connection.query(queryUpdateInstitucion, [
          correo_institucional || null,
          telefono_institucional || null,
          direccion_institucion || null,
          id_institucion
        ])
      );
      console.log('📝 Programada actualización de institución');
    }

    // 3. Insertar acta de nombramiento (si hay datos)
    if (tipo_documento || numero_resolucion || fecha_resolucion || archivo_nombramiento) {
      const archivoNombramientoBuffer = (archivo_nombramiento && typeof archivo_nombramiento === 'string' && archivo_nombramiento.length > 0)
        ? Buffer.from(archivo_nombramiento, 'base64') 
        : null;
      
      console.log('📄 Procesando archivo nombramiento:', {
        existe: !!archivo_nombramiento,
        longitud: archivo_nombramiento?.length || 0,
        buffer: archivoNombramientoBuffer ? 'creado' : 'null'
      });
      
      const queryNombramiento = `
        INSERT INTO actas_nombramiento 
        (id_afiliado, tipo_documento, numero_resolucion, fecha_resolucion, archivo_documento)
        VALUES (?, ?, ?, ?, ?)
      `;
      insertPromises.push(
        connection.query(queryNombramiento, [
          idAfiliado,
          tipo_documento || null,
          numero_resolucion || null,
          fecha_resolucion || null,
          archivoNombramientoBuffer
        ])
      );
      console.log('📝 Programada inserción de acta nombramiento');
    }

    // 4. Insertar acta de posesión (si hay datos)
    if (numero_acta || fecha_acta || archivo_posesion) {
      const archivoPosesionBuffer = (archivo_posesion && typeof archivo_posesion === 'string' && archivo_posesion.length > 0)
        ? Buffer.from(archivo_posesion, 'base64') 
        : null;
      
      console.log('📄 Procesando archivo posesión:', {
        existe: !!archivo_posesion,
        longitud: archivo_posesion?.length || 0,
        buffer: archivoPosesionBuffer ? 'creado' : 'null'
      });
      
      const queryPosesion = `
        INSERT INTO actas_posesion 
        (id_afiliado, numero_acta, fecha_acta, documento_acta)
        VALUES (?, ?, ?, ?)
      `;
      insertPromises.push(
        connection.query(queryPosesion, [
          idAfiliado,
          numero_acta || null,
          fecha_acta || null,
          archivoPosesionBuffer
        ])
      );
      console.log('📝 Programada inserción de acta posesión');
    }

    // 5. Insertar rector (si se proporciona)
    // OPTIMIZACIÓN: Usar INSERT IGNORE con subquery
    if (nombre_rector && id_institucion) {
      const queryRector = `
        INSERT IGNORE INTO rectores (nombre_rector, id_institucion)
        SELECT ?, ? 
        WHERE NOT EXISTS (
          SELECT 1 FROM rectores WHERE id_institucion = ?
        )
      `;
      insertPromises.push(
        connection.query(queryRector, [nombre_rector, id_institucion, id_institucion])
      );
      console.log('📝 Programada inserción de rector');
    }

    // 6. Insertar otros cargos en BATCH (si hay datos)
    // OPTIMIZACIÓN: Una sola query en lugar de múltiples
    if (otros_cargos && Array.isArray(otros_cargos) && otros_cargos.length > 0) {
      const cargosValidos = otros_cargos.filter(cargo => cargo.nombre_cargo);
      
      if (cargosValidos.length > 0) {
        const queryOtroCargo = `
          INSERT INTO otros_cargos 
          (id_afiliado, nombre_cargo, fecha_inicio, fecha_fin)
          VALUES ?
        `;
        const valoresCargos = cargosValidos.map(cargo => [
          idAfiliado,
          cargo.nombre_cargo,
          cargo.fecha_inicio || null,
          cargo.fecha_fin || null
        ]);
        
        insertPromises.push(
          connection.query(queryOtroCargo, [valoresCargos])
        );
        console.log(`📝 Programada inserción de ${cargosValidos.length} otros cargos en batch`);
      }
    }

    // ============================================
    // EJECUTAR TODAS LAS OPERACIONES EN PARALELO
    // ============================================
    console.log(`⚡ Ejecutando ${insertPromises.length} operaciones en paralelo...`);
    const inicio = Date.now();
    
    await Promise.all(insertPromises);
    
    const tiempo = Date.now() - inicio;
    console.log(`✅ Operaciones completadas en ${tiempo}ms`);

    await connection.commit();
    
    // OPTIMIZACIÓN: Retornar datos básicos sin hacer otra consulta pesada
    console.log('✅ Afiliado creado exitosamente:', { id_afiliado: idAfiliado, cedula, nombres, apellidos });
    
    return { 
      id_afiliado: idAfiliado, 
      cedula, 
      nombres, 
      apellidos,
      id_cargo,
      nombre_cargo: null // Se puede agregar si es necesario
    };

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error en createAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const updateAfiliado = async (id, data) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const camposAfiliado = [];
    const valoresAfiliado = [];

    const camposPermitidos = [
      'cedula', 'nombres', 'apellidos', 'religion_id', 'fecha_nacimiento', 
      'fecha_afiliacion', 'direccion_domicilio', 'municipio_domicilio', 
      'municipio_residencia', 'direccion_residencia', 'id_cargo', 'id_eps', 
      'id_arl', 'id_pension', 'id_cesantias', 'id_institucion', 'municipio_trabajo'
    ];

    for (const campo of camposPermitidos) {
      if (data.hasOwnProperty(campo)) {
        camposAfiliado.push(`${campo} = ?`);
        valoresAfiliado.push(data[campo]);
      }
    }

    // Manejar foto si existe
    if (data.foto_afiliado) {
      camposAfiliado.push('foto_afiliado = ?');
      valoresAfiliado.push(Buffer.from(data.foto_afiliado, 'base64'));
    }

    if (camposAfiliado.length > 0) {
      const queryAfiliado = `UPDATE afiliados SET ${camposAfiliado.join(', ')} WHERE id_afiliado = ?`;
      valoresAfiliado.push(id);
      await connection.query(queryAfiliado, valoresAfiliado);
    }

    await connection.commit();
    return getAfiliadoById(id);

  } catch (error) {
    await connection.rollback();
    console.error('Error en updateAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const deleteAfiliado = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // OPTIMIZACIÓN: Ejecutar eliminaciones en paralelo
    await Promise.all([
      connection.query('DELETE FROM actas_nombramiento WHERE id_afiliado = ?', [id]),
      connection.query('DELETE FROM actas_posesion WHERE id_afiliado = ?', [id]),
      connection.query('DELETE FROM otros_cargos WHERE id_afiliado = ?', [id]),
      connection.query('DELETE FROM cuotas WHERE cedula = (SELECT cedula FROM afiliados WHERE id_afiliado = ?)', [id])
    ]);
    
    const [result] = await connection.query('DELETE FROM afiliados WHERE id_afiliado = ?', [id]);
    
    await connection.commit();
    return result.affectedRows > 0;

  } catch (error) {
    await connection.rollback();
    console.error('Error en deleteAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const searchAfiliados = async (searchTerm) => {
  const query = `
    SELECT a.*, 
           c.nombre_cargo,
           ie.nombre_institucion
    FROM afiliados a
    LEFT JOIN cargos c ON a.id_cargo = c.id_cargo
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
    WHERE a.cedula LIKE ? OR a.nombres LIKE ? OR a.apellidos LIKE ?
  `;
  const term = `%${searchTerm}%`;
  const [afiliados] = await db.query(query, [term, term, term]);
  return afiliados;
};
