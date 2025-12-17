export function PreviewCuotas({ 
  cuotas, 
  mesSeleccionado, 
  anioSeleccionado, 
  advertenciasCero,
  onGuardar,
  onCancelar,
  loading 
}) {
  const cuotasValidas = cuotas.filter(c => c.existe).length;

  return (
    <div className="cuotas-preview-container">
      <h4 className="cuotas-preview-title">
        📊 Vista Previa ({cuotas.length} cuotas detectadas)
      </h4>
      
      {advertenciasCero.length > 0 && (
        <div className="cuotas-advertencia-cero">
          <strong>⚠️ {advertenciasCero.length} Cuota(s) con Valor $0:</strong>
          <ul>
            {advertenciasCero.slice(0, 5).map((c, idx) => (
              <li key={idx}>
                Cédula {c.cedula} - {c.nombres} {c.apellidos}
              </li>
            ))}
            {advertenciasCero.length > 5 && (
              <li>... y {advertenciasCero.length - 5} más</li>
            )}
          </ul>
        </div>
      )}

      <div className="cuotas-preview-tabla-container">
        <table className="table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre Completo</th>
              <th>Mes</th>
              <th>Año</th>
              <th>Valor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.map((cuota, index) => (
              <tr 
                key={index}
                className={
                  !cuota.existe 
                    ? "cuotas-row-error" 
                    : parseFloat(cuota.valor) === 0 
                      ? "cuotas-row-warning" 
                      : ""
                }
              >
                <td>{cuota.cedula}</td>
                <td>{cuota.nombres} {cuota.apellidos}</td>
                <td>{mesSeleccionado}</td>
                <td>{anioSeleccionado}</td>
                <td className={parseFloat(cuota.valor) === 0 ? "cuotas-valor-cero" : "cuotas-valor-normal"}>
                  ${parseFloat(cuota.valor).toLocaleString()}
                </td>
                <td>
                  {!cuota.existe ? (
                    <span className="cuotas-estado-error">❌ No existe</span>
                  ) : parseFloat(cuota.valor) === 0 ? (
                    <span className="cuotas-estado-warning">⚠️ Valor $0</span>
                  ) : (
                    <span className="cuotas-estado-success">✅ Listo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="cuotas-preview-acciones">
        <button 
          type="button" 
          className="btn btn-warning" 
          onClick={onCancelar}
        >
          🔄 Cancelar
        </button>
        <button 
          type="button" 
          className="btn btn-success"
          onClick={onGuardar}
          disabled={loading || cuotasValidas === 0}
        >
          {loading ? "Guardando..." : `💾 Guardar ${cuotasValidas} Cuota(s)`}
        </button>
      </div>
    </div>
  );
}