// src/components/modules/coordinaciones/components/CoordinacionCard.jsx
import { useCoordinaciones } from '../../../../contexts/CoordinacionesContext';

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconFolder = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
  </svg>
);

const IconCheckSquare = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const IconClipboardCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <polyline points="9 14 11 16 15 11"></polyline>
  </svg>
);

const IconBookOpen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const CoordinacionCard = ({
  coordinacion,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { getCoordinacionStats } = useCoordinaciones();
  const stats = getCoordinacionStats(coordinacion.id);

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(coordinacion);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `¿Estás seguro de eliminar la coordinación "${coordinacion.nombre}"? Se eliminarán todas sus actividades, archivos y notas asociadas.`
      )
    ) {
      onDelete(coordinacion.id);
    }
  };

  return (
    <div
      className="coordinacion-card"
      onClick={() => onSelect(coordinacion)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(coordinacion);
        }
      }}
    >
      {/* Header superior idéntico a Semanas, Días y Valuaciones */}
      <div className="card-header">
        <div className="card-title-group">
          {coordinacion.codigo && (
            <span className="coordinacion-partida-badge">
              <IconFolder />
              <span>{coordinacion.codigo}</span>
            </span>
          )}
          <h4 className="coordinacion-title" title={coordinacion.nombre}>
            {coordinacion.nombre}
          </h4>
        </div>

        <div className="card-actions-group">
          <button
            type="button"
            className="btn-action-icon edit"
            onClick={handleEdit}
            title="Editar coordinación"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            className="btn-action-icon delete"
            onClick={handleDelete}
            title="Eliminar coordinación"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="card-body">
        {/* Badge Responsable (Estilo periodo-badge-row) */}
        {coordinacion.responsable && (
          <div className="periodo-badge-row">
            <IconUser />
            <span>
              Responsable: <strong>{coordinacion.responsable}</strong>
            </span>
          </div>
        )}

        {/* Descripción de la Coordinación */}
        <p className="coordinacion-desc">
          {coordinacion.descripcion || 'Espacio de trabajo operativo para la coordinación de actividades, plazos y documentos.'}
        </p>

        {/* Bloque Financiero y Operativo de 2 Filas (Homogéneo con Valuaciones y Planificación) */}
        <div className="card-financial-block">
          {/* Fila 1: Actividades Activas + Completadas */}
          <div className="financial-row-1">
            <div className="financial-cell">
              <span className="cell-label">Actividades Activas</span>
              <span className="cell-val highlight-blue">
                <IconCheckSquare />
                <span>{stats.pendientesActivos} activa{stats.pendientesActivos !== 1 ? 's' : ''}</span>
              </span>
              {stats.vencidas > 0 ? (
                <span className="kpi-alert-badge overdue">
                  ⚠️ {stats.vencidas} vencida{stats.vencidas > 1 ? 's' : ''}
                </span>
              ) : stats.porVencer > 0 ? (
                <span className="kpi-alert-badge soon">
                  ⏰ {stats.porVencer} por vencer
                </span>
              ) : null}
            </div>

            <div className="financial-cell right">
              <span className="cell-label">Completadas</span>
              <span className="cell-val highlight-green">
                <IconClipboardCheck />
                <span>{stats.completados}</span>
              </span>
            </div>
          </div>

          {/* Fila 2: Documentos + Notas */}
          <div className="financial-row-2">
            <div className="financial-cell">
              <span className="cell-label">Documentos</span>
              <span className="cell-val highlight-slate">
                <IconFolder />
                <span>{stats.totalArchivos}</span>
              </span>
            </div>

            <div className="financial-cell right">
              <span className="cell-label">Notas / Bitácora</span>
              <span className="cell-val highlight-slate">
                <IconBookOpen />
                <span>{stats.totalNotas}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de la Tarjeta */}
      <div className="card-footer-row">
        <span className={`status-pill ${coordinacion.estado === 'activo' ? 'active' : 'inactive'}`}>
          {coordinacion.estado === 'activo' ? 'En Operación' : 'Inactivo'}
        </span>

        <span className="btn-enter-workspace">
          <span>Entrar al Espacio</span>
          <IconArrowRight />
        </span>
      </div>
    </div>
  );
};
