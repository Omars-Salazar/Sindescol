// backend/src/routes/authRoutes.js
import express from 'express';
import * as authService from '../services/authService.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('📝 Petición de login recibida');
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email y contraseña son requeridos' 
      });
    }

    const resultado = await authService.login(email, password);
    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('❌ Error en /login:', error.message);
    res.status(401).json({ success: false, error: error.message });
  }
});

// Registro (opcional - solo para admins)
router.post('/register', async (req, res) => {
  try {
    const resultado = await authService.registrarUsuario(req.body);
    res.status(201).json({ success: true, data: resultado });
  } catch (error) {
    console.error('❌ Error en /register:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Verificar token (para debugging)
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token' });
  }

  try {
    const jwt = (await import('jsonwebtoken')).default;
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'sindescol-super-secreto-2025-cambiar-en-produccion'
    );
    res.json({ success: true, data: decoded });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
});

export default router;