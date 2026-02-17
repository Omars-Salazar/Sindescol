import { useState, useEffect } from "react";
import * as api from "../../services/api";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import "./ModalCrearAfiliado.css";

export const ModalEditarAfiliado = ({ isOpen, onClose, afiliadoId, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("personales");
  const [loading, setLoading] = useState(false);
  const [salarioCalculado, setSalarioCalculado] = useState(null);
  const [formData, setFormData] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    religion_id: "",
    foto_afiliado: null,
    direccion_domicilio: "",
    municipio_domicilio: "",
    direccion_residencia: "",
    municipio_residencia: "",
    id_eps: "",
    id_arl: "",
    id_pension: "",
    id_cesantias: "",
    id_cargo: "",
    fecha_afiliacion: "",
    municipio_trabajo: "",
    departamento_trabajo: "",
    id_institucion: "",
    correo_institucional: "",
    telefono_institucional: "",
    direccion_institucion: "",
    nombre_rector: "",
    tipo_documento: "",
    numero_resolucion: "",
    fecha_resolucion: "",
    archivo_nombramiento: null,
    numero_acta: "",
    fecha_acta: "",
    archivo_posesion: null,
    otros_cargos: []
  });

  const [otroCargo, setOtroCargo] = useState({
    nombre_cargo: "",
    fecha_inicio: "",
    fecha_fin: ""
  });

  const [opciones, setOpciones] = useState({
    religiones: [],
    municipios: [],
    eps: [],
    arl: [],
    pension: [],
    cesantias: [],
    cargos: [],
    instituciones: [],
    departamentos: [],
  });

  const usuarioData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const usuario = usuarioData ? JSON.parse(usuarioData) : null;

  useEffect(() => {
    if (isOpen && afiliadoId) {
      cargarDatosAfiliado();
      cargarOpciones();
    }
  }, [isOpen, afiliadoId]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Efecto para cargar cargos disponibles según el municipio seleccionado
  useEffect(() => {
    const cargarCargosPorMunicipio = async () => {
      if (formData.municipio_trabajo && !loading) {
        try {
          const response = await fetchWithAuth(`/api/cargos/municipio/${formData.municipio_trabajo}`);
          if (!response.ok) {
            console.error('Error al obtener cargos por municipio');
            setOpciones(prev => ({ ...prev, cargos: [] }));
            return;
          }
          
          const data = await response.json();
          setOpciones(prev => ({ ...prev, cargos: data.data || [] }));
          console.log(`✅ Cargos disponibles para municipio ${formData.municipio_trabajo}:`, data.data?.length || 0);
        } catch (error) {
          console.error('Error cargando cargos por municipio:', error);
          setOpciones(prev => ({ ...prev, cargos: [] }));
        }
      } else if (!formData.municipio_trabajo && !loading) {
        // Si no hay municipio seleccionado, cargar todos los cargos
        cargarOpciones();
      }
    };

    cargarCargosPorMunicipio();
  }, [formData.municipio_trabajo]);

  // Calcular salario cuando cambie el cargo o municipio en edición
  useEffect(() => {
    const calcularSalario = async () => {
      if (formData.id_cargo && formData.municipio_trabajo) {
        try {
          const response = await fetchWithAuth(`/api/salarios?id_cargo=${formData.id_cargo}&id_municipio=${formData.municipio_trabajo}`);
          const data = await response.json();
          
          if (data.success && data.data.length > 0) {
            setSalarioCalculado(data.data[0].salario);
          } else {
            setSalarioCalculado(null);
          }
        } catch (error) {
          console.error("Error consultando salario:", error);
          setSalarioCalculado(null);
        }
      } else {
        setSalarioCalculado(null);
      }
    };

    calcularSalario();
  }, [formData.id_cargo, formData.municipio_trabajo]);

  const cargarDatosAfiliado = async () => {
    setLoading(true);
    try {
      // Cargar datos del afiliado
      const { data } = await api.getAfiliadoById(afiliadoId);
      
      if (data.success) {
        const afiliado = data.data;
        const formatFecha = (fecha) => {
          if (!fecha) return "";
          const date = new Date(fecha);
          return date.toISOString().split('T')[0];
        };

        setFormData({
          cedula: afiliado.cedula || "",
          nombres: afiliado.nombres || "",
          apellidos: afiliado.apellidos || "",
          fecha_nacimiento: formatFecha(afiliado.fecha_nacimiento),
          religion_id: afiliado.religion_id || "",
          foto_afiliado: null,
          direccion_domicilio: afiliado.direccion_domicilio || "",
          municipio_domicilio: afiliado.municipio_domicilio || "",
          direccion_residencia: afiliado.direccion_residencia || "",
          municipio_residencia: afiliado.municipio_residencia || "",
          id_eps: afiliado.id_eps || "",
          id_arl: afiliado.id_arl || "",
          id_pension: afiliado.id_pension || "",
          id_cesantias: afiliado.id_cesantias || "",
          id_cargo: afiliado.id_cargo || "",
          fecha_afiliacion: formatFecha(afiliado.fecha_afiliacion),
          municipio_trabajo: afiliado.municipio_trabajo || "",
          departamento_trabajo: afiliado.departamento_trabajo || "",
          id_institucion: afiliado.id_institucion || "",
          correo_institucional: afiliado.correo_institucional || "",
          telefono_institucional: afiliado.telefono_institucional || "",
          direccion_institucion: afiliado.direccion_institucion || "",
          nombre_rector: "",
          tipo_documento: "",
          numero_resolucion: "",
          fecha_resolucion: "",
          archivo_nombramiento: null,
          numero_acta: "",
          fecha_acta: "",
          archivo_posesion: null,
          otros_cargos: []
        });
      }

      // Cargar actas de nombramiento
      const { data: dataNombramiento } = await api.getActaNombramiento(afiliadoId);
      if (dataNombramiento.success && dataNombramiento.data.length > 0) {
        const acta = dataNombramiento.data[0];
        const formatFecha = (fecha) => {
          if (!fecha) return "";
          const date = new Date(fecha);
          return date.toISOString().split('T')[0];
        };
        
        setFormData(prev => ({
          ...prev,
          tipo_documento: acta.tipo_documento || "",
          numero_resolucion: acta.numero_resolucion || "",
          fecha_resolucion: formatFecha(acta.fecha_resolucion)
        }));
      }

      // Cargar actas de posesión
      const { data: dataPosesion } = await api.getActaPosesion(afiliadoId);
      if (dataPosesion.success && dataPosesion.data.length > 0) {
        const acta = dataPosesion.data[0];
        const formatFecha = (fecha) => {
          if (!fecha) return "";
          const date = new Date(fecha);
          return date.toISOString().split('T')[0];
        };
        
        setFormData(prev => ({
          ...prev,
          numero_acta: acta.numero_acta || "",
          fecha_acta: formatFecha(acta.fecha_acta)
        }));
      }

      // Cargar otros cargos
      const { data: dataOtros } = await api.getOtrosCargos(afiliadoId);
      if (dataOtros.success && dataOtros.data) {
        setFormData(prev => ({
          ...prev,
          otros_cargos: dataOtros.data.map(cargo => ({
            nombre_cargo: cargo.nombre_cargo,
            fecha_inicio: cargo.fecha_inicio ? new Date(cargo.fecha_inicio).toISOString().split('T')[0] : "",
            fecha_fin: cargo.fecha_fin ? new Date(cargo.fecha_fin).toISOString().split('T')[0] : ""
          }))
        }));
      }

      // Cargar rector (si existe)
      if (data.success && data.data.id_institucion) {
        const { data: dataRector } = await api.getRectorByInstitucion(data.data.id_institucion);
        if (dataRector.success && dataRector.data) {
          setFormData(prev => ({
            ...prev,
            nombre_rector: dataRector.data.nombre_rector || ""
          }));
        }
      }

    } catch (error) {
      console.error("Error cargando datos del afiliado:", error);
      alert("Error al cargar los datos del afiliado");
    } finally {
      setLoading(false);
    }
  };

  const cargarOpciones = async () => {
    try {
      const endpoints = {
        religiones: "/api/religiones",
        municipios: "/api/municipios",
        eps: "/api/eps",
        arl: "/api/arl",
        pension: "/api/pension",
        cesantias: "/api/cesantias",
        cargos: "/api/cargos",
        instituciones: "/api/instituciones",
        departamentos: "/api/departamentos",
      };

      const data = {};
      for (const [key, url] of Object.entries(endpoints)) {
        try {
          const response = await fetchWithAuth(url);
          if (!response.ok) {
            data[key] = [];
            continue;
          }
          const text = await response.text();
          let result;
          try {
            result = JSON.parse(text);
            data[key] = result.data || result || [];
          } catch (e) {
            data[key] = [];
          }
        } catch (err) {
          console.error(`Error cargando ${key}:`, err);
          data[key] = [];
        }
      }

      setOpciones(data);
    } catch (error) {
      console.error("Error cargando opciones:", error);
    }
  };

  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleChange = async (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file" && files && files.length > 0) {
      const file = files[0];
      try {
        const base64 = await convertirArchivoABase64(file);
        setFormData((prev) => ({
          ...prev,
          [name]: base64,
        }));
      } catch (error) {
        console.error(`Error convirtiendo archivo ${name}:`, error);
        alert(`Error al procesar el archivo ${name}`);
      }
    } else {
      // Si se cambia el departamento, resetear municipio y cargo
      if (name === 'departamento_trabajo') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          municipio_trabajo: '',
          id_cargo: ''
        }));
        setSalarioCalculado(null);
      }
      // Si se cambia el municipio, resetear el cargo
      else if (name === 'municipio_trabajo') {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          id_cargo: ''
        }));
        setSalarioCalculado(null);
      }
      else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleOtroCargoChange = (e) => {
    const { name, value } = e.target;
    setOtroCargo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarOtroCargo = () => {
    if (otroCargo.nombre_cargo && otroCargo.fecha_inicio) {
      setFormData((prev) => ({
        ...prev,
        otros_cargos: [...prev.otros_cargos, otroCargo],
      }));
      setOtroCargo({ nombre_cargo: "", fecha_inicio: "", fecha_fin: "" });
    } else {
      alert("Por favor completa el nombre del cargo y la fecha de inicio");
    }
  };

  const eliminarOtroCargo = (index) => {
    setFormData((prev) => ({
      ...prev,
      otros_cargos: prev.otros_cargos.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      cedula: "",
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      religion_id: "",
      foto_afiliado: null,
      direccion_domicilio: "",
      municipio_domicilio: "",
      direccion_residencia: "",
      municipio_residencia: "",
      id_eps: "",
      id_arl: "",
      id_pension: "",
      id_cesantias: "",
      id_cargo: "",
      fecha_afiliacion: "",
      municipio_trabajo: "",
      departamento_trabajo: "",
      id_institucion: "",
      correo_institucional: "",
      telefono_institucional: "",
      direccion_institucion: "",
      nombre_rector: "",
      tipo_documento: "",
      numero_resolucion: "",
      fecha_resolucion: "",
      archivo_nombramiento: null,
      numero_acta: "",
      fecha_acta: "",
      archivo_posesion: null,
      otros_cargos: []
    });
    setOtroCargo({ nombre_cargo: "", fecha_inicio: "", fecha_fin: "" });
    setSalarioCalculado(null);
    setActiveTab("personales");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cedula || !formData.nombres || !formData.apellidos || !formData.id_cargo) {
      alert("Faltan campos requeridos");
      return;
    }

    onSubmit(afiliadoId, formData);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>Cargando datos del afiliado...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Afiliado</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "personales" ? "active" : ""}`}
            onClick={() => setActiveTab("personales")}
          >
            Datos Personales
          </button>
          <button
            className={`tab-btn ${activeTab === "seguridad" ? "active" : ""}`}
            onClick={() => setActiveTab("seguridad")}
          >
            Seguridad Social
          </button>
          <button
            className={`tab-btn ${activeTab === "laborales" ? "active" : ""}`}
            onClick={() => setActiveTab("laborales")}
          >
            Datos Laborales
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {activeTab === "personales" && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Cédula *</label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Religión</label>
                  <select
                    name="religion_id"
                    value={formData.religion_id}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {opciones.religiones.map((r) => (
                      <option key={r.id_religion} value={r.id_religion}>
                        {r.nombre_religion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cambiar Foto</label>
                  <input
                    type="file"
                    name="foto_afiliado"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <small style={{ color: "#666" }}>Dejar vacío para mantener la foto actual</small>
                </div>
              </div>

              <fieldset className="fieldset">
                <legend>Domicilio</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion_domicilio"
                      value={formData.direccion_domicilio}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Municipio</label>
                    <input
                      type="text"
                      name="municipio_domicilio"
                      value={formData.municipio_domicilio}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend>Residencia</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion_residencia"
                      value={formData.direccion_residencia}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Municipio</label>
                    <input
                      type="text"
                      name="municipio_residencia"
                      value={formData.municipio_residencia}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {activeTab === "seguridad" && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group">
                  <label>EPS</label>
                  <select name="id_eps" value={formData.id_eps} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {opciones.eps.map((e) => (
                      <option key={e.id_eps} value={e.id_eps}>{e.nombre_eps}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ARL</label>
                  <select name="id_arl" value={formData.id_arl} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {opciones.arl.map((a) => (
                      <option key={a.id_arl} value={a.id_arl}>{a.nombre_arl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pensión</label>
                  <select name="id_pension" value={formData.id_pension} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {opciones.pension.map((p) => (
                      <option key={p.id_pension} value={p.id_pension}>{p.nombre_pension}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cesantías</label>
                  <select name="id_cesantias" value={formData.id_cesantias} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {opciones.cesantias.map((c) => (
                      <option key={c.id_cesantias} value={c.id_cesantias}>{c.nombre_cesantias}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "laborales" && (
            <div className="tab-content">
              <fieldset className="fieldset">
                <legend>Información Laboral</legend>
                
                <div className="labor-steps">
                  {/* PASO 1: Departamento (solo para presidencia_nacional) */}
                  {usuario?.rol === 'presidencia_nacional' && (
                    <div className={`step-card ${formData.departamento_trabajo ? 'completed' : ''}`}>
                      <div className="step-header">
                        <div className="step-number">1</div>
                        <span className="step-label">Departamento de Trabajo</span>
                        <span className="step-hint">Requerido</span>
                      </div>
                      <div className="step-content">
                        <select
                          name="departamento_trabajo"
                          value={formData.departamento_trabajo}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Seleccionar departamento...</option>
                          {opciones.departamentos.map((d) => (
                            <option key={d.departamento} value={d.departamento}>{d.departamento}</option>
                          ))}
                        </select>
                        <small>Selecciona el departamento donde labora el afiliado</small>
                      </div>
                    </div>
                  )}
                  
                  {/* PASO 2: Municipio */}
                  <div className={`step-card ${formData.municipio_trabajo ? 'completed' : ''} ${usuario?.rol === 'presidencia_nacional' && !formData.departamento_trabajo ? 'disabled' : ''}`}>
                    <div className="step-header">
                      <div className="step-number">{usuario?.rol === 'presidencia_nacional' ? '2' : '1'}</div>
                      <span className="step-label">Municipio de Trabajo</span>
                      <span className="step-hint">Requerido</span>
                    </div>
                    <div className="step-content">
                      <select 
                        name="municipio_trabajo" 
                        value={formData.municipio_trabajo} 
                        onChange={handleChange}
                        required
                        disabled={usuario?.rol === 'presidencia_nacional' && !formData.departamento_trabajo}
                      >
                        <option value="">
                          {usuario?.rol === 'presidencia_nacional' && !formData.departamento_trabajo
                            ? "⚠️ Selecciona un departamento primero"
                            : "Selecciona el municipio de trabajo..."}
                        </option>
                        {opciones.municipios
                          .filter((m) => {
                            if (usuario?.rol === 'presidencia_nacional') {
                              return formData.departamento_trabajo && m.departamento === formData.departamento_trabajo;
                            } else if (usuario?.departamento) {
                              return m.departamento === usuario.departamento;
                            }
                            return true;
                          })
                          .map((m) => (
                            <option key={m.id_municipio} value={m.id_municipio}>{m.nombre_municipio}</option>
                          ))}
                      </select>
                      <small>El municipio debe estar en el departamento seleccionado</small>
                    </div>
                  </div>
                  
                  {/* PASO 3: Cargo */}
                  <div className={`step-card ${formData.id_cargo ? 'completed' : ''} ${!formData.municipio_trabajo ? 'disabled' : ''}`}>
                    <div className="step-header">
                      <div className="step-number">{usuario?.rol === 'presidencia_nacional' ? '3' : '2'}</div>
                      <span className="step-label">Cargo</span>
                      <span className="step-hint">Requerido</span>
                    </div>
                    <div className="step-content">
                      <select 
                        name="id_cargo" 
                        value={formData.id_cargo} 
                        onChange={handleChange} 
                        required
                        disabled={!formData.municipio_trabajo}
                      >
                        <option value="">
                          {!formData.municipio_trabajo
                            ? "⚠️ Selecciona un municipio primero"
                            : opciones.cargos.length === 0
                              ? "⚠️ No hay cargos disponibles para este municipio"
                              : "Selecciona un cargo..."}
                        </option>
                        {opciones.cargos.map((c) => (
                          <option key={c.id_cargo} value={c.id_cargo}>{c.nombre_cargo}</option>
                        ))}
                      </select>
                      {formData.municipio_trabajo && opciones.cargos.length > 0 && (
                        <div className="availability-badge">
                          ✓ {opciones.cargos.length} cargo(s) disponible(s)
                        </div>
                      )}
                      {formData.municipio_trabajo && opciones.cargos.length === 0 && (
                        <div className="availability-badge empty">
                          ✕ Ningún cargo disponible en este municipio
                        </div>
                      )}
                      <small>Los cargos mostrados están disponibles en el municipio seleccionado</small>
                    </div>
                  </div>
                </div>
                
                {/* SALARIO */}
                <div className="step-card">
                  <div className="step-header">
                    <div style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>💰</div>
                    <span className="step-label">Salario Asociado</span>
                  </div>
                  <div className="step-content">
                    <input
                      type="text"
                      value={salarioCalculado ? `$${salarioCalculado.toLocaleString()}` : "Selecciona cargo y municipio"}
                      disabled
                      style={{
                        backgroundColor: salarioCalculado ? '#f0fdf4' : '#f5f5f5',
                        color: salarioCalculado ? '#16a34a' : '#666',
                        fontWeight: salarioCalculado ? '700' : '600',
                        fontSize: salarioCalculado ? '16px' : '14px',
                        cursor: 'not-allowed',
                        borderColor: salarioCalculado ? '#86efac' : '#ddd'
                      }}
                    />
                    {salarioCalculado && (
                      <div className="availability-badge">
                        ✓ Salario encontrado en la base de datos
                      </div>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* FECHA DE AFILIACIÓN */}
              <fieldset className="fieldset">
                <legend>Información Adicional</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Afiliación</label>
                    <input
                      type="date"
                      name="fecha_afiliacion"
                      value={formData.fecha_afiliacion}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ACTAS DE NOMBRAMIENTO */}
              <fieldset className="fieldset">
                <legend>Acta de Nombramiento</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Documento</label>
                    <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                      <option value="">Seleccionar...</option>
                      <option value="Resolución">Resolución</option>
                      <option value="Decreto">Decreto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Número de Resolución/Decreto</label>
                    <input
                      type="text"
                      name="numero_resolucion"
                      value={formData.numero_resolucion}
                      onChange={handleChange}
                      placeholder="Ej: RES-2020-001"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Resolución/Decreto</label>
                    <input
                      type="date"
                      name="fecha_resolucion"
                      value={formData.fecha_resolucion}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cambiar Archivo</label>
                    <input
                      type="file"
                      name="archivo_nombramiento"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <small style={{ color: "#666" }}>Dejar vacío para mantener el archivo actual</small>
                  </div>
                </div>
              </fieldset>

              {/* ACTAS DE POSESIÓN */}
              <fieldset className="fieldset">
                <legend>Actas de Posesión</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Número de Acta</label>
                    <input
                      type="text"
                      name="numero_acta"
                      value={formData.numero_acta}
                      onChange={handleChange}
                      placeholder="Ej: ACTA-2020-001"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha del Acta</label>
                    <input
                      type="date"
                      name="fecha_acta"
                      value={formData.fecha_acta}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cambiar Archivo</label>
                    <input
                      type="file"
                      name="archivo_posesion"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <small style={{ color: "#666" }}>Dejar vacío para mantener el archivo actual</small>
                  </div>
                </div>
              </fieldset>

              {/* INSTITUCIÓN EDUCATIVA */}
              <fieldset className="fieldset">
                <legend>Institución Educativa</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institución</label>
                    <select name="id_institucion" value={formData.id_institucion} onChange={handleChange}>
                      <option value="">Seleccionar...</option>
                      {opciones.instituciones.map((i) => (
                        <option key={i.id_institucion} value={i.id_institucion}>{i.nombre_institucion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Correo Institucional</label>
                    <input
                      type="email"
                      name="correo_institucional"
                      value={formData.correo_institucional}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono Institucional</label>
                    <input
                      type="tel"
                      name="telefono_institucional"
                      value={formData.telefono_institucional}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion_institucion"
                      value={formData.direccion_institucion}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* RECTOR */}
              <fieldset className="fieldset">
                <legend>Rector</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre del Rector</label>
                    <input
                      type="text"
                      name="nombre_rector"
                      value={formData.nombre_rector}
                      onChange={handleChange}
                      placeholder="Ej: Dr. Carlos Mendoza"
                    />
                  </div>
                </div>
              </fieldset>

              {/* OTROS CARGOS */}
              <fieldset className="fieldset">
                <legend>Otros Cargos</legend>
                <div className="form-group">
                  <label>Nombre del Cargo</label>
                  <input
                    type="text"
                    name="nombre_cargo"
                    value={otroCargo.nombre_cargo}
                    onChange={handleOtroCargoChange}
                    placeholder="Ej: Auxiliar de Sistemas"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Inicio</label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={otroCargo.fecha_inicio}
                      onChange={handleOtroCargoChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Fin</label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={otroCargo.fecha_fin}
                      onChange={handleOtroCargoChange}
                    />
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                      type="button"
                      className="btn-submit"
                      onClick={agregarOtroCargo}
                      style={{ width: "100%" }}
                    >
                      + Agregar Cargo
                    </button>
                  </div>
                </div>

                {formData.otros_cargos.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ fontSize: "14px", marginBottom: "0.5rem" }}>Cargos Actuales:</h4>
                    {formData.otros_cargos.map((cargo, index) => (
                      <div
                        key={index}
                        style={{
                          background: "#f5f5f5",
                          padding: "0.75rem",
                          borderRadius: "4px",
                          marginBottom: "0.5rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <strong>{cargo.nombre_cargo}</strong>
                          <br />
                          <small>
                            {cargo.fecha_inicio} - {cargo.fecha_fin || "Actual"}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => eliminarOtroCargo(index)}
                          style={{ padding: "0.5rem 1rem" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};