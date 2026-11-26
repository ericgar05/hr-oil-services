// components/planificacion/ActividadesList.jsx
import { useCurrency } from '../../../../../../contexts/CurrencyContext';
import { useBudget } from '../../../../../../contexts/BudgetContext';

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconFolder = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconLayers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconCheckSquare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const IconFileText = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const ActividadesList = ({ actividades, onEdit, onDelete, loading }) => {
  const { formatCurrency } = useCurrency();
  const { budget } = useBudget();

  if (loading) {
    return (
      <div className="actividades-empty-state">
        <p>Cargando actividades del día...</p>
      </div>
    );
  }

  if (!actividades || actividades.length === 0) {
    return (
      <div className="actividades-empty-state">
        <IconFileText />
        <p>No hay actividades planificadas para este día.</p>
        <span>Pulsa en "+ Agregar Actividad" en la parte superior para asignar una partida contractual.</span>
      </div>
    );
  }

  return (
    <div className="planning-actividades-container">
      {actividades.map((actividad) => {
        const subCount = actividad.subactividades ? actividad.subactividades.length : 0;
        const persCount = actividad.personal ? actividad.personal.length : 0;
        const budItem = budget?.items?.find(i => i.id === actividad.partida_id);
        const itemCode = budItem?.item || actividad.item || actividad.partida_codigo || null;

        return (
          <div key={actividad.id} className="planning-actividad-card">
            {/* Header de la Tarjeta (Homogéneo con Semanas y Valuaciones) */}
            <div className="actividad-card-header">
              <div className="actividad-card-title-group">
                <span className="actividad-partida-badge">
                  <IconFolder />
                  <span>{itemCode ? `Partida ${itemCode}` : 'Partida'}</span>
                </span>
                <span className="actividad-partida-nombre" title={actividad.nombre_partida || budItem?.descripcion}>
                  {actividad.nombre_partida || budItem?.descripcion || actividad.budget_items?.description || 'Partida no asignada'}
                </span>
              </div>

              <div className="actividad-card-actions-group">
                <button
                  type="button"
                  onClick={() => onEdit(actividad)}
                  className="btn-action-icon edit"
                  title="Editar Actividad"
                >
                  <IconEdit />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(actividad.id)}
                  className="btn-action-icon delete"
                  title="Eliminar Actividad"
                >
                  <IconTrash />
                </button>
              </div>
            </div>

            {/* Cuerpo de la Tarjeta */}
            <div className="actividad-card-body">
              {/* Descripción Principal de la Actividad */}
              <h4 className="actividad-card-descripcion">
                {actividad.descripcion || 'Sin descripción'}
              </h4>

              {/* Bloque Financiero y Operativo idéntico a semanas y valuaciones */}
              <div className="actividad-financial-block">
                <div className="actividad-financial-cell">
                  <span className="cell-label">Volumen / Cantidad</span>
                  <span className="cell-val highlight-blue">
                    <IconLayers />
                    <span>
                      {parseFloat(actividad.cantidad_programada || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {actividad.unidad_medida || 'Und'}
                    </span>
                  </span>
                </div>

                <div className="actividad-financial-cell right">
                  <span className="cell-label">Monto Programado</span>
                  <span className="cell-val highlight-green">
                    <IconTrendingUp />
                    <span>{formatCurrency(actividad.monto_programado, 'USD')}</span>
                  </span>
                </div>

                {persCount > 0 && (
                  <div className="actividad-financial-cell">
                    <span className="cell-label">Cuadrilla</span>
                    <span className="cell-val highlight-slate">
                      <IconUsers />
                      <span>{persCount} {persCount === 1 ? 'persona' : 'personas'}</span>
                    </span>
                  </div>
                )}

                {subCount > 0 && (
                  <div className="actividad-financial-cell right">
                    <span className="cell-label">Checklist Operativo</span>
                    <span className="cell-val highlight-amber">
                      <IconCheckSquare />
                      <span>{subCount} {subCount === 1 ? 'tarea' : 'tareas'}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActividadesList;
