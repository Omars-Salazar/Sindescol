import pool from "../config/db.js";

export const getMensajes = async (soloActivos = false) => {
  let query = "SELECT id_mensaje, mensaje, activo, orden, fecha_creacion FROM mensajes_dia";
  const params = [];

  if (soloActivos) {
    query += " WHERE activo = 1";
  }

  query += " ORDER BY orden ASC, id_mensaje ASC";

  const [rows] = await pool.query(query, params);
  return rows;
};

export const getMensajeDelDia = async () => {
  const [[countRow]] = await pool.query(
    "SELECT COUNT(*) as total FROM mensajes_dia WHERE activo = 1"
  );

  if (!countRow || countRow.total === 0) {
    return null;
  }

  const hoy = new Date();
  const inicioAnio = new Date(hoy.getFullYear(), 0, 0);
  const diff = hoy - inicioAnio;
  const unDia = 1000 * 60 * 60 * 24;
  const diaDelAnio = Math.floor(diff / unDia);
  const offset = diaDelAnio % countRow.total;

  const [rows] = await pool.query(
    "SELECT id_mensaje, mensaje FROM mensajes_dia WHERE activo = 1 ORDER BY orden ASC, id_mensaje ASC LIMIT 1 OFFSET ?",
    [offset]
  );

  return rows[0] || null;
};

export const createMensaje = async (data) => {
  const { mensaje, activo = true, orden = 0 } = data;

  const [result] = await pool.query(
    "INSERT INTO mensajes_dia (mensaje, activo, orden) VALUES (?, ?, ?)",
    [mensaje, activo ? 1 : 0, orden]
  );

  return {
    id_mensaje: result.insertId,
    mensaje,
    activo: activo ? 1 : 0,
    orden
  };
};

export const updateMensaje = async (id, data) => {
  const { mensaje, activo, orden } = data;

  const [result] = await pool.query(
    "UPDATE mensajes_dia SET mensaje = ?, activo = ?, orden = ? WHERE id_mensaje = ?",
    [mensaje, activo ? 1 : 0, orden, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query(
    "SELECT id_mensaje, mensaje, activo, orden, fecha_creacion FROM mensajes_dia WHERE id_mensaje = ?",
    [id]
  );

  return rows[0];
};

export const deleteMensaje = async (id) => {
  const [result] = await pool.query(
    "DELETE FROM mensajes_dia WHERE id_mensaje = ?",
    [id]
  );

  return result.affectedRows > 0;
};
