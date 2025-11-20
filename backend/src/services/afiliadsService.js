import db from "../config/db.js";

export const getAfiliados = async () => {
  const query = `
    SELECT a.*, 
           c.nombre_cargo,
           r.nombre_religion,
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
    LEFT JOIN municipios mt ON a.municipio_trabajo = mt.id_municipio
    LEFT JOIN entidades_eps e ON a.id_eps = e.id_eps
    LEFT JOIN entidades_arl ar ON a.id_arl = ar.id_arl
    LEFT JOIN entidades_pension p ON a.id_pension = p.id_pension
    LEFT JOIN entidades_cesantias ce ON a.id_cesantias = ce.id_cesantias
    LEFT JOIN instituciones_educativas ie ON a.id_institucion = ie.id_institucion
  `;
  const [afiliados] = await db.query(query);
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
  return afiliados[0];
};

export const createAfiliado = async (data) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      // Datos personales
      cedula, nombres, apellidos, religion_id, fecha_nacimiento, fecha_afiliacion,
      direccion_domicilio, municipio_domicilio, municipio_residencia, direccion_residencia,
      
      // Seguridad social
      id_cargo, id_eps, id_arl, id_pension, id_cesantias, 
      
      // Datos laborales
      municipio_trabajo, id_institucion, correo_institucional, 
      telefono_institucional, direccion_institucion,
      
      // Actas
      tipo_documento, numero_resolucion, fecha_resolucion,
      numero_acta, fecha_acta,
      
      // Rector
      nombre_rector,
      
      // Otros cargos
      otros_cargos
    } = data;

    // 1. Insertar afiliado
    const queryAfiliado = `
      INSERT INTO afiliados 
      (cedula, nombres, apellidos, religion_id, fecha_nacimiento, fecha_afiliacion,
       direccion_domicilio, municipio_domicilio, municipio_residencia, direccion_residencia,
       id_cargo, id_eps, id_arl, id_pension, id_cesantias, id_institucion, municipio_trabajo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultAfiliado] = await connection.query(queryAfiliado, [
      cedula, nombres, apellidos, religion_id || null, fecha_nacimiento || null, 
      fecha_afiliacion || null, direccion_domicilio || null, municipio_domicilio || null, 
      municipio_residencia || null, direccion_residencia || null, id_cargo, 
      id_eps || null, id_arl || null, id_pension || null, id_cesantias || null, 
      id_institucion, municipio_trabajo || null
    ]);

    const idAfiliado = resultAfiliado.insertId;

    // 2. Actualizar institución educativa si se proporcionan datos
    if (id_institucion && (correo_institucional || telefono_institucional || direccion_institucion)) {
      const queryUpdateInstitucion = `
        UPDATE instituciones_educativas 
        SET correo_institucional = COALESCE(?, correo_institucional),
            telefono_institucional = COALESCE(?, telefono_institucional),
            direccion_institucion = COALESCE(?, direccion_institucion)
        WHERE id_institucion = ?
      `;
      await connection.query(queryUpdateInstitucion, [
        correo_institucional || null,
        telefono_institucional || null,
        direccion_institucion || null,
        id_institucion
      ]);
    }

    // 3. Insertar acta de nombramiento si hay datos
    if (tipo_documento || numero_resolucion || fecha_resolucion) {
      const queryNombramiento = `
        INSERT INTO actas_nombramiento 
        (id_afiliado, tipo_documento, numero_resolucion, fecha_resolucion)
        VALUES (?, ?, ?, ?)
      `;
      await connection.query(queryNombramiento, [
        idAfiliado,
        tipo_documento || null,
        numero_resolucion || null,
        fecha_resolucion || null
      ]);
    }

    // 4. Insertar acta de posesión si hay datos
    if (numero_acta || fecha_acta) {
      const queryPosesion = `
        INSERT INTO actas_posesion 
        (id_afiliado, numero_acta, fecha_acta)
        VALUES (?, ?, ?)
      `;
      await connection.query(queryPosesion, [
        idAfiliado,
        numero_acta || null,
        fecha_acta || null
      ]);
    }

    // 5. Insertar rector si se proporciona
    if (nombre_rector && id_institucion) {
      // Verificar si ya existe un rector para esta institución
      const [rectoresExistentes] = await connection.query(
        'SELECT id_rector FROM rectores WHERE id_institucion = ?',
        [id_institucion]
      );

      if (rectoresExistentes.length === 0) {
        const queryRector = `
          INSERT INTO rectores (nombre_rector, id_institucion)
          VALUES (?, ?)
        `;
        await connection.query(queryRector, [nombre_rector, id_institucion]);
      }
    }

    // 6. Insertar otros cargos si hay datos
    if (otros_cargos && Array.isArray(otros_cargos)) {
      for (const cargo of otros_cargos) {
        if (cargo.nombre_cargo) {
          const queryOtroCargo = `
            INSERT INTO otros_cargos 
            (id_afiliado, nombre_cargo, fecha_inicio, fecha_fin)
            VALUES (?, ?, ?, ?)
          `;
          await connection.query(queryOtroCargo, [
            idAfiliado,
            cargo.nombre_cargo,
            cargo.fecha_inicio || null,
            cargo.fecha_fin || null
          ]);
        }
      }
    }

    await connection.commit();
    return getAfiliadoById(idAfiliado);

  } catch (error) {
    await connection.rollback();
    console.error('Error en createAfiliado:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const updateAfiliado = async (id, data) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Construir query dinámicamente con los campos proporcionados
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

    if (camposAfiliado.length > 0) {
      const queryAfiliado = `UPDATE afiliados SET ${camposAfiliado.join(', ')} WHERE id_afiliado = ?`;
      valoresAfiliado.push(id);
      await connection.query(queryAfiliado, valoresAfiliado);
    }

    // Actualizar institución si es necesario
    if (data.id_institucion && (data.correo_institucional || data.telefono_institucional || data.direccion_institucion)) {
      const camposInstitucion = [];
      const valoresInstitucion = [];

      if (data.correo_institucional) {
        camposInstitucion.push('correo_institucional = ?');
        valoresInstitucion.push(data.correo_institucional);
      }
      if (data.telefono_institucional) {
        camposInstitucion.push('telefono_institucional = ?');
        valoresInstitucion.push(data.telefono_institucional);
      }
      if (data.direccion_institucion) {
        camposInstitucion.push('direccion_institucion = ?');
        valoresInstitucion.push(data.direccion_institucion);
      }

      if (camposInstitucion.length > 0) {
        const queryInstitucion = `UPDATE instituciones_educativas SET ${camposInstitucion.join(', ')} WHERE id_institucion = ?`;
        valoresInstitucion.push(data.id_institucion);
        await connection.query(queryInstitucion, valoresInstitucion);
      }
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

    // Eliminar registros relacionados primero
    await connection.query('DELETE FROM actas_nombramiento WHERE id_afiliado = ?', [id]);
    await connection.query('DELETE FROM actas_posesion WHERE id_afiliado = ?', [id]);
    await connection.query('DELETE FROM otros_cargos WHERE id_afiliado = ?', [id]);
    await connection.query('DELETE FROM cuotas WHERE cedula = (SELECT cedula FROM afiliados WHERE id_afiliado = ?)', [id]);
    
    // Eliminar afiliado
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