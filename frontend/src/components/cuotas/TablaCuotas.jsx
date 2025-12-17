export function TablaCuotas({ cuotas, indexPrimero }) {
  return (
    <div className="cuotas-tabla-container">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Cédula</th>
            <th>Mes</th>
            <th>Año</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {cuotas.map((cuota, index) => (
            <tr key={cuota.id_cuota}>
              <td className="cuotas-numero-fila">
                {indexPrimero + index + 1}
              </td>
              <td>{cuota.cedula}</td>
              <td>{cuota.mes}</td>
              <td>{cuota.anio}</td>
              <td className={parseFloat(cuota.valor) === 0 ? "cuotas-valor-cero" : "cuotas-valor-normal"}>
                ${parseFloat(cuota.valor).toLocaleString()}
                {parseFloat(cuota.valor) === 0 && <span className="cuotas-icono-warning">⚠️</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}