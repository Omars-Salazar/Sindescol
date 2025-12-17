import { useState, useEffect } from "react";
import * as api from "../services/api";

export default function Salarios() {
  const [salarios, setSalarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [alert, setAlert] = useState(null);
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(20);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    cargo: "",
    municipio: "",
    busqueda: ""
  });

  const [formData, setFormData] = useState({
    id_cargo: "",
    id_municipio: "",
    salario: "",
  });

  useEffect(() => {
    fetchSalarios();
    fetchCargos();
    fetchMunicipios();
  }, []);

  const fetchSalarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.getSalarios();
      setSalarios(data.data || []);
    } catch (error) {
      showAlert("Error al cargar salarios", "danger");
    }
    setLoading(false);
  };

  const fetchCargos = async () => {
    try {
      const { data } = await api.getCargos();
      setCargos(data.data || []);
    } catch (error) {
      console.error("Error cargando cargos:", error);
    }
  };

  const fetchMunicipios = async () => {
    try {
      const response = await fetch("/api/municipios");
      const data = await response.json();
      if (data.success) {
        setMunicipios(data.data || []);
      }
    } catch (error) {
      console.error("Error cargando municipios:", error);
    }
  };

  // Filtrar salarios
  const salariosFiltrados = salarios.filter(salario => {
    const cumpleCargo = !filtros.cargo || salario.id_cargo === parseInt(filtros.cargo);
    const cumpleMunicipio = !filtros.municipio || salario.id_municipio === parseInt(filtros.municipio);
    const cumpleBusqueda = !filtros.busqueda || 
      salario.nombre_cargo?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      salario.nombre_municipio?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      salario.departamento?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return cumpleCargo && cumpleMunicipio && cumpleBusqueda;
  });

  // Calcular paginación
  const indexUltimo = paginaActual * elementosPorPagina;
  const indexPrimero = indexUltimo - elementosPorPagina;
  const salariosPaginados = salariosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(salariosFiltrados.length / elementosPorPagina);

  // Cambiar página
  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generar números de página
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
    setPaginaActual(1); // Reiniciar a la primera página al filtrar
  };

  const limpiarFiltros = () => {
    setFiltros({ cargo: "", municipio: "", busqueda: "" });
    setPaginaActual(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateSalario(editingId, formData);
        showAlert("Salario actualizado", "success");
      } else {
        await api.createSalario(formData);
        showAlert("Salario creado", "success");
      }
      resetForm();
      fetchSalarios();
    } catch (error) {
      showAlert(error.response?.data?.error || "Error al guardar", "danger");
    }
  };

  const handleEdit = (salario) => {
    setFormData({
      id_cargo: salario.id_cargo,
      id_municipio: salario.id_municipio,
      salario: salario.salario
    });
    setEditingId(salario.id_salario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este salario?")) {
      try {
        await api.deleteSalario(id);
        showAlert("Salario eliminado", "success");
        fetchSalarios();
      } catch (error) {
        showAlert("Error al eliminar", "danger");
      }
    }
  };

  const resetForm = () => {
    setFormData({ id_cargo: "", id_municipio: "", salario: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>💵 Gestión de Salarios</h1>
        <p>Administra los salarios por cargo y municipio</p>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? "✕ Cancelar" : "➕ Nuevo Salario"}
      </button>

      {showForm && (
        <div className="card" style={{ marginTop: "2rem", background: "var(--light-blue)" }}>
          <h3>{editingId ? "Editar Salario" : "Crear Nuevo Salario"}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <div className="form-row">
              <div className="form-group">
                <label>Cargo *</label>
                <select name="id_cargo" value={formData.id_cargo} onChange={handleInputChange} required>
                  <option value="">Seleccionar cargo</option>
                  {cargos.map((cargo) => (
                    <option key={cargo.id_cargo} value={cargo.id_cargo}>
                      {cargo.nombre_cargo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Municipio *</label>
                <select name="id_municipio" value={formData.id_municipio} onChange={handleInputChange} required>
                  <option value="">Seleccionar municipio</option>
                  {municipios.map((municipio) => (
                    <option key={municipio.id_municipio} value={municipio.id_municipio}>
                      {municipio.nombre_municipio} - {municipio.departamento}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Salario *</label>
              <input
                type="number"
                name="salario"
                value={formData.salario}
                onChange={handleInputChange}
                placeholder="Ej: 2500000"
                min="0"
                step="1000"
                required
              />
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-success">
                {editingId ? "Actualizar" : "Crear"} Salario
              </button>
              <button type="button" className="btn btn-warning" onClick={resetForm}>
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <>
          {/* Filtros */}
          <div className="card" style={{ marginTop: "2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>🔍 Filtros</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Buscar</label>
                <input
                  type="text"
                  name="busqueda"
                  value={filtros.busqueda}
                  onChange={handleFiltroChange}
                  placeholder="Buscar por cargo, municipio o departamento..."
                />
              </div>
              <div className="form-group">
                <label>Filtrar por Cargo</label>
                <select name="cargo" value={filtros.cargo} onChange={handleFiltroChange}>
                  <option value="">Todos los cargos</option>
                  {cargos.map((cargo) => (
                    <option key={cargo.id_cargo} value={cargo.id_cargo}>
                      {cargo.nombre_cargo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Filtrar por Municipio</label>
                <select name="municipio" value={filtros.municipio} onChange={handleFiltroChange}>
                  <option value="">Todos los municipios</option>
                  {municipios.map((municipio) => (
                    <option key={municipio.id_municipio} value={municipio.id_municipio}>
                      {municipio.nombre_municipio}
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

          {/* Información de paginación */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginTop: "2rem",
            marginBottom: "1rem",
            padding: "1rem",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <div style={{ color: "var(--text-dark)", fontWeight: "500" }}>
              📊 Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, salariosFiltrados.length)} de {salariosFiltrados.length} registros
              {salariosFiltrados.length !== salarios.length && (
                <span style={{ color: "var(--text-light)", marginLeft: "0.5rem" }}>
                  (filtrados de {salarios.length} totales)
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>Mostrar:</span>
                <select 
                  value={elementosPorPagina} 
                  onChange={(e) => {
                    setElementosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  style={{ 
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "2px solid var(--border-color)"
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="loading">Cargando...</div>
          ) : salariosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>
                {salarios.length === 0 
                  ? "No hay salarios registrados" 
                  : "No se encontraron salarios con los filtros aplicados"}
              </p>
              {salarios.length === 0 && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  Crear el primer salario
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cargo</th>
                      <th>Municipio</th>
                      <th>Departamento</th>
                      <th>Salario</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salariosPaginados.map((salario, index) => (
                      <tr key={salario.id_salario}>
                        <td style={{ color: "var(--text-light)" }}>
                          {indexPrimero + index + 1}
                        </td>
                        <td>{salario.nombre_cargo || "N/A"}</td>
                        <td>{salario.nombre_municipio || "N/A"}</td>
                        <td>{salario.departamento || "N/A"}</td>
                        <td style={{ fontWeight: "bold", color: "var(--primary-blue)" }}>
                          ${salario.salario?.toLocaleString() || "0"}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleEdit(salario)}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(salario.id_salario)}
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
                  {/* Botón Primera Página */}
                  <button
                    onClick={() => cambiarPagina(1)}
                    disabled={paginaActual === 1}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "2px solid var(--border-color)",
                      borderRadius: "4px",
                      background: paginaActual === 1 ? "#f0f0f0" : "white",
                      cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                      opacity: paginaActual === 1 ? 0.5 : 1
                    }}
                  >
                    ⏮️
                  </button>

                  {/* Botón Anterior */}
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "2px solid var(--border-color)",
                      borderRadius: "4px",
                      background: paginaActual === 1 ? "#f0f0f0" : "white",
                      cursor: paginaActual === 1 ? "not-allowed" : "pointer",
                      opacity: paginaActual === 1 ? 0.5 : 1
                    }}
                  >
                    ◀ Anterior
                  </button>

                  {/* Números de página */}
                  {generarNumerosPagina().map((numero) => (
                    <button
                      key={numero}
                      onClick={() => cambiarPagina(numero)}
                      style={{
                        padding: "0.5rem 0.75rem",
                        border: "2px solid var(--border-color)",
                        borderRadius: "4px",
                        background: paginaActual === numero ? "var(--primary-blue)" : "white",
                        color: paginaActual === numero ? "white" : "var(--text-dark)",
                        cursor: "pointer",
                        fontWeight: paginaActual === numero ? "bold" : "normal",
                        minWidth: "40px"
                      }}
                    >
                      {numero}
                    </button>
                  ))}

                  {/* Botón Siguiente */}
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "2px solid var(--border-color)",
                      borderRadius: "4px",
                      background: paginaActual === totalPaginas ? "#f0f0f0" : "white",
                      cursor: paginaActual === totalPaginas ? "not-allowed" : "pointer",
                      opacity: paginaActual === totalPaginas ? 0.5 : 1
                    }}
                  >
                    Siguiente ▶
                  </button>

                  {/* Botón Última Página */}
                  <button
                    onClick={() => cambiarPagina(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "2px solid var(--border-color)",
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
        </>
      )}
    </div>
  );
}