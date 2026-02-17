// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ModalSolicitudSoporte from '../components/ModalSolicitudSoporte';
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
              />
              <button
  type="button"
  className="login-toggle-password"
  onClick={() => setShowPassword(!showPassword)}
  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
  aria-label="Toggle password visibility"
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
            />
            <label htmlFor="recordarme" className="login-remember-label">
              Mantener sesión iniciada
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading && <span className="login-button-loading"></span>}
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            ¿Problemas para acceder?{' '}
            <button
              type="button"
              className="login-footer-link"
              onClick={() => setShowModal(true)}
            >
              Contacta al administrador
            </button>
          </p>
        </div>
      </div>

      <div className="login-version">v1.0.0 - SINDESCOL</div>

      <ModalSolicitudSoporte
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
