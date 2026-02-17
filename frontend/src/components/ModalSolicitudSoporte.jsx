import { useState } from 'react';
import { getApiUrl } from '../config/api.config.js';
import './ModalSolicitudSoporte.css';

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
      const response = await fetch(getApiUrl('/auth/support-request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          nombre: '',
          email: '',
          tipoSolicitud: '',
          mensaje: ''
        });
        setAlertMessage('Solicitud enviada exitosamente. Recibirás una respuesta pronto.');
        setAlertType('success');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          onClose();
        }, 3000);
      } else {
        setAlertMessage(data.error || 'Error al enviar la solicitud');
        setAlertType('error');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 4000);
      }
    } catch (error) {
      setAlertMessage('Error de conexión con el servidor');
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
                  <option value="cambio_correo">Cambio de Correo Electrónico</option>
                  <option value="cambio_contraseña">Cambio de Contraseña</option>
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
