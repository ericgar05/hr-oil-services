import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '../../../../../../api/supaBase';
import { useExecution } from '../../../../../../contexts/ExecutionContext';
import Modal from '../../../../../common/Modal/Modal';
import { ActividadEjecucion } from './ActividadEjecucion';

// Vector SVG Icons
const IconClipboardCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <polyline points="9 14 11 16 15 11"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconCheckSquare = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

export const DiaEjecucion = ({ dia }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);

  const getActividadesPorDia = useCallback(async (diaId) => {
    if (!diaId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('plan_actividades')
      .select(`
        *,
        subactividades:plan_subactividades(*),
        personal:plan_actividad_personal(*)
      `)
      .eq('dia_id', diaId)
      .order('created_at');

    if (error) {
      console.error('Error fetching actividades para ejecución:', error);
    } else {
      setActividades(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (dia?.id) {
      getActividadesPorDia(dia.id);
    }
  }, [dia, getActividadesPorDia]);

  // Operational metrics
  const totalPersonalAsignado = useMemo(() => {
    const pids = new Set();
    actividades.forEach(a => {
      (a.personal || []).forEach(p => {
        if (p.personal_id) pids.add(p.personal_id);
        else if (p.id) pids.add(p.id);
      });
    });
    return pids.size;
  }, [actividades]);

  const totalSubactividades = useMemo(() => {
    return actividades.reduce((acc, a) => acc + (a.subactividades?.length || 0), 0);
  }, [actividades]);

  const completedSubactividades = useMemo(() => {
    return actividades.reduce((acc, a) => acc + (a.subactividades?.filter(s => s.completada)?.length || 0), 0);
  }, [actividades]);

  const montoPlan = parseFloat(dia.monto_planificado) || 0;
  const montoEjec = parseFloat(dia.monto_ejecutado) || 0;

  return (
    <div className="ejecucion-dia-view">
      {/* Ficha Resumen Ejecutiva del Día (Limpia, sin botones superiores redundantes) */}
      <div className="detail-info-card dia-planning-unified-card dia-ejecucion-unified-card">
        <div className="dia-card-main-content">
          <div className="dia-card-main-left">
            {/* Etiqueta de contexto */}
            <div className="dia-card-badge-row">
              <span className="dia-context-badge">
                Ejecución Diaria
              </span>
            </div>

            {/* Título único de fecha */}
            <h2 className="dia-main-title">
              {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h2>

            {/* Badges de Métricas Operativas */}
            <div className="dia-metrics-pill-row">
              <div className="dia-metric-badge">
                <IconClipboardCheck />
                <span>
                  <strong>{actividades.length}</strong> {actividades.length === 1 ? 'actividad' : 'actividades'}
                </span>
              </div>

              {totalPersonalAsignado > 0 && (
                <div className="dia-metric-badge crew" title="Personal asignado a las actividades de hoy">
                  <IconUsers />
                  <span>
                    <strong>{totalPersonalAsignado}</strong> {totalPersonalAsignado === 1 ? 'en cuadrilla' : 'en cuadrilla'}
                  </span>
                </div>
              )}

              {totalSubactividades > 0 && (
                <div className="dia-metric-badge tasks" title="Progreso de tareas en checklist">
                  <IconCheckSquare />
                  <span>
                    <strong>{completedSubactividades}/{totalSubactividades}</strong> tareas listas
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hero Metric: Total Ejecutado vs Planificado */}
          <div className="dia-card-main-right">
            <div className="dia-hero-finance-box">
              <div className="dia-hero-finance-row">
                <span className="dia-hero-finance-label">Total Ejecutado</span>
                <div className="dia-hero-finance-val">
                  ${montoEjec.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="dia-hero-finance-plan-row">
                <span className="dia-hero-finance-sub">
                  Planificado: <strong>${montoPlan.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Actividades a Ejecutar */}
      <div className="execution-list-container">
        {loading ? (
          <div className="ejecucion-no-content">Cargando actividades del día...</div>
        ) : actividades.length > 0 ? (
          actividades.map(actividad => (
            <ActividadEjecucion
              key={actividad.id}
              actividadPlanificada={actividad}
              onFinalizar={() => getActividadesPorDia(dia.id)}
              onUpdate={() => getActividadesPorDia(dia.id)}
            />
          ))
        ) : (
          <div className="ejecucion-no-content">
            <p style={{ margin: 0 }}>No hay actividades planificadas para este día.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Subcomponent: Daily Report Modal (Grouped & Responsive)
export const DailyReportModal = ({ isOpen, onClose, diaId, diaFecha }) => {
  const [reports, setReports] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const { getReportesDia } = useExecution();

  useEffect(() => {
    if (isOpen && diaId) {
      setLoadingReport(true);
      getReportesDia(diaId).then(data => {
        setReports(data || []);
        setLoadingReport(false);
      });
    }
  }, [isOpen, diaId, getReportesDia]);

  // Grouping Logic by Activity
  const groupedReports = useMemo(() => {
    return reports.reduce((acc, report) => {
      const actId = report.actividad_id;
      if (!acc[actId]) {
        acc[actId] = {
          nombre: report.nombre_actividad,
          partida: report.nombre_partida,
          items: []
        };
      }
      acc[actId].items.push(report);
      return acc;
    }, {});
  }, [reports]);

  const formattedDateTitle = diaFecha
    ? new Date(diaFecha + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reporte de Ejecución${formattedDateTitle ? ` - ${formattedDateTitle}` : ''}`}
      size="lg"
    >
      <div className="ejecucion-modal-body">
        {loadingReport ? (
          <div className="ejecucion-report-loading">
            <p>Cargando reportes del día...</p>
          </div>
        ) : Object.keys(groupedReports).length > 0 ? (
          <div className="ejecucion-reports-stack">
            {Object.values(groupedReports).map((group, idx) => (
              <div key={idx} className="ejecucion-report-group-card">
                {/* Header de la Actividad */}
                <div className="ejecucion-report-group-header">
                  <div className="report-group-title-wrap">
                    <h4 className="report-group-title">{group.nombre}</h4>
                    {group.partida && <span className="report-group-partida">{group.partida}</span>}
                  </div>
                  <span className="report-group-badge">
                    {group.items.length} {group.items.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                {/* Lista de Registros */}
                <div className="ejecucion-report-group-items">
                  {group.items.map((item, itemIdx) => (
                    <div key={item.id || itemIdx} className="ejecucion-report-entry">
                      {/* Metadatos superiores */}
                      <div className="report-entry-meta">
                        <div className="report-meta-left">
                          <span className={`report-action-pill ${item.tipo_accion || 'cierre'}`}>
                            {item.tipo_accion?.replace('_', ' ') || 'AVANCE'}
                          </span>
                          <span className="report-timestamp">
                            {new Date(item.fecha_reporte).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="report-author">
                          👤 {item.usuario_reporta || 'Supervisor'}
                        </span>
                      </div>

                      {/* Cantidades y Trabajo */}
                      <div className="report-entry-content-grid">
                        <div className="report-content-box">
                          <span className="report-box-label">Ejecutado</span>
                          <div className="report-box-value highlight-green">
                            {item.cantidades_ejecutadas} UND
                          </div>
                        </div>

                        <div className="report-content-box details">
                          <span className="report-box-label">Trabajos Realizados</span>
                          <p className="report-box-desc">{item.descripcion_trabajo || 'Sin detalles'}</p>
                        </div>
                      </div>

                      {/* Observaciones / Justificación */}
                      {item.justificacion && (
                        <div className="report-entry-alert">
                          <span className="report-alert-label">Observaciones:</span>
                          <p className="report-alert-text">{item.justificacion}</p>
                        </div>
                      )}

                      {/* Materiales utilizados */}
                      {item.detalles?.materiales && item.detalles.materiales.length > 0 && (
                        <div className="report-entry-materials">
                          <span className="materials-title">📦 Materiales Utilizados:</span>
                          <div className="materials-chip-list">
                            {item.detalles.materiales.map((m, mIdx) => (
                              <span key={mIdx} className="material-chip">
                                {m.nombre}: <strong>{m.cantidad} {m.unidad}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ejecucion-report-empty">
            <p>No se encontraron reportes registrados para este día.</p>
          </div>
        )}

        <div className="ejecucion-modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DiaEjecucion;
