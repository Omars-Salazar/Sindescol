// backend/src/services/authService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { getErrorMessage } from '../utils/errorMessages.js';

export const login = async (email, password) => {
  try {
    console.log('🔍 Intentando login con email:', email);
    
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (usuarios.length === 0) {
      console.log('❌ Usuario no encontrado o inactivo');
      throw new Error(getErrorMessage('AUTH.INVALID_CREDENTIALS'));
    }

    const usuario = usuarios[0];
    console.log('✅ Usuario encontrado:', usuario.email);

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      console.log('❌ Contraseña incorrecta');
      throw new Error(getErrorMessage('AUTH.INVALID_CREDENTIALS'));
    }

    console.log('✅ Contraseña válida');

    // Generar JWT con departamento
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        departamento: usuario.departamento,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'sindescol-super-secreto-2025-cambiar-en-produccion',
      { expiresIn: '8h' }
    );

    console.log('✅ Token generado exitosamente');

    return {
      token,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        departamento: usuario.departamento,
        rol: usuario.rol
      }
    };
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
};

export const registrarUsuario = async (datos) => {
  const { email, password, nombre, departamento, rol } = datos;
  
  // Verificar si el usuario ya existe
  const [usuariosExistentes] = await pool.query(
    'SELECT id_usuario FROM usuarios WHERE email = ?',
    [email]
  );

  if (usuariosExistentes.length > 0) {
    throw new Error(getErrorMessage('AUTH.EMAIL_REGISTERED'));
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const [result] = await pool.query(
    'INSERT INTO usuarios (email, password_hash, nombre, departamento, rol) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, nombre, departamento, rol || 'usuario']
  );

  return { id_usuario: result.insertId };
};