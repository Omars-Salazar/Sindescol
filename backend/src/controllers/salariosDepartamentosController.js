import * as salarioService from "../services/salariosDepartamentosService.js";

export const getSalarios = async (req, res) => {
  try {
    const { id_cargo, id_municipio } = req.query;
    console.log("🔍 Consulta de salarios con filtros:", { id_cargo, id_municipio });
    
    const salarios = await salarioService.getSalarios(id_cargo, id_municipio);
    res.json({ success: true, data: salarios });
  } catch (error) {
    console.error("❌ Error en getSalarios:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSalarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const salario = await salarioService.getSalarioById(id);
    if (!salario) {
      return res.status(404).json({ success: false, error: "Salario no encontrado" });
    }
    res.json({ success: true, data: salario });
  } catch (error) {
    console.error("❌ Error en getSalarioById:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSalario = async (req, res) => {
  try {
    console.log("📝 Datos recibidos para crear salario:", req.body);
    const salario = await salarioService.createSalario(req.body);
    res.status(201).json({ success: true, data: salario });
  } catch (error) {
    console.error("❌ Error en createSalario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSalario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("✏️ Actualizando salario:", id, req.body);
    const salario = await salarioService.updateSalario(id, req.body);
    if (!salario) {
      return res.status(404).json({ success: false, error: "Salario no encontrado" });
    }
    res.json({ success: true, data: salario });
  } catch (error) {
    console.error("❌ Error en updateSalario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSalario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Eliminando salario:", id);
    const deleted = await salarioService.deleteSalario(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Salario no encontrado" });
    }
    res.json({ success: true, message: "Salario eliminado" });
  } catch (error) {
    console.error("❌ Error en deleteSalario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};