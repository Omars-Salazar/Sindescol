import pool from "../config/db.js";

// Obtener todos los departamentos únicos
export const getDepartamentos = async () => {
  const query = "SELECT DISTINCT departamento FROM municipios ORDER BY departamento";
  const [rows] = await pool.query(query);
  return rows;
};

// Obtener municipios por departamento
export const getMunicipiosByDepartamento = async (departamento) => {
  const query = "SELECT * FROM municipios WHERE departamento = ? ORDER BY nombre_municipio";
  const [rows] = await pool.query(query, [departamento]);
  return rows;
};

// Obtener un municipio por ID
export const getMunicipioById = async (id) => {
  const query = "SELECT * FROM municipios WHERE id_municipio = ?";
  const [rows] = await pool.query(query, [id]);
  return rows[0] || null;
};

// Crear un municipio
export const createMunicipio = async (data) => {
  const { nombre_municipio, departamento } = data;
  
  const query = "INSERT INTO municipios (nombre_municipio, departamento) VALUES (?, ?)";
  const [result] = await pool.query(query, [nombre_municipio, departamento]);
  
  return {
    id_municipio: result.insertId,
    nombre_municipio,
    departamento
  };
};

// Actualizar un municipio
export const updateMunicipio = async (id, data) => {
  const { nombre_municipio, departamento } = data;
  
  const query = "UPDATE municipios SET nombre_municipio = ?, departamento = ? WHERE id_municipio = ?";
  const [result] = await pool.query(query, [nombre_municipio, departamento, id]);
  
  if (result.affectedRows === 0) return null;
  
  return {
    id_municipio: id,
    nombre_municipio,
    departamento
  };
};

// Eliminar un municipio
export const deleteMunicipio = async (id) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Verificar si el municipio está siendo usado
    const [afiliados] = await connection.query(
      "SELECT COUNT(*) as count FROM afiliados WHERE municipio_trabajo = ? OR municipio_domicilio = ? OR municipio_residencia = ?",
      [id, id, id]
    );
    
    if (afiliados[0].count > 0) {
      throw new Error("No se puede eliminar el municipio porque está siendo usado por afiliados");
    }
    
    const [salarios] = await connection.query(
      "SELECT COUNT(*) as count FROM salarios_municipios WHERE id_municipio = ?",
      [id]
    );
    
    if (salarios[0].count > 0) {
      throw new Error("No se puede eliminar el municipio porque tiene salarios asociados");
    }
    
    // Si no está siendo usado, eliminarlo
    const [result] = await connection.query("DELETE FROM municipios WHERE id_municipio = ?", [id]);
    
    await connection.commit();
    return result.affectedRows > 0;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Crear múltiples municipios para un departamento
export const createDepartamentoConMunicipios = async (data) => {
  const { departamento, municipios } = data;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const municipiosCreados = [];
    
    for (const nombre_municipio of municipios) {
      const query = "INSERT INTO municipios (nombre_municipio, departamento) VALUES (?, ?)";
      const [result] = await connection.query(query, [nombre_municipio, departamento]);
      
      municipiosCreados.push({
        id_municipio: result.insertId,
        nombre_municipio,
        departamento
      });
    }
    
    await connection.commit();
    return { departamento, municipios: municipiosCreados };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};