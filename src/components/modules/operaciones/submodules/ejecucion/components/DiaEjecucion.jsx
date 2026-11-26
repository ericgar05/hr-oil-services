import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../../../api/supaBase';
import { useExecution } from '../../../../../../contexts/ExecutionContext';
import Modal from '../../../../../common/Modal/Modal';
import { ActividadEjecucion } from './ActividadEjecucion';

export const DiaEjecucion = ({ dia, onBack }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);

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

  return (
    <div className="ejecucion-detail-container">
      {/* Info Card de Identidad del Día */}
      <div className="detail-info-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="semana-pill primary" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ejecución Diaria
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
              {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span>📋 <strong>{actividades.length}</strong> actividades</span>
              <span>•</span>
              <span>💰 Plan: <strong>${(dia.monto_planificado || 0).toLocaleString()}</strong></span>
              <span>•</span>
              <span>✅ Ejec: <strong style={{ color: '#16a34a' }}>${(dia.monto_ejecutado || 0).toLocaleString()}</strong></span>
            </div>
          </div>

          <button
            onClick={() => setShowDailyReport(true)}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px' }}
          >
            📋 Reporte del Día
          </button>
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

      {/* Daily Report Modal */}
      <DailyReportModal
        isOpen={showDailyReport}
        onClose={() => setShowDailyReport(false)}
        diaId={dia.id}
        diaFecha={dia.fecha}
      />
    </div>
  );
};

// Subcomponent: Daily Report Modal (Grouped)
const DailyReportModal = ({ isOpen, onClose, diaId, diaFecha }) => {
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

  // Grouping Logic
  const groupedReports = reports.reduce((acc, report) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reporte General del Día - ${new Date(diaFecha + 'T00:00:00').toLocaleDateString()}`}>
      <div style={{ padding: '20px' }}>
        {loadingReport ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Cargando reportes del día...</div>
        ) : Object.keys(groupedReports).length > 0 ? (
          <div className="reports-stack" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {Object.values(groupedReports).map((group, idx) => (
              <div key={idx} className="activity-group">
                {/* Activity Header */}
                <div style={{
                  backgroundColor: '#f1f5f9',
                  padding: '10px 15px',
                  borderRadius: '8px 8px 0 0',
                  border: '1px solid #e2e8f0',
                  borderBottom: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#334155', fontSize: '1rem' }}>{group.nombre}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{group.partida}</span>
                  </div>
                  <span style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>
                    {group.items.length} Reportes
                  </span>
                </div>

                {/* Reports List */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  padding: '15px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  {group.items.map((report) => (
                    <div key={report.id} className="report-item-compact" style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '15px', marginBottom: '5px' }}>

                      {/* Sub-Header: Type & Date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          backgroundColor: report.tipo_accion === 'replanificacion' ? '#fff7ed' : (report.tipo_accion === 'avance_diario' ? '#eff6ff' : '#f0fdf4'),
                          color: report.tipo_accion === 'replanificacion' ? '#c2410c' : (report.tipo_accion === 'avance_diario' ? '#1d4ed8' : '#15803d'),
                          padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase'
                        }}>
                          {report.tipo_accion?.replace('_', ' ') || 'REPORTE'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(report.fecha_reporte).toLocaleDateString()} • Por: {report.usuario_reporta}
                        </div>
                      </div>

                      {/* Body Description */}
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#334155', whiteSpace: 'pre-wrap' }}>
                        {report.descripcion_trabajo}
                      </p>

                      {/* Quantities Mini-Bar */}
                      <div style={{
                        display: 'flex',
                        gap: '15px',
                        fontSize: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        color: '#475569'
                      }}>
                        <span>Ejecutado hoy: <strong style={{ color: '#15803d' }}>{report.cantidades_ejecutadas}</strong></span>
                        {report.cantidades_pendientes > 0 && (
                          <span>Pendiente: <strong style={{ color: '#d97706' }}>{report.cantidades_pendientes}</strong></span>
                        )}
                      </div>

                      {/* Materials List (If Any) */}
                      {report.materiales_consumidos && report.materiales_consumidos.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#475569' }}>
                          <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>Materiales utilizados:</span>
                          <ul style={{ margin: 0, paddingLeft: '15px' }}>
                            {report.materiales_consumidos.map((m, i) => (
                              <li key={i}>{m.nombre} - {m.cantidad} {m.unidad}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Justification if Replanned */}
                      {report.justificacion_replanificacion && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '0.75rem',
                          color: '#b45309',
                          backgroundColor: '#fefce8',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #fef08a'
                        }}>
                          <strong>Justificación:</strong> {report.justificacion_replanificacion}
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            No hay reportes de ejecución registrados para este día.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DiaEjecucion;
