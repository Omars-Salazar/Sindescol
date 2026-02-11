import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

// Importar rutas
import authRoutes from './authRoutes.js';
import afiliadsRoutes from './afiliadsRoutes.js';
import cargosRoutes from './cargosRoutes.js';
import cuotasRoutes from './cuotasRoutes.js';
import salariosRoutes from './salariosRoutes.js';
import municipiosRoutes from './municipiosRoutes.js';
import departamentosRoutes from './departamentosRoutes.js';
import institucionesRoutes from './institucionesRoutes.js';
import religionesRoutes from './religionesRoutes.js';
import arlRoutes from './arlRoutes.js';
import pensionRoutes from './pensionRoutes.js';
import epsRoutes from './epsRoutes.js';
import cesantiasRoutes from './cesantiasRoutes.js';
import actasRoutes from './actasRoutes.js';
import otrosCargosRoutes from './otrosCargosRoutes.js';
import rectoresRoutes from './rectoresRoutes.js';
import usuariosRoutes from './usuariosRoutes.js';
import mensajesDiaRoutes from './mensajesDiaRoutes.js';

const router = express.Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================
router.use('/auth', authRoutes);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================
// IMPORTANTE: El filtrado por departamento ahora se hace automáticamente
// en los servicios usando req.user.departamento y req.user.rol

router.use('/afiliados', authenticateToken, afiliadsRoutes);
router.use('/cargos', authenticateToken, cargosRoutes);
router.use('/cuotas', authenticateToken, cuotasRoutes);
router.use('/salarios', authenticateToken, salariosRoutes);
router.use('/municipios', authenticateToken, municipiosRoutes);
router.use('/departamentos', authenticateToken, departamentosRoutes);
router.use('/instituciones', authenticateToken, institucionesRoutes);
router.use('/religiones', authenticateToken, religionesRoutes);
router.use('/arl', authenticateToken, arlRoutes);
router.use('/pension', authenticateToken, pensionRoutes);
router.use('/eps', authenticateToken, epsRoutes);
router.use('/cesantias', authenticateToken, cesantiasRoutes);
router.use('/actas', authenticateToken, actasRoutes);
router.use('/otros-cargos', authenticateToken, otrosCargosRoutes);
router.use('/rectores', authenticateToken, rectoresRoutes);
router.use('/usuarios', authenticateToken, usuariosRoutes);
router.use('/mensajes-dia', authenticateToken, mensajesDiaRoutes);

export default router;
