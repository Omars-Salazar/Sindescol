/**
 * SINDESCOL - Modal de Actualización Disponible
 * 
 * Archivo: components/ModalUpdateAvailable.jsx
 * Descripción: Componente Modal para mostrar y gestionar actualizaciones disponibles
 * 
 * @author Omar Santiago Salazar
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import './ModalUpdateAvailable.css';

export default function ModalUpdateAvailable({ 
  isOpen, 
  version, 
  releaseDate, 
  onDownload, 
  onDismiss,
  isDownloading = false,
  downloadProgress = 0,
  isDownloaded = false,
  error = ''
}) {
  const [timeAgo, setTimeAgo] = useState('');

  // Calcular tiempo transcurrido desde la fecha de lanzamiento
  useEffect(() => {
    if (!releaseDate) return;

    const calculateTimeAgo = () => {
      const releaseTime = new Date(releaseDate).getTime();
      const now = new Date().getTime();
      const diffMs = now - releaseTime;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        setTimeAgo(`Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`);
      } else if (diffHours > 0) {
        setTimeAgo(`Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`);
      } else if (diffMins > 0) {
        setTimeAgo(`Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`);
      } else {
        setTimeAgo('Hace poco');
      }
    };

    calculateTimeAgo();
  }, [releaseDate]);

  if (!isOpen) return null;

  return (
    <div className="modal-update-overlay">
      <div className="modal-update-container">
        {/* Header */}
        <div className="modal-update-header">
          <div className="modal-update-icon">⬆️</div>
          <h2 className="modal-update-title">Actualización Disponible</h2>
          {!isDownloading && !isDownloaded && (
            <button
              type="button"
              className="modal-update-close-btn"
              onClick={onDismiss}
              aria-label="Cerrar modal"
              title="Descartar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="modal-update-content">
          <div className="modal-update-version-info">
            <div className="modal-update-version-badge">
              v{version}
            </div>
            <div className="modal-update-version-meta">
              <p className="modal-update-version-label">Nueva versión disponible</p>
              {timeAgo && (
                <p className="modal-update-version-time">{timeAgo}</p>
              )}
            </div>
          </div>

          {/* Progreso de descarga */}
          {isDownloading && (
            <div className="modal-update-progress-section">
              <div className="modal-update-progress-label">
                <span>Descargando actualización...</span>
                <span className="modal-update-progress-percent">{downloadProgress}%</span>
              </div>
              <div className="modal-update-progress-bar">
                <div
                  className="modal-update-progress-fill"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Estado descargado */}
          {isDownloaded && !isDownloading && (
            <div className="modal-update-success-message">
              <div className="modal-update-check-icon">✓</div>
              <p>Descarga completada. La aplicación se reiniciará para aplicar los cambios.</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="modal-update-error-message">
              <div className="modal-update-error-icon">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {/* Información adicional */}
          {!isDownloading && !isDownloaded && (
            <div className="modal-update-info-box">
              <p className="modal-update-info-title">✨ Esta actualización incluye:</p>
              <ul className="modal-update-info-list">
                <li>Mejoras de rendimiento</li>
                <li>Correcciones de errores</li>
                <li>Nuevas características</li>
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-update-actions">
          {!isDownloaded ? (
            <>
              <button
                type="button"
                className="modal-update-btn-primary"
                onClick={onDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <span className="modal-update-spinner"></span>
                    Descargando {downloadProgress}%
                  </>
                ) : (
                  <>
                    <span className="modal-update-btn-icon">📥</span>
                    Descargar Ahora
                  </>
                )}
              </button>
              {!isDownloading && (
                <button
                  type="button"
                  className="modal-update-btn-secondary"
                  onClick={onDismiss}
                >
                  Después
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              className="modal-update-btn-primary"
              onClick={() => window.electron?.restartApp()}
            >
              <span className="modal-update-btn-icon">🔄</span>
              Reiniciar Ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
