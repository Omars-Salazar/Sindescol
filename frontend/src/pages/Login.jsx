// frontend/src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ModalSolicitudSoporte from '../components/ModalSolicitudSoporte';
import ModalUpdateAvailable from '../components/ModalUpdateAvailable';
import ModalChangeLog from '../components/ModalChangeLog';
import { getApiUrl } from '../config/api.config.js';

import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  
  // Estado para actualizaciones
  const [updateState, setUpdateState] = useState({
    available: false,
    version: '',
    releaseDate: '',
    downloading: false,
    progress: 0,
    downloaded: false,
    error: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showChangeLogModal, setShowChangeLogModal] = useState(false);
  
  const navigate = useNavigate();

  // Inicializar listeners de actualización
  useEffect(() => {
    if (!window.electron) return undefined;

    // Obtener versión actual
    window.electron.getAppVersion()
      .then((info) => setAppVersion(info?.version || ''))
      .catch(() => setAppVersion(''));

    // Listener: Actualización disponible
    const offAvailable = window.electron.onUpdateAvailable((event, info) => {
      console.log('[Login] Update available:', info);
      setUpdateState((prev) => ({
        ...prev,
        available: true,
        version: info?.version || '',
        releaseDate: info?.releaseDate || '',
        error: ''
      }));
      setShowUpdateModal(true);
    });

    // Listener: Progreso de descarga
    const offProgress = window.electron.onUpdateProgress((event, progress) => {
      const percent = Number.isFinite(progress?.percent)
        ? Math.round(progress.percent)
        : 0;

      setUpdateState((prev) => ({
        ...prev,
        available: true,
        downloading: true,
        progress: percent,
        error: ''
      }));
    });

    // Listener: Descarga completada
    const offDownloaded = window.electron.onUpdateDownloaded((event, info) => {
      console.log('[Login] Update downloaded:', info);
      setUpdateState((prev) => ({
        ...prev,
        available: true,
        downloaded: true,
        downloading: false,
        progress: 100,
        version: info?.version || prev.version,
        releaseDate: info?.releaseDate || prev.releaseDate,
        error: ''
      }));
    });

    // Listener: Error en descarga
    const offError = window.electron.onUpdateError((event, error) => {
      // Solo mostrar error si estábamos descargando
      if (updateState.downloading) {
        const errorMessage = typeof error === 'string' 
          ? error 
          : error?.message || 'Error al descargar la actualización';
        
        console.error('[Login] Update download error:', errorMessage);
        setUpdateState((prev) => ({
          ...prev,
          downloading: false,
          error: errorMessage
        }));
      }
      // Ignorar errores de "no hay actualizaciones disponibles"
    });

    // Listener: Actualización instalada
    const offInstalled = window.electron.onUpdateInstalled?.((event, info) => {
      console.log('[Login] Update installed:', info);
      // Mostrar modal de cambios cuando se reinicia
      setShowChangeLogModal(true);
      setUpdateState((prev) => ({
        ...prev,
        downloaded: false
      }));
    });

    return () => {
      offAvailable?.();
      offProgress?.();
      offDownloaded?.();
      offError?.();
      offInstalled?.();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Bloquear login si hay descarga en progreso
    if (updateState.downloading) {
      setError('Por favor espera a que se complete la descarga de la actualización');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Guardar token y datos de usuario
        if (recordarme) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        } else {
          sessionStorage.setItem('token', data.data.token);
          sessionStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        }
        navigate('/');
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadUpdate = () => {
    window.electron?.downloadUpdate();
  };

  const handleDismissUpdate = () => {
    setShowUpdateModal(false);
  };

  return (
    <div className="login-container">
      {/* Partículas flotantes (opcional) */}
      <div className="login-particles">
        <div className="login-particle"></div>
        <div className="login-particle"></div>
        <div className="login-particle"></div>
        <div className="login-particle"></div>
        <div className="login-particle"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <img 
              src="/escudo_sindescol.png" 
              alt="SINDESCOL Logo" 
              className="login-logo"
            />
          </div>
          <h1 className="login-title">SINDESCOL</h1>
          <p className="login-subtitle">Sistema de Gestión Sindical</p>
          <div className="login-departamento">
            📍 Acceso por Departamento
          </div>
        </div>

        {error && (
          <div className="login-alert">
            <span className="login-alert-icon">⚠️</span>
            <span className="login-alert-message">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">📧</span>
              <input
                id="email"
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@sindescol.com"
                required
                autoComplete="email"
                disabled={loading || updateState.downloading}
              />
            </div>
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="password">
              Contraseña
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={loading || updateState.downloading}
              />
              <button
                type="button"
                className="login-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-label="Toggle password visibility"
                disabled={loading || updateState.downloading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

            </div>
          </div>

          <div className="login-remember">
            <input
              id="recordarme"
              type="checkbox"
              className="login-checkbox"
              checked={recordarme}
              onChange={(e) => setRecordarme(e.target.checked)}
              disabled={loading || updateState.downloading}
            />
            <label htmlFor="recordarme" className="login-remember-label">
              Mantener sesión iniciada
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || updateState.downloading}
          >
            {loading && <span className="login-button-loading"></span>}
            {updateState.downloading ? 'Descargando actualización...' : loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Aviso si hay descarga en progreso */}
        {updateState.downloading && (
          <div className="login-update-warning">
            <span className="login-update-warning-icon">⏳</span>
            <span className="login-update-warning-text">
              Descargando actualización ({updateState.progress}%)... Por favor espera.
            </span>
          </div>
        )}

        <div className="login-footer">
          <p className="login-footer-text">
            ¿Problemas para acceder?{' '}
            <button
              type="button"
              className="login-footer-link"
              onClick={() => setShowModal(true)}
              disabled={updateState.downloading}
            >
              Contacta al administrador
            </button>
          </p>
        </div>
      </div>

      {/* Modal de Actualización */}
      <ModalUpdateAvailable
        isOpen={showUpdateModal}
        version={updateState.version}
        releaseDate={updateState.releaseDate}
        onDownload={handleDownloadUpdate}
        onDismiss={handleDismissUpdate}
        isDownloading={updateState.downloading}
        downloadProgress={updateState.progress}
        isDownloaded={updateState.downloaded}
        error={updateState.error}
      />

      {/* Modal de Cambios y Novedades */}
      <ModalChangeLog
        isOpen={showChangeLogModal}
        version={updateState.version}
        releaseDate={updateState.releaseDate}
        onClose={() => setShowChangeLogModal(false)}
      />

      <div className="login-version">v{appVersion || '1.0.0'} - SINDESCOL</div>

      <ModalSolicitudSoporte
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
