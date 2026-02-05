import db from "../config/db.js";

// ============================================
// OBTENER SALARIOS CON FILTRADO POR DEPARTAMENTO
// ============================================
export const getSalarios = async (departamento, rol) => {
  let query = `
    SELECT s.*, m.nombre_municipio, m.departamento, c.nombre_cargo
    FROM salarios s
    INNER JOIN municipios m ON s.id_municipio = m.id_municipio
    LEFT JOIN cargos c ON s.id_cargo = c.id_cargo
  `;
  
  const params = [];
  
  // Si no es presidencia_nacional, filtrar por departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` WHERE m.departamento = ?`;
    params.push(departamento);
    console.log(`💵 [${rol}] Filtrando salarios por departamento:`, departamento);
  } else {
    console.log(`💵 [presidencia_nacional] Cargando TODOS los salarios`);
  }
  
  query += ` ORDER BY m.departamento, m.nombre_municipio, c.nombre_cargo`;
  
  const [salarios] = await db.query(query, params);
  console.log(`✅ Salarios encontrados: ${salarios.length}`);
  return salarios;
};

// ============================================
// OBTENER SALARIO POR ID (sin filtro - detalles completos)
// ============================================
export const getSalarioById = async (id) => {
  const [salarios] = await db.query(
    `SELECT s.*, m.nombre_municipio, m.departamento, c.nombre_cargo
     FROM salarios s
     INNER JOIN municipios m ON s.id_municipio = m.id_municipio
     LEFT JOIN cargos c ON s.id_cargo = c.id_cargo
     WHERE s.id_salario = ?`,
    [id]
  );
  return salarios[0];
};

// ============================================
// CREAR SALARIO CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const createSalario = async (data, departamento, rol) => {
  const { id_municipio, id_cargo, valor_salario } = data;

  // VALIDAR QUE EL MUNICIPIO PERTENECE AL DEPARTAMENTO DEL USUARIO
  const [municipio] = await db.query(
    'SELECT departamento, nombre_municipio FROM municipios WHERE id_municipio = ?',
    [id_municipio]
  );

  if (municipio.length === 0) {
    throw new Error('Municipio no encontrado');
  }

  // Solo presidencia_nacional puede crear salarios en cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (municipio[0].departamento !== departamento) {
      throw new Error(`No puedes crear salarios para ${municipio[0].departamento}. Solo puedes gestionar salarios de ${departamento}`);
    }
  }

  // Verificar si ya existe un salario para ese cargo en ese municipio
  const [existente] = await db.query(
    'SELECT id_salario FROM salarios WHERE id_municipio = ? AND id_cargo = ?',
    [id_municipio, id_cargo]
  );

  if (existente.length > 0) {
    throw new Error(`Ya existe un salario registrado para este cargo en ${municipio[0].nombre_municipio}`);
  }

  const [result] = await db.query(
    'INSERT INTO salarios (id_municipio, id_cargo, valor_salario) VALUES (?, ?, ?)',
    [id_municipio, id_cargo, valor_salario]
  );

  console.log(`✅ [${rol}] Salario creado en ${municipio[0].departamento}:`, { 
    id_salario: result.insertId, 
    municipio: municipio[0].nombre_municipio,
    valor_salario 
  });
  
  return { 
    id_salario: result.insertId, 
    id_municipio, 
    id_cargo, 
    valor_salario 
  };
};

