// backend/src/middleware/auth.js
import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ 
      success: false, 
      error: 'No autorizado - Token requerido' 
    });
  }
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'sindescol-super-secreto-2025-cambiar-en-produccion'
    );
    
    console.log('✅ Token válido para usuario:', decoded.email);
    req.usuario = decoded;
    next();
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido o expirado' 
    });
  }
};

export const filtrarPorDepartamento = (req, res, next) => {
  req.departamento = req.usuario.departamento;
  console.log('🔒 Filtro aplicado - Departamento:', req.departamento);
  next();
};