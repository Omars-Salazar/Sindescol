/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: utils/errorMessages.js
 * Descripción: Mensajes de error amigables y específicos para el usuario
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

export const errorMessages = {
  // ============ AUTENTICACIÓN ============
  AUTH: {
    INVALID_CREDENTIALS: 'Email o contraseña incorrectos. Por favor, verifica e intenta de nuevo.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    NO_TOKEN: 'Debes iniciar sesión para acceder a esta función.',
    UNAUTHORIZED: 'No tienes permiso para realizar esta acción.',
    EMAIL_REGISTERED: 'Este email ya está registrado en el sistema.',
  },

  // ============ CUOTAS ============
  CUOTAS: {
    MISSING_DATA: 'Por favor, completa todos los campos: cédula, mes, año y valor.',
    AFFILIATE_NOT_FOUND: 'No encontramos un afiliado con esa cédula. Verifica el número e intenta de nuevo.',
    DUPLICATE_QUOTA: 'Ya existe una cuota registrada para este afiliado en {{mes}}/{{anio}}. No se puede duplicar.',
    WITHOUT_PERMISSION: 'No tienes permiso para gestionar cuotas de este afiliado. Pertenece a {{departamento}}.',
    UPDATING_MISSING_DATA: 'Por favor, completa todos los campos para actualizar: mes, año y valor.',
    NOT_FOUND: 'No encontramos la cuota que intentas modificar. Podría haber sido eliminada.',
    DELETE_WITHOUT_PERMISSION: 'No puedes eliminar esta cuota. Pertenece a otro departamento.',
  },

  // ============ AFILIADOS ============
  AFILIADOS: {
    MISSING_DATA: 'Por favor, completa todos los campos requeridos.',
    INVALID_CEDULA: 'El número de cédula no es válido. Verifica que sea un número.',
    CEDULA_DUPLICATE: 'Ya existe un afiliado con esta cédula en el sistema.',
    NOT_FOUND: 'No encontramos el afiliado que buscas.',
    WITHOUT_PERMISSION: 'No tienes permiso para gestionar afiliados de otro departamento.',
  },

  // ============ USUARIOS ============
  USUARIOS: {
    MISSING_DATA: 'Por favor, completa todos los campos requeridos.',
    INVALID_PHONE: 'El número de celular debe tener 10 dígitos. Verifica e intenta de nuevo.',
    EMAIL_REGISTERED: 'Este email ya está registrado. Usa otro correo.',
    WITHOUT_PERMISSION_CREATE: 'Solo puedes crear usuarios en tu departamento.',
    CANNOT_MODIFY_ROLE: 'No puedes cambiar el rol de este usuario.',
    CANNOT_DELETE_SELF: 'No puedes eliminar tu propia cuenta.',
    WITHOUT_PERMISSION_DELETE: 'No tienes permiso para eliminar este usuario.',
    CANNOT_DELETE_ADMIN: 'No se puede eliminar el usuario de Presidencia Nacional.',
  },

  // ============ MUNICIPIOS ============
  MUNICIPIOS: {
    MISSING_DATA: 'Por favor, completa el nombre del municipio.',
    ALREADY_EXISTS: 'Ya existe un municipio con este nombre en {{departamento}}.',
    WITHOUT_PERMISSION_CREATE: 'Solo Presidencia Nacional puede crear municipios.',
    WITHOUT_PERMISSION_EDIT: 'Solo Presidencia Nacional puede editar municipios.',
    WITHOUT_PERMISSION_DELETE: 'Solo Presidencia Nacional puede eliminar municipios.',
    WITHOUT_PERMISSION_VIEW: 'No tienes permiso para ver municipios de {{departamento}}.',
    IN_USE_AFFILIATES: 'No se puede eliminar este municipio. Tiene {{count}} afiliados asociados.',
    IN_USE_SALARIES: 'No se puede eliminar este municipio. Tiene {{count}} salarios registrados.',
  },

  // ============ CARGOS ============
  CARGOS: {
    MISSING_NAME: 'Por favor, ingresa el nombre del cargo.',
    INVALID_SALARY: 'El salario debe ser mayor a 0.',
    NO_MUNICIPALITIES: 'Debes seleccionar al menos un municipio.',
    IN_USE_AFFILIATES: 'No se puede eliminar este cargo. Tiene {{count}} afiliados asociados.',
  },

  // ============ SALARIOS ============
  SALARIOS: {
    MUNICIPALITY_NOT_FOUND: 'No encontramos el municipio seleccionado.',
    MISSING_SALARY: 'Por favor, ingresa el valor del salario.',
    ALREADY_EXISTS: 'Ya existe un salario registrado para este cargo en {{municipio}}.',
    NOT_FOUND: 'No encontramos el salario que intentas modificar.',
    WITHOUT_PERMISSION_CREATE: 'No tienes permiso para crear salarios en {{departamento}}.',
    WITHOUT_PERMISSION_EDIT: 'No tienes permiso para editar este salario.',
    WITHOUT_PERMISSION_DELETE: 'No tienes permiso para eliminar este salario.',
    WITHOUT_PERMISSION_VIEW: 'No tienes permiso para ver salarios de {{municipio}}.',
  },

  // ============ GENERAL ============
  GENERAL: {
    SERVER_ERROR: 'Hubo un error en el servidor. Por favor, intenta de nuevo más tarde.',
    DATABASE_ERROR: 'No pudimos conectar con la base de datos. Por favor, intenta de nuevo.',
    OPERATION_SUCCESS: 'Operación realizada con éxito.',
    REQUIRED_FIELD: 'Este campo es obligatorio.',
  },
};

/**
 * Reemplaza placeholders en mensajes de error
 * @param {string} message - Mensaje con placeholders {{variableName}}
 * @param {object} params - Objeto con valores para reemplazar
 * @returns {string} Mensaje con valores reemplazados
 */
export const formatErrorMessage = (message, params = {}) => {
  let formatted = message;
  Object.keys(params).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    formatted = formatted.replace(regex, params[key]);
  });
  return formatted;
};

/**
 * Retorna mensaje de error amigable con parámetros
 * @param {string} path - Ruta al mensaje en errorMessages (ej: 'CUOTAS.DUPLICATE_QUOTA')
 * @param {object} params - Parámetros para reemplazar en el mensaje
 * @returns {string} Mensaje formateado
 */
export const getErrorMessage = (path, params = {}) => {
  const keys = path.split('.');
  let message = errorMessages;
  
  for (const key of keys) {
    if (message[key]) {
      message = message[key];
    } else {
      return errorMessages.GENERAL.SERVER_ERROR;
    }
  }
  
  return formatErrorMessage(message, params);
};
