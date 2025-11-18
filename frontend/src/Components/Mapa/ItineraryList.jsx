// src/Components/Mapa/ItineraryList.jsx
import React from "react";

/**
 * Props:
 * - itinerary: [{ title, lat, lng }]
 * - onRemove(index)
 * - onMoveUp(index)
 * - onMoveDown(index)
 * - onClear()
 * - onExport()
 */
export default function ItineraryList({
  itinerary = [],
  onRemove,
  onMoveUp,
  onMoveDown,
  onClear,
  onExport,
}) {
  return (
    <div className="card mt-4 shadow-sm">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="m-0">Itinerário</h6>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={onClear} title="Limpar lista">
              Limpar
            </button>
            <button className="btn btn-sm btn-primary" onClick={onExport} title="Exportar JSON">
              Exportar
            </button>
          </div>
        </div>

        {itinerary.length === 0 ? (
          <div className="text-muted small">Nenhum ponto adicionado. Use "Adicionar ao itinerário".</div>
        ) : (
          <ul className="list-group list-group-flush">
            {itinerary.map((it, i) => (
              <li key={i} className="list-group-item d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  <div className="fw-semibold">{it.title || `Ponto ${i + 1}`}</div>
                  <small className="text-muted">{Number(it.lat).toFixed(5)}, {Number(it.lng).toFixed(5)}</small>
                </div>

                <div className="btn-group btn-group-sm" role="group" aria-label="controls">
                  <button
                    className="btn btn-light"
                    onClick={() => onMoveUp(i)}
                    disabled={i === 0}
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => onMoveDown(i)}
                    disabled={i === itinerary.length - 1}
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => onRemove(i)}
                    title="Remover"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
