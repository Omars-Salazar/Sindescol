import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

/**
 * Login de usuario
 * Genera un token JWT con: id_usuario, correo, rol, departamento
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isProduction = process.env.NODE_ENV === 'production';

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
    }

    if (!isProduction) {
      console.log('🔑 Intento de login:', email);
    } else {
      console.log('🔑 Intento de login');
    }

    // Buscar usuario en la base de datos
    let usuarios;
    try {
      [usuarios] = await db.query(
        'SELECT id_usuario, email, nombre, password_hash, rol, departamento, activo FROM usuarios WHERE email = ?',
        [email]
      );
    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError.message);
      return res.status(500).json({ 
        success: false,
        message: 'Error en la conexión a la base de datos',
        error: dbError.message 
      });
    }

    if (usuarios.length === 0) {
      if (!isProduction) {
        console.log('❌ Usuario no encontrado:', email);
      } else {
        console.log('❌ Usuario no encontrado');
      }
      return res.status(401).json({ 
        success: false,
        message: 'Email o contraseña incorrectos' 
      });
    }

    const usuario = usuarios[0];

    if (!usuario.activo) {
      if (!isProduction) {
        console.log('❌ Usuario inactivo:', email);
      } else {
        console.log('❌ Usuario inactivo');
      }
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacta a presidencia.'
      });
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValido) {
      if (!isProduction) {
        console.log('❌ Contraseña incorrecta para:', email);
      } else {
        console.log('❌ Contraseña incorrecta');
      }
      return res.status(401).json({ 
        success: false,
        message: 'Email o contraseña incorrectos' 
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no configurado en el servidor');
      return res.status(500).json({
        success: false,
        message: 'Configuración de seguridad faltante. Contacta al administrador.'
      });
    }

    // ⭐ GENERAR TOKEN JWT CON ROL Y DEPARTAMENTO
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.rol,                     // ⭐ presidencia_nacional, presidencia, usuario
        departamento: usuario.departamento    // ⭐ Antioquia, Nariño, Valle del Cauca, Cesar, o NULL
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expira en 24 horas
    );

    console.log('✅ Login exitoso:', {
      email: usuario.email,
      rol: usuario.rol,
      departamento: usuario.departamento || 'TODOS (Presidencia Nacional)'
    });

    // Retornar token y datos del usuario (sin contraseña)
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id_usuario: usuario.id_usuario,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          departamento: usuario.departamento
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor al procesar el login' 
    });
  }
};

/**
 * Registro de nuevo usuario
 * Solo presidencia_nacional puede crear usuarios
 */
export const register = async (req, res) => {
  try {
    const { email, password, rol, departamento } = req.body;

    // Validar datos requeridos
    if (!email || !password || !rol) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, contraseña y rol son requeridos' 
      });
    }

    // Validar rol
    const rolesValidos = ['presidencia_nacional', 'presidencia', 'usuario'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ 
        success: false,
        message: `Rol inválido. Debe ser: ${rolesValidos.join(', ')}` 
      });
    }

    // Validar que presidencia y usuario tengan departamento
    if ((rol === 'presidencia' || rol === 'usuario') && !departamento) {
      return res.status(400).json({ 
        success: false,
        message: 'El departamento es requerido para los roles presidencia y usuario' 
      });
    }

    // Validar que presidencia_nacional NO tenga departamento
    if (rol === 'presidencia_nacional' && departamento) {
      return res.status(400).json({ 
        success: false,
        message: 'El rol presidencia_nacional no debe tener departamento asignado' 
      });
    }

    console.log('📝 Registro de nuevo usuario:', { email, rol, departamento });

    // Verificar si el email ya existe
    const [existente] = await db.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'El email ya está registrado' 
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar nuevo usuario
    const [result] = await db.query(
      'INSERT INTO usuarios (email, password_hash, rol, departamento) VALUES (?, ?, ?, ?)',
      [email, passwordHash, rol, departamento || null]
    );

    console.log('✅ Usuario registrado:', { 
      id_usuario: result.insertId, 
      email, 
      rol, 
      departamento: departamento || 'NULL' 
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: {
        id_usuario: result.insertId,
        email,
        rol,
        departamento: departamento || null
      }
    });

  } catch (error) {
    console.error('❌ Error en register:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor al registrar usuario' 
    });
  }
};

/**
 * Verificar token (para validar si el usuario sigue autenticado)
 */
export const verifyToken = async (req, res) => {
  try {
    // req.user ya está disponible gracias al middleware authenticateToken
    res.json({
      success: true,
      message: 'Token válido',
      usuario: {
        id_usuario: req.user.id_usuario,
        email: req.user.email,
        rol: req.user.rol,
        departamento: req.user.departamento
      }
    });
  } catch (error) {
    console.error('❌ Error en verifyToken:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor al verificar token' 
    });
  }
};

/**
 * Logout (en el backend no hay mucho que hacer, el frontend debe eliminar el token)
 */
export const logout = async (req, res) => {
  try {
    console.log('👋 Logout de usuario:', req.user.email);
    
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('❌ Error en logout:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor al cerrar sesión' 
    });
  }
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (req, res) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({ 
        success: false,
        message: 'Contraseña actual y nueva son requeridas' 
      });
    }

    // Obtener usuario actual
    const [usuarios] = await db.query(
      'SELECT password_hash FROM usuarios WHERE id_usuario = ?',
      [req.user.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña actual
    const passwordValido = await bcrypt.compare(contrasenaActual, usuarios[0].password_hash);

    if (!passwordValido) {
      return res.status(401).json({ 
        success: false,
        message: 'Contraseña actual incorrecta' 
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(contrasenaNueva, salt);

    // Actualizar contraseña
    await db.query(
      'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?',
      [passwordHash, req.user.id_usuario]
    );

    console.log('✅ Contraseña cambiada para usuario:', req.user.email);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en changePassword:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor al cambiar contraseña' 
    });
  }
};