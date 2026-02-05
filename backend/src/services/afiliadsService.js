import db from "../config/db.js";

// ============================================
// FUNCIÓN PARA OBTENER AFILIADOS CON FILTRO POR DEPARTAMENTO
// ============================================
export const getAfiliados = async (departamento, rol) => {
  let query = `
    SELECT a.id_afiliado, a.cedula, a.nombres, a.apellidos,
           a.id_cargo, a.id_institucion,
           c.nombre_cargo, ie.nombre_institucion,
           m.departamento, m.nombre_municipio
    FROM afiliados a
    LEFT JOIN cargos c ON a.id_cargo = c.id_cargo
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
    LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
  `;
  
  const params = [];
  
  // FILTRADO POR ROL:
  // - presidencia_nacional: ve TODO (sin filtros)
  // - presidencia: solo su departamento
  // - usuario: solo su departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` WHERE m.departamento = ?`;
    params.push(departamento);
    console.log(`📊 [${rol}] Filtrando afiliados por departamento:`, departamento);
  } else {
    console.log(`📊 [presidencia_nacional] Cargando TODOS los afiliados`);
  }
  
  query += ` ORDER BY a.id_afiliado DESC`;
  
  const [afiliados] = await db.query(query, params);
  console.log(`✅ Afiliados encontrados: ${afiliados.length}`);
  return afiliados;
};

