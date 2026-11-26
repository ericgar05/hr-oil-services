// src/components/modules/coordinaciones/components/workspace/tabs/AgendaTab.jsx
import { useMemo } from 'react';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';

const IconCalendar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export const AgendaTab = ({ coordinacion, departamento }) => {
  const currentCoord = coordinacion || departamento;
  const { pendientes, updatePendiente } = useCoordinaciones();

  // Filtrar actividades con fecha límite asignada de esta coordinación
  const deptAgenda = useMemo(() => {
    return pendientes
      .filter((p) => (p.coordinacion_id === currentCoord.id || p.departamento_id === currentCoord.id) && p.fecha_limite)
      .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
  }, [pendientes, currentCoord.id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const next7DaysStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Grupos Cronológicos
  const vencidas = useMemo(() => {
    return deptAgenda.filter((p) => p.fecha_limite < todayStr && p.estado !== 'Completado');
  }, [deptAgenda, todayStr]);

  const estaSemana = useMemo(() => {
    return deptAgenda.filter(
      (p) => p.fecha_limite >= todayStr && p.fecha_limite <= next7DaysStr && p.estado !== 'Completado'
    );
  }, [deptAgenda, todayStr, next7DaysStr]);

  const proximas = useMemo(() => {
    return deptAgenda.filter((p) => p.fecha_limite > next7DaysStr && p.estado !== 'Completado');
  }, [deptAgenda, next7DaysStr]);

  const completadas = useMemo(() => {
    return deptAgenda.filter((p) => p.estado === 'Completado');
  }, [deptAgenda]);

  const handleToggleCompleted = (act) => {
    const nextEstado = act.estado === 'Completado' ? 'Pendiente' : 'Completado';
    updatePendiente(act.id, { estado: nextEstado });
  };

  const renderAgendaCard = (act, variantClass = '') => (
    <div
      key={act.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.15rem',
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        marginBottom: '0.65rem',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
        <input
          type="checkbox"
          checked={act.estado === 'Completado'}
          onChange={() => handleToggleCompleted(act)}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          title="Marcar como completada"
        />
        <div style={{ minWidth: 0 }}>
          <h5
            style={{
              margin: '0 0 0.2rem 0',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: act.estado === 'Completado' ? '#94a3b8' : '#0f172a',
              textDecoration: act.estado === 'Completado' ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {act.titulo}
          </h5>
          <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.78rem', color: '#64748b' }}>
            {act.responsable && <span>👤 {act.responsable}</span>}
            <span
              style={{
                fontWeight: 700,
                textTransform: 'uppercase',
                color: act.prioridad === 'Alta' ? '#dc2626' : act.prioridad === 'Media' ? '#d97706' : '#64748b',
              }}
            >
              • {act.prioridad}
            </span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontSize: '0.88rem',
            fontWeight: 800,
            fontFamily: 'ui-monospace, monospace',
            color: variantClass === 'vencidas' ? '#dc2626' : variantClass === 'hoy' ? '#d97706' : '#1e40af',
          }}
        >
          📅 {new Date(act.fecha_limite + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          {new Date(act.fecha_limite + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
          Control de Plazos y Agenda
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
          Seguimiento cronológico estricto de las actividades con fecha límite asignada.
        </p>
      </div>

      {deptAgenda.length === 0 ? (
        <div className="coordinaciones-empty-state">
          <div className="empty-state-icon">
            <IconCalendar />
          </div>
          <h4>Sin plazos o fechas programadas</h4>
          <p>No hay actividades con fecha límite asignada en este departamento.</p>
        </div>
      ) : (
        <>
          {/* Bloque 1: Vencidas */}
          {vencidas.length > 0 && (
            <div className="agenda-block">
              <h5 className="agenda-block-title vencidas">
                🚨 Vencidas ({vencidas.length})
              </h5>
              {vencidas.map((act) => renderAgendaCard(act, 'vencidas'))}
            </div>
          )}

          {/* Bloque 2: Para Hoy / Esta Semana */}
          {estaSemana.length > 0 && (
            <div className="agenda-block">
              <h5 className="agenda-block-title hoy-semana">
                ⚠️ Para Hoy y Próximos 7 Días ({estaSemana.length})
              </h5>
              {estaSemana.map((act) => renderAgendaCard(act, 'hoy'))}
            </div>
          )}

          {/* Bloque 3: Próximas */}
          {proximas.length > 0 && (
            <div className="agenda-block">
              <h5 className="agenda-block-title proximas">
                ⏳ Próximas en Agenda ({proximas.length})
              </h5>
              {proximas.map((act) => renderAgendaCard(act, 'proximas'))}
            </div>
          )}

          {/* Bloque 4: Completadas */}
          {completadas.length > 0 && (
            <div className="agenda-block">
              <h5 className="agenda-block-title completadas">
                ✅ Completadas con Plazo ({completadas.length})
              </h5>
              {completadas.map((act) => renderAgendaCard(act, 'completadas'))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
