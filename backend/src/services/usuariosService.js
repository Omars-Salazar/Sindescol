// backend/src/services/usuariosService.js
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { getErrorMessage } from '../utils/errorMessages.js';

export const getUsuarios = async (rolSolicitante, departamentoSolicitante) => {
  try {
    let query = `
      SELECT id_usuario, email, nombre, celular, departamento, rol, activo, fecha_creacion
      FROM usuarios
      WHERE 1=1
    `;
    const params = [];

    // GESTIÓN DE USUARIOS: Excluir presidencia nacional, filtrar por departamento
    if (rolSolicitante === 'presidencia_nacional') {
      // Presidencia Nacional ve TODOS los usuarios MENOS a sí misma
      query += ` AND rol != 'presidencia_nacional'`;
    } else if (rolSolicitante === 'presidencia') {
      // Presidencia departamental ve solo usuarios de su propio departamento
      query += ` AND departamento = ?`;
      params.push(departamentoSolicitante);
    }

    query += ` ORDER BY fecha_creacion DESC`;

    console.log('🔍 Query usuarios (Gestión):', query);
    console.log('📊 Params:', params);

    const [usuarios] = await pool.query(query, params);
    
    console.log('✅ Usuarios obtenidos:', usuarios.length);
    if (usuarios.length > 0) {
      console.log('📱 Ejemplo de usuario con celular:', {
        email: usuarios[0].email,
        celular: usuarios[0].celular,
        tipo_celular: typeof usuarios[0].celular
      });
    }
    
    return usuarios;
  } catch (error) {
    console.error('❌ Error en getUsuarios service:', error);
    throw error;
  }
};

// ============================================
// OBTENER PRESIDENCIAS (para Información de Presidencias)
// ============================================
export const getPresidencias = async (rolSolicitante, departamentoSolicitante) => {
  try {
    let query = `
      SELECT id_usuario, email, nombre, celular, departamento, rol, activo, fecha_creacion
      FROM usuarios
      WHERE 1=1
    `;
    const params = [];

    if (rolSolicitante === 'presidencia_nacional') {
      // Presidencia Nacional ve TODAS las presidencias departamentales
      query += ` AND rol = 'presidencia'`;
    } else if (rolSolicitante === 'presidencia') {
      // Presidencia departamental ve TODAS las presidencias (nacionales + departamentales)
      query += ` AND (rol = 'presidencia' OR rol = 'presidencia_nacional')`;
    } else if (rolSolicitante === 'usuario') {
      // Usuario regular solo ve presidencias de su departamento o nacional
      query += ` AND ((rol = 'presidencia' AND departamento = ?) OR rol = 'presidencia_nacional')`;
      params.push(departamentoSolicitante);
    }

    query += ` ORDER BY fecha_creacion DESC`;

    console.log('🔍 Query presidencias:', query);
    console.log('📊 Params:', params);

    const [presidencias] = await pool.query(query, params);
    
    console.log('✅ Presidencias obtenidas:', presidencias.length);
    
    return presidencias;
  } catch (error) {
    console.error('❌ Error en getPresidencias service:', error);
    throw error;
  }
};

export const createUsuario = async (data, rolCreador, departamentoCreador) => {
  try {
    const { email, password, nombre, celular, departamento, rol } = data;

    // Validaciones
    if (!email || !password || !nombre || !departamento || !rol) {
      throw new Error('Todos los campos son requeridos');
    }

    // Validar formato de celular (opcional pero recomendado)
    if (celular && !/^\d{10}$/.test(celular.replace(/\s/g, ''))) {
      throw new Error('El número de celular debe tener 10 dígitos');
    }

    // Validar permisos según el rol del creador
    if (rolCreador === 'presidencia') {
      // Presidencia solo puede crear usuarios normales en su departamento
      if (rol !== 'usuario') {
        throw new Error('Solo puedes crear usuarios con rol "usuario"');
      }
      if (departamento !== departamentoCreador) {
        throw new Error('Solo puedes crear usuarios en tu departamento');
      }
    } else if (rolCreador === 'presidencia_nacional') {
      // Presidencia Nacional puede crear cualquier usuario excepto otro presidencia_nacional
      if (rol === 'presidencia_nacional') {
        throw new Error('No puedes crear otro usuario de Presidencia Nacional');
      }
    }

    // Verificar si el email ya existe
    const [existente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existente.length > 0) {
      throw new Error('El email ya está registrado');
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios (email, password_hash, nombre, celular, departamento, rol, activo) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [email, passwordHash, nombre, celular || null, departamento, rol]
    );

    return {
      id_usuario: result.insertId,
      email,
      nombre,
      celular: celular || null,
      departamento,
      rol,
      activo: true
    };
  } catch (error) {
    console.error('Error en createUsuario service:', error);
    throw error;
  }
};