// ============================================
// OBTENER AFILIADO POR ID (sin filtro de departamento - detalles completos)
// ============================================
export const getAfiliadoById = async (id) => {
  const query = `
    SELECT a.*, 
           c.nombre_cargo,
           r.nombre_religion,
           md.nombre_municipio as municipio_domicilio_nombre,
           mr.nombre_municipio as municipio_residencia_nombre,
           mt.nombre_municipio as municipio_trabajo_nombre,
           mt.departamento as departamento_trabajo,
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

// ============================================
// CREAR AFILIADO CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const createAfiliado = async (data, departamento, rol) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // VALIDAR QUE EL MUNICIPIO DE TRABAJO PERTENECE AL DEPARTAMENTO DEL USUARIO
    if (data.municipio_trabajo) {
      const [municipios] = await connection.query(
        'SELECT departamento FROM municipios WHERE id_municipio = ?',
        [data.municipio_trabajo]
      );
      
      console.log('🔍 Validación municipio:', {
        id_municipio: data.municipio_trabajo,
        municipioEnBD: municipios[0],
        departamentoUsuario: departamento,
        rol: rol
      });
      
      // SOLO presidencia_nacional puede crear afiliados en cualquier departamento
      if (rol !== 'presidencia_nacional') {
        if (municipios.length === 0) {
          throw new Error('Municipio no encontrado');
        }
        if (municipios[0].departamento !== departamento) {
          throw new Error(`No tienes permiso para crear afiliados en el departamento ${municipios[0].departamento}. Solo puedes crear afiliados en ${departamento}`);
        }
      }
    } else {
      throw new Error('Municipio de trabajo es requerido');
    }

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
    // OPERACIONES EN PARALELO
    // ============================================
    const insertPromises = [];

    // 2. Actualizar institución educativa
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
    }

    // 3. Insertar acta de nombramiento
    if (tipo_documento || numero_resolucion || fecha_resolucion || archivo_nombramiento) {
      const archivoNombramientoBuffer = (archivo_nombramiento && typeof archivo_nombramiento === 'string' && archivo_nombramiento.length > 0)
        ? Buffer.from(archivo_nombramiento, 'base64') 
        : null;
      
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
    }

    // 4. Insertar acta de posesión
    if (numero_acta || fecha_acta || archivo_posesion) {
      const archivoPosesionBuffer = (archivo_posesion && typeof archivo_posesion === 'string' && archivo_posesion.length > 0)
        ? Buffer.from(archivo_posesion, 'base64') 
        : null;
      
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
    }

    // 5. Insertar rector
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
    }

    // 6. Insertar otros cargos en BATCH
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
      }
    }

    await Promise.all(insertPromises);
    await connection.commit();
    
    console.log(`✅ [${rol}] Afiliado creado en ${departamento || 'TODOS'}:`, { id_afiliado: idAfiliado, cedula, nombres, apellidos });
    
    return { 
      id_afiliado: idAfiliado, 
      cedula, 
      nombres, 
      apellidos,
      id_cargo,
      nombre_cargo: null
    };

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error en createAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// ACTUALIZAR AFILIADO CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const updateAfiliado = async (id, data, departamento, rol) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // VALIDAR QUE EL AFILIADO PERTENECE AL DEPARTAMENTO DEL USUARIO
    const [afiliadoActual] = await connection.query(`
      SELECT m.departamento 
      FROM afiliados a
      LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
      WHERE a.id_afiliado = ?
    `, [id]);

    if (afiliadoActual.length === 0) {
      throw new Error('Afiliado no encontrado');
    }

    // Solo presidencia_nacional puede editar afiliados de cualquier departamento
    if (rol !== 'presidencia_nacional') {
      if (afiliadoActual[0].departamento !== departamento) {
        throw new Error(`No tienes permiso para editar este afiliado. Pertenece a ${afiliadoActual[0].departamento}`);
      }
    }

    // VALIDAR NUEVO MUNICIPIO DE TRABAJO (si se está cambiando)
    if (data.municipio_trabajo) {
      const [municipios] = await connection.query(
        'SELECT departamento FROM municipios WHERE id_municipio = ?',
        [data.municipio_trabajo]
      );
      
      if (rol !== 'presidencia_nacional') {
        if (municipios.length === 0 || municipios[0].departamento !== departamento) {
          throw new Error(`El nuevo municipio debe pertenecer a ${departamento}`);
        }
      }
    }

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
    console.log(`✅ [${rol}] Afiliado actualizado:`, id);
    return getAfiliadoById(id);

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error en updateAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// ELIMINAR AFILIADO CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const deleteAfiliado = async (id, departamento, rol) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // VALIDAR QUE EL AFILIADO PERTENECE AL DEPARTAMENTO DEL USUARIO
    const [afiliadoActual] = await connection.query(`
      SELECT m.departamento 
      FROM afiliados a
      LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
      WHERE a.id_afiliado = ?
    `, [id]);

    if (afiliadoActual.length === 0) {
      throw new Error('Afiliado no encontrado');
    }

    // Solo presidencia_nacional puede eliminar afiliados de cualquier departamento
    if (rol !== 'presidencia_nacional') {
      if (afiliadoActual[0].departamento !== departamento) {
        throw new Error(`No tienes permiso para eliminar este afiliado. Pertenece a ${afiliadoActual[0].departamento}`);
      }
    }

    await Promise.all([
      connection.query('DELETE FROM actas_nombramiento WHERE id_afiliado = ?', [id]),
      connection.query('DELETE FROM actas_posesion WHERE id_afiliado = ?', [id]),
      connection.query('DELETE FROM otros_cargos WHERE id_afiliado = ?', [id]),
      connection.query('DELETE FROM cuotas WHERE cedula = (SELECT cedula FROM afiliados WHERE id_afiliado = ?)', [id])
    ]);
    
    const [result] = await connection.query('DELETE FROM afiliados WHERE id_afiliado = ?', [id]);
    
    await connection.commit();
    console.log(`✅ [${rol}] Afiliado eliminado:`, id);
    return result.affectedRows > 0;

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error en deleteAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const searchAfiliados = async (searchTerm, departamento, rol) => {
  let query = `
    SELECT a.*, 
           c.nombre_cargo,
           ie.nombre_institucion,
           m.departamento
    FROM afiliados a
    LEFT JOIN cargos c ON a.id_cargo = c.id_cargo
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
    LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
    WHERE (a.cedula LIKE ? OR a.nombres LIKE ? OR a.apellidos LIKE ?)
  `;
  
  const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
  
  // Aplicar filtro de departamento si no es presidencia_nacional
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` AND m.departamento = ?`;
    params.push(departamento);
  }
  
  const [afiliados] = await db.query(query, params);
  return afiliados;
};