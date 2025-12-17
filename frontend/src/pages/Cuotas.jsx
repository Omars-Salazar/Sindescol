import { useState, useEffect } from "react";
import * as api from "../services/api";
import { procesarArchivoCuotas } from "../utils/procesadorArchivos";
import { FormularioCargaCuotas } from "../components/cuotas/FormularioCargaCuotas";
import { TablaCuotas } from "../components/cuotas/TablaCuotas";
import { FiltrosCuotas } from "../components/cuotas/FiltrosCuotas";
import { PaginacionControles } from "../components/shared/PaginacionControles";
import "../styles/cuotas.css";

export default function Cuotas() {
  const [cuotas, setCuotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState(null);
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(20);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    mes: "",
    anio: ""
  });

  useEffect(() => {
    fetchCuotas();
  }, []);

  const fetchCuotas = async () => {
    setLoading(true);
    try {
      const { data } = await api.getCuotas();
      setCuotas(data.data || []);
    } catch (error) {
      showAlert("Error al cargar cuotas", "danger");
    }
    setLoading(false);
  };

  const handleGuardarCuotas = async (cuotasValidas, mesSeleccionado, anioSeleccionado) => {
    setLoading(true);
    
    try {
      let exitosas = 0;
      let fallidas = 0;

      for (const cuota of cuotasValidas) {
        try {
          await api.createCuota({
            cedula: cuota.cedula,
            mes: mesSeleccionado,
            anio: anioSeleccionado,
            valor: cuota.valor
          });
          exitosas++;
        } catch (error) {
          console.error(`Error guardando cuota de ${cuota.cedula}:`, error);
          fallidas++;
        }
      }

      if (exitosas > 0) {
        showAlert(`✅ ${exitosas} cuota(s) guardadas exitosamente${fallidas > 0 ? ` (${fallidas} fallidas)` : ''}`, "success");
        setShowForm(false);
        fetchCuotas();
      } else {
        showAlert("No se pudo guardar ninguna cuota", "danger");
      }

    } catch (error) {
      console.error("Error en proceso de guardado:", error);
      showAlert("Error al guardar las cuotas", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (name, value) => {
    setFiltros({ ...filtros, [name]: value });
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({ busqueda: "", mes: "", anio: "" });
    setPaginaActual(1);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Filtrar cuotas
  const cuotasFiltradas = cuotas.filter(cuota => {
    const cumpleBusqueda = !filtros.busqueda || 
      cuota.cedula?.toString().includes(filtros.busqueda);
    const cumpleMes = !filtros.mes || cuota.mes === filtros.mes;
    const cumpleAnio = !filtros.anio || cuota.anio === parseInt(filtros.anio);
    
    return cumpleBusqueda && cumpleMes && cumpleAnio;
  });

  // Paginación
  const indexUltimo = paginaActual * elementosPorPagina;
  const indexPrimero = indexUltimo - elementosPorPagina;
  const cuotasPaginadas = cuotasFiltradas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(cuotasFiltradas.length / elementosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular total
  const totalCuotasMes = cuotasFiltradas.reduce((sum, c) => sum + (parseFloat(c.valor) || 0), 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1>💰 Gestión de Cuotas</h1>
        <p>Carga y administra las cuotas mensuales de los afiliados</p>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? "✕ Cancelar" : "📤 Cargar Cuotas del Mes"}
      </button>

      {showForm && (
        <FormularioCargaCuotas 
          onGuardar={handleGuardarCuotas}
          loading={loading}
          showAlert={showAlert}
        />
      )}

      {!showForm && (
        <>
          <FiltrosCuotas
            filtros={filtros}
            onChange={handleFiltroChange}
            onLimpiar={limpiarFiltros}
            totalCuotas={totalCuotasMes}
          />

          <div className="cuotas-info-paginacion">
            <div className="cuotas-info-registros">
              📊 Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, cuotasFiltradas.length)} de {cuotasFiltradas.length} registros
              {cuotasFiltradas.length !== cuotas.length && (
                <span className="cuotas-info-filtrados">
                  (filtrados de {cuotas.length} totales)
                </span>
              )}
            </div>
            <div className="cuotas-selector-elementos">
              <label>
                <span>Mostrar:</span>
                <select 
                  value={elementosPorPagina} 
                  onChange={(e) => {
                    setElementosPorPagina(Number(e.target.value));
                    setPaginaActual(1);
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
          ) : cuotasFiltradas.length === 0 ? (
            <div className="empty-state">
              <p>
                {cuotas.length === 0 
                  ? "No hay cuotas registradas" 
                  : "No se encontraron cuotas con los filtros aplicados"}
              </p>
              {cuotas.length === 0 && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  Cargar las primeras cuotas
                </button>
              )}
            </div>
          ) : (
            <>
              <TablaCuotas 
                cuotas={cuotasPaginadas}
                indexPrimero={indexPrimero}
              />

              {totalPaginas > 1 && (
                <PaginacionControles
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  onCambiarPagina={cambiarPagina}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