export const updateUsuario = async (id, data, rolCreador, departamentoCreador) => {
  try {
    const { nombre, celular, departamento, rol, password } = data;

    // Obtener usuario actual
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return null;
    }

    const usuarioActual = usuarios[0];

    // Validar permisos
    if (rolCreador === 'presidencia') {
      // Presidencia solo puede editar usuarios de su departamento
      if (usuarioActual.departamento !== departamentoCreador) {
        throw new Error('No tienes permiso para editar este usuario');
      }
      if (usuarioActual.rol !== 'usuario') {
        throw new Error('Solo puedes editar usuarios con rol "usuario"');
      }
    }

    // No se puede cambiar el rol a presidencia_nacional
    if (rol === 'presidencia_nacional') {
      throw new Error('No se puede asignar el rol de Presidencia Nacional');
    }

    // Validar formato de celular si se proporciona
    if (celular && !/^\d{10}$/.test(celular.replace(/\s/g, ''))) {
      throw new Error('El número de celular debe tener 10 dígitos');
    }

    // Construir query de actualización
    const updates = [];
    const params = [];

    if (nombre) {
      updates.push('nombre = ?');
      params.push(nombre);
    }

    if (celular !== undefined) {
      updates.push('celular = ?');
      params.push(celular || null);
    }

    if (departamento && rolCreador === 'presidencia_nacional') {
      updates.push('departamento = ?');
      params.push(departamento);
    }

    if (rol && rolCreador === 'presidencia_nacional') {
      updates.push('rol = ?');
      params.push(rol);
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    params.push(id);
    
    await pool.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuario = ?`,
      params
    );

    // Retornar usuario actualizado
    const [updated] = await pool.query(
      'SELECT id_usuario, email, nombre, celular, departamento, rol, activo FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    return updated[0];
  } catch (error) {
    console.error('Error en updateUsuario service:', error);
    throw error;
  }
};

export const deleteUsuario = async (id, rolCreador, idUsuarioActual) => {
  try {
    // No puede eliminarse a sí mismo
    if (parseInt(id) === parseInt(idUsuarioActual)) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    // Obtener usuario a eliminar
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return false;
    }

    const usuario = usuarios[0];

    // No se puede eliminar a Presidencia Nacional
    if (usuario.rol === 'presidencia_nacional') {
      throw new Error('No se puede eliminar al usuario de Presidencia Nacional');
    }

    // Validar permisos según rol
    if (rolCreador === 'presidencia') {
      if (usuario.rol !== 'usuario') {
        throw new Error('Solo puedes eliminar usuarios con rol "usuario"');
      }
    }

    // Eliminar usuario
    const [result] = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en deleteUsuario service:', error);
    throw error;
  }
};

export const toggleActivo = async (id) => {
  try {
    // Obtener estado actual
    const [usuarios] = await pool.query(
      'SELECT activo FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return null;
    }

    const nuevoEstado = !usuarios[0].activo;

    // Actualizar estado
    await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id_usuario = ?',
      [nuevoEstado, id]
    );

    const [updated] = await pool.query(
      'SELECT id_usuario, email, nombre, celular, departamento, rol, activo FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    return updated[0];
  } catch (error) {
    console.error('Error en toggleActivo service:', error);
    throw error;
  }
};

// ============================================
// OBTENER CORREO DE PRESIDENCIA NACIONAL
// ============================================
export const getCorreoPresidenciaNacional = async () => {
  try {
    const [usuarios] = await pool.query(
      'SELECT email FROM usuarios WHERE rol = ? AND activo = TRUE LIMIT 1',
      ['presidencia_nacional']
    );

    if (usuarios.length === 0) {
      throw new Error('No se encontró un usuario de Presidencia Nacional activo');
    }

    return usuarios[0].email;
  } catch (error) {
    console.error('Error en getCorreoPresidenciaNacional service:', error);
    throw error;
  }
};
