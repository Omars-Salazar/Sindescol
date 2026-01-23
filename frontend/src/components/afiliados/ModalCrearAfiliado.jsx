import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import "./ModalCrearAfiliado.css";

export const ModalCrearAfiliado = ({ isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("personales");
  const [completedTabs, setCompletedTabs] = useState({
    personales: false,
    seguridad: false,
    laborales: false
  });

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

  // Estados adicionales
  const [salarioCalculado, setSalarioCalculado] = useState(null);
  const [cargandoSalario, setCargandoSalario] = useState(false);
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
  });

  useEffect(() => {
    if (isOpen) {
      cargarOpciones();
    }
  }, [isOpen]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // OPTIMIZACIÓN: Efecto para calcular salario (no bloqueante)
  useEffect(() => {
  const calcularSalario = async () => {
    if (formData.id_cargo && formData.municipio_trabajo) {
      try {
        setCargandoSalario(true);
        const response = await fetchWithAuth(`/api/salarios?id_cargo=${formData.id_cargo}&id_municipio=${formData.municipio_trabajo}`);
        
        if (!response.ok) {
          setSalarioCalculado(null);
          return;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const salario = data.data.find(s => 
            parseInt(s.id_cargo) === parseInt(formData.id_cargo) && 
            parseInt(s.id_municipio) === parseInt(formData.municipio_trabajo)
          );
          
          setSalarioCalculado(salario ? salario.salario : null);
        } else {
          setSalarioCalculado(null);
        }
      } catch (error) {
        console.error("Error calculando salario:", error);
        setSalarioCalculado(null);
      } finally {
        setCargandoSalario(false);
      }
    } else {
      setSalarioCalculado(null);
      setCargandoSalario(false);
    }
  };

  calcularSalario();
}, [formData.id_cargo, formData.municipio_trabajo]);

  // OPTIMIZACIÓN: Cargar todas las opciones en paralelo
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
    };

    const promesas = Object.entries(endpoints).map(async ([key, url]) => {
      try {
        const response = await fetchWithAuth(url);
        if (!response.ok) return [key, []];
        
        const text = await response.text();
        const result = JSON.parse(text);
        return [key, result.data || result || []];
      } catch (err) {
        console.error(`Error cargando ${key}:`, err);
        return [key, []];
      }
    });

    const resultados = await Promise.all(promesas);
    const data = {};
    resultados.forEach(([key, value]) => {
      data[key] = value;
    });

    setOpciones(data);
  } catch (error) {
    console.error("Error cargando opciones:", error);
  }
};

  const validarPestana = (pestana) => {
    if (pestana === "personales") {
      if (!formData.cedula || !formData.nombres || !formData.apellidos) {
        alert("Por favor completa los campos obligatorios: Cédula, Nombres y Apellidos");
        return false;
      }
      return true;
    }

    if (pestana === "seguridad") {
      return true;
    }

    if (pestana === "laborales") {
      if (!formData.id_cargo) {
        alert("Por favor selecciona un cargo");
        return false;
      }
      return true;
    }

    return true;
  };

  const cambiarPestana = (nuevaPestana) => {
    const orden = ["personales", "seguridad", "laborales"];
    const indexActual = orden.indexOf(activeTab);
    const indexNuevo = orden.indexOf(nuevaPestana);

    if (indexNuevo < indexActual) {
      setActiveTab(nuevaPestana);
      return;
    }

    if (!validarPestana(activeTab)) {
      return;
    }

    setCompletedTabs(prev => ({
      ...prev,
      [activeTab]: true
    }));

    setActiveTab(nuevaPestana);
  };

  const siguientePestana = () => {
    if (activeTab === "personales") {
      cambiarPestana("seguridad");
    } else if (activeTab === "seguridad") {
      cambiarPestana("laborales");
    }
  };

  const pestanaAnterior = () => {
    if (activeTab === "seguridad") {
      setActiveTab("personales");
    } else if (activeTab === "laborales") {
      setActiveTab("seguridad");
    }
  };

  // OPTIMIZACIÓN: Validar tamaño antes de convertir
  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('El archivo es demasiado grande (máx 5MB)'));
        return;
      }

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
        alert(error.message || `Error al procesar el archivo ${name}`);
        e.target.value = '';
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cedula || !formData.nombres || !formData.apellidos || !formData.id_cargo) {
      alert("Faltan campos requeridos. Por favor completa todos los pasos.");
      return;
    }

    onSubmit(formData);
    resetForm();
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
    setCargandoSalario(false);
    setActiveTab("personales");
    setCompletedTabs({
      personales: false,
      seguridad: false,
      laborales: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear Nuevo Afiliado</h2>
          <button className="close-btn" onClick={() => { onClose(); resetForm(); }}>
            ×
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "personales" ? "active" : ""} ${completedTabs.personales ? "completed" : ""}`}
            onClick={() => cambiarPestana("personales")}
          >
            ✓ Datos Personales
          </button>
          <button
            className={`tab-btn ${activeTab === "seguridad" ? "active" : ""} ${completedTabs.seguridad ? "completed" : ""}`}
            onClick={() => cambiarPestana("seguridad")}
            disabled={!completedTabs.personales && activeTab !== "seguridad"}
            style={{
              opacity: !completedTabs.personales && activeTab !== "seguridad" ? 0.5 : 1,
              cursor: !completedTabs.personales && activeTab !== "seguridad" ? "not-allowed" : "pointer"
            }}
          >
            ✓ Seguridad Social
          </button>
          <button
            className={`tab-btn ${activeTab === "laborales" ? "active" : ""} ${completedTabs.laborales ? "completed" : ""}`}
            onClick={() => cambiarPestana("laborales")}
            disabled={!completedTabs.seguridad && activeTab !== "laborales"}
            style={{
              opacity: !completedTabs.seguridad && activeTab !== "laborales" ? 0.5 : 1,
              cursor: !completedTabs.seguridad && activeTab !== "laborales" ? "not-allowed" : "pointer"
            }}
          >
            ✓ Datos Laborales
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* TAB: DATOS PERSONALES */}
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
                    placeholder="Ej: 12345678"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Ej: Juan"
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
                    placeholder="Ej: Pérez"
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
                  <label>Foto</label>
                  <input
                    type="file"
                    name="foto_afiliado"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <small style={{ color: "#666", fontSize: "12px" }}>Máx 5MB</small>
                </div>
              </div>

              <fieldset className="fieldset">
                <legend>Domicilio</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección Domicilio</label>
                    <input
                      type="text"
                      name="direccion_domicilio"
                      value={formData.direccion_domicilio}
                      onChange={handleChange}
                      placeholder="Ej: Calle 10 #2-30"
                    />
                  </div>
                  <div className="form-group">
                    <label>Municipio Domicilio</label>
                    <input
                      type="text"
                      name="municipio_domicilio"
                      value={formData.municipio_domicilio}
                      onChange={handleChange}
                      placeholder="Ej: Cali, Pasto, Medellín"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend>Residencia</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección Residencia</label>
                    <input
                      type="text"
                      name="direccion_residencia"
                      value={formData.direccion_residencia}
                      onChange={handleChange}
                      placeholder="Ej: Carrera 4 #5-6"
                    />
                  </div>
                  <div className="form-group">
                    <label>Municipio Residencia</label>
                    <input
                      type="text"
                      name="municipio_residencia"
                      value={formData.municipio_residencia}
                      onChange={handleChange}
                      placeholder="Ej: Jamundí, Ipiales, Bello"
                    />
                  </div>
                </div>
              </fieldset>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={siguientePestana}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: SEGURIDAD SOCIAL */}
          {activeTab === "seguridad" && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group">
                  <label>EPS</label>
                  <select
                    name="id_eps"
                    value={formData.id_eps}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {opciones.eps.map((e) => (
                      <option key={e.id_eps} value={e.id_eps}>
                        {e.nombre_eps}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ARL</label>
                  <select
                    name="id_arl"
                    value={formData.id_arl}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {opciones.arl.map((a) => (
                      <option key={a.id_arl} value={a.id_arl}>
                        {a.nombre_arl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pensión</label>
                  <select
                    name="id_pension"
                    value={formData.id_pension}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {opciones.pension.map((p) => (
                      <option key={p.id_pension} value={p.id_pension}>
                        {p.nombre_pension}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cesantías</label>
                  <select
                    name="id_cesantias"
                    value={formData.id_cesantias}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {opciones.cesantias.map((c) => (
                      <option key={c.id_cesantias} value={c.id_cesantias}>
                        {c.nombre_cesantias}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={pestanaAnterior}
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={siguientePestana}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* TAB: DATOS LABORALES */}
          {activeTab === "laborales" && (
            <div className="tab-content">
              <fieldset className="fieldset">
                <legend>Información Básica</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Cargo *</label>
                    <select
                      name="id_cargo"
                      value={formData.id_cargo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {opciones.cargos.map((c) => (
                        <option key={c.id_cargo} value={c.id_cargo}>
                          {c.nombre_cargo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Municipio de Trabajo *</label>
                    <select
                      name="municipio_trabajo"
                      value={formData.municipio_trabajo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {opciones.municipios.map((m) => (
                        <option key={m.id_municipio} value={m.id_municipio}>
                          {m.nombre_municipio}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
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
                  <div className="form-group">
                    <label>💰 Salario Asignado</label>
                    <input
                      type="text"
                      value={
                        cargandoSalario 
                          ? "Buscando salario..." 
                          : salarioCalculado 
                            ? `$${parseFloat(salarioCalculado).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` 
                            : formData.id_cargo && formData.municipio_trabajo 
                              ? "No hay salario definido" 
                              : "Seleccione cargo y municipio"
                      }
                      disabled
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: salarioCalculado ? '#28a745' : '#666',
                        fontWeight: salarioCalculado ? 'bold' : 'normal',
                        fontSize: salarioCalculado ? '16px' : '14px',
                        cursor: 'not-allowed'
                      }}
                    />
                    {formData.id_cargo && formData.municipio_trabajo && !salarioCalculado && !cargandoSalario && (
                      <small style={{ color: '#dc3545', marginTop: '4px', display: 'block' }}>
                        ⚠️ No hay salario configurado para esta combinación
                      </small>
                    )}
                    {salarioCalculado && (
                      <small style={{ color: '#28a745', marginTop: '4px', display: 'block' }}>
                        ✅ Salario encontrado en la base de datos
                      </small>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* ACTAS DE NOMBRAMIENTO */}
              <fieldset className="fieldset">
                <legend>Acto administrativo de Nombramiento</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Documento</label>
                    <select
                      name="tipo_documento"
                      value={formData.tipo_documento}
                      onChange={handleChange}
                    >
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
                    <label>Archivo de Nombramiento</label>
                    <input
                      type="file"
                      name="archivo_nombramiento"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <small style={{ color: "#666", fontSize: "12px" }}>Máx 5MB</small>
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
                    <label>Subir</label>
                    <input
                      type="file"
                      name="archivo_posesion"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                    />
                    <small style={{ color: "#666", fontSize: "12px" }}>Máx 5MB</small>
                  </div>
                </div>
              </fieldset>
              
              {/* INSTITUCIÓN EDUCATIVA */}
              <fieldset className="fieldset">
                <legend>Institución Educativa</legend>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institución</label>
                    <select
                      name="id_institucion"
                      value={formData.id_institucion}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      {opciones.instituciones.map((i) => (
                        <option key={i.id_institucion} value={i.id_institucion}>
                          {i.nombre_institucion}
                        </option>
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
                      placeholder="Ej: contacto@institucion.edu.co"
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
                      placeholder="Ej: 3001112233"
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección de la Institución</label>
                    <input
                      type="text"
                      name="direccion_institucion"
                      value={formData.direccion_institucion}
                      onChange={handleChange}
                      placeholder="Ej: Calle 10 #2-30"
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
                <legend>Otros Cargos (opcional)</legend>
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
                    <h4 style={{ fontSize: "14px", marginBottom: "0.5rem" }}>Cargos Agregados:</h4>
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

              {/* Botones de navegación */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={pestanaAnterior}
                >
                  ← Anterior
                </button>
                <button type="submit" className="btn-submit">
                  Crear Afiliado
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};