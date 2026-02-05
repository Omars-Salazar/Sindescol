import * as municipiosService from '../services/municipiosService.js';

export const municipiosController = {
  getMunicipios: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`🏙️ GET /municipios - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const municipios = await municipiosService.getMunicipios(departamento, rol);
      res.json({ success: true, data: municipios });
    } catch (error) {
      console.error('Error en getMunicipios:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getMunicipioById: async (req, res) => {
    try {
      const municipio = await municipiosService.getMunicipioById(req.params.id);
      if (!municipio) {
        return res.status(404).json({ success: false, message: 'Municipio no encontrado' });
      }
      res.json({ success: true, data: municipio });
    } catch (error) {
      console.error('Error en getMunicipioById:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDepartamentos: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`🏛️ GET /departamentos - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const departamentos = await municipiosService.getDepartamentos(departamento, rol);
      res.json({ success: true, data: departamentos });
    } catch (error) {
      console.error('Error en getDepartamentos:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getMunicipiosByDepartamento: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`🏙️ GET /municipios/departamento/${req.params.departamento} - Rol: ${rol}`);
      const municipios = await municipiosService.getMunicipiosByDepartamento(req.params.departamento, departamento, rol);
      res.json({ success: true, data: municipios });
    } catch (error) {
      console.error('Error en getMunicipiosByDepartamento:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  createMunicipio: async (req, res) => {
    try {
      const { rol } = req.user;
      console.log(`➕ POST /municipios - Rol: ${rol}`);
      const municipio = await municipiosService.createMunicipio(req.body, rol);
      res.status(201).json({ success: true, data: municipio });
    } catch (error) {
      console.error('Error en createMunicipio:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateMunicipio: async (req, res) => {
    try {
      const { rol } = req.user;
      console.log(`✏️ PUT /municipios/${req.params.id} - Rol: ${rol}`);
      const municipio = await municipiosService.updateMunicipio(req.params.id, req.body, rol);
      res.json({ success: true, data: municipio });
    } catch (error) {
      console.error('Error en updateMunicipio:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteMunicipio: async (req, res) => {
    try {
      const { rol } = req.user;
      console.log(`🗑️ DELETE /municipios/${req.params.id} - Rol: ${rol}`);
      const success = await municipiosService.deleteMunicipio(req.params.id, rol);
      if (success) {
        res.json({ success: true, message: 'Municipio eliminado correctamente' });
      } else {
        res.status(404).json({ success: false, message: 'Municipio no encontrado' });
      }
    } catch (error) {
      console.error('Error en deleteMunicipio:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};