import { useState, useEffect } from "react";
import { ModalCrearDepartamento } from "../components/departamentos/ModalCrearDepartamento";
import { ModalCrearMunicipio } from "../components/departamentos/ModalCrearMunicipio";
import { ModalEditarMunicipio } from "../components/departamentos/ModalEditarMunicipio";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import "./Departamentos.css";

export default function Departamentos() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipiosPorDepartamento, setMunicipiosPorDepartamento] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Determinar si el usuario puede editar
  const puedeEditar = usuarioActual?.rol !== 'usuario';
  
  // Estados de modales
  const [modalDepartamentoOpen, setModalDepartamentoOpen] = useState(false);
  const [modalMunicipioOpen, setModalMunicipioOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [municipioEditar, setMunicipioEditar] = useState(null);
  
  // Estado para expandir/colapsar - SOLO almacena el nombre del departamento expandido
  const [departamentoExpandido, setDepartamentoExpandido] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (userData) {
      setUsuarioActual(JSON.parse(userData));
    }
    cargarDepartamentos();
  }, []);

  const cargarDepartamentos = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("/api/departamentos");
      const data = await response.json();
      
      if (data.success) {
        // Eliminar departamentos duplicados
        let departamentosUnicos = [];
        const nombresVistos = new Set();
        
        for (const depto of (data.data || [])) {
          if (!nombresVistos.has(depto.departamento)) {
            nombresVistos.add(depto.departamento);
            departamentosUnicos.push(depto);
          }
        }

        // Presidencia nacional ve todos los departamentos
        // Presidencia departamental ve solo su departamento
        if (usuarioActual?.rol === 'presidencia' && usuarioActual?.departamento) {
          departamentosUnicos = departamentosUnicos.filter(
            d => d.departamento === usuarioActual.departamento
          );
        }
        // Si el rol es 'presidencia_nacional', mostrar todos los departamentos (sin filtro)
        
        console.log("📋 Departamentos cargados:", departamentosUnicos);
        console.log("👤 Usuario actual:", usuarioActual);
        setDepartamentos(departamentosUnicos);
      }
    } catch (error) {
      console.error("Error cargando departamentos:", error);
      showAlert("Error al cargar departamentos", "danger");
    } finally {
      setLoading(false);
    }
  };

  const cargarMunicipios = async (departamento) => {
    try {
      const response = await fetchWithAuth(`/api/departamentos/${encodeURIComponent(departamento)}/municipios`);
      const data = await response.json();
      
      if (data.success) {
        setMunicipiosPorDepartamento(prev => ({
          ...prev,
          [departamento]: data.data || []
        }));
      }
    } catch (error) {
      console.error("Error cargando municipios:", error);
    }
  };

  const toggleDepartamento = (nombreDepartamento) => {
    console.log("🔄 Toggle:", nombreDepartamento);
    console.log("📊 Estado actual:", departamentoExpandido);
    
    if (departamentoExpandido === nombreDepartamento) {
      // Si el departamento ya está expandido, colapsarlo
      console.log("❌ Cerrando departamento");
      setDepartamentoExpandido(null);
    } else {
      // Si no está expandido, expandir este y colapsar cualquier otro
      console.log("✅ Abriendo departamento:", nombreDepartamento);
      setDepartamentoExpandido(nombreDepartamento);
      
      // Cargar municipios si no existen
      if (!municipiosPorDepartamento[nombreDepartamento]) {
        console.log("📥 Cargando municipios para:", nombreDepartamento);
        cargarMunicipios(nombreDepartamento);
      }
    }
  };

  const handleCrearDepartamento = async (formData) => {
    try {
      const response = await fetchWithAuth("/api/departamentos/crear-con-municipios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Departamento y municipios creados exitosamente", "success");
        setModalDepartamentoOpen(false);
        cargarDepartamentos();
        setMunicipiosPorDepartamento({});
        setDepartamentoExpandido(null);
      } else {
        showAlert(data.error || "Error al crear departamento", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error al crear departamento", "danger");
    }
  };

  const handleCrearMunicipio = async (formData) => {
    try {
      const response = await fetchWithAuth("/api/departamentos/municipio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Municipio creado exitosamente", "success");
        setModalMunicipioOpen(false);
        cargarDepartamentos();
        setMunicipiosPorDepartamento(prev => {
          const nuevo = { ...prev };
          delete nuevo[formData.departamento];
          return nuevo;
        });
      } else {
        showAlert(data.error || "Error al crear municipio", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error al crear municipio", "danger");
    }
  };

  const handleEditarMunicipio = async (id, formData) => {
    try {
      const response = await fetchWithAuth(`/api/departamentos/municipio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Municipio actualizado exitosamente", "success");
        setModalEditarOpen(false);
        setMunicipioEditar(null);
        cargarDepartamentos();
        setMunicipiosPorDepartamento({});
      } else {
        showAlert(data.error || "Error al actualizar municipio", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error al actualizar municipio", "danger");
    }
  };

  const handleEliminarMunicipio = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el municipio "${nombre}"?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/departamentos/municipio/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Municipio eliminado exitosamente", "success");
        cargarDepartamentos();
        setMunicipiosPorDepartamento({});
      } else {
        showAlert(data.error || "Error al eliminar municipio", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Error al eliminar municipio", "danger");
    }
  };

  const abrirModalEditar = (municipio) => {
    setMunicipioEditar(municipio);
    setModalEditarOpen(true);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>🗺️ Gestión de Departamentos y Municipios</h1>
        <p>Administra los departamentos y sus municipios</p>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        {usuarioActual?.rol === 'presidencia_nacional' && puedeEditar && (
          <button 
            className="btn btn-primary" 
            onClick={() => setModalDepartamentoOpen(true)}
          >
            ➕ Nuevo Departamento
          </button>
        )}
        {puedeEditar && (
          <button 
            className="btn btn-success" 
            onClick={() => setModalMunicipioOpen(true)}
          >
            ➕ Nueva Entidad
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : departamentos.length === 0 ? (
        <div className="empty-state">
          <p>No hay departamentos registrados</p>
          <button className="btn btn-primary" onClick={() => setModalDepartamentoOpen(true)}>
            Crear el primer departamento
          </button>
        </div>
      ) : (
        <div className="departamentos-grid">
          {departamentos.map((depto) => {
            const nombreDepto = depto.departamento;
            const estaExpandido = departamentoExpandido === nombreDepto;
            const esDelUsuario = usuarioActual?.departamento === nombreDepto;
            const puedeInteractuar = usuarioActual?.rol === 'presidencia_nacional' || esDelUsuario;
            
            console.log(`🏷️ Renderizando: "${nombreDepto}", expandido: ${estaExpandido}, estado actual: "${departamentoExpandido}"`);
            
            return (
              <div 
                key={nombreDepto} 
                className={`departamento-card ${estaExpandido ? 'expandido' : ''} ${!puedeInteractuar ? 'disabled' : ''}`}
              >
                <div 
                  className="departamento-header" 
                  onClick={() => puedeInteractuar && toggleDepartamento(nombreDepto)}
                  style={{ cursor: puedeInteractuar ? 'pointer' : 'not-allowed', opacity: puedeInteractuar ? 1 : 0.6 }}
                >
                  <h3>📍 {nombreDepto}</h3>
                  <button
                    className="btn-expand"
                    onClick={(e) => {
                      e.stopPropagation();
                      puedeInteractuar && toggleDepartamento(nombreDepto);
                    }}
                    disabled={!puedeInteractuar}
                  >
                    {estaExpandido ? "▼" : "▶"}
                  </button>
                </div>

                {estaExpandido && puedeInteractuar ? (
                  <div className="municipios-lista">
                    {municipiosPorDepartamento[nombreDepto] ? (
                      municipiosPorDepartamento[nombreDepto].length > 0 ? (
                        municipiosPorDepartamento[nombreDepto].map((municipio) => (
                          <div key={municipio.id_municipio} className="municipio-item">
                            <span className="municipio-nombre">
                              🏙️ {municipio.nombre_municipio}
                            </span>
                            {puedeEditar && (
                              <div className="municipio-actions">
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalEditar(municipio);
                                  }}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEliminarMunicipio(municipio.id_municipio, municipio.nombre_municipio);
                                  }}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-municipios">No hay municipios registrados</p>
                      )
                    ) : (
                      <div className="loading-municipios">Cargando municipios...</div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <ModalCrearDepartamento
        isOpen={modalDepartamentoOpen}
        onClose={() => setModalDepartamentoOpen(false)}
        onSubmit={handleCrearDepartamento}
      />

      <ModalCrearMunicipio
        isOpen={modalMunicipioOpen}
        onClose={() => setModalMunicipioOpen(false)}
        onSubmit={handleCrearMunicipio}
        departamentos={departamentos}
        usuarioActual={usuarioActual}
      />

      <ModalEditarMunicipio
        isOpen={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false);
          setMunicipioEditar(null);
        }}
        onSubmit={handleEditarMunicipio}
        municipio={municipioEditar}
        departamentos={departamentos}
        usuarioActual={usuarioActual}
      />
    </div>
  );
}