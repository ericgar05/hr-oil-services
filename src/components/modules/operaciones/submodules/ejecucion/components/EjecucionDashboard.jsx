// components/ejecucion/EjecucionDashboard.jsx
import React from 'react';
import { useMetricas } from '../../../../../../hooks/useMetricas';
import { useProjects } from '../../../../../../contexts/ProjectContext';

// Iconos Vectoriales SVG Profesionales
const IconActivity = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const IconDollar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const IconEfficiency = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const EjecucionDashboard = ({ semanas, actividades }) => {
  const { selectedProject } = useProjects();
  const { calcularKPIs } = useMetricas();

  const kpis = calcularKPIs(selectedProject, actividades, semanas);

  return (
    <div className="ejecucion-dashboard">
      {/* Header Bar */}
      <div className="ejecucion-list-header">
        <div className="header-titles">
          <h2>Dashboard de Control y Avance</h2>
          <p>Métricas operativas de campo, eficiencia de cuadrillas y cumplimiento de metas</p>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen General */}
      <div className="resumen-general" style={{ marginBottom: '1.5rem' }}>
        <div className="resumen-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          {/* KPI 1: Avance Físico */}
          <div className="resumen-card">
            <div className="resumen-icon primary">
              <IconActivity />
            </div>
            <div className="resumen-content">
              <div className="resumen-value" style={{ color: '#1e40af' }}>{kpis.avanceFisico}%</div>
              <div className="resumen-label">Avance Físico Ponderado</div>
              <div className="resumen-subtitle">Progreso de actividades</div>
            </div>
          </div>

          {/* KPI 2: Avance Financiero */}
          <div className="resumen-card">
            <div className="resumen-icon success">
              <IconDollar />
            </div>
            <div className="resumen-content">
              <div className="resumen-value" style={{ color: '#15803d' }}>{kpis.avanceFinanciero}%</div>
              <div className="resumen-label">Avance Financiero</div>
              <div className="resumen-subtitle">
                ${(kpis.montoCompletado || 0).toLocaleString()} / ${(kpis.montoPlanificado || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* KPI 3: Eficiencia Operativa */}
          <div className="resumen-card">
            <div className="resumen-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <IconEfficiency />
            </div>
            <div className="resumen-content">
              <div className="resumen-value" style={{ color: '#6d28d9' }}>{kpis.eficienciaGeneral}%</div>
              <div className="resumen-label">Eficiencia Operativa</div>
              <div className="resumen-subtitle">
                {kpis.actividadesCompletadas} de {kpis.actividadesTotales} completadas
              </div>
            </div>
          </div>

          {/* KPI 4: Cumplimiento de Plazos */}
          <div className="resumen-card">
            <div className="resumen-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <IconClock />
            </div>
            <div className="resumen-content">
              <div className="resumen-value" style={{ color: '#c2410c' }}>{kpis.cumplimientoPlazos}%</div>
              <div className="resumen-label">Cumplimiento de Plazos</div>
              <div className="resumen-subtitle">Actividades en cronograma</div>
            </div>
          </div>
        </div>

        {/* Barra de Progreso Global */}
        <div className="progress-section" style={{ marginTop: '1rem' }}>
          <div className="progress-header">
            <span className="progress-title">Progreso de Ejecución Física de Proyecto</span>
            <span className="progress-pct">{kpis.avanceFisico}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, kpis.avanceFisico))}%` }}
            ></div>
          </div>
          <div className="progress-details" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Actividades en Proceso: <strong>{kpis.actividadesEnProceso}</strong></span>
            <span>Completadas: <strong>{kpis.actividadesCompletadas}</strong> / {kpis.actividadesTotales}</span>
          </div>
        </div>
      </div>

      {/* Panel de Alertas Activas */}
      <AlertasPanel actividades={actividades} />
    </div>
  );
};

// Componente interno para alertas estilizado con estándar corporativo
const AlertasPanel = ({ actividades }) => {
  const alertas = (actividades || []).filter(act =>
    act.estado === 'en_proceso' &&
    (act.fecha_planificada || act.plan_dias?.fecha) &&
    new Date(act.fecha_planificada || act.plan_dias?.fecha) < new Date()
  ).slice(0, 5);

  if (alertas.length === 0) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#dcfce7',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconCheckCircle />
        </div>
        <div>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: '700', color: '#166534' }}>
            Operaciones en Cronograma
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#15803d' }}>
            No se detectan actividades retrasadas ni desviaciones de plazos activas en el proyecto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fffbeb',
      border: '1.5px solid #fde68a',
      borderRadius: '12px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: '#fef3c7',
          color: '#b45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconAlert />
        </div>
        <div>
          <h4 style={{ margin: '0 0 2px 0', fontSize: '1rem', fontWeight: '700', color: '#92400e' }}>
            Alertas de Ejecución Activas ({alertas.length})
          </h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#b45309' }}>
            Actividades marcadas "en proceso" cuya fecha programada ya venció:
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alertas.map((alerta, index) => {
          const fechaStr = alerta.fecha_planificada || alerta.plan_dias?.fecha;
          return (
            <div
              key={index}
              style={{
                background: '#ffffff',
                border: '1px solid #fef08a',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <div>
                <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                  {alerta.descripcion || alerta.nombre || 'Actividad Operativa'}
                </strong>
                {alerta.equipos?.nombre && (
                  <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                    ({alerta.equipos.nombre})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: '600' }}>
                  Venció: {fechaStr ? new Date(fechaStr + 'T00:00:00').toLocaleDateString() : 'N/A'}
                </span>
                <span style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase'
                }}>
                  Retrasada
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
