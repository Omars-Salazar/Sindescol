import nodemailer from 'nodemailer';
import { getCorreoPresidenciaNacional } from './usuariosService.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const enviarSolicitudSoporte = async ({ nombre, email, tipoSolicitud, mensaje }) => {
  try {
    // Verificar que las credenciales SMTP estén configuradas
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Credenciales SMTP no configuradas. La solicitud se registrará en logs pero no se enviará por email.');
      console.log(`Solicitud de soporte registrada: Nombre: ${nombre}, Email: ${email}, Tipo: ${tipoSolicitud}, Mensaje: ${mensaje}`);
      return { success: true, message: 'Solicitud registrada (email no enviado por falta de configuración)', logged: true };
    }

    // Obtener el correo de la presidencia nacional
    const correoPresidenciaNacional = await getCorreoPresidenciaNacional();

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: correoPresidenciaNacional,
      subject: `Nueva Solicitud de Soporte: ${tipoSolicitud}`,
      html: `
        <h2>Nueva Solicitud de Soporte</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Tipo de Solicitud:</strong> ${tipoSolicitud}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error al enviar la solicitud de soporte');
  }
};
