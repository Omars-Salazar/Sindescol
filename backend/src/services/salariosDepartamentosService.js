import db from "../config/db.js";

export const getSalarios = async (id_cargo = null, id_municipio = null) => {
  try {
    let query = `
      SELECT sm.*, c.nombre_cargo, m.nombre_municipio, m.departamento
      FROM salarios_municipios sm
      LEFT JOIN cargos c ON sm.id_cargo = c.id_cargo
      LEFT JOIN municipios m ON sm.id_municipio = m.id_municipio
    `;
    
    const params = [];
    const conditions = [];

    if (id_cargo) {
      conditions.push('sm.id_cargo = ?');
      params.push(id_cargo);
    }

    if (id_municipio) {
      conditions.push('sm.id_municipio = ?');
      params.push(id_municipio);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    console.log("📊 Query salarios:", query);
    console.log("📊 Params:", params);

    const [salarios] = await db.query(query, params);
    return salarios;
  } catch (error) {
    console.error("❌ Error en getSalarios service:", error);
    throw error;
  }
};

export const getSalarioById = async (id) => {
  try {
    const query = `
      SELECT sm.*, c.nombre_cargo, m.nombre_municipio, m.departamento
      FROM salarios_municipios sm
      LEFT JOIN cargos c ON sm.id_cargo = c.id_cargo
      LEFT JOIN municipios m ON sm.id_municipio = m.id_municipio
      WHERE sm.id_salario = ?
    `;
    const [salarios] = await db.query(query, [id]);
    return salarios[0];
  } catch (error) {
    console.error("❌ Error en getSalarioById service:", error);
    throw error;
  }
};

export const createSalario = async (data) => {
  try {
    const { id_cargo, id_municipio, salario } = data;
    const query = `
      INSERT INTO salarios_municipios (id_cargo, id_municipio, salario)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [id_cargo, id_municipio, salario]);
    return getSalarioById(result.insertId);
  } catch (error) {
    console.error("❌ Error en createSalario service:", error);
    throw error;
  }
};

export const updateSalario = async (id, data) => {
  try {
    // Whitelist de campos permitidos para evitar inyecciones SQL y errores de columnas inexistentes
    const allowedFields = ['id_cargo', 'id_municipio', 'salario'];
    const filteredData = {};
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (allowedFields.includes(key)) {
        filteredData[key] = value;
        values.push(value);
      }
    }
    
    if (Object.keys(filteredData).length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }
    
    const fields = Object.keys(filteredData).map((key) => `${key} = ?`).join(", ");
    const query = `UPDATE salarios_municipios SET ${fields} WHERE id_salario = ?`;
    await db.query(query, [...values, id]);
    return getSalarioById(id);
  } catch (error) {
    console.error("❌ Error en updateSalario service:", error);
    throw error;
  }
};

export const deleteSalario = async (id) => {
  try {
    const query = `DELETE FROM salarios_municipios WHERE id_salario = ?`;
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("❌ Error en deleteSalario service:", error);
    throw error;
  }
};