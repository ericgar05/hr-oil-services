// components/planificacion/ActividadesList.jsx
import { useCurrency } from '../../../../../../contexts/CurrencyContext';

export const ActividadesList = ({ actividades, onEdit, onDelete, loading }) => {
  const { formatCurrency } = useCurrency();

  if (loading) {
    return (
      <div className="planning-no-content" style={{ marginTop: '20px' }}>
        Cargando actividades...
      </div>
    );
  }

  if (!actividades || actividades.length === 0) {
    return (
      <div className="planning-no-content" style={{ marginTop: '20px' }}>
        No hay actividades planificadas para este día.
      </div>
    );
  }

  return (
    <div className="planning-actividades-container" style={{ marginTop: '20px' }}>
      {actividades.map((actividad) => {
        const subCount = actividad.subactividades ? actividad.subactividades.length : 0;
        const persCount = actividad.personal ? actividad.personal.length : 0;

        return (
          <div key={actividad.id} className="planning-actividad-item">
            <div className="actividad-main-info">
              <h4 className="actividad-title">{actividad.descripcion || 'Sin descripción'}</h4>

              <div className="actividad-partida">
                <span style={{ opacity: 0.7 }}>📂</span>
                {actividad.nombre_partida || actividad.budget_items?.description || 'Partida no asignada'}
              </div>

              <div className="actividad-metrics">
                <div className="metric-badge quantity" title="Cantidad Programada">
                  <span>📊</span>
                  <strong>{actividad.cantidad_programada}</strong> {actividad.unidad_medida}
                </div>

                <div className="metric-badge money" title="Monto Programado">
                  <span>💰</span>
                  <strong>{formatCurrency(actividad.monto_programado, 'USD')}</strong>
                </div>

                {subCount > 0 && (
                  <div className="metric-badge resources" title="Subactividades">
                    <span>✅</span> {subCount} tareas
                  </div>
                )}

                {persCount > 0 && (
                  <div className="metric-badge resources" title="Personal Involucrado">
                    <span>👥</span> {persCount} pers.
                  </div>
                )}
              </div>
            </div>

            <div className="actividad-actions">
              <button
                onClick={() => onEdit(actividad)}
                className="btn-action-sm"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(actividad.id)}
                className="btn-action-sm danger"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};