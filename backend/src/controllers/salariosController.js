import * as salariosService from '../services/salariosService.js';

export const salariosController = {
  getSalarios: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`💵 GET /salarios - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const salarios = await salariosService.getSalarios(departamento, rol);
      res.json({ success: true, data: salarios });
    } catch (error) {
      console.error('Error en getSalarios:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSalarioById: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      const salario = await salariosService.getSalarioById(req.params.id);
      
      if (!salario) {
        return res.status(404).json({ success: false, message: 'Salario no encontrado' });
      }

      // Validar permisos
      if (rol !== 'presidencia_nacional' && salario.departamento !== departamento) {
        return res.status(403).json({ 
          success: false, 
          message: `No tienes permiso para ver este salario. Pertenece a ${salario.departamento}` 
        });
      }

      res.json({ success: true, data: salario });
    } catch (error) {
      console.error('Error en getSalarioById:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createSalario: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`➕ POST /salarios - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const salario = await salariosService.createSalario(req.body, departamento, rol);
      res.status(201).json({ success: true, data: salario });
    } catch (error) {
      console.error('Error en createSalario:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateSalario: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`✏️ PUT /salarios/${req.params.id} - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const salario = await salariosService.updateSalario(req.params.id, req.body, departamento, rol);
      res.json({ success: true, data: salario });
    } catch (error) {
      console.error('Error en updateSalario:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deleteSalario: async (req, res) => {
    try {
      const { departamento, rol } = req.user;
      console.log(`🗑️ DELETE /salarios/${req.params.id} - Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
      const success = await salariosService.deleteSalario(req.params.id, departamento, rol);
      if (success) {
        res.json({ success: true, message: 'Salario eliminado correctamente' });
      } else {
        res.status(404).json({ success: false, message: 'Salario no encontrado' });
      }
    } catch (error) {
      console.error('Error en deleteSalario:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
