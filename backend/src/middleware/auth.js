import jwt from 'jsonwebtoken';
import db from '../config/db.js';

/**
 * Middleware para autenticar el token JWT
 * Extrae: id_usuario, correo, rol, departamento
 */
export const authenticateToken = async (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Token no proporcionado. Acceso denegado.' 
    });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [usuarios] = await db.query(
      'SELECT id_usuario, email, rol, departamento, activo FROM usuarios WHERE id_usuario = ? LIMIT 1',
      [decoded.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado. Acceso denegado.'
      });
    }

    if (!usuarios[0].activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Sesion denegada.'
      });
    }

    // ⭐ IMPORTANTE: Agregar toda la información del usuario a req.user
    req.user = {
      id_usuario: usuarios[0].id_usuario,
      email: usuarios[0].email,
      rol: usuarios[0].rol,
      departamento: usuarios[0].departamento
    };

    console.log('🔐 Usuario autenticado:', {
      email: req.user.email,
      rol: req.user.rol,
      departamento: req.user.departamento || 'TODOS (Presidencia Nacional)'
    });

    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        message: 'Token expirado. Por favor, inicia sesión nuevamente.' 
      });
    }
    
    return res.status(403).json({ 
      success: false,
      message: 'Token inválido. Acceso denegado.' 
    });
  }
};

/**
 * Middleware para verificar que el usuario tiene un rol específico
 * Uso: router.delete('/afiliados/:id', authenticateToken, requireRole('presidencia_nacional'), deleteAfiliado)
 */
export const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no autenticado' 
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false,
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario tiene presidencia_nacional
 */
export const requirePresidenciaNacional = requireRole('presidencia_nacional');

/**
 * Middleware para verificar que el usuario tiene permiso de gestión de usuarios
 */
export const verificarPermisoGestionUsuarios = (req, res, next) => {
  if (!req.user || !req.user.rol) {
    return res.status(401).json({ 
      success: false,
      message: 'Usuario no autenticado' 
    });
  }

  const rolesPermitidos = ['presidencia_nacional', 'presidencia'];
  
  if (!rolesPermitidos.includes(req.user.rol)) {
    return res.status(403).json({ 
      success: false,
      message: 'Acceso denegado. Solo presidencia nacional o presidencia pueden gestionar usuarios.' 
    });
  }

  next();
};