import { useState, useEffect } from "react";
import "../../pages/Departamentos.css";

export const ModalEditarMunicipio = ({ isOpen, onClose, onSubmit, municipio, departamentos, usuarioActual }) => {
  const [formData, setFormData] = useState({
    nombre_municipio: "",
    departamento: ""
  });

  const esPresidenciaDepartamental = usuarioActual?.rol === 'presidencia';
  const esPresidenciaNacional = usuarioActual?.rol === 'presidencia_nacional';

  // Filtrar departamentos según el rol
  const departamentosFiltrados = esPresidenciaDepartamental && usuarioActual?.departamento
    ? departamentos.filter(d => d.departamento === usuarioActual.departamento)
    : departamentos;

  useEffect(() => {
    if (municipio) {
      setFormData({
        nombre_municipio: municipio.nombre_municipio || "",
        departamento: municipio.departamento || ""
      });
    }
  }, [municipio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si es presidencia departamental, no permitir cambiar el departamento
    if (esPresidenciaDepartamental && name === 'departamento') {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre_municipio.trim() || !formData.departamento) {
      alert("Todos los campos son requeridos");
      return;
    }

    onSubmit(municipio.id_municipio, formData);
  };

  if (!isOpen || !municipio) return null;

  return (
    <div className="modal-departamentos">
      <div className="modal-departamentos-content">
        <div className="modal-departamentos-header">
          <h2>Editar Municipio</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-departamentos-body">
            <div className="form-group">
              <label>Departamento *</label>
              {esPresidenciaDepartamental ? (
                <input
                  type="text"
                  value={formData.departamento}
                  disabled
                  className="form-control-disabled"
                />
              ) : (
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar departamento...</option>
                  {departamentosFiltrados.map((depto, index) => (
                    <option key={index} value={depto.departamento}>
                      {depto.departamento}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label>Nombre del Municipio *</label>
              <input
                type="text"
                name="nombre_municipio"
                value={formData.nombre_municipio}
                onChange={handleChange}
                placeholder="Ej: Pasto"
                required
              />
            </div>
          </div>

          <div className="modal-departamentos-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-submit">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};