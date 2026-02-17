import db from "../config/db.js";

// ============================================
// OBTENER CARGOS CON FILTRADO POR DEPARTAMENTO
// ============================================
export const getCargos = async (departamento, rol) => {
  let query = `
    SELECT DISTINCT c.id_cargo, c.nombre_cargo,
           COUNT(DISTINCT a.id_afiliado) as total_afiliados
    FROM cargos c
  `;
  
  const params = [];
  
  // Si no es presidencia_nacional, filtrar por departamento basado en salarios y municipios
  if (rol !== 'presidencia_nacional' && departamento) {
    query += `
    LEFT JOIN salarios_municipios sm ON c.id_cargo = sm.id_cargo
    LEFT JOIN municipios m ON sm.id_municipio = m.id_municipio
    LEFT JOIN afiliados a ON c.id_cargo = a.id_cargo AND a.municipio_trabajo = m.id_municipio
    WHERE m.departamento = ?
    `;
    params.push(departamento);
    console.log(`📋 [${rol}] Filtrando cargos con salarios en departamento:`, departamento);
  } else {
    // Presidencia nacional ve todos los cargos
    query += `
    LEFT JOIN afiliados a ON c.id_cargo = a.id_cargo
    `;
    console.log(`📋 [presidencia_nacional] Cargando TODOS los cargos`);
  }
  
  query += ` GROUP BY c.id_cargo, c.nombre_cargo ORDER BY c.nombre_cargo`;
  
  const [cargos] = await db.query(query, params);
  console.log(`✅ Cargos encontrados: ${cargos.length}`);
  return cargos;
};

// ============================================
// OBTENER CARGO POR ID (sin filtro - detalles completos)
// ============================================
export const getCargoById = async (id) => {
  const [cargos] = await db.query(
    'SELECT * FROM cargos WHERE id_cargo = ?',
    [id]
  );
  return cargos[0];
};

// ============================================
// OBTENER MUNICIPIOS Y SALARIOS POR CARGO (filtrado por departamento)
// ============================================
export const getMunicipiosByCargo = async (id, departamento, rol) => {
  let query = `
    SELECT DISTINCT 
      m.id_municipio,
      m.nombre_municipio,
      m.departamento,
      s.salario
    FROM salarios_municipios s
    LEFT JOIN municipios m ON s.id_municipio = m.id_municipio
    WHERE s.id_cargo = ?
  `;
  
  const params = [id];
  
  // Si no es presidencia_nacional, filtrar por departamento del usuario
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` AND m.departamento = ?`;
    params.push(departamento);
    console.log(`🗺️ [${rol}] Filtrando municipios para cargo ${id} en departamento: ${departamento}`);
  } else {
    console.log(`🗺️ [presidencia_nacional] Mostrando TODOS los municipios para cargo ${id}`);
  }
  
  query += ` ORDER BY m.nombre_municipio`;
  
  const [datos] = await db.query(query, params);
  
  return datos;
};

// ============================================
// CREAR CARGO CON SALARIOS
// ============================================
export const createCargo = async (data) => {
  const { nombre_cargo, salario, municipios = [] } = data;

  if (!nombre_cargo || !nombre_cargo.trim()) {
    throw new Error('El nombre del cargo es requerido');
  }

  if (!salario || salario <= 0) {
    throw new Error('El salario debe ser mayor a 0');
  }

  if (municipios.length === 0) {
    throw new Error('Debes seleccionar al menos un municipio');
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Crear cargo
    const [cargoResult] = await connection.query(
      'INSERT INTO cargos (nombre_cargo) VALUES (?)',
      [nombre_cargo.trim()]
    );

    const id_cargo = cargoResult.insertId;

    // 2. Crear salarios para cada municipio
    for (const id_municipio of municipios) {
      await connection.query(
        'INSERT INTO salarios_municipios (id_cargo, id_municipio, salario) VALUES (?, ?, ?)',
        [id_cargo, id_municipio, salario]
      );
    }

    await connection.commit();

    console.log(`✅ Cargo creado:`, { id_cargo, nombre_cargo, salarios_count: municipios.length });
    return { id_cargo, nombre_cargo, municipios };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// ACTUALIZAR CARGO CON SALARIOS
// ============================================
export const updateCargo = async (id, data) => {
  const { nombre_cargo, salario, municipios = [] } = data;

  if (!nombre_cargo || !nombre_cargo.trim()) {
    throw new Error('El nombre del cargo es requerido');
  }

  if (!salario || salario <= 0) {
    throw new Error('El salario debe ser mayor a 0');
  }

  if (municipios.length === 0) {
    throw new Error('Debes seleccionar al menos un municipio');
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Actualizar cargo
    await connection.query(
      'UPDATE cargos SET nombre_cargo = ? WHERE id_cargo = ?',
      [nombre_cargo.trim(), id]
    );

    // 2. Eliminar salarios anteriores
    await connection.query(
      'DELETE FROM salarios_municipios WHERE id_cargo = ?',
      [id]
    );

    // 3. Crear nuevos salarios
    for (const id_municipio of municipios) {
      await connection.query(
        'INSERT INTO salarios_municipios (id_cargo, id_municipio, salario) VALUES (?, ?, ?)',
        [id, id_municipio, salario]
      );
    }

    await connection.commit();

    console.log(`✅ Cargo actualizado:`, id);
    return getCargoById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// OBTENER CARGOS POR MUNICIPIO
// ============================================
export const getCargosByMunicipio = async (id_municipio) => {
  const query = `
    SELECT DISTINCT c.id_cargo, c.nombre_cargo
    FROM cargos c
    INNER JOIN salarios_municipios sm ON c.id_cargo = sm.id_cargo
    WHERE sm.id_municipio = ?
    ORDER BY c.nombre_cargo
  `;
  
  const [cargos] = await db.query(query, [id_municipio]);
  console.log(`🎯 Cargos disponibles para municipio ${id_municipio}: ${cargos.length}`);
  return cargos;
};

// ============================================
// ELIMINAR CARGO CON VALIDACIÓN
// ============================================
export const deleteCargo = async (id, departamento, rol) => {
  // Verificar si hay salarios asociados a este cargo
  const [salarios] = await db.query(
    'SELECT COUNT(*) as count FROM salarios_municipios WHERE id_cargo = ?',
    [id]
  );

  if (salarios[0].count > 0) {
    throw new Error('No se puede eliminar el cargo porque tiene salarios asociados. Elimina esos salarios y vuelve a intentar.');
  }

  // Verificar si hay afiliados usando este cargo
  let checkQuery = `
    SELECT COUNT(*) as count 
    FROM afiliados a
    WHERE a.id_cargo = ?
  `;
  
  const params = [id];
  
  // Si no es presidencia_nacional, solo verificar en su departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    checkQuery += `
    AND EXISTS (
      SELECT 1 FROM municipios m 
      WHERE m.id_municipio = a.municipio_trabajo 
      AND m.departamento = ?
    )`;
    params.push(departamento);
  }
  
  const [afiliados] = await db.query(checkQuery, params);
  
  if (afiliados[0].count > 0) {
    throw new Error(`No se puede eliminar el cargo porque tiene ${afiliados[0].count} afiliados asociados en ${departamento || 'el sistema'}`);
  }
  
  const [result] = await db.query('DELETE FROM cargos WHERE id_cargo = ?', [id]);
  console.log(`✅ [${rol}] Cargo eliminado:`, id);
  return result.affectedRows > 0;
};