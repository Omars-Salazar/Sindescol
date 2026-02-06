// frontend/src/pages/Cuotas.jsx
import { useState, useEffect } from "react";
import * as api from "../services/api";
import { FormularioCargaCuotas } from "../components/cuotas/FormularioCargaCuotas";
import { FiltrosCuotas } from "../components/cuotas/FiltrosCuotas";
import { PaginacionControles } from "../components/shared/PaginacionControles";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import "../styles/cuotas.css";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export default function Cuotas() {
  const [cuotas, setCuotas] = useState([]);
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(20);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    anio: new Date().getFullYear()
  });
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroMunicipio, setFiltroMunicipio] = useState("");
  const [opciones, setOpciones] = useState({
    departamentos: [],
    municipios: [],
  });

  // Obtener datos del usuario
  const usuarioData = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  const usuario = usuarioData ? JSON.parse(usuarioData) : null;

  useEffect(() => {
    cargarDatos();
    cargarOpciones();
  }, []);

  const cargarOpciones = async () => {
    try {
      const [resDepartamentos, resMunicipios] = await Promise.all([
        fetchWithAuth("/api/departamentos"),
        fetchWithAuth("/api/municipios")
      ]);
      
      const dataDeps = await resDepartamentos.json();
      const dataMuns = await resMunicipios.json();
      
      setOpciones({
        departamentos: dataDeps.data || [],
        municipios: dataMuns.data || []
      });
    } catch (error) {
      console.error("Error cargando opciones:", error);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar cuotas
      const responseCuotas = await fetchWithAuth("/api/cuotas");
      const dataCuotas = await responseCuotas.json();
      
      // Cargar afiliados
      const responseAfiliados = await fetchWithAuth("/api/afiliados");
      const dataAfiliados = await responseAfiliados.json();

      if (dataCuotas.success) {
        setCuotas(dataCuotas.data || []);
      }
      
      if (dataAfiliados.success) {
        setAfiliados(dataAfiliados.data || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      showAlert("Error al cargar datos", "danger");
    } finally {
      setLoading(false);
    }
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
        cargarDatos();
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
    setFiltros({ busqueda: "", anio: new Date().getFullYear() });
    setPaginaActual(1);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Organizar datos por afiliado
  const organizarDatosPorAfiliado = () => {
    const datosOrganizados = [];

    afiliados.forEach(afiliado => {
      const cuotasAfiliado = cuotas.filter(c => 
        c.cedula === afiliado.cedula && 
        parseInt(c.anio) === parseInt(filtros.anio)
      );

      // Crear objeto con cuotas por mes
      const cuotasPorMes = {};
      MESES.forEach(mes => {
        const cuotaMes = cuotasAfiliado.find(c => c.mes === mes);
        cuotasPorMes[mes] = cuotaMes ? parseFloat(cuotaMes.valor) : null;
      });

      // Calcular total
      const total = Object.values(cuotasPorMes).reduce((sum, val) => sum + (val || 0), 0);

      datosOrganizados.push({
        cedula: afiliado.cedula,
        nombres: afiliado.nombres,
        apellidos: afiliado.apellidos,
        cuotasPorMes,
        total
      });
    });

    return datosOrganizados;
  };

  // Filtrar datos
  const datosFiltrados = organizarDatosPorAfiliado().filter(dato => {
    const afiliado = afiliados.find(a => a.cedula === dato.cedula);
    
    const cumpleBusqueda = !filtros.busqueda || 
      dato.cedula?.toString().includes(filtros.busqueda) ||
      dato.nombres?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      dato.apellidos?.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    // Filtrar por departamento (solo si presidencia_nacional)
    const cumpleDepartamento = usuario?.rol !== 'presidencia_nacional' || !filtroDepartamento || 
      (afiliado && afiliado.departamento === filtroDepartamento);
    
    // Filtrar por municipio (solo si presidencia_nacional)
    const cumpleMunicipio = usuario?.rol !== 'presidencia_nacional' || !filtroMunicipio || 
      (afiliado && afiliado.municipio_trabajo == filtroMunicipio);
    
    return cumpleBusqueda && cumpleDepartamento && cumpleMunicipio;
  });

  // Paginación
  const indexUltimo = paginaActual * elementosPorPagina;
  const indexPrimero = indexUltimo - elementosPorPagina;
  const datosPaginados = datosFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(datosFiltrados.length / elementosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calcular totales por mes
  const calcularTotalesPorMes = () => {
    const totales = {};
    MESES.forEach(mes => {
      totales[mes] = datosFiltrados.reduce((sum, dato) => 
        sum + (dato.cuotasPorMes[mes] || 0), 0
      );
    });
    return totales;
  };

  const totalesPorMes = calcularTotalesPorMes();
  const totalGeneral = Object.values(totalesPorMes).reduce((sum, val) => sum + val, 0);

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
          />

          {/* Filtros de departamento y municipio (solo para presidencia_nacional) */}
          {usuario?.rol === 'presidencia_nacional' && (
            <div style={{
              marginBottom: "1.5rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              background: "white",
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Filtrar por Departamento</label>
                <select
                  value={filtroDepartamento}
                  onChange={(e) => {
                    setFiltroDepartamento(e.target.value);
                    setFiltroMunicipio("");
                    setPaginaActual(1);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "1rem"
                  }}
                >
                  <option value="">Todos los departamentos</option>
                  {opciones.departamentos.map((d) => (
                    <option key={d.departamento} value={d.departamento}>
                      {d.departamento}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Filtrar por Municipio</label>
                <select
                  value={filtroMunicipio}
                  onChange={(e) => {
                    setFiltroMunicipio(e.target.value);
                    setPaginaActual(1);
                  }}
                  disabled={!filtroDepartamento}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    opacity: !filtroDepartamento ? 0.5 : 1,
                    cursor: !filtroDepartamento ? "not-allowed" : "pointer"
                  }}
                >
                  <option value="">
                    {!filtroDepartamento ? "Selecciona departamento primero" : "Todos los municipios"}
                  </option>
                  {opciones.municipios
                    .filter((m) => m.departamento === filtroDepartamento)
                    .map((m) => (
                      <option key={m.id_municipio} value={m.id_municipio}>
                        {m.nombre_municipio}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          <div className="cuotas-info-paginacion">
            <div className="cuotas-info-registros">
              📊 Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, datosFiltrados.length)} de {datosFiltrados.length} afiliados
              {datosFiltrados.length !== afiliados.length && (
                <span className="cuotas-info-filtrados">
                  (filtrados de {afiliados.length} totales)
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
          ) : datosFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>
                {afiliados.length === 0 
                  ? "No hay afiliados registrados" 
                  : "No se encontraron afiliados con los filtros aplicados"}
              </p>
            </div>
          ) : (
            <>
              <div className="cuotas-tabla-horizontal-container">
                <table className="cuotas-tabla-horizontal">
                  <thead>
                    <tr>
                      <th className="sticky-col">Cédula</th>
                      <th className="sticky-col-2">Nombres</th>
                      <th className="sticky-col-3">Apellidos</th>
                      {MESES.map(mes => (
                        <th key={mes} className="mes-header">
                          {mes.charAt(0).toUpperCase() + mes.slice(1)}
                        </th>
                      ))}
                      <th className="total-header">Total {filtros.anio}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosPaginados.map((dato, index) => (
                      <tr key={dato.cedula}>
                        <td className="sticky-col">{dato.cedula}</td>
                        <td className="sticky-col-2">{dato.nombres}</td>
                        <td className="sticky-col-3">{dato.apellidos}</td>
                        {MESES.map(mes => (
                          <td 
                            key={mes} 
                            className={`cuota-valor ${
                              dato.cuotasPorMes[mes] === null 
                                ? 'sin-cuota' 
                                : dato.cuotasPorMes[mes] === 0 
                                  ? 'cuota-cero' 
                                  : 'cuota-normal'
                            }`}
                          >
                            {dato.cuotasPorMes[mes] === null 
                              ? '-' 
                              : `$${dato.cuotasPorMes[mes].toLocaleString()}`}
                          </td>
                        ))}
                        <td className="total-valor">
                          ${dato.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="fila-totales">
                      <td className="sticky-col" colSpan="3"><strong>Totales del Año</strong></td>
                      {MESES.map(mes => (
                        <td key={mes} className="total-mes">
                          ${totalesPorMes[mes].toLocaleString()}
                        </td>
                      ))}
                      <td className="total-general">
                        ${totalGeneral.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

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