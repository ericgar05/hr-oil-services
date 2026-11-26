// src/components/modules/coordinaciones/components/DepartamentoCard.jsx
import { useCoordinaciones } from '../../../../contexts/CoordinacionesContext';

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const DepartamentoCard = ({
  departamento,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { getDepartamentoStats } = useCoordinaciones();
  const stats = getDepartamentoStats(departamento.id);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(departamento);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`¿Estás seguro de eliminar el departamento "${departamento.nombre}"? Se eliminarán todas sus actividades, archivos y notas asociadas.`)) {
      onDelete(departamento.id);
    }
  };

  return (
    <div
      className="departamento-card"
      onClick={() => onSelect(departamento)}
    >
      {/* Barra superior de color temático */}
      <div
        className="departamento-color-bar"
        style={{ backgroundColor: departamento.color || '#1e40af' }}
      />

      {/* Cabecera de la Tarjeta */}
      <div className="departamento-card-header">
        <div className="departamento-title-group">
          <div
            className="departamento-icon-badge"
            style={{
              backgroundColor: `${departamento.color || '#1e40af'}15`,
              color: departamento.color || '#1e40af',
            }}
          >
            🏢
          </div>
          <h4 className="departamento-name" title={departamento.nombre}>
            {departamento.nombre}
          </h4>
        </div>

        <div className="coordinacion-actions">
          <button
            type="button"
            className="btn-action-icon"
            onClick={handleEdit}
            title="Editar departamento"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            className="btn-action-icon delete"
            onClick={handleDelete}
            title="Eliminar departamento"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="departamento-card-body">
        <p className="departamento-desc">
          {departamento.descripcion || 'Sin descripción registrada para este departamento.'}
        </p>

        {/* Bloque KPI con 4 Celdas */}
        <div className="departamento-kpi-block">
          <div className="kpi-cell">
            <span className="cell-label">Actividades Activas</span>
            <span className="cell-value">{stats.pendientesActivos}</span>
          </div>

          <div className="kpi-cell">
            <span className="cell-label">Control de Plazos</span>
            {stats.vencidas > 0 ? (
              <span className="cell-value alert-red">🚨 {stats.vencidas} vencida{stats.vencidas > 1 ? 's' : ''}</span>
            ) : stats.porVencer > 0 ? (
              <span className="cell-value alert-amber">⚠️ {stats.porVencer} en 48h</span>
            ) : (
              <span className="cell-value success">✓ Al día</span>
            )}
          </div>

          <div className="kpi-cell">
            <span className="cell-label">Documentos</span>
            <span className="cell-value">{stats.totalArchivos}</span>
          </div>

          <div className="kpi-cell">
            <span className="cell-label">Notas / Bitácora</span>
            <span className="cell-value">{stats.totalNotas}</span>
          </div>
        </div>
      </div>

      {/* Footer de la Tarjeta */}
      <div className="departamento-card-footer">
        <span>Estado: <strong>{departamento.estado || 'activo'}</strong></span>
        <span className="link-open-workspace">
          Abrir Espacio <IconArrowRight />
        </span>
      </div>
    </div>
  );
};
