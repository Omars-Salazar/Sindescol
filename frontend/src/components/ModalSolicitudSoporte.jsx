import { useState } from 'react';
import { getApiUrl } from '../config/api.config.js';
import './ModalSolicitudSoporte.css';

const SUPPORT_FALLBACK_WEBHOOK_URL = import.meta.env.VITE_SUPPORT_FALLBACK_WEBHOOK_URL || '';
const SUPPORT_EMERGENCY_EMAIL = import.meta.env.VITE_SUPPORT_EMERGENCY_EMAIL || 'soportesindescol@gmail.com';
const SUPPORT_FALLBACK_TOKEN = import.meta.env.VITE_SUPPORT_FALLBACK_TOKEN || '';
const REQUEST_TIMEOUT_MS = 10000;

const TIPOS_SOLICITUD = [
  { value: 'cambio_correo', label: 'Cambio de Correo Electrónico' },
  { value: 'cambio_contrasena', label: 'Cambio de Contraseña' },
  { value: 'actualizacion_datos', label: 'Actualización de Datos Personales' },
  { value: 'problema_acceso', label: 'Problema de Acceso al Sistema' },
  { value: 'error_plataforma', label: 'Reporte de Error en la Plataforma' },
  { value: 'solicitud_certificado', label: 'Solicitud de Certificado' },
  { value: 'otro', label: 'Otro' }
];

const getTipoSolicitudLabel = (tipoValue) => {
  const tipo = TIPOS_SOLICITUD.find((item) => item.value === tipoValue);
  return tipo ? tipo.label : tipoValue;
};

const createSupportPayload = (formData) => ({
  ...formData,
  tipoSolicitudLabel: getTipoSolicitudLabel(formData.tipoSolicitud),
  source: 'sindescol-contact-form',
  sentAt: new Date().toISOString()
});

const fetchWithTimeout = async (url, options, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const sendToPrimaryBackend = async (payload) => {
  const response = await fetchWithTimeout(getApiUrl('/auth/support-request'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'No se pudo enviar por el canal principal');
  }

  return data;
};

const sendToFallbackWebhook = async (payload) => {
  if (!SUPPORT_FALLBACK_WEBHOOK_URL) {
    throw new Error('Canal de respaldo no configurado');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (SUPPORT_FALLBACK_TOKEN) {
    headers['x-support-token'] = SUPPORT_FALLBACK_TOKEN;
  }

  const response = await fetchWithTimeout(SUPPORT_FALLBACK_WEBHOOK_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Canal de respaldo no disponible');
  }

  return true;
};

const buildEmergencyMailto = ({ nombre, email, tipoSolicitud, mensaje }) => {
  const subject = `Solicitud Soporte Urgente: ${getTipoSolicitudLabel(tipoSolicitud)}`;
  const body = [
    'Canal principal no disponible. Envio por canal de emergencia.',
    '',
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    `Tipo de solicitud: ${getTipoSolicitudLabel(tipoSolicitud)}`,
    '',
    'Mensaje:',
    mensaje
  ].join('\n');

  return `mailto:${SUPPORT_EMERGENCY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export default function ModalSolicitudSoporte({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipoSolicitud: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = createSupportPayload(formData);

      try {
        await sendToPrimaryBackend(payload);
        setAlertMessage('Solicitud enviada exitosamente. Recibiras una respuesta pronto.');
      } catch (primaryError) {
        try {
          await sendToFallbackWebhook(payload);
          setAlertMessage('Solicitud enviada por canal de contingencia. Recibiras respuesta pronto.');
        } catch (fallbackError) {
          const mailtoLink = buildEmergencyMailto(formData);
          window.location.href = mailtoLink;
          throw new Error('No fue posible enviar en linea. Se abrio tu correo para envio de emergencia.');
        }
      }

      setFormData({
        nombre: '',
        email: '',
        tipoSolicitud: '',
        mensaje: ''
      });
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        onClose();
      }, 3500);
    } catch (error) {
      setAlertMessage(error.message || 'No fue posible enviar la solicitud');
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {showAlert && (
        <div className={`custom-alert ${alertType}`}>
          <div className="custom-alert-content">
            <span className="custom-alert-icon">
              {alertType === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="custom-alert-message">{alertMessage}</span>
            <button
              className="custom-alert-close"
              onClick={() => setShowAlert(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Solicitud de Soporte</h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-form-group">
                <label className="modal-label" htmlFor="nombre">
                  Nombre Completo *
                </label>
                <div className="modal-input-wrapper">
                  <span className="modal-input-icon">👤</span>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    className="modal-input"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="email">
                  Correo Electrónico *
                </label>
                <div className="modal-input-wrapper">
                  <span className="modal-input-icon">📧</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="modal-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="tipoSolicitud">
                  Tipo de Solicitud *
                </label>
                <select
                  id="tipoSolicitud"
                  name="tipoSolicitud"
                  className="modal-select"
                  value={formData.tipoSolicitud}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona el tipo de solicitud</option>
                  {TIPOS_SOLICITUD.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-label" htmlFor="mensaje">
                  Mensaje Detallado *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  className="modal-textarea"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  placeholder="Describe detalladamente tu solicitud de soporte..."
                  rows="4"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-btn primary"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