// ============================================
// ACTUALIZAR SALARIO CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const updateSalario = async (id, data, departamento, rol) => {
  // VALIDAR QUE EL SALARIO PERTENECE AL DEPARTAMENTO DEL USUARIO
  const [salarioActual] = await db.query(
    `SELECT m.departamento, m.nombre_municipio
     FROM salarios s
     INNER JOIN municipios m ON s.id_municipio = m.id_municipio
     WHERE s.id_salario = ?`,
    [id]
  );

  if (salarioActual.length === 0) {
    throw new Error('Salario no encontrado');
  }

  // Solo presidencia_nacional puede editar salarios de cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (salarioActual[0].departamento !== departamento) {
      throw new Error(`No puedes editar este salario. Pertenece a ${salarioActual[0].departamento}`);
    }
  }

  const { id_municipio, id_cargo, valor_salario } = data;

  // Si se está cambiando el municipio, validar que pertenece al departamento
  if (id_municipio) {
    const [nuevoMunicipio] = await db.query(
      'SELECT departamento FROM municipios WHERE id_municipio = ?',
      [id_municipio]
    );

    if (rol !== 'presidencia_nacional') {
      if (nuevoMunicipio.length === 0 || nuevoMunicipio[0].departamento !== departamento) {
        throw new Error(`El nuevo municipio debe pertenecer a ${departamento}`);
      }
    }
  }

  await db.query(
    'UPDATE salarios SET id_municipio = ?, id_cargo = ?, valor_salario = ? WHERE id_salario = ?',
    [id_municipio, id_cargo, valor_salario, id]
  );

  console.log(`✅ [${rol}] Salario actualizado:`, id);
  return getSalarioById(id);
};

// ============================================
// ELIMINAR SALARIO CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const deleteSalario = async (id, departamento, rol) => {
  // VALIDAR QUE EL SALARIO PERTENECE AL DEPARTAMENTO DEL USUARIO
  const [salarioActual] = await db.query(
    `SELECT m.departamento, m.nombre_municipio
     FROM salarios s
     INNER JOIN municipios m ON s.id_municipio = m.id_municipio
     WHERE s.id_salario = ?`,
    [id]
  );

  if (salarioActual.length === 0) {
    throw new Error('Salario no encontrado');
  }

  // Solo presidencia_nacional puede eliminar salarios de cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (salarioActual[0].departamento !== departamento) {
      throw new Error(`No puedes eliminar este salario. Pertenece a ${salarioActual[0].departamento}`);
    }
  }

  const [result] = await db.query('DELETE FROM salarios WHERE id_salario = ?', [id]);
  console.log(`✅ [${rol}] Salario eliminado:`, id);
  return result.affectedRows > 0;
};

// ============================================
// OBTENER SALARIOS POR MUNICIPIO
// ============================================
export const getSalariosByMunicipio = async (id_municipio, departamento, rol) => {
  // Verificar que el municipio pertenece al departamento
  const [municipio] = await db.query(
    'SELECT departamento, nombre_municipio FROM municipios WHERE id_municipio = ?',
    [id_municipio]
  );

  if (municipio.length === 0) {
    throw new Error('Municipio no encontrado');
  }

  // Solo presidencia_nacional puede ver salarios de cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (municipio[0].departamento !== departamento) {
      throw new Error(`No puedes ver los salarios de ${municipio[0].nombre_municipio}. Pertenece a ${municipio[0].departamento}`);
    }
  }

  const [salarios] = await db.query(
    `SELECT s.*, c.nombre_cargo
     FROM salarios s
     LEFT JOIN cargos c ON s.id_cargo = c.id_cargo
     WHERE s.id_municipio = ?
     ORDER BY c.nombre_cargo`,
    [id_municipio]
  );

  return salarios;
};

// ============================================
// OBTENER SALARIOS POR CARGO
// ============================================
export const getSalariosByCargo = async (id_cargo, departamento, rol) => {
  let query = `
    SELECT s.*, m.nombre_municipio, m.departamento
    FROM salarios s
    INNER JOIN municipios m ON s.id_municipio = m.id_municipio
    WHERE s.id_cargo = ?
  `;
  
  const params = [id_cargo];
  
  // Si no es presidencia_nacional, filtrar por departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` AND m.departamento = ?`;
    params.push(departamento);
  }
  
  query += ` ORDER BY m.departamento, m.nombre_municipio`;
  
  const [salarios] = await db.query(query, params);
  return salarios;
};