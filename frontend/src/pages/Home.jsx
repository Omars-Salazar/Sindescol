// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import './Home.css';

export default function Home() {
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalAfiliados: 0,
    totalCargos: 0,
    totalDepartamentos: 0,
    cuotasMesActual: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatosUsuario();
    cargarEstadisticas();
  }, []);

  const cargarDatosUsuario = () => {
    const usuarioData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  };

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      // Cargar afiliados
      const resAfiliados = await fetchWithAuth('/api/afiliados');
      const dataAfiliados = await resAfiliados.json();
      
      // Cargar cargos
      const resCargos = await fetchWithAuth('/api/cargos');
      const dataCargos = await resCargos.json();
      
      // Cargar departamentos
      const resDepartamentos = await fetchWithAuth('/api/departamentos');
      const dataDepartamentos = await resDepartamentos.json();
      
      // Cargar cuotas
      const resCuotas = await fetchWithAuth('/api/cuotas');
      const dataCuotas = await resCuotas.json();
      
      const mesActual = new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase();
      const cuotasMes = dataCuotas.success 
        ? dataCuotas.data.filter(c => c.mes.toLowerCase() === mesActual).length 
        : 0;

      setEstadisticas({
        totalAfiliados: dataAfiliados.success ? dataAfiliados.data.length : 0,
        totalCargos: dataCargos.success ? dataCargos.data.length : 0,
        totalDepartamentos: dataDepartamentos.success ? dataDepartamentos.data.length : 0,
        cuotasMesActual: cuotasMes
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return '¡Buenos días';
    if (hora < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const tienePermisoGestionUsuarios = usuario?.rol === 'presidencia_nacional' || usuario?.rol === 'presidencia';

  const modulos = [
    {
      titulo: '👥 Afiliados',
      descripcion: 'Gestiona la información completa de todos los afiliados del sindicato',
      ruta: '/afiliados',
      color: '#1976D2',
      icono: '👥',
      estadistica: estadisticas.totalAfiliados,
      labelEstadistica: 'Afiliados registrados'
    },
    {
      titulo: '💼 Cargos',
      descripcion: 'Administra los diferentes cargos y posiciones disponibles',
      ruta: '/cargos',
      color: '#4CAF50',
      icono: '💼',
      estadistica: estadisticas.totalCargos,
      labelEstadistica: 'Cargos disponibles'
    },
    {
      titulo: '💰 Cuotas',
      descripcion: 'Controla y registra las cuotas mensuales de los afiliados',
      ruta: '/cuotas',
      color: '#FFC107',
      icono: '💰',
      estadistica: estadisticas.cuotasMesActual,
      labelEstadistica: 'Cuotas este mes'
    },
    {
      titulo: '💵 Salarios',
      descripcion: 'Gestiona los salarios por cargo y municipio en el sistema',
      ruta: '/salarios',
      color: '#FF5722',
      icono: '💵',
      estadistica: '---',
      labelEstadistica: 'Por cargo y municipio'
    },
    {
      titulo: '🗺️ Departamentos',
      descripcion: 'Administra los departamentos y municipios del sistema',
      ruta: '/departamentos',
      color: '#9C27B0',
      icono: '🗺️',
      estadistica: estadisticas.totalDepartamentos,
      labelEstadistica: 'Departamentos activos'
    }
  ];

  if (tienePermisoGestionUsuarios) {
    modulos.push({
      titulo: '👤 Gestión de Usuarios',
      descripcion: 'Administra los accesos y permisos de usuarios del sistema',
      ruta: '/gestion-usuarios',
      color: '#00BCD4',
      icono: '👤',
      estadistica: 'Admin',
      labelEstadistica: 'Acceso exclusivo'
    });
  }

  return (
    <div className="home-container">
      {/* Header con gradiente y logo animado */}
      <div className="home-header">
        <div className="home-header-content">
          <h1 className="home-title">
            {obtenerSaludo()}, {usuario?.nombre || 'Usuario'}! 👋
          </h1>
          <p className="home-subtitle">
            Bienvenido al Sistema de Gestión SINDESCOL
          </p>
          
          {usuario && (
            <div className="home-user-info">
              <div className="home-user-badge">
                <span className="badge-icon">
                  {usuario.rol === 'presidencia_nacional' ? '🏛️' :
                   usuario.rol === 'presidencia' ? '👔' : '👤'}
                </span>
                <span className="badge-text">
                  {usuario.rol === 'presidencia_nacional' ? 'Presidencia Nacional' :
                   usuario.rol === 'presidencia' ? 'Presidencia' : 'Usuario'}
                </span>
              </div>
              <div className="home-user-location">
                <span className="location-icon">📍</span>
                <span className="location-text">{usuario.departamento}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="home-stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Afiliados</div>
            <div className="stat-value">
              {loading ? '...' : estadisticas.totalAfiliados}
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <div className="stat-label">Cargos Activos</div>
            <div className="stat-value">
              {loading ? '...' : estadisticas.totalCargos}
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-yellow">
          <div className="stat-icon">🗺️</div>
          <div className="stat-content">
            <div className="stat-label">Departamentos</div>
            <div className="stat-value">
              {loading ? '...' : estadisticas.totalDepartamentos}
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-orange">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Cuotas del Mes</div>
            <div className="stat-value">
              {loading ? '...' : estadisticas.cuotasMesActual}
            </div>
          </div>
        </div>
      </div>

      {/* Módulos de acceso */}
      <div className="home-modules-section">
        <h2 className="section-title">
          <span className="section-icon">🚀</span>
          Acceso Rápido a Módulos
        </h2>
        
        <div className="home-modules-grid">
          {modulos.map((modulo, index) => (
            <a 
              key={index}
              href={modulo.ruta} 
              className="module-card"
              style={{ '--hover-color': modulo.color }}
            >
              <div className="module-header" style={{ background: `linear-gradient(135deg, ${modulo.color} 0%, ${modulo.color}dd 100%)` }}>
                <span className="module-icon">{modulo.icono}</span>
                <h3 className="module-title">{modulo.titulo}</h3>
              </div>
              
              <div className="module-body">
                <p className="module-description">{modulo.descripcion}</p>
                
                <div className="module-stats">
                  <div className="module-stat-value">{modulo.estadistica}</div>
                  <div className="module-stat-label">{modulo.labelEstadistica}</div>
                </div>
              </div>
              
              <div className="module-footer">
                <span className="module-link">Ir al módulo →</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className="home-info-cards">
        <div className="info-card info-card-tip">
          <div className="info-card-icon">💡</div>
          <div className="info-card-content">
            <h4>Consejo del día</h4>
            <p>Mantén actualizada la información de los afiliados para un mejor servicio.</p>
          </div>
        </div>

        <div className="info-card info-card-help">
          <div className="info-card-icon">❓</div>
          <div className="info-card-content">
            <h4>¿Necesitas ayuda?</h4>
            <p>Consulta el menú lateral para acceder a información de contacto.</p>
          </div>
        </div>
      </div>
    </div>
  );
}