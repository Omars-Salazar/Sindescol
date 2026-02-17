import db from "../config/db.js";
import { getErrorMessage } from "../utils/errorMessages.js";

// ============================================
// OBTENER CUOTAS CON FILTRADO POR DEPARTAMENTO
// ============================================
export const getCuotas = async (departamento, rol) => {
  let query = `
    SELECT c.*, 
           a.nombres, a.apellidos,
           m.departamento, m.nombre_municipio
    FROM cuotas c
    INNER JOIN afiliados a ON c.cedula = a.cedula
    LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
  `;
  
  const params = [];
  
  // Si no es presidencia_nacional, filtrar por departamento
  if (rol !== 'presidencia_nacional' && departamento) {
    query += ` WHERE m.departamento = ?`;
    params.push(departamento);
    console.log(`💰 [${rol}] Filtrando cuotas por departamento:`, departamento);
  } else {
    console.log(`💰 [presidencia_nacional] Cargando TODAS las cuotas`);
  }
  
  query += ` ORDER BY c.anio DESC, c.mes DESC, c.cedula`;
  
  const [cuotas] = await db.query(query, params);
  console.log(`✅ Cuotas encontradas: ${cuotas.length}`);
  return cuotas;
};

// ============================================
// OBTENER CUOTA POR ID (sin filtro - detalles completos)
// ============================================
export const getCuotaById = async (id) => {
  const [cuotas] = await db.query(
    `SELECT c.*, a.nombres, a.apellidos, m.departamento
     FROM cuotas c
     INNER JOIN afiliados a ON c.cedula = a.cedula
     LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
     WHERE c.id_cuota = ?`,
    [id]
  );
  return cuotas[0];
};

// ============================================
// CREAR CUOTA CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const createCuota = async (data, departamento, rol) => {
  // Normalizar el nombre del campo 'ano' a 'anio'
  const normalizedData = {
    ...data,
    anio: data.anio ?? data.ano,
    valor_cuota: data.valor_cuota ?? data.valor
  };
  
  const { cedula, mes, estado_pago } = normalizedData;
  const anio = normalizedData.anio;
  const valor_cuota = normalizedData.valor_cuota;

  if (!cedula || !mes || !anio || !valor_cuota) {
    throw new Error(getErrorMessage('CUOTAS.MISSING_DATA'));
  }

  // VALIDAR QUE EL AFILIADO PERTENECE AL DEPARTAMENTO DEL USUARIO
  const [afiliado] = await db.query(
    `SELECT a.id_afiliado, m.departamento
     FROM afiliados a
     LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
     WHERE a.cedula = ?`,
    [cedula]
  );

  if (afiliado.length === 0) {
    throw new Error(getErrorMessage('CUOTAS.AFFILIATE_NOT_FOUND'));
  }

  // Solo presidencia_nacional puede crear cuotas para cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (afiliado[0].departamento !== departamento) {
      throw new Error(getErrorMessage('CUOTAS.WITHOUT_PERMISSION', { departamento: afiliado[0].departamento }));
    }
  }

  // Verificar si ya existe una cuota para ese afiliado en ese mes/año
  const [existente] = await db.query(
    'SELECT id_cuota FROM cuotas WHERE cedula = ? AND mes = ? AND anio = ?',
    [cedula, mes, anio]
  );

  if (existente.length > 0) {
    throw new Error(getErrorMessage('CUOTAS.DUPLICATE_QUOTA', { mes, anio }));
  }

  const [result] = await db.query(
    'INSERT INTO cuotas (cedula, mes, anio, valor) VALUES (?, ?, ?, ?)',
    [cedula, mes, anio, valor_cuota]
  );

  console.log(`✅ [${rol}] Cuota creada para ${cedula} en ${departamento || 'TODOS'}:`, { id_cuota: result.insertId, mes, anio });
  return { id_cuota: result.insertId, cedula, mes, anio, valor: valor_cuota };
};

