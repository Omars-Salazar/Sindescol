import { useState, useEffect, useMemo } from "react";
import { ModalCrearAfiliado } from "../components/afiliados/ModalCrearAfiliado";
import { ModalVerAfiliado } from "../components/afiliados/ModalVerAfiliado";
import { ModalEditarAfiliado } from "../components/afiliados/ModalEditarAfiliado";
import { ModalEliminarAfiliado } from "../components/afiliados/ModalEliminarAfiliado";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { MESSAGES } from "../utils/toastMessages";
import "./Afiliados.css";

function Afiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();

  // OPTIMIZACIÓN: Estados de paginación y búsqueda
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(20);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDebounced, setFiltroDebounced] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("");
  const [opciones, setOpciones] = useState({
    departamentos: [],
    municipios: [],
  });

  // Obtener datos del usuario
  const usuarioData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const usuario = usuarioData ? JSON.parse(usuarioData) : null;

  useEffect(() => {
    cargarAfiliados();
    cargarOpciones();
  }, []);

  // OPTIMIZACIÓN: Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroDebounced(busqueda);
      setPaginaActual(1); // Resetear a primera página al buscar
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const cargarOpciones = async () => {
    try {
      const [resDepartamentos, resMunicipios] = await Promise.all([
        fetchWithAuth("/api/departamentos"),
        fetchWithAuth("/api/municipios")
      ]);
      
      const dataDeps = await resDepartamentos.json();
      const dataMuns = await resMunicipios.json();
      
      setOpciones({
        departamentos: dataDeps.data || [],
        municipios: dataMuns.data || []
      });
    } catch (error) {
      console.error("Error cargando opciones:", error);
    }
  };

  const cargarAfiliados = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/afiliados");
      const data = await response.json();

      if (data.success) {
        console.log(`✅ Cargados ${data.data?.length || 0} afiliados`);
        setAfiliados(data.data || []);
      } else {
        setAfiliados([]);
        showError(data.message || data.error || MESSAGES.LOAD_ERROR);
      }
    } catch (error) {
      console.error("Error completo:", error);
      setAfiliados([]);
      showError(error.message || MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearAfiliado = async (formData) => {
    try {
      console.log("Enviando datos del afiliado...");
      const response = await fetchWithAuth("/api/afiliados", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Afiliado creado exitosamente");
        setModalCrearOpen(false);
        cargarAfiliados();
        showSuccess(MESSAGES.AFFILIATE_CREATED);
      } else {
        console.error("Error del servidor:", data.error || data.message);
        showError(data.message || data.error || MESSAGES.SAVE_ERROR);
      }
    } catch (error) {
      console.error("Error creando afiliado:", error);
      showError(error.message || MESSAGES.SAVE_ERROR);
    }
  };

  const handleEditarAfiliado = async (afiliadoId, formData) => {
    try {
      console.log("Enviando datos del afiliado...");
    
    // Filtrar solo los campos permitidos por el backend
    const camposPermitidos = [
      'cedula', 'nombres', 'apellidos', 'religion_id', 'fecha_nacimiento', 
      'fecha_afiliacion', 'direccion_domicilio', 'municipio_domicilio', 
      'municipio_residencia', 'direccion_residencia', 'id_cargo', 'id_eps', 
      'id_arl', 'id_pension', 'id_cesantias', 'id_institucion', 'municipio_trabajo',
      'foto_afiliado'
    ];
    
    const datosLimpios = {};
    for (const campo of camposPermitidos) {
      if (formData.hasOwnProperty(campo)) {
        datosLimpios[campo] = formData[campo];
      }
    }
    
      const response = await fetchWithAuth(`/api/afiliados/${afiliadoId}`, {
        method: "PUT",
        body: JSON.stringify(datosLimpios)
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Afiliado editado exitosamente");
        setModalEditarOpen(false);
        cargarAfiliados();
        showSuccess(MESSAGES.AFFILIATE_UPDATED);
      } else {
        console.error("Error del servidor:", data.error || data.message);
        showError(data.message || data.error || MESSAGES.SAVE_ERROR);
      }
    } catch (error) {
      console.error("Error editando afiliado:", error);
      showError(error.message || MESSAGES.SAVE_ERROR);
    }
  };

  const handleEliminarAfiliado = async () => {
    try {
      if (!afiliadoSeleccionado) {
        showWarning("⚠️ No hay afiliado seleccionado");
        return;
      }

      console.log("Eliminando afiliado con ID:", afiliadoSeleccionado);
      const response = await fetchWithAuth(`/api/afiliados/${afiliadoSeleccionado}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Afiliado eliminado exitosamente");
        setModalEliminarOpen(false);
        setAfiliadoSeleccionado(null);
        cargarAfiliados();
        showSuccess(MESSAGES.AFFILIATE_DELETED);
      } else {
        console.error("Error del servidor:", data.error || data.message);
        showError(data.message || data.error || MESSAGES.DELETE_ERROR);
      }
    } catch (error) {
      console.error("Error eliminando afiliado:", error);
      showError(error.message || MESSAGES.DELETE_ERROR);
    }
  };

  const handleVerAfiliado = (id) => {
    setAfiliadoSeleccionado(id);
    setModalVerOpen(true);
  };

  const abrirModalEditar = (id) => {
    setAfiliadoSeleccionado(id);
    setModalEditarOpen(true);
  };

  const abrirModalEliminar = (id) => {
    setAfiliadoSeleccionado(id);
    setModalEliminarOpen(true);
  };

  // OPTIMIZACIÓN: Filtrar y paginar con useMemo
  const afiliadosFiltrados = useMemo(() => {
    let resultado = afiliados;

    // Filtrar por búsqueda
    if (filtroDebounced) {
      const termino = filtroDebounced.toLowerCase();
      resultado = resultado.filter(afiliado => 
        afiliado.cedula?.toLowerCase().includes(termino) ||
        afiliado.nombres?.toLowerCase().includes(termino) ||
        afiliado.apellidos?.toLowerCase().includes(termino) ||
        afiliado.nombre_cargo?.toLowerCase().includes(termino) ||
        afiliado.nombre_institucion?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por departamento (solo si presidencia_nacional)
    if (usuario?.rol === 'presidencia_nacional' && filtroDepartamento) {
      resultado = resultado.filter(afiliado => 
        afiliado.departamento === filtroDepartamento
      );
    }

    // Filtrar por municipio (solo si presidencia_nacional)
    if (usuario?.rol === 'presidencia_nacional' && filtroMunicipio) {
      resultado = resultado.filter(afiliado => 
        afiliado.municipio_trabajo == filtroMunicipio
      );
    }

    return resultado;
  }, [afiliados, filtroDebounced, filtroDepartamento, filtroMunicipio, usuario]);

  const afiliadosPaginados = useMemo(() => {
    const indexUltimo = paginaActual * elementosPorPagina;
    const indexPrimero = indexUltimo - elementosPorPagina;
    return afiliadosFiltrados.slice(indexPrimero, indexUltimo);
  }, [afiliadosFiltrados, paginaActual, elementosPorPagina]);

  const totalPaginas = Math.ceil(afiliadosFiltrados.length / elementosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generarNumerosPagina = () => {
    const numeros = [];
    const maxBotones = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

    if (fin - inicio + 1 < maxBotones) {
      inicio = Math.max(1, fin - maxBotones + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  return (
    <div className="afiliados-container">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
      
      <div className="afiliados-header">
        <h1>Gestión de Afiliados</h1>
        <button className="btn-crear" onClick={() => setModalCrearOpen(true)}>
          + Nuevo Afiliado
        </button>
      </div>

      {/* OPTIMIZACIÓN: Barra de búsqueda */}
      <div style={{ 
        marginBottom: "1.5rem", 
        display: "flex", 
        gap: "1rem", 
        alignItems: "center",
        background: "white",
        padding: "1rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Buscar por cédula, nombre, cargo o institución..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "2px solid #ddd",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
          />
        </div>
        {busqueda && (
          <button 
            onClick={() => setBusqueda("")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros de departamento y municipio (solo para presidencia_nacional) */}
      {usuario?.rol === 'presidencia_nacional' && (
        <div style={{
          marginBottom: "1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Filtrar por Departamento</label>
            <select
              value={filtroDepartamento}
              onChange={(e) => {
                setFiltroDepartamento(e.target.value);
                setFiltroMunicipio("");
                setPaginaActual(1);
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
            >
              <option value="">Todos los departamentos</option>
              {opciones.departamentos.map((d) => (
                <option key={d.departamento} value={d.departamento}>
                  {d.departamento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Filtrar por Municipio</label>
            <select
              value={filtroMunicipio}
              onChange={(e) => {
                setFiltroMunicipio(e.target.value);
                setPaginaActual(1);
              }}
              disabled={!filtroDepartamento}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "1rem",
                opacity: !filtroDepartamento ? 0.5 : 1,
                cursor: !filtroDepartamento ? "not-allowed" : "pointer"
              }}
            >
              <option value="">
                {!filtroDepartamento ? "Selecciona departamento primero" : "Todos los municipios"}
              </option>
              {opciones.municipios
                .filter((m) => m.departamento === filtroDepartamento)
                .map((m) => (
                  <option key={m.id_municipio} value={m.id_municipio}>
                    {m.nombre_municipio}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      {/* OPTIMIZACIÓN: Información de paginación */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "1rem",
        padding: "1rem",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <div style={{ color: "#333", fontWeight: "500" }}>
          📊 Mostrando {((paginaActual - 1) * elementosPorPagina) + 1} - {Math.min(paginaActual * elementosPorPagina, afiliadosFiltrados.length)} de {afiliadosFiltrados.length}
          {afiliadosFiltrados.length !== afiliados.length && (
            <span style={{ color: "#666", marginLeft: "0.5rem" }}>
              (filtrados de {afiliados.length} totales)
            </span>
          )}
        </div>
        <div style={{ color: "#666" }}>
          Página {paginaActual} de {totalPaginas}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #007bff",
            borderRadius: "50%",
            margin: "0 auto 1rem",
            animation: "spin 1s linear infinite"
          }}></div>
          <p>Cargando afiliados...</p>
        </div>
      ) : afiliadosFiltrados.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "3rem",
          background: "white",
          borderRadius: "8px"
        }}>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>
            {afiliados.length === 0 
              ? "No hay afiliados registrados" 
              : "No se encontraron afiliados con el criterio de búsqueda"}
          </p>
          {afiliados.length === 0 && (
            <button 
              className="btn-crear" 
              onClick={() => setModalCrearOpen(true)}
              style={{ marginTop: "1rem" }}
            >
              Crear el primer afiliado
            </button>
          )}
        </div>
      ) : (
        <>
          <table className="afiliados-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Cargo</th>
                <th>Institución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {afiliadosPaginados.map((afiliado, index) => (
                <tr key={afiliado.id_afiliado}>
                  <td style={{ color: "#999" }}>
                    {((paginaActual - 1) * elementosPorPagina) + index + 1}
                  </td>
                  <td>{afiliado.cedula}</td>
                  <td>{afiliado.nombres}</td>
                  <td>{afiliado.apellidos}</td>
                  <td>{afiliado.nombre_cargo || "-"}</td>
                  <td>{afiliado.nombre_institucion || "-"}</td>
                  <td>
                    <button 
                      className="btn-view"
                      onClick={() => handleVerAfiliado(afiliado.id_afiliado)}
                    >
                      👁️ Ver
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => abrirModalEditar(afiliado.id_afiliado)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => abrirModalEliminar(afiliado.id_afiliado)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Controles de paginación */}
          {totalPaginas > 1 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "2rem",
              padding: "1rem",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <button
                onClick={() => cambiarPagina(1)}
                disabled={paginaActual === 1}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                  background: paginaActual === 1 ? "#f0f0f0" : "white",
                  cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                  opacity: paginaActual === 1 ? 0.5 : 1
                }}
              >
                ⏮️
              </button>

              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                style={{
                  padding: "0.5rem 1rem",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                  background: paginaActual === 1 ? "#f0f0f0" : "white",
                  cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                  opacity: paginaActual === 1 ? 0.5 : 1
                }}
              >
                ◀ Anterior
              </button>

              {generarNumerosPagina().map((numero) => (
                <button
                  key={numero}
                  onClick={() => cambiarPagina(numero)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    border: "2px solid #ddd",
                    borderRadius: "4px",
                    background: paginaActual === numero ? "#007bff" : "white",
                    color: paginaActual === numero ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: paginaActual === numero ? "bold" : "normal",
                    minWidth: "40px"
                  }}
                >
                  {numero}
                </button>
              ))}

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                style={{
                  padding: "0.5rem 1rem",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                  background: paginaActual === totalPaginas ? "#f0f0f0" : "white",
                  cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer",
                  opacity: paginaActual === totalPaginas ? 0.5 : 1
                }}
              >
                Siguiente ▶
              </button>

              <button
                onClick={() => cambiarPagina(totalPaginas)}
                disabled={paginaActual === totalPaginas}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "2px solid #ddd",
                  borderRadius: "4px",
                  background: paginaActual === totalPaginas ? "#f0f0f0" : "white",
                  cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer",
                  opacity: paginaActual === totalPaginas ? 0.5 : 1
                }}
              >
                ⏭️
              </button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      <ModalCrearAfiliado
        isOpen={modalCrearOpen}
        onClose={() => setModalCrearOpen(false)}
        onSubmit={handleCrearAfiliado}
      />

      <ModalVerAfiliado
        isOpen={modalVerOpen}
        onClose={() => {
          setModalVerOpen(false);
          setAfiliadoSeleccionado(null);
        }}
        afiliadoId={afiliadoSeleccionado}
      />

      <ModalEditarAfiliado
        isOpen={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false);
          setAfiliadoSeleccionado(null);
        }}
        afiliadoId={afiliadoSeleccionado}
        onSubmit={handleEditarAfiliado}
      />

      <ModalEliminarAfiliado
        isOpen={modalEliminarOpen}
        onClose={() => {
          setModalEliminarOpen(false);
          setAfiliadoSeleccionado(null);
        }}
        onConfirm={handleEliminarAfiliado}
        afiliado={afiliados.find(a => a.id_afiliado === afiliadoSeleccionado)}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Afiliados;