export function PaginacionControles({ paginaActual, totalPaginas, onCambiarPagina }) {
  const generarNumerosPagina = () => {
    const numeros = [];
    const maxBotones = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxBotones / 2));
    let fin = Math.min(totalPaginas, inicio + maxBotones - 1);

    if (fin - inicio + 1 < maxBotones) {
      inicio = Math.max(1, fin - maxBotones + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  return (
    <div className="paginacion-container">
      <button
        onClick={() => onCambiarPagina(1)}
        disabled={paginaActual === 1}
        className="paginacion-btn"
      >
        ⏮️
      </button>

      <button
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="paginacion-btn"
      >
        ◀ Anterior
      </button>

      {generarNumerosPagina().map((numero) => (
        <button
          key={numero}
          onClick={() => onCambiarPagina(numero)}
          className={`paginacion-btn ${paginaActual === numero ? 'activo' : ''}`}
        >
          {numero}
        </button>
      ))}

      <button
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="paginacion-btn"
      >
        Siguiente ▶
      </button>

      <button
        onClick={() => onCambiarPagina(totalPaginas)}
        disabled={paginaActual === totalPaginas}
        className="paginacion-btn"
      >
        ⏭️
      </button>
    </div>
  );
}