// frontend/src/utils/toastMessages.js
/**
 * Mensajes de toast amigables e intuitivos para todo el sistema
 */

export const MESSAGES = {
  // Mensajes de éxito - USUARIOS
  USER_CREATED: 'Usuario creado exitosamente. Ya puede acceder al sistema.',
  USER_UPDATED: 'Datos del usuario actualizados correctamente.',
  USER_DELETED: 'Usuario eliminado del sistema.',
  USER_STATUS_CHANGED: 'Estado del usuario actualizado.',
  
  // Mensajes de éxito - AFILIADOS
  AFFILIATE_CREATED: 'Afiliado registrado exitosamente en el sistema.',
  AFFILIATE_UPDATED: 'Información del afiliado actualizada correctamente.',
  AFFILIATE_DELETED: 'Afiliado eliminado del registro.',
  
  // Mensajes de éxito - DEPARTAMENTOS Y MUNICIPIOS
  DEPARTMENT_CREATED: 'Departamento agregado al sistema.',
  MUNICIPALITY_CREATED: 'Municipio agregado exitosamente.',
  MUNICIPALITY_UPDATED: 'Información del municipio actualizada.',
  MUNICIPALITY_DELETED: 'Municipio eliminado del sistema.',
  
  // Mensajes de éxito - CARGOS
  POSITION_CREATED: 'Cargo creado exitosamente.',
  POSITION_UPDATED: 'Información del cargo actualizada.',
  POSITION_DELETED: 'Cargo eliminado del sistema.',
  
  // Mensajes de éxito - CUOTAS
  QUOTA_CREATED: 'Cuota registrada exitosamente.',
  QUOTA_UPDATED: 'Información de la cuota actualizada.',
  QUOTA_DELETED: 'Cuota eliminada del registro.',
  
  // Mensajes de éxito - SALARIOS
  SALARY_CREATED: 'Salario registrado en el sistema.',
  SALARY_UPDATED: 'Información del salario actualizada.',
  SALARY_DELETED: 'Registro de salario eliminado.',
  
  // Mensajes de éxito - AUTENTICACIÓN
  LOGIN_SUCCESS: '¡Bienvenido! Sesión iniciada correctamente.',
  LOGOUT_SUCCESS: 'Sesión cerrada. ¡Hasta pronto!',
  
  // Mensajes de error - VALIDACIÓN
  REQUIRED_FIELDS: 'Por favor completa todos los campos obligatorios.',
  INVALID_EMAIL: 'El correo electrónico no tiene un formato válido.',
  INVALID_PHONE: 'El número de celular debe tener 10 dígitos.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres.',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden.',
  
  // Mensajes de error - CONEXIÓN
  CONNECTION_ERROR: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
  SERVER_ERROR: 'Ocurrió un error en el servidor. Intenta nuevamente en unos momentos.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.',
  
  // Mensajes de error - AUTENTICACIÓN
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos. Verifica tus datos.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  
  // Mensajes de error - DATOS
  LOAD_ERROR: 'No se pudieron cargar los datos. Intenta recargar la página.',
  SAVE_ERROR: 'No se pudieron guardar los cambios. Intenta nuevamente.',
  DELETE_ERROR: 'No se pudo eliminar el registro. Verifica si está siendo usado.',
  DUPLICATE_ERROR: 'Ya existe un registro con estos datos.',
  NOT_FOUND: 'No se encontró el registro solicitado.',
  
  // Mensajes de advertencia
  UNSAVED_CHANGES: 'Tienes cambios sin guardar. ¿Deseas continuar?',
  DELETE_CONFIRMATION: '¿Estás seguro de que deseas eliminar este registro?',
  IRREVERSIBLE_ACTION: 'Esta acción no se puede deshacer.',
  
  // Mensajes informativos
  LOADING: 'Cargando información...',
  SAVING: 'Guardando cambios...',
  DELETING: 'Eliminando registro...',
  PROCESSING: 'Procesando solicitud...',
  NO_RESULTS: 'No se encontraron resultados.',
  EMPTY_LIST: 'No hay registros para mostrar.',
};

/**
 * Función helper para obtener mensajes personalizados
 */
export const getCustomMessage = (template, data = {}) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
};

/**
 * Mensajes de error específicos por código HTTP
 */
export const HTTP_MESSAGES = {
  400: 'La solicitud contiene datos inválidos. Verifica la información.',
  401: 'Debes iniciar sesión para acceder.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'El registro ya existe en el sistema.',
  422: 'Los datos proporcionados no son válidos.',
  429: 'Has realizado demasiadas solicitudes. Espera un momento.',
  500: 'Error interno del servidor. Contacta al administrador.',
  502: 'El servidor no está disponible. Intenta más tarde.',
  503: 'El servicio está temporalmente no disponible.',
};
