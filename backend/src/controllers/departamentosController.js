import * as departamentosService from "../services/departamentosService.js";

export const getDepartamentos = async (req, res) => {
  try {
    const departamentos = await departamentosService.getDepartamentos();
    res.json({ success: true, data: departamentos });
  } catch (error) {
    console.error("❌ Error en getDepartamentos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMunicipiosByDepartamento = async (req, res) => {
  try {
    const { departamento } = req.params;
    const municipios = await departamentosService.getMunicipiosByDepartamento(departamento);
    res.json({ success: true, data: municipios });
  } catch (error) {
    console.error("❌ Error en getMunicipiosByDepartamento:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMunicipio = async (req, res) => {
  try {
    const { rol, departamento: userDepartamento } = req.user;
    const { departamento } = req.body;

    // Si es presidencia_departamental, solo puede crear municipios en su departamento
    if (rol === 'presidencia_departamental' && departamento !== userDepartamento) {
      return res.status(403).json({ 
        success: false, 
        error: "Solo puedes crear municipios en tu departamento" 
      });
    }

    console.log("📝 Creando municipio:", req.body);
    const municipio = await departamentosService.createMunicipio(req.body);
    console.log("✅ Municipio creado exitosamente");
    res.status(201).json({ success: true, data: municipio });
  } catch (error) {
    console.error("❌ Error en createMunicipio:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMunicipio = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, departamento: userDepartamento } = req.user;

    // Si es presidencia_departamental, verificar que el municipio sea de su departamento
    if (rol === 'presidencia_departamental') {
      const municipio = await departamentosService.getMunicipioById(id);
      if (municipio?.departamento !== userDepartamento) {
        return res.status(403).json({ 
          success: false, 
          error: "No tienes permiso para actualizar municipios de otros departamentos" 
        });
      }
    }

    console.log("📝 Actualizando municipio:", id, req.body);
    const municipio = await departamentosService.updateMunicipio(id, req.body);
    if (!municipio) {
      return res.status(404).json({ success: false, error: "Municipio no encontrado" });
    }
    console.log("✅ Municipio actualizado exitosamente");
    res.json({ success: true, data: municipio });
  } catch (error) {
    console.error("❌ Error en updateMunicipio:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMunicipio = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, departamento: userDepartamento } = req.user;

    // Si es presidencia_departamental, verificar que el municipio sea de su departamento
    if (rol === 'presidencia_departamental') {
      const municipio = await departamentosService.getMunicipioById(id);
      if (municipio?.departamento !== userDepartamento) {
        return res.status(403).json({ 
          success: false, 
          error: "No tienes permiso para eliminar municipios de otros departamentos" 
        });
      }
    }

    console.log("🗑️ Eliminando municipio:", id);
    const deleted = await departamentosService.deleteMunicipio(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Municipio no encontrado" });
    }
    console.log("✅ Municipio eliminado exitosamente");
    res.json({ success: true, message: "Municipio eliminado" });
  } catch (error) {
    console.error("❌ Error en deleteMunicipio:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDepartamentoConMunicipios = async (req, res) => {
  try {
    const { rol } = req.user;

    // Solo presidencia_nacional puede crear departamentos
    if (rol !== 'presidencia_nacional') {
      return res.status(403).json({ 
        success: false, 
        error: "Solo presidencia_nacional puede crear departamentos" 
      });
    }

    console.log("📝 Creando departamento con municipios:", req.body);
    const resultado = await departamentosService.createDepartamentoConMunicipios(req.body);
    console.log("✅ Departamento creado exitosamente");
    res.status(201).json({ success: true, data: resultado });
  } catch (error) {
    console.error("❌ Error en createDepartamentoConMunicipios:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};