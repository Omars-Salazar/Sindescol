import { useState, useEffect } from "react";
import * as api from "../services/api";

export default function Cargos() {
  const [cargos, setCargos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const [cargoExpandido, setCargoExpandido] = useState(null);
  const [municipiosPorCargo, setMunicipiosPorCargo] = useState({});
  const [formData, setFormData] = useState({ 
    nombre_cargo: "", 
    salario: "",
    municipios: []
  });

  useEffect(() => {
    fetchCargos();
    fetchMunicipios();
  }, []);

  // Limpiar formulario cuando se cierra
  useEffect(() => {
    if (!showForm) {
      setFormData({ nombre_cargo: "", salario: "", municipios: [] });
      setEditingId(null);
    }
  }, [showForm]);

  const fetchCargos = async () => {
    setLoading(true);
    try {
      const { data } = await api.getCargos();
      setCargos(data.data || []);
    } catch (error) {
      showAlert("Error al cargar cargos", "danger");
    }
    setLoading(false);
  };

  const fetchMunicipios = async () => {
    try {
      const { data } = await api.getMunicipios();
      setMunicipios(data.data || []);
    } catch (error) {
      console.error("Error cargando municipios:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMunicipioToggle = (id_municipio) => {
    setFormData(prev => {
      const municipiosActuales = [...prev.municipios];
      const index = municipiosActuales.indexOf(id_municipio);
      
      if (index > -1) {
        // Si ya está seleccionado, quitarlo
        municipiosActuales.splice(index, 1);
      } else {
        // Si no está seleccionado, agregarlo
        municipiosActuales.push(id_municipio);
      }
      
      return { ...prev, municipios: municipiosActuales };
    });
  };

  const handleSelectAll = () => {
    if (formData.municipios.length === municipios.length) {
      // Si todos están seleccionados, deseleccionar todos
      setFormData({ ...formData, municipios: [] });
    } else {
      // Si no todos están seleccionados, seleccionar todos
      setFormData({ ...formData, municipios: municipios.map(m => m.id_municipio) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre_cargo.trim()) {
      showAlert("El nombre del cargo es requerido", "danger");
      return;
    }
    
    if (!formData.salario || formData.salario <= 0) {
      showAlert("El salario debe ser mayor a 0", "danger");
      return;
    }
    
    if (formData.municipios.length === 0) {
      showAlert("Debes seleccionar al menos un municipio", "danger");
      return;
    }

    try {
      if (editingId) {
        await api.updateCargo(editingId, formData);
        showAlert("Cargo actualizado", "success");
      } else {
        await api.createCargo(formData);
        showAlert("Cargo creado", "success");
      }
      resetForm();
      fetchCargos();
    } catch (error) {
      showAlert(error.response?.data?.error || "Error al guardar", "danger");
    }
  };

  const handleEdit = async (cargo) => {
    try {
      // Cargar los municipios asociados al cargo
      const { data } = await api.getMunicipiosByCargo(cargo.id_cargo);
      
      if (data.success && data.data.length > 0) {
        const municipiosIds = data.data.map(m => m.id_municipio);
        const salario = data.data[0].salario; // Asumiendo que todos tienen el mismo salario
        
        setFormData({
          nombre_cargo: cargo.nombre_cargo,
          salario: salario,
          municipios: municipiosIds
        });
      } else {
        setFormData({
          nombre_cargo: cargo.nombre_cargo,
          salario: "",
          municipios: []
        });
      }
      
      setEditingId(cargo.id_cargo);
      setShowForm(true);
    } catch (error) {
      console.error("Error cargando datos del cargo:", error);
      showAlert("Error al cargar los datos del cargo", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este cargo? Se eliminarán también sus salarios asociados.")) {
      try {
        await api.deleteCargo(id);
        showAlert("Cargo eliminado", "success");
        fetchCargos();
      } catch (error) {
        showAlert("Error al eliminar", "danger");
      }
    }
  };

  const toggleMunicipios = async (id_cargo) => {
    if (cargoExpandido === id_cargo) {
      // Si el cargo ya está expandido, colapsarlo
      setCargoExpandido(null);
    } else {
      // Si no está expandido, expandir este y colapsar cualquier otro
      setCargoExpandido(id_cargo);
      
      // Cargar municipios si no existen
      if (!municipiosPorCargo[id_cargo]) {
        try {
          const { data } = await api.getMunicipiosByCargo(id_cargo);
          if (data.success) {
            setMunicipiosPorCargo(prev => ({
              ...prev,
              [id_cargo]: data.data
            }));
          }
        } catch (error) {
          console.error("Error cargando municipios:", error);
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({ nombre_cargo: "", salario: "", municipios: [] });
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
        <h1>💼 Gestión de Cargos</h1>
        <p>Administra los cargos, salarios y municipios asociados</p>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? "✕ Cancelar" : "➕ Nuevo Cargo"}
      </button>

      {showForm && (
        <div className="card" style={{ marginTop: "2rem", background: "var(--light-blue)" }}>
          <h3>{editingId ? "Editar Cargo" : "Crear Nuevo Cargo"}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label>Nombre del Cargo *</label>
              <input
                type="text"
                name="nombre_cargo"
                value={formData.nombre_cargo}
                onChange={handleInputChange}
                placeholder="Ej: Docente de Primaria"
                required
              />
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

            <div className="form-group">
              <label>Municipios * (Selecciona uno o más)</label>
              <div style={{ 
                border: "2px solid var(--border-color)", 
                borderRadius: "6px", 
                padding: "1rem",
                maxHeight: "300px",
                overflowY: "auto",
                background: "white"
              }}>
                <div style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #e0e0e0" }}>
                  <label style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "var(--primary-blue)"
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.municipios.length === municipios.length && municipios.length > 0}
                      onChange={handleSelectAll}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    {formData.municipios.length === municipios.length && municipios.length > 0
                      ? "Deseleccionar todos"
                      : "Seleccionar todos"}
                  </label>
                </div>

                {municipios.map((municipio) => (
                  <div key={municipio.id_municipio} style={{ marginBottom: "0.5rem" }}>
                    <label style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem",
                      cursor: "pointer",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <input
                        type="checkbox"
                        checked={formData.municipios.includes(municipio.id_municipio)}
                        onChange={() => handleMunicipioToggle(municipio.id_municipio)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span>{municipio.nombre_municipio} - {municipio.departamento}</span>
                    </label>
                  </div>
                ))}
              </div>
              <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
                Municipios seleccionados: {formData.municipios.length}
              </small>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-success">
                {editingId ? "Actualizar" : "Crear"} Cargo
              </button>
              <button type="button" className="btn btn-warning" onClick={resetForm}>
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando...</div>
      ) : cargos.length === 0 ? (
        <div className="empty-state">
          <p>No hay cargos registrados</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear el primer cargo
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {cargos.map((cargo) => {
            const estaExpandido = cargoExpandido === cargo.id_cargo;
            
            return (
              <div key={cargo.id_cargo} className="card">
                <h4 style={{ color: "var(--primary-blue)", marginBottom: "1rem" }}>
                  {cargo.nombre_cargo}
                </h4>
                
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => toggleMunicipios(cargo.id_cargo)}
                  style={{ marginBottom: "1rem", width: "100%" }}
                >
                  {estaExpandido ? "▼ Ocultar" : "▶ Ver"} Municipios y Salarios
                </button>

                {estaExpandido && (
                  <div style={{ 
                    background: "#f9f9f9", 
                    padding: "1rem", 
                    borderRadius: "6px",
                    marginBottom: "1rem",
                    maxHeight: "200px",
                    overflowY: "auto"
                  }}>
                    {municipiosPorCargo[cargo.id_cargo] ? (
                      municipiosPorCargo[cargo.id_cargo].length > 0 ? (
                        municipiosPorCargo[cargo.id_cargo].map((item, index) => (
                          <div key={index} style={{ 
                            padding: "0.5rem",
                            borderBottom: index < municipiosPorCargo[cargo.id_cargo].length - 1 ? "1px solid #ddd" : "none"
                          }}>
                            <strong>{item.nombre_municipio}</strong>
                            <br />
                            <small style={{ color: "#666" }}>{item.departamento}</small>
                            <br />
                            <span style={{ color: "var(--primary-blue)", fontWeight: "bold" }}>
                              ${item.salario?.toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "#999", textAlign: "center", margin: 0 }}>
                          Sin municipios asociados
                        </p>
                      )
                    ) : (
                      <div className="loading-municipios">Cargando municipios...</div>
                    )}
                  </div>
                )}

                <div className="action-buttons">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEdit(cargo)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(cargo.id_cargo)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}