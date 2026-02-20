import express from 'express';
import {
  login,
  register,
  verifyToken,
  logout,
  changePassword
} from '../controllers/authController.js';
import { enviarSolicitudSoporte } from '../controllers/supportController.js';
import { authenticateToken, requirePresidenciaNacional } from '../middleware/auth.js';
import { authLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.post('/login', authLimiter, login); // Rate limit estricto en login
router.post('/support-request', uploadLimiter, enviarSolicitudSoporte); // Rate limit para uploads

// Rutas protegidas (requieren autenticación)
router.post('/register', authenticateToken, requirePresidenciaNacional, register); // Solo presidencia_nacional puede registrar usuarios
router.get('/verify', authenticateToken, verifyToken);
router.post('/logout', authenticateToken, logout);
router.post('/change-password', authenticateToken, changePassword);

export default router;