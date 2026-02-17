import * as cargosService from '../services/cargosService.js';

export const cargosController = {
  getCargos: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`📋 GET /cargos - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const cargos = await cargosService.getCargos(departamento, rol);
      res.json({ success: true, data: cargos });
    } catch (error) {
      console.error('Error en getCargos:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCargoById: async (req, res) => {
    try {
      const cargo = await cargosService.getCargoById(req.params.id);
      if (!cargo) {
        return res.status(404).json({ success: false, message: 'Cargo no encontrado' });
      }
      res.json({ success: true, data: cargo });
    } catch (error) {
      console.error('Error en getCargoById:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getMunicipiosByCargo: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      const municipios = await cargosService.getMunicipiosByCargo(req.params.id, departamento, rol);
      res.json({ success: true, data: municipios });
    } catch (error) {
      console.error('Error en getMunicipiosByCargo:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCargosByMunicipio: async (req, res) => {
    try {
      const { id_municipio } = req.params;
      console.log(`🎯 GET /cargos/municipio/${id_municipio} - Obteniendo cargos`);
      const cargos = await cargosService.getCargosByMunicipio(id_municipio);
      res.json({ success: true, data: cargos });
    } catch (error) {
      console.error('Error en getCargosByMunicipio:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createCargo: async (req, res) => {
    try {
      const { rol } = req.user;
      if (rol === 'usuario') {
        return res.status(403).json({ success: false, message: 'No tienes permiso para crear cargos' });
      }
      console.log(`➕ POST /cargos - Rol: ${rol}`);
      const cargo = await cargosService.createCargo(req.body);
      res.status(201).json({ success: true, data: cargo });
    } catch (error) {
      console.error('Error en createCargo:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateCargo: async (req, res) => {
    try {
      const { rol } = req.user;
      if (rol === 'usuario') {
        return res.status(403).json({ success: false, message: 'No tienes permiso para editar cargos' });
      }
      console.log(`✏️ PUT /cargos/${req.params.id} - Rol: ${rol}`);
      const cargo = await cargosService.updateCargo(req.params.id, req.body);
      res.json({ success: true, data: cargo });
    } catch (error) {
      console.error('Error en updateCargo:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteCargo: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      if (rol === 'usuario') {
        return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar cargos' });
      }
      console.log(`🗑️ DELETE /cargos/${req.params.id} - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const success = await cargosService.deleteCargo(req.params.id, departamento, rol);
      if (success) {
        res.json({ success: true, message: 'Cargo eliminado correctamente' });
      } else {
        res.status(404).json({ success: false, message: 'Cargo no encontrado' });
      }
    } catch (error) {
      console.error('Error en deleteCargo:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};