// ============================================
// ACTUALIZAR CUOTA CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const updateCuota = async (id, data, departamento, rol) => {
  // VALIDAR QUE LA CUOTA PERTENECE A UN AFILIADO DEL DEPARTAMENTO
  const [cuotaActual] = await db.query(
    `SELECT c.cedula, m.departamento
     FROM cuotas c
     INNER JOIN afiliados a ON c.cedula = a.cedula
     LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
     WHERE c.id_cuota = ?`,
    [id]
  );

  if (cuotaActual.length === 0) {
    throw new Error(getErrorMessage('CUOTAS.NOT_FOUND'));
  }

  // Solo presidencia_nacional puede editar cuotas de cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (cuotaActual[0].departamento !== departamento) {
      throw new Error(getErrorMessage('CUOTAS.WITHOUT_PERMISSION', { departamento: cuotaActual[0].departamento }));
    }
  }

  // Normalizar el nombre del campo 'ano' a 'anio'
  const normalizedData = {
    ...data,
    anio: data.anio ?? data.ano,
    valor_cuota: data.valor_cuota ?? data.valor
  };
  
  const { mes, estado_pago } = normalizedData;
  const anio = normalizedData.anio;
  const valor_cuota = normalizedData.valor_cuota;

  if (!mes || !anio || !valor_cuota) {
    throw new Error(getErrorMessage('CUOTAS.UPDATING_MISSING_DATA'));
  }

  await db.query(
    'UPDATE cuotas SET mes = ?, anio = ?, valor = ? WHERE id_cuota = ?',
    [mes, anio, valor_cuota, id]
  );

  console.log(`✅ [${rol}] Cuota actualizada:`, id);
  return getCuotaById(id);
};

// ============================================
// ELIMINAR CUOTA CON VALIDACIÓN DE DEPARTAMENTO
// ============================================
export const deleteCuota = async (id, departamento, rol) => {
  // VALIDAR QUE LA CUOTA PERTENECE A UN AFILIADO DEL DEPARTAMENTO
  const [cuotaActual] = await db.query(
    `SELECT c.cedula, m.departamento
     FROM cuotas c
     INNER JOIN afiliados a ON c.cedula = a.cedula
     LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
     WHERE c.id_cuota = ?`,
    [id]
  );

  if (cuotaActual.length === 0) {
    throw new Error(getErrorMessage('CUOTAS.NOT_FOUND'));
  }

  // Solo presidencia_nacional puede eliminar cuotas de cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (cuotaActual[0].departamento !== departamento) {
      throw new Error(getErrorMessage('CUOTAS.DELETE_WITHOUT_PERMISSION'));
    }
  }

  const [result] = await db.query('DELETE FROM cuotas WHERE id_cuota = ?', [id]);
  console.log(`✅ [${rol}] Cuota eliminada:`, id);
  return result.affectedRows > 0;
};

// ============================================
// OBTENER CUOTAS POR CÉDULA
// ============================================
export const getCuotasByCedula = async (cedula, departamento, rol) => {
  // Verificar que el afiliado pertenece al departamento
  const [afiliado] = await db.query(
    `SELECT m.departamento
     FROM afiliados a
     LEFT JOIN municipios m ON a.municipio_trabajo = m.id_municipio
     WHERE a.cedula = ?`,
    [cedula]
  );

  if (afiliado.length === 0) {
    throw new Error(getErrorMessage('CUOTAS.AFFILIATE_NOT_FOUND'));
  }

  // Solo presidencia_nacional puede ver cuotas de cualquier departamento
  if (rol !== 'presidencia_nacional') {
    if (afiliado[0].departamento !== departamento) {
      throw new Error(getErrorMessage('CUOTAS.WITHOUT_PERMISSION', { departamento: afiliado[0].departamento }));
    }
  }

  const [cuotas] = await db.query(
    'SELECT * FROM cuotas WHERE cedula = ? ORDER BY anio DESC, mes DESC',
    [cedula]
  );

  return cuotas;
};