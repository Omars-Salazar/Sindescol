import { useState, useEffect } from "react";
import * as api from "../services/api";

export default function Cargos() {
  const [cargos, setCargos] = useState([]);
  const [municipiosPorCargo, setMunicipiosPorCargo] = useState({});
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  // ⚠️ SOLO UN CARGO EXPANDIDO
  const [cargoExpandido, setCargoExpandido] = useState(null);

  const [formData, setFormData] = useState({
    nombre_cargo: "",
    salario: "",
    municipios: []
  });

  useEffect(() => {
    fetchCargos();
    fetchMunicipios();
  }, []);

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
    } catch {
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

  const handleMunicipioToggle = (id) => {
    setFormData(prev => {
      const copia = [...prev.municipios];
      const index = copia.indexOf(id);
      index > -1 ? copia.splice(index, 1) : copia.push(id);
      return { ...prev, municipios: copia };
    });
  };

  const handleSelectAll = () => {
    setFormData({
      ...formData,
      municipios:
        formData.municipios.length === municipios.length
          ? []
          : municipios.map(m => m.id_municipio)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const { data } = await api.getMunicipiosByCargo(cargo.id_cargo);

      if (data.success && data.data.length > 0) {
        setFormData({
          nombre_cargo: cargo.nombre_cargo,
          salario: data.data[0].salario,
          municipios: data.data.map(m => m.id_municipio)
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
    } catch {
      showAlert("Error al cargar datos del cargo", "danger");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este cargo? Se eliminarán también sus salarios asociados.")) {
      try {
        await api.deleteCargo(id);
        showAlert("Cargo eliminado", "success");
        fetchCargos();
      } catch {
        showAlert("Error al eliminar", "danger");
      }
    }
  };

  const toggleMunicipios = async (id_cargo) => {
    if (cargoExpandido === id_cargo) {
      setCargoExpandido(null);
    } else {
      setCargoExpandido(id_cargo);

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
        <label>Municipios *</label>
        <div
          style={{
            border: "2px solid var(--border-color)",
            borderRadius: "6px",
            padding: "1rem",
            maxHeight: "300px",
            overflowY: "auto",
            background: "white"
          }}
        >
          <div style={{ marginBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
            <label style={{ fontWeight: "bold", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={
                  formData.municipios.length === municipios.length &&
                  municipios.length > 0
                }
                onChange={handleSelectAll}
              />{" "}
              Seleccionar todos
            </label>
          </div>

          {municipios.map((m) => (
            <label key={m.id_municipio} style={{ display: "block", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.municipios.includes(m.id_municipio)}
                onChange={() => handleMunicipioToggle(m.id_municipio)}
              />{" "}
              {m.nombre_municipio} - {m.departamento}
            </label>
          ))}
        </div>
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
        </div>
      ) : (
        /* ✅ ÚNICO CAMBIO REAL: GRID → FLEX */
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            alignItems: "flex-start"
          }}
        >
          {cargos.map((cargo) => {
            const estaExpandido = cargoExpandido === cargo.id_cargo;
            const municipiosCargados = municipiosPorCargo[cargo.id_cargo];

            return (
              <div
                key={cargo.id_cargo}
                className="card"
                style={{
                  flex: "1 1 350px",
                  maxWidth: "450px"
                }}
              >
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
                  <div
                    style={{
                      background: "#f9f9f9",
                      padding: "1rem",
                      borderRadius: "6px",
                      marginBottom: "1rem",
                      maxHeight: "200px",
                      overflowY: "auto"
                    }}
                  >
                    {!municipiosCargados ? (
                      <div style={{ textAlign: "center", color: "#666" }}>
                        Cargando municipios...
                      </div>
                    ) : municipiosCargados.length === 0 ? (
                      <p style={{ color: "#999", textAlign: "center", margin: 0 }}>
                        Sin municipios asociados
                      </p>
                    ) : (
                      municipiosCargados.map((m, i) => (
                        <div key={i} style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>
                          <strong>{m.nombre_municipio}</strong>
                          <br />
                          <small>{m.departamento}</small>
                          <br />
                          <span style={{ color: "var(--primary-blue)", fontWeight: "bold" }}>
                            ${m.salario?.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="action-buttons">
                  <button className="btn btn-warning btn-sm" onClick={() => handleEdit(cargo)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cargo.id_cargo)}>
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
