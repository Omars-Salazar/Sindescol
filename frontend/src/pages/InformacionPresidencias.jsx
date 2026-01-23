// frontend/src/pages/InformacionPresidencias.jsx
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import "./InformacionPresidencias.css";

export default function InformacionPresidencias() {
  const [presidencias, setPresidencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    departamento: ""
  });
  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    cargarPresidencias();
    cargarDepartamentos();
  }, []);

  const cargarPresidencias = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("/api/usuarios");
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo usuarios con rol 'presidencia' o 'presidencia_nacional'
        const soloPresidencias = (data.data || []).filter(usuario => 
          usuario.rol === 'presidencia' || usuario.rol === 'presidencia_nacional'
        );
        setPresidencias(soloPresidencias);
      }
    } catch (error) {
      console.error('Error cargando presidencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDepartamentos = async () => {
    try {
      const response = await fetchWithAuth("/api/departamentos");
      const data = await response.json();
      
      if (data.success) {
        // Eliminar duplicados
        const departamentosUnicos = [];
        const nombresVistos = new Set();
        
        for (const depto of (data.data || [])) {
          if (!nombresVistos.has(depto.departamento)) {
            nombresVistos.add(depto.departamento);
            departamentosUnicos.push(depto.departamento);
          }
        }
        
        setDepartamentos(departamentosUnicos.sort());
      }
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const limpiarFiltros = () => {
    setFiltros({ busqueda: "", departamento: "" });
  };

  const formatCelular = (celular) => {
    if (!celular || celular === '' || celular === null || celular === undefined) {
      return "No registrado";
    }
    
    const celularStr = String(celular).replace(/\D/g, '');
    
    if (celularStr.length === 10) {
      return `${celularStr.slice(0, 3)} ${celularStr.slice(3, 6)} ${celularStr.slice(6)}`;
    }
    
    return celularStr || "No registrado";
  };

  // Filtrar presidencias
  const presidenciasFiltradas = presidencias.filter(presidencia => {
    const cumpleBusqueda = !filtros.busqueda || 
      presidencia.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      presidencia.email?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      presidencia.departamento?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    const cumpleDepartamento = !filtros.departamento || 
      presidencia.departamento === filtros.departamento;
    
    return cumpleBusqueda && cumpleDepartamento;
  });

  return (
    <div className="container">
      <div className="page-header">
        <h1>🏛️ Información de Presidencias</h1>
        <p>Directorio de contacto de las presidencias departamentales</p>
      </div>

      {/* Filtros */}
      <div className="card filtros-presidencias">
        <h3 style={{ marginBottom: "1rem" }}>🔍 Filtros</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Buscar</label>
            <input
              type="text"
              name="busqueda"
              value={filtros.busqueda}
              onChange={handleFiltroChange}
              placeholder="Buscar por nombre, email o departamento..."
            />
          </div>
          <div className="form-group">
            <label>Filtrar por Departamento</label>
            <select 
              name="departamento" 
              value={filtros.departamento} 
              onChange={handleFiltroChange}
            >
              <option value="">Todos los departamentos</option>
              {departamentos.map((depto, index) => (
                <option key={index} value={depto}>
                  {depto}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button 
          type="button" 
          className="btn btn-warning" 
          onClick={limpiarFiltros}
          style={{ marginTop: "1rem" }}
        >
          🔄 Limpiar Filtros
        </button>
      </div>

      {/* Información de resultados */}
      <div className="info-resultados">
        <p>
          📊 Mostrando {presidenciasFiltradas.length} presidencia(s)
          {presidenciasFiltradas.length !== presidencias.length && (
            <span style={{ color: "#666", marginLeft: "0.5rem" }}>
              (filtradas de {presidencias.length} totales)
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="loading">Cargando información...</div>
      ) : presidenciasFiltradas.length === 0 ? (
        <div className="empty-state">
          <p>
            {presidencias.length === 0 
              ? "No hay presidencias registradas" 
              : "No se encontraron presidencias con los filtros aplicados"}
          </p>
        </div>
      ) : (
        <div className="presidencias-grid">
          {presidenciasFiltradas.map((presidencia) => (
            <div key={presidencia.id_usuario} className="presidencia-card">
              <div className="presidencia-header">
                <div className="presidencia-icono">
                  {presidencia.rol === 'presidencia_nacional' ? '🏛️' : '👔'}
                </div>
                <div className="presidencia-rol">
                  <span className={`badge-rol ${presidencia.rol}`}>
                    {presidencia.rol === 'presidencia_nacional' 
                      ? 'Presidencia Nacional' 
                      : 'Presidencia Departamental'}
                  </span>
                </div>
              </div>

              <div className="presidencia-body">
                <div className="presidencia-info-item">
                  <div className="info-label">
                    <span className="info-icon">👤</span>
                    Nombre
                  </div>
                  <div className="info-value">{presidencia.nombre}</div>
                </div>

                <div className="presidencia-info-item">
                  <div className="info-label">
                    <span className="info-icon">📧</span>
                    Email
                  </div>
                  <div className="info-value email-value">
                    {presidencia.email}
                  </div>
                </div>

                <div className="presidencia-info-item">
                  <div className="info-label">
                    <span className="info-icon">📱</span>
                    Celular
                  </div>
                  <div className="info-value celular-value">
                    {formatCelular(presidencia.celular)}
                  </div>
                </div>

                <div className="presidencia-info-item">
                  <div className="info-label">
                    <span className="info-icon">📍</span>
                    Departamento
                  </div>
                  <div className="info-value departamento-value">
                    {presidencia.departamento}
                  </div>
                </div>

                {presidencia.activo !== undefined && (
                  <div className="presidencia-estado">
                    <span className={`estado-badge ${presidencia.activo ? 'activo' : 'inactivo'}`}>
                      {presidencia.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </div>
                )}
              </div>

              <div className="presidencia-footer">
                <div className="acciones-contacto">
                  <a 
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${presidencia.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-contacto email"
                    title="Enviar correo por Gmail"
                  >
                    📧 Gmail
                  </a>
                  {presidencia.celular && (
                    <a 
                      href={`https://wa.me/57${String(presidencia.celular).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-contacto whatsapp"
                      title="Contactar por WhatsApp"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}