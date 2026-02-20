/**
 * SINDESCOL - Modal de Cambios y Novedades
 * 
 * Archivo: components/ModalChangeLog.jsx
 * Descripción: Componente Modal para mostrar los cambios aplicados después de actualizar
 * 
 * @author Omar Santiago Salazar
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import './ModalChangeLog.css';

export default function ModalChangeLog({ 
  isOpen, 
  version, 
  releaseDate,
  changes = [],
  onClose
}) {
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    improvements: true,
    bugfixes: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!isOpen) return null;

  // Agrupar cambios por tipo
  const groupedChanges = {
    features: changes.filter(c => c.type === 'feature') || [],
    improvements: changes.filter(c => c.type === 'improvement') || [],
    bugfixes: changes.filter(c => c.type === 'bugfix') || []
  };

  // Cambios predeterminados si no hay información específica
  const defaultChanges = {
    features: [
      'Sistema mejorado de autoactualización',
      'Notificaciones más claras y mejores'
    ],
    improvements: [
      'Mejor rendimiento en operaciones',
      'Interfaz de usuario más intuitiva',
      'Optimización de recursos'
    ],
    bugfixes: [
      'Corrección de errores menores',
      'Mejora en la estabilidad general'
    ]
  };

  const featuresToShow = groupedChanges.features.length > 0 
    ? groupedChanges.features 
    : defaultChanges.features;
  const improvementsToShow = groupedChanges.improvements.length > 0 
    ? groupedChanges.improvements 
    : defaultChanges.improvements;
  const bugfixesToShow = groupedChanges.bugfixes.length > 0 
    ? groupedChanges.bugfixes 
    : defaultChanges.bugfixes;

  return (
    <div className="modal-changelog-overlay">
      <div className="modal-changelog-container">
        {/* Header */}
        <div className="modal-changelog-header">
          <div className="modal-changelog-header-content">
            <h1 className="modal-changelog-title">¡Bienvenido a la v{version}!</h1>
            <p className="modal-changelog-subtitle">Descubre qué hay de nuevo</p>
          </div>
          <button
            type="button"
            className="modal-changelog-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-changelog-content">
          {/* Información de versión */}
          <div className="modal-changelog-version-info">
            <span className="modal-changelog-version-badge">v{version}</span>
            {releaseDate && (
              <span className="modal-changelog-date">
                {new Date(releaseDate).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
          </div>

          {/* Secciones de cambios */}
          {/* Nuevas Características */}
          {featuresToShow.length > 0 && (
            <div className="modal-changelog-section">
              <button
                type="button"
                className="modal-changelog-section-header"
                onClick={() => toggleSection('features')}
              >
                <span className="modal-changelog-section-icon">✨</span>
                <span className="modal-changelog-section-title">Nuevas Características</span>
                <span className={`modal-changelog-section-arrow ${expandedSections.features ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.features && (
                <div className="modal-changelog-section-content">
                  <ul className="modal-changelog-list">
                    {featuresToShow.map((feature, idx) => (
                      <li key={idx} className="modal-changelog-item">
                        <span className="modal-changelog-item-dot"></span>
                        <span className="modal-changelog-item-text">
                          {typeof feature === 'string' ? feature : feature.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Mejoras */}
          {improvementsToShow.length > 0 && (
            <div className="modal-changelog-section">
              <button
                type="button"
                className="modal-changelog-section-header"
                onClick={() => toggleSection('improvements')}
              >
                <span className="modal-changelog-section-icon">⚡</span>
                <span className="modal-changelog-section-title">Mejoras</span>
                <span className={`modal-changelog-section-arrow ${expandedSections.improvements ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.improvements && (
                <div className="modal-changelog-section-content">
                  <ul className="modal-changelog-list">
                    {improvementsToShow.map((improvement, idx) => (
                      <li key={idx} className="modal-changelog-item">
                        <span className="modal-changelog-item-dot"></span>
                        <span className="modal-changelog-item-text">
                          {typeof improvement === 'string' ? improvement : improvement.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Correcciones */}
          {bugfixesToShow.length > 0 && (
            <div className="modal-changelog-section">
              <button
                type="button"
                className="modal-changelog-section-header"
                onClick={() => toggleSection('bugfixes')}
              >
                <span className="modal-changelog-section-icon">🐛</span>
                <span className="modal-changelog-section-title">Correcciones</span>
                <span className={`modal-changelog-section-arrow ${expandedSections.bugfixes ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.bugfixes && (
                <div className="modal-changelog-section-content">
                  <ul className="modal-changelog-list">
                    {bugfixesToShow.map((bugfix, idx) => (
                      <li key={idx} className="modal-changelog-item">
                        <span className="modal-changelog-item-dot"></span>
                        <span className="modal-changelog-item-text">
                          {typeof bugfix === 'string' ? bugfix : bugfix.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="modal-changelog-footer-info">
            <div className="modal-changelog-info-box">
              <span className="modal-changelog-info-icon">💡</span>
              <p>Esta actualización ha sido diseñada para mejorar tu experiencia. ¡Gracias por usar SINDESCOL!</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-changelog-actions">
          <button
            type="button"
            className="modal-changelog-btn-primary"
            onClick={onClose}
          >
            Entendido, ¡Gracias!
          </button>
        </div>
      </div>
    </div>
  );
}
