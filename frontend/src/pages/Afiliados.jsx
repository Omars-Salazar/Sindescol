import { useState, useEffect, useMemo } from "react";
import { ModalCrearAfiliado } from "../components/afiliados/ModalCrearAfiliado";
import { ModalVerAfiliado } from "../components/afiliados/ModalVerAfiliado";
import { ModalEditarAfiliado } from "../components/afiliados/ModalEditarAfiliado";
import { ModalEliminarAfiliado } from "../components/afiliados/ModalEliminarAfiliado";
import "./Afiliados.css";

function Afiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [afiliadoSeleccionado, setAfiliadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  // OPTIMIZACIÓN: Estados de paginación y búsqueda
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(20);
  const [busqueda, setBusqueda] = useState("");
  const [filtroDebounced, setFiltroDebounced] = useState("");

  useEffect(() => {
    cargarAfiliados();
  }, []);

  // OPTIMIZACIÓN: Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltroDebounced(busqueda);
      setPaginaActual(1); // Resetear a primera página al buscar
    }, 300);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const cargarAfiliados = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/afiliados");

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Respuesta no es JSON válido");
      }

      if (data.success) {
        console.log(`✅ Cargados ${data.data?.length || 0} afiliados`);
        setAfiliados(data.data || []);
      }
    } catch (error) {
      console.error("Error completo:", error);
      setAfiliados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearAfiliado = async (formData) => {
    try {
      console.log("Enviando datos del afiliado...");
      const response = await fetch("/api/afiliados", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Respuesta no es JSON válido");
      }

      if (data.success) {
        console.log("✅ Afiliado creado exitosamente");
        setModalCrearOpen(false);
        cargarAfiliados();
        alert("✅ Afiliado creado exitosamente");
      } else {
        console.error("Error del servidor:", data.error);
        alert("❌ Error al crear afiliado: " + data.error);
      }
    } catch (error) {
      console.error("Error creando afiliado:", error);
      alert("❌ Error al crear afiliado");
    }
  };

  const handleEditarAfiliado = async (id, formData) => {
    try {
      console.log("Editando afiliado:", id);
      const response = await fetch(`/api/afiliados/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Respuesta no es JSON válido");
      }

      if (data.success) {
        console.log("✅ Afiliado actualizado exitosamente");
        setModalEditarOpen(false);
        setAfiliadoSeleccionado(null);
        cargarAfiliados();
        alert("✅ Afiliado actualizado exitosamente");
      } else {
        console.error("Error del servidor:", data.error);
        alert("❌ Error al actualizar afiliado: " + data.error);
      }
    } catch (error) {
      console.error("Error actualizando afiliado:", error);
      alert("❌ Error al actualizar afiliado");
    }
  };

  const handleEliminarAfiliado = async () => {
    try {
      console.log("Eliminando afiliado:", afiliadoSeleccionado);
      const response = await fetch(`/api/afiliados/${afiliadoSeleccionado}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Respuesta no es JSON válido");
      }

      if (data.success) {
        console.log("✅ Afiliado eliminado exitosamente");
        setModalEliminarOpen(false);
        setAfiliadoSeleccionado(null);
        cargarAfiliados();
        alert("✅ Afiliado eliminado exitosamente");
      } else {
        console.error("Error del servidor:", data.error);
        alert("❌ Error al eliminar afiliado: " + data.error);
      }
    } catch (error) {
      console.error("Error eliminando afiliado:", error);
      alert("❌ Error al eliminar afiliado");
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
    if (!filtroDebounced) return afiliados;

    const termino = filtroDebounced.toLowerCase();
    return afiliados.filter(afiliado => 
      afiliado.cedula?.toLowerCase().includes(termino) ||
      afiliado.nombres?.toLowerCase().includes(termino) ||
      afiliado.apellidos?.toLowerCase().includes(termino) ||
      afiliado.nombre_cargo?.toLowerCase().includes(termino) ||
      afiliado.nombre_institucion?.toLowerCase().includes(termino)
    );
  }, [afiliados, filtroDebounced]);

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