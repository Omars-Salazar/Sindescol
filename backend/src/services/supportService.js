import nodemailer from 'nodemailer';
import { getCorreoPresidenciaNacional } from './usuariosService.js';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/'/g, '&#39;');

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
    const nombreSeguro = escapeHtml(nombre);
    const emailSeguro = escapeHtml(email);
    const tipoSolicitudSeguro = escapeHtml(tipoSolicitud);
    const mensajeSeguro = escapeHtml(mensaje).replace(/\n/g, '<br>');

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: correoPresidenciaNacional,
      subject: `Nueva Solicitud de Soporte: ${tipoSolicitud}`,
      html: `
        <div style="margin:0;padding:24px 12px;background:#f3f5f8;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1f2937;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px 28px;background:linear-gradient(120deg,#0b3d91,#0ea5e9);color:#ffffff;">
                <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:0.9;">Sindescol</p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;">Nueva Solicitud de Soporte</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px;">
                <p style="margin:0 0 18px;font-size:14px;color:#4b5563;">Se ha recibido una nueva solicitud desde el formulario de soporte.</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="width:180px;padding:12px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">Nombre</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${nombreSeguro}</td>
                  </tr>
                  <tr>
                    <td style="width:180px;padding:12px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;">Email</td>
                    <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">
                      <a href="mailto:${emailSeguro}" style="color:#0b67d0;text-decoration:none;">${emailSeguro}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="width:180px;padding:12px 14px;background:#f9fafb;font-size:13px;font-weight:600;color:#111827;">Tipo de Solicitud</td>
                    <td style="padding:12px 14px;font-size:13px;color:#111827;">${tipoSolicitudSeguro}</td>
                  </tr>
                </table>

                <div style="margin-top:20px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                  <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#111827;">Mensaje</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:#1f2937;white-space:normal;">${mensajeSeguro}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `,
      text: `Nueva Solicitud de Soporte\n\nNombre: ${nombre}\nEmail: ${email}\nTipo de Solicitud: ${tipoSolicitud}\n\nMensaje:\n${mensaje}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error al enviar la solicitud de soporte');
  }
};
