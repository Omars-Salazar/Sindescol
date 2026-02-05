import db from "../config/db.js";

// ============================================
// OBTENER CARGOS CON FILTRADO POR DEPARTAMENTO
// ============================================
export const getCargos = async (departamento, rol) => {
  let query = `
    SELECT DISTINCT c.id_cargo, c.nombre_cargo, c.descripcion_cargo,
           COUNT(DISTINCT a.id_afiliado) as total_afiliados
    FROM cargos c
    LEFT JOIN afiliados a ON c.id_cargo = a.id_cargo
  `;
  
  const params = [];
  
  // Si no es presidencia_nacional, filtrar por departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += `
    LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
    WHERE m.departamento = ?
    `;
    params.push(departamento);
    console.log(`📋 [${rol}] Filtrando cargos por departamento:`, departamento);
  } else {
    console.log(`📋 [presidencia_nacional] Cargando TODOS los cargos`);
  }
  
  query += ` GROUP BY c.id_cargo, c.nombre_cargo, c.descripcion_cargo ORDER BY c.nombre_cargo`;
  
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
// CREAR CARGO (disponible para todos)
// ============================================
export const createCargo = async (data) => {
  const { nombre_cargo, descripcion_cargo } = data;
  
  const [result] = await db.query(
    'INSERT INTO cargos (nombre_cargo, descripcion_cargo) VALUES (?, ?)',
    [nombre_cargo, descripcion_cargo || null]
  );
  
  console.log(`✅ Cargo creado:`, { id_cargo: result.insertId, nombre_cargo });
  return { id_cargo: result.insertId, nombre_cargo, descripcion_cargo };
};

// ============================================
// ACTUALIZAR CARGO (disponible para todos)
// ============================================
export const updateCargo = async (id, data) => {
  const { nombre_cargo, descripcion_cargo } = data;
  
  await db.query(
    'UPDATE cargos SET nombre_cargo = ?, descripcion_cargo = ? WHERE id_cargo = ?',
    [nombre_cargo, descripcion_cargo || null, id]
  );
  
  console.log(`✅ Cargo actualizado:`, id);
  return getCargoById(id);
};

// ============================================
// ELIMINAR CARGO CON VALIDACIÓN
// ============================================
export const deleteCargo = async (id, departamento, rol) => {
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