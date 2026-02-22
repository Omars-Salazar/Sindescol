// frontend/src/components/Sidebar.jsx
import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.href = '/login';
  };

  const handleNavegar = (ruta) => {
    window.location.href = ruta;
  };

  const tienePermisoGestionUsuarios = usuario?.rol === 'presidencia_nacional' || usuario?.rol === 'presidencia';

  return (
    <>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <img 
              src="/escudo_sindescol.png" 
              alt="SINDESCOL" 
              className="sidebar-logo"
            />
            <div className="sidebar-title">
              <h3>SINDESCOL</h3>
              <p>Sistema de Gestión</p>
            </div>
          </div>
          
          {usuario && (
            <div className="sidebar-user-info">
              <p className="user-name">{usuario.nombre}</p>
              <p className="user-email">{usuario.email}</p>
              <div className="user-badges">
                <span className="badge badge-rol">
                  {usuario.rol === 'presidencia_nacional' ? '🏛️ Presidencia Nacional' : 
                   usuario.rol === 'presidencia' ? '👔 Presidencia' : 
                   '👤 Usuario'}
                </span>
                <span className="badge badge-depto">
                  📍 {usuario.departamento}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="sidebar-menu">
          {/* Sección de Información */}
          <div className="menu-section">
            <h4 className="menu-section-title">Información</h4>
            
            <button
              onClick={() => {
                handleNavegar('/informacion-presidencias');
                setIsOpen(false);
              }}
              className="menu-item"
            >
              <span className="menu-icon">🏛️</span>
              <div className="menu-content">
                <div className="menu-title">Información de Presidencias</div>
                <div className="menu-subtitle">Directorio de contacto</div>
              </div>
            </button>
          </div>

          {/* Sección de Administración (solo para presidencias) */}
          {tienePermisoGestionUsuarios && (
            <div className="menu-section">
              <h4 className="menu-section-title">Administración</h4>
              
              <button
                onClick={() => {
                  handleNavegar('/gestion-usuarios');
                  setIsOpen(false);
                }}
                className="menu-item"
              >
                <span className="menu-icon">👥</span>
                <div className="menu-content">
                  <div className="menu-title">Gestión de Usuarios</div>
                  <div className="menu-subtitle">Administrar accesos</div>
                </div>
              </button>
            </div>
          )}

          {/* Información del sistema */}
          <div className="sidebar-info">
            <h4>Información del Sistema</h4>
            <p>
              Versión 1.0.5<br />
              © 2025 SINDESCOL<br />
              <span style={{fontSize: '0.85em', opacity: 0.8}}>Sistema mejorado con alertas intuitivas</span>
            </p>
          </div>
        </div>

        {/* Footer con botón de cerrar sesión */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="btn-logout"
          >
            <span className="logout-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}