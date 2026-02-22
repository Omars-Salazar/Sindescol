// frontend/src/pages/GestionUsuarios.jsx
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { MESSAGES } from "../utils/toastMessages";
import "./GestionUsuarios.css";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { toast, showSuccess, showError, showWarning, hideToast } = useToast();
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [filtros, setFiltros] = useState({ departamento: 'todos', rol: 'todos' });
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    celular: "",
    departamento: "",
    rol: "usuario"
  });

  useEffect(() => {
    const userData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
    if (userData) {
      setUsuarioActual(JSON.parse(userData));
    }
    cargarUsuarios();
    cargarDepartamentos();
  }, []);

  // Limpiar formulario cuando se cierra
  const puedeEditarRol = usuarioActual?.rol === 'presidencia_nacional';

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("/api/usuarios");
      const data = await response.json();
      
      console.log('📡 Respuesta del servidor:', data);
      
      if (data.success) {
        console.log('👥 Usuarios recibidos:', data.data.length);
        if (data.data.length > 0) {
          console.log('📱 Primer usuario con celular:', {
            email: data.data[0].email,
            celular: data.data[0].celular,
            tipo: typeof data.data[0].celular
          });
        }
        setUsuarios(data.data || []);
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      showError(MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const cargarDepartamentos = async () => {
    try {
      const response = await fetchWithAuth("/api/departamentos");
      const data = await response.json();
      if (data.success) {
        const lista = (data.data || [])
          .map((item) => (typeof item === "string" ? item : item.departamento))
          .filter(Boolean);
        setDepartamentos(lista);
      }
    } catch (error) {
      console.error("❌ Error cargando departamentos:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validación en tiempo real para el celular
    if (name === 'celular') {
      // Solo permitir números y limitar a 10 dígitos
      const numeros = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numeros.slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación adicional del celular
    if (formData.celular && formData.celular.length !== 10) {
      showWarning(MESSAGES.INVALID_PHONE);
      return;
    }
    
    try {
      let response;
      
      if (editingId) {
        response = await fetchWithAuth(`/api/usuarios/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetchWithAuth("/api/usuarios", {
          method: "POST",
          body: JSON.stringify(formData)
        });
      }
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(editingId ? MESSAGES.USER_UPDATED : MESSAGES.USER_CREATED);
        resetForm();
        cargarUsuarios();
      } else {
        showError(data.error || MESSAGES.SAVE_ERROR);
      }
    } catch (error) {
      showError(error.message || MESSAGES.SAVE_ERROR);
    }
  };

  const handleEdit = (usuario) => {
    setFormData({
      email: usuario.email,
      password: "",
      nombre: usuario.nombre,
      celular: usuario.celular || "",
      departamento: usuario.departamento,
      rol: usuario.rol
    });
    setEditingId(usuario.id_usuario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      const response = await fetchWithAuth(`/api/usuarios/${id}`, {
        method: "DELETE"
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(MESSAGES.USER_DELETED);
        cargarUsuarios();
      } else {
        showError(data.error || MESSAGES.DELETE_ERROR);
      }
    } catch (error) {
      showError(error.message || MESSAGES.DELETE_ERROR);
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      const response = await fetchWithAuth(`/api/usuarios/${id}/toggle-activo`, {
        method: "PATCH"
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(MESSAGES.USER_STATUS_CHANGED);
        cargarUsuarios();
      } else {
        showError(data.error || MESSAGES.SAVE_ERROR);
      }
    } catch (error) {
      showError(MESSAGES.SAVE_ERROR);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      nombre: "",
      celular: "",
      departamento: "",
      rol: "usuario"
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelar = () => {
    resetForm();
  };

  const formatCelular = (celular) => {
    console.log('📱 Formateando celular:', celular, 'tipo:', typeof celular);
    
    if (!celular || celular === '' || celular === null || celular === undefined) {
      return "No registrado";
    }
    
    // Convertir a string y limpiar
    const celularStr = String(celular).replace(/\D/g, '');
    
    // Formato: 300 123 4567
    if (celularStr.length === 10) {
      return `${celularStr.slice(0, 3)} ${celularStr.slice(3, 6)} ${celularStr.slice(6)}`;
    }
    
    // Si no tiene 10 dígitos, devolver tal cual
    return celularStr || "No registrado";
  };

  useEffect(() => {
    if (!showForm) {
      setFormData({
        email: "",
        password: "",
        nombre: "",
        celular: "",
        departamento: puedeEditarRol ? "" : (usuarioActual?.departamento || ""),
        rol: "usuario"
      });
      setEditingId(null);
    }
  }, [showForm, puedeEditarRol, usuarioActual]);

  useEffect(() => {
    if (usuarioActual && !puedeEditarRol && !editingId) {
      setFormData((prev) => ({
        ...prev,
        departamento: usuarioActual.departamento || ""
      }));
    }
  }, [usuarioActual, puedeEditarRol, editingId]);
  const departamentosDisponibles = [...new Set([
    ...departamentos,
    ...(formData.departamento ? [formData.departamento] : [])
  ])];
  const rolesDisponibles = [...new Set(usuarios.map((usuario) => usuario.rol))];

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const coincideDepartamento =
      filtros.departamento === 'todos' || usuario.departamento === filtros.departamento;
    const coincideRol = filtros.rol === 'todos' || usuario.rol === filtros.rol;
    return coincideDepartamento && coincideRol;
  });

  return (
    <div className="container">
      <div className="page-header">
        <h1>👥 Gestión de Usuarios</h1>
        <p>Administra los accesos al sistema</p>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
      
      <div className="page-header">
        <h1>👥 Gestión de Usuarios</h1>
        <p>Administra los accesos al sistema de forma segura</p>
      </div>
      {showForm && (
        <div className="card gestion-usuarios-form">
          <h3>{editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@sindescol.com"
                  required
                  disabled={editingId}
                />
                {editingId && (
                  <small className="form-hint">El email no se puede modificar</small>
                )}
              </div>
              <div className="form-group">
                <label>{editingId ? "Nueva Contraseña (opcional)" : "Contraseña *"}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required={!editingId}
                />
                {editingId && (
                  <small className="form-hint">Dejar vacío para no cambiar</small>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="form-group">
                <label>Número de Celular *</label>
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="3001234567"
                  required
                  maxLength="10"
                  pattern="\d{10}"
                />
                <small className="form-hint">
                  {formData.celular 
                    ? `${formData.celular.length}/10 dígitos${formData.celular.length === 10 ? ' ✓' : ''}`
                    : 'Ingresa 10 dígitos (ej: 3001234567)'}
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Departamento *</label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  required
                  disabled={!puedeEditarRol}
                >
                  {puedeEditarRol && (
                    <option value="">Selecciona un departamento</option>
                  )}
                  {departamentosDisponibles.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
                {!puedeEditarRol && (
                  <small className="form-hint">Usuarios de tu departamento únicamente</small>
                )}
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                  disabled={!puedeEditarRol}
                >
                  <option value="usuario">Usuario</option>
                  {puedeEditarRol && <option value="presidencia">Presidencia</option>}
                </select>
                {!puedeEditarRol && (
                  <small className="form-hint">Solo puedes crear usuarios normales</small>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingId ? "💾 Actualizar" : "➕ Crear"} Usuario
              </button>
              <button type="button" className="btn btn-warning" onClick={handleCancelar}>
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">⏳ Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <div className="empty-state">
          <p>📋 No hay usuarios registrados</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Crear el primer usuario
          </button>
        </div>
      ) : (
        <div className="usuarios-tabla-container">
          <div className="usuarios-filtros">
            {puedeEditarRol && (
              <div className="form-group">
                <label>Filtrar por departamento</label>
                <select
                  name="departamento"
                  value={filtros.departamento}
                  onChange={handleFiltroChange}
                >
                  <option value="todos">Todos</option>
                  {departamentosDisponibles.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Filtrar por rol</label>
              <select name="rol" value={filtros.rol} onChange={handleFiltroChange}>
                <option value="todos">Todos</option>
                {rolesDisponibles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol === 'presidencia_nacional'
                      ? 'Presidencia Nacional'
                      : rol === 'presidencia'
                      ? 'Presidencia'
                      : 'Usuario'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <table className="table usuarios-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Celular</th>
                <th>Departamento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td className="email-cell">{usuario.email}</td>
                  <td>{usuario.nombre}</td>
                  <td className="celular-cell">
                    📱 {formatCelular(usuario.celular)}
                  </td>
                  <td>{usuario.departamento}</td>
                  <td>
                    <span className={`rol-badge rol-${usuario.rol}`}>
                      {usuario.rol === 'presidencia_nacional' ? '🏛️ P. Nacional' :
                       usuario.rol === 'presidencia' ? '👔 Presidencia' :
                       '👤 Usuario'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-estado ${usuario.activo ? 'activo' : 'inactivo'}`}
                      onClick={() => handleToggleActivo(usuario.id_usuario)}
                    >
                      {usuario.activo ? '✅ Activo' : '❌ Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEdit(usuario)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(usuario.id_usuario)}
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
      )}
    </div>
  );
}