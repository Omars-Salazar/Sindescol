import * as cuotasService from '../services/cuotasService.js';

export const cuotasController = {
  getCuotas: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`💰 GET /cuotas - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const cuotas = await cuotasService.getCuotas(departamento, rol);
      res.json({ success: true, data: cuotas });
    } catch (error) {
      console.error('Error en getCuotas:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCuotaById: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      const cuota = await cuotasService.getCuotaById(req.params.id);
      
      if (!cuota) {
        return res.status(404).json({ success: false, message: 'Cuota no encontrada' });
      }

      // Validar permisos
      if (rol !== 'presidencia_nacional' && cuota.departamento !== departamento) {
        return res.status(403).json({ 
          success: false, 
          message: `No tienes permiso para ver esta cuota. Pertenece a ${cuota.departamento}` 
        });
      }

      res.json({ success: true, data: cuota });
    } catch (error) {
      console.error('Error en getCuotaById:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createCuota: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`➕ POST /cuotas - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const cuota = await cuotasService.createCuota(req.body, departamento, rol);
      res.status(201).json({ success: true, data: cuota });
    } catch (error) {
      console.error('Error en createCuota:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateCuota: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`✏️ PUT /cuotas/${req.params.id} - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const cuota = await cuotasService.updateCuota(req.params.id, req.body, departamento, rol);
      res.json({ success: true, data: cuota });
    } catch (error) {
      console.error('Error en updateCuota:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteCuota: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`🗑️ DELETE /cuotas/${req.params.id} - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const success = await cuotasService.deleteCuota(req.params.id, departamento, rol);
      if (success) {
        res.json({ success: true, message: 'Cuota eliminada correctamente' });
      } else {
        res.status(404).json({ success: false, message: 'Cuota no encontrada' });
      }
    } catch (error) {
      console.error('Error en deleteCuota:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  getCuotasByCedula: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`🔍 GET /cuotas/cedula/${req.params.cedula} - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const cuotas = await cuotasService.getCuotasByCedula(req.params.cedula, departamento, rol);
      res.json({ success: true, data: cuotas });
    } catch (error) {
      console.error('Error en getCuotasByCedula:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};