import db from "../config/db.js";
export const getSalarios = async () => {
  const query = `
    SELECT sd.*, c.nombre_cargo
    FROM salarios_departamentos sd
    LEFT JOIN cargos c ON sd.id_cargo = c.id_cargo
  `;
  const [salarios] = await db.query(query);
  return salarios;
};

export const getSalarioById = async (id) => {
  const query = `
    SELECT sd.*, c.nombre_cargo
    FROM salarios_departamentos sd
    LEFT JOIN cargos c ON sd.id_cargo = c.id_cargo
    WHERE sd.id_salario = ?
  `;
  const [salarios] = await db.query(query, [id]);
  return salarios[0];
};

export const getSalariosByCargoAndDepartamento = async (id_cargo, departamento) => {
  const query = `
    SELECT sd.*, c.nombre_cargo
    FROM salarios_departamentos sd
    LEFT JOIN cargos c ON sd.id_cargo = c.id_cargo
    WHERE sd.id_cargo = ? AND sd.departamento = ?
  `;
  const [salarios] = await db.query(query, [id_cargo, departamento]);
  return salarios[0];
};

export const createSalario = async (data) => {
  const { id_cargo, departamento, salario } = data;
  const query = `
    INSERT INTO salarios_departamentos (id_cargo, departamento, salario)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.query(query, [id_cargo, departamento, salario]);
  return getSalarioById(result.insertId);
};

export const updateSalario = async (id, data) => {
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(data);
  const query = `UPDATE salarios_departamentos SET ${fields} WHERE id_salario = ?`;
  await db.query(query, [...values, id]);
  return getSalarioById(id);
};

export const deleteSalario = async (id) => {
  const query = `DELETE FROM salarios_departamentos WHERE id_salario = ?`;
  const [result] = await db.query(query, [id]);
  return result.affectedRows > 0;
};
