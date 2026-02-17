import { useState, useEffect } from "react";
import "../../pages/Departamentos.css";

export const ModalCrearMunicipio = ({ isOpen, onClose, onSubmit, departamentos, usuarioActual }) => {
  const [formData, setFormData] = useState({
    nombre_municipio: "",
    departamento: ""
  });

  // presidencia_nacional puede crear en cualquier departamento
  // presidencia solo en su departamento
  const esPresidenciaNacional = usuarioActual?.rol === 'presidencia_nacional';
  const esPresidenciaDepto = usuarioActual?.rol === 'presidencia';

  // Filtrar departamentos según el rol
  const departamentosFiltrados = esPresidenciaDepto && usuarioActual?.departamento
    ? departamentos.filter(d => d.departamento === usuarioActual.departamento)
    : departamentos;

  useEffect(() => {
    if (esPresidenciaDepto && usuarioActual?.departamento) {
      setFormData(prev => ({
        ...prev,
        departamento: usuarioActual.departamento
      }));
    }
  }, [usuarioActual, isOpen, esPresidenciaDepto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    onSubmit(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre_municipio: "",
      departamento: esPresidenciaDepto ? usuarioActual?.departamento || "" : ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-departamentos">
      <div className="modal-departamentos-content">
        <div className="modal-departamentos-header">
          <h2>Crear Nuevo Municipio</h2>
          <button className="modal-close-btn" onClick={() => { onClose(); resetForm(); }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-departamentos-body">
            <div className="form-group">
              <label>Departamento *</label>
              {esPresidenciaDepto ? (
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#f0f0f0', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {usuarioActual?.departamento}
                </div>
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
              onClick={() => { onClose(); resetForm(); }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-submit">
              Crear Municipio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};