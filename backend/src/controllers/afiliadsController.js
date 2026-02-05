import * as afiliadsService from '../services/afiliadsService.js';

// ============================================
// OBTENER TODOS LOS AFILIADOS (filtrado por rol)
// ============================================
export const getAfiliados = async (req, res) => {
  try {
    const { departamento, rol } = req.user; // Del middleware de autenticación
    
    console.log(`📋 GET /afiliados - Usuario: ${req.user.correo}, Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
    
    const afiliados = await afiliadsService.getAfiliados(departamento, rol);
    res.json({ success: true, data: afiliados });
  } catch (error) {
    console.error('Error en getAfiliados:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// OBTENER AFILIADO POR ID
// ============================================
export const getAfiliadoById = async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    const afiliado = await afiliadsService.getAfiliadoById(req.params.id);
    
    if (!afiliado) {
      return res.status(404).json({ success: false, message: 'Afiliado no encontrado' });
    }

    // Validar que el usuario tenga permiso para ver este afiliado
    if (rol !== 'presidencia_nacional' && afiliado.departamento_trabajo !== departamento) {
      return res.status(403).json({ 
        success: false, 
        message: `No tienes permiso para ver este afiliado. Pertenece a ${afiliado.departamento_trabajo}` 
      });
    }

    res.json({ success: true, data: afiliado });
  } catch (error) {
    console.error('Error en getAfiliadoById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// BUSCAR AFILIADO POR CÉDULA
// ============================================
export const getAfiliadoByCedula = async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    const afiliado = await afiliadsService.getAfiliadoByCedula(req.params.cedula);
    
    if (!afiliado) {
      return res.status(404).json({ success: false, message: 'Afiliado no encontrado' });
    }

    // Validar que el usuario tenga permiso para ver este afiliado
    if (rol !== 'presidencia_nacional' && afiliado.departamento_trabajo !== departamento) {
      return res.status(403).json({ 
        success: false, 
        message: `No tienes permiso para ver este afiliado. Pertenece a ${afiliado.departamento_trabajo}` 
      });
    }

    res.json({ success: true, data: afiliado });
  } catch (error) {
    console.error('Error en getAfiliadoByCedula:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CREAR AFILIADO (con validación de departamento)
// ============================================
export const createAfiliado = async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    
    console.log(`➕ POST /afiliados - Usuario: ${req.user.correo}, Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
    
    const afiliado = await afiliadsService.createAfiliado(req.body, departamento, rol);
    res.status(201).json({ success: true, data: afiliado });
  } catch (error) {
    console.error('Error en createAfiliado:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// ACTUALIZAR AFILIADO (con validación de departamento)
// ============================================
export const updateAfiliado = async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    
    console.log(`✏️ PUT /afiliados/${req.params.id} - Usuario: ${req.user.correo}, Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
    
    const afiliado = await afiliadsService.updateAfiliado(req.params.id, req.body, departamento, rol);
    res.json({ success: true, data: afiliado });
  } catch (error) {
    console.error('Error en updateAfiliado:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// ELIMINAR AFILIADO (con validación de departamento)
// ============================================
export const deleteAfiliado = async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    
    console.log(`🗑️ DELETE /afiliados/${req.params.id} - Usuario: ${req.user.correo}, Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
    
    const success = await afiliadsService.deleteAfiliado(req.params.id, departamento, rol);
    
    if (success) {
      res.json({ success: true, message: 'Afiliado eliminado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Afiliado no encontrado' });
    }
  } catch (error) {
    console.error('Error en deleteAfiliado:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// ============================================
// BUSCAR AFILIADOS (filtrado por departamento)
// ============================================
export const searchAfiliados = async (req, res) => {
  try {
    const { departamento, rol } = req.user;
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Parámetro de búsqueda requerido' });
    }

    console.log(`🔍 SEARCH /afiliados?q=${q} - Usuario: ${req.user.correo}, Rol: ${rol}, Departamento: ${departamento || 'TODOS'}`);
    
    const afiliados = await afiliadsService.searchAfiliados(q, departamento, rol);
    res.json({ success: true, data: afiliados });
  } catch (error) {
    console.error('Error en searchAfiliados:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};