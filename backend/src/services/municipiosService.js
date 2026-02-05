import db from "../config/db.js";

// ============================================
// OBTENER MUNICIPIOS CON FILTRADO POR DEPARTAMENTO
// ============================================
export const getMunicipios = async (departamento, rol) => {
  let query = `
    SELECT m.*,
           COUNT(DISTINCT a.id_afiliado) as total_afiliados
    FROM municipios m
    LEFT JOIN afiliados a ON m.id_municipio = a.municipio_trabajo
  `;
  
  const params = [];
  
  // Si no es presidencia_nacional, filtrar por departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` WHERE m.departamento = ?`;
    params.push(departamento);
    console.log(`🏙️ [${rol}] Filtrando municipios por departamento:`, departamento);
  } else {
    console.log(`🏙️ [presidencia_nacional] Cargando TODOS los municipios`);
  }
  
  query += ` GROUP BY m.id_municipio ORDER BY m.departamento, m.nombre_municipio`;
  
  const [municipios] = await db.query(query, params);
  console.log(`✅ Municipios encontrados: ${municipios.length}`);
  return municipios;
};

// ============================================
// OBTENER MUNICIPIO POR ID (sin filtro - detalles completos)
// ============================================
export const getMunicipioById = async (id) => {
  const [municipios] = await db.query(
    'SELECT * FROM municipios WHERE id_municipio = ?',
    [id]
  );
  return municipios[0];
};

// ============================================
// OBTENER MUNICIPIOS POR DEPARTAMENTO
// ============================================
export const getMunicipiosByDepartamento = async (dept, departamento, rol) => {
  // Solo presidencia_nacional puede ver municipios de otros departamentos
  if (rol !== 'presidencia_nacional') {
    if (dept !== departamento) {
      throw new Error(`No puedes ver municipios de ${dept}. Solo tienes acceso a ${departamento}`);
    }
  }

  const [municipios] = await db.query(
    'SELECT * FROM municipios WHERE departamento = ? ORDER BY nombre_municipio',
    [dept]
  );
  
  return municipios;
};

// ============================================
// OBTENER DEPARTAMENTOS ÚNICOS
// ============================================
export const getDepartamentos = async (departamento, rol) => {
  let query = 'SELECT DISTINCT departamento FROM municipios';
  const params = [];
  
  // Si no es presidencia_nacional, solo mostrar su departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ' WHERE departamento = ?';
    params.push(departamento);
    console.log(`🏛️ [${rol}] Mostrando solo departamento:`, departamento);
  } else {
    console.log(`🏛️ [presidencia_nacional] Mostrando TODOS los departamentos`);
  }
  
  query += ' ORDER BY departamento';
  
  const [departamentos] = await db.query(query, params);
  console.log(`✅ Departamentos disponibles: ${departamentos.length}`);
  return departamentos.map(d => d.departamento);
};

// ============================================
// CREAR MUNICIPIO (solo presidencia_nacional)
// ============================================
export const createMunicipio = async (data, rol) => {
  // Solo presidencia_nacional puede crear municipios
  if (rol !== 'presidencia_nacional') {
    throw new Error('Solo Presidencia Nacional puede crear nuevos municipios');
  }

  const { nombre_municipio, departamento } = data;

  // Verificar si ya existe el municipio en ese departamento
  const [existente] = await db.query(
    'SELECT id_municipio FROM municipios WHERE nombre_municipio = ? AND departamento = ?',
    [nombre_municipio, departamento]
  );

  if (existente.length > 0) {
    throw new Error(`El municipio ${nombre_municipio} ya existe en ${departamento}`);
  }

  const [result] = await db.query(
    'INSERT INTO municipios (nombre_municipio, departamento) VALUES (?, ?)',
    [nombre_municipio, departamento]
  );

  console.log(`✅ [presidencia_nacional] Municipio creado:`, { id_municipio: result.insertId, nombre_municipio, departamento });
  return { id_municipio: result.insertId, nombre_municipio, departamento };
};

// ============================================
// ACTUALIZAR MUNICIPIO (solo presidencia_nacional)
// ============================================
export const updateMunicipio = async (id, data, rol) => {
  // Solo presidencia_nacional puede editar municipios
  if (rol !== 'presidencia_nacional') {
    throw new Error('Solo Presidencia Nacional puede editar municipios');
  }

  const { nombre_municipio, departamento } = data;

  await db.query(
    'UPDATE municipios SET nombre_municipio = ?, departamento = ? WHERE id_municipio = ?',
    [nombre_municipio, departamento, id]
  );

  console.log(`✅ [presidencia_nacional] Municipio actualizado:`, id);
  return getMunicipioById(id);
};

// ============================================
// ELIMINAR MUNICIPIO CON VALIDACIÓN (solo presidencia_nacional)
// ============================================
export const deleteMunicipio = async (id, rol) => {
  // Solo presidencia_nacional puede eliminar municipios
  if (rol !== 'presidencia_nacional') {
    throw new Error('Solo Presidencia Nacional puede eliminar municipios');
  }

  // Verificar si hay afiliados en este municipio
  const [afiliados] = await db.query(
    `SELECT COUNT(*) as count FROM afiliados 
     WHERE municipio_trabajo = ? OR municipio_domicilio = ? OR municipio_residencia = ?`,
    [id, id, id]
  );

  if (afiliados[0].count > 0) {
    throw new Error(`No se puede eliminar el municipio porque tiene ${afiliados[0].count} afiliados asociados`);
  }

  // Verificar si hay salarios en este municipio
  const [salarios] = await db.query(
    'SELECT COUNT(*) as count FROM salarios WHERE id_municipio = ?',
    [id]
  );

  if (salarios[0].count > 0) {
    throw new Error(`No se puede eliminar el municipio porque tiene ${salarios[0].count} salarios registrados`);
  }

  const [result] = await db.query('DELETE FROM municipios WHERE id_municipio = ?', [id]);
  console.log(`✅ [presidencia_nacional] Municipio eliminado:`, id);
  return result.affectedRows > 0;
};