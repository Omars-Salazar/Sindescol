import * as supportService from '../services/supportService.js';

export const enviarSolicitudSoporte = async (req, res) => {
  try {
    const { nombre, email, tipoSolicitud, mensaje } = req.body;

    // Validaciones
    if (!nombre || !email || !tipoSolicitud || !mensaje) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de correo electrónico inválido'
      });
    }

    // Validar tipo de solicitud
    const tiposValidos = ['cambio_correo', 'cambio_contraseña'];
    if (!tiposValidos.includes(tipoSolicitud)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de solicitud inválido'
      });
    }

    // Enviar la solicitud
    const resultado = await supportService.enviarSolicitudSoporte({
      nombre,
      email,
      tipoSolicitud: tipoSolicitud === 'cambio_correo' ? 'Cambio de Correo' : 'Cambio de Contraseña',
      mensaje
    });

    res.json({
      success: true,
      message: 'Solicitud de soporte enviada exitosamente'
    });

  } catch (error) {
    console.error('Error en enviarSolicitudSoporte:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};
