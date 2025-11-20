import * as afiliadsService from "../services/afiliadsService.js";

export const getAfiliados = async (req, res) => {
  try {
    const afiliados = await afiliadsService.getAfiliados();
    res.json({ success: true, data: afiliados });
  } catch (error) {
    console.error("Error en getAfiliados:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAfiliadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const afiliado = await afiliadsService.getAfiliadoById(id);
    if (!afiliado) return res.status(404).json({ success: false, error: "Afiliado no encontrado" });
    res.json({ success: true, data: afiliado });
  } catch (error) {
    console.error("Error en getAfiliadoById:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAfiliadoByCedula = async (req, res) => {
  try {
    const { cedula } = req.params;
    const afiliado = await afiliadsService.getAfiliadoByCedula(cedula);
    if (!afiliado) return res.status(404).json({ success: false, error: "Afiliado no encontrado" });
    res.json({ success: true, data: afiliado });
  } catch (error) {
    console.error("Error en getAfiliadoByCedula:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAfiliado = async (req, res) => {
  try {
    console.log("📝 Datos recibidos para crear afiliado:", JSON.stringify(req.body, null, 2));
    const afiliado = await afiliadsService.createAfiliado(req.body);
    console.log("✅ Afiliado creado exitosamente:", afiliado);
    res.status(201).json({ success: true, data: afiliado });
  } catch (error) {
    console.error("❌ Error en createAfiliado:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAfiliado = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📝 Actualizando afiliado:", id, req.body);
    const afiliado = await afiliadsService.updateAfiliado(id, req.body);
    if (!afiliado) return res.status(404).json({ success: false, error: "Afiliado no encontrado" });
    res.json({ success: true, data: afiliado });
  } catch (error) {
    console.error("Error en updateAfiliado:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAfiliado = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await afiliadsService.deleteAfiliado(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Afiliado no encontrado" });
    res.json({ success: true, message: "Afiliado eliminado" });
  } catch (error) {
    console.error("Error en deleteAfiliado:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const searchAfiliados = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: "Parámetro de búsqueda requerido" });
    const afiliados = await afiliadsService.searchAfiliados(q);
    res.json({ success: true, data: afiliados });
  } catch (error) {
    console.error("Error en searchAfiliados:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};