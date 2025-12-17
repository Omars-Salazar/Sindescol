const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function FiltrosCuotas({ filtros, onChange, onLimpiar, totalCuotas }) {
  return (
    <div className="card cuotas-filtros-card">
      <h3 className="cuotas-filtros-title">🔍 Filtros</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Buscar por Cédula</label>
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            placeholder="Ingresa cédula..."
          />
        </div>
        <div className="form-group">
          <label>Filtrar por Mes</label>
          <select 
            name="mes" 
            value={filtros.mes} 
            onChange={(e) => onChange(e.target.name, e.target.value)}
          >
            <option value="">Todos los meses</option>
            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {mes.charAt(0).toUpperCase() + mes.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Filtrar por Año</label>
          <input
            type="number"
            name="anio"
            value={filtros.anio}
            onChange={(e) => onChange(e.target.name, e.target.value)}
            placeholder="Año..."
          />
        </div>
      </div>
      <div className="cuotas-filtros-footer">
        <button 
          type="button" 
          className="btn btn-warning" 
          onClick={onLimpiar}
        >
          🔄 Limpiar Filtros
        </button>
        {totalCuotas > 0 && (
          <div className="cuotas-total-badge">
            💵 Total: ${totalCuotas.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}