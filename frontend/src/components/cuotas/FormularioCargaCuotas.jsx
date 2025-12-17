   import { useState } from "react";
import { procesarArchivoCuotas } from "../../utils/procesadorArchivos";
import { PreviewCuotas } from "./PreviewCuotas";

const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function FormularioCargaCuotas({ onGuardar, loading, showAlert }) {
  const [archivo, setArchivo] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [cuotasPreview, setCuotasPreview] = useState([]);
  const [procesandoArchivo, setProcesandoArchivo] = useState(false);
  const [advertenciasCero, setAdvertenciasCero] = useState([]);

  const handleArchivoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'txt', 'xls', 'xlsx'].includes(extension)) {
      showAlert("Formato no válido. Use CSV, TXT, XLS o XLSX", "danger");
      return;
    }

    setArchivo(file);
    setProcesandoArchivo(true);
    setCuotasPreview([]);
    setAdvertenciasCero([]);

    try {
      const cuotasConInfo = await procesarArchivoCuotas(file, extension);
      
      if (cuotasConInfo.length === 0) {
        showAlert("No se encontraron datos válidos en el archivo", "warning");
        setProcesandoArchivo(false);
        return;
      }

      const conCero = cuotasConInfo.filter(c => parseFloat(c.valor) === 0);
      setAdvertenciasCero(conCero);
      setCuotasPreview(cuotasConInfo);
      
      if (conCero.length > 0) {
        showAlert(`⚠️ ${conCero.length} cuota(s) con valor $0 detectadas`, "warning");
      }

    } catch (error) {
      console.error("Error procesando archivo:", error);
      showAlert("Error al procesar el archivo", "danger");
    } finally {
      setProcesandoArchivo(false);
    }
  };

  const handleGuardar = () => {
    if (!mesSeleccionado) {
      showAlert("Selecciona un mes", "danger");
      return;
    }

    if (cuotasPreview.length === 0) {
      showAlert("No hay cuotas para guardar", "danger");
      return;
    }

    const noEncontrados = cuotasPreview.filter(c => !c.existe);
    if (noEncontrados.length > 0) {
      const confirmar = window.confirm(
        `Hay ${noEncontrados.length} cédula(s) que no existen en el sistema:\n` +
        noEncontrados.map(c => `- ${c.cedula}`).join('\n') +
        `\n\n¿Deseas continuar guardando solo las cuotas de afiliados registrados?`
      );
      if (!confirmar) return;
    }

    if (advertenciasCero.length > 0) {
      const confirmar = window.confirm(
        `⚠️ ADVERTENCIA: ${advertenciasCero.length} cuota(s) con valor $0:\n` +
        advertenciasCero.map(c => `- ${c.cedula}: ${c.nombres} ${c.apellidos}`).join('\n') +
        `\n\n¿Confirmas que deseas guardar estas cuotas con valor $0?`
      );
      if (!confirmar) return;
    }

    const cuotasValidas = cuotasPreview.filter(c => c.existe);
    onGuardar(cuotasValidas, mesSeleccionado, anioSeleccionado);
  };

  const resetForm = () => {
    setArchivo(null);
    setMesSeleccionado("");
    setCuotasPreview([]);
    setAdvertenciasCero([]);
    const fileInput = document.getElementById('archivo-cuotas');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="cuotas-formulario-card">
      <h3>📤 Cargar Cuotas Mensuales</h3>
      
      <div className="cuotas-form-content">
        <div className="form-row">
          <div className="form-group">
            <label>Mes de las Cuotas *</label>
            <select 
              value={mesSeleccionado} 
              onChange={(e) => setMesSeleccionado(e.target.value)}
              required
            >
              <option value="">Seleccionar mes</option>
              {meses.map((mes) => (
                <option key={mes} value={mes}>
                  {mes.charAt(0).toUpperCase() + mes.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Año *</label>
            <input
              type="number"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              min="2020"
              max="2030"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Archivo de Cuotas (CSV, TXT, XLS, XLSX) *</label>
          <input
            id="archivo-cuotas"
            type="file"
            accept=".csv,.txt,.xls,.xlsx"
            onChange={handleArchivoChange}
            disabled={!mesSeleccionado}
          />
          <small className="cuotas-file-hint">
            📋 Formato esperado: Primera columna = Cédula, Segunda columna = Valor
            <br />
            Ejemplo: 123456789,50000 o 123456789;50000
          </small>
        </div>

        {procesandoArchivo && (
          <div className="cuotas-loading-container">
            <div className="cuotas-spinner"></div>
            <p>Procesando archivo...</p>
          </div>
        )}

        {cuotasPreview.length > 0 && !procesandoArchivo && (
          <PreviewCuotas
            cuotas={cuotasPreview}
            mesSeleccionado={mesSeleccionado} 
            anioSeleccionado={anioSeleccionado} 
            advertenciasCero={advertenciasCero}
            onGuardar={handleGuardar}
            onCancelar={resetForm}
            loading={loading}
          />
        )}
      </div>
    </div>
  );  
}  