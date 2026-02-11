import * as mensajesDiaService from "../services/mensajesDiaService.js";

export const getMensajes = async (req, res) => {
  try {
    const mensajes = await mensajesDiaService.getMensajes();
    res.json({ success: true, data: mensajes });
  } catch (error) {
    console.error("Error en getMensajes:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMensajeDelDia = async (req, res) => {
  try {
    const mensaje = await mensajesDiaService.getMensajeDelDia();
    res.json({ success: true, data: mensaje });
  } catch (error) {
    console.error("Error en getMensajeDelDia:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMensaje = async (req, res) => {
  try {
    const { mensaje, activo, orden } = req.body;

    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({
        success: false,
        error: "El mensaje es requerido"
      });
    }

    const nuevoMensaje = await mensajesDiaService.createMensaje({
      mensaje: mensaje.trim(),
      activo: activo !== undefined ? activo : true,
      orden: orden !== undefined ? orden : 0
    });

    res.status(201).json({ success: true, data: nuevoMensaje });
  } catch (error) {
    console.error("Error en createMensaje:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje, activo, orden } = req.body;

    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({
        success: false,
        error: "El mensaje es requerido"
      });
    }

    if (activo === undefined) {
      return res.status(400).json({
        success: false,
        error: "El estado activo es requerido"
      });
    }

    if (orden === undefined) {
      return res.status(400).json({
        success: false,
        error: "El orden es requerido"
      });
    }

    const mensajeActualizado = await mensajesDiaService.updateMensaje(id, {
      mensaje: mensaje.trim(),
      activo,
      orden
    });

    if (!mensajeActualizado) {
      return res.status(404).json({ success: false, error: "Mensaje no encontrado" });
    }

    res.json({ success: true, data: mensajeActualizado });
  } catch (error) {
    console.error("Error en updateMensaje:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await mensajesDiaService.deleteMensaje(id);

    if (!eliminado) {
      return res.status(404).json({ success: false, error: "Mensaje no encontrado" });
    }

    res.json({ success: true, message: "Mensaje eliminado" });
  } catch (error) {
    console.error("Error en deleteMensaje:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
