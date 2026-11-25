// components/ejecucion/SemanaEjecucion.jsx
import { useState, useEffect } from 'react';
import { useExecution } from '../../../../../../contexts/ExecutionContext';
import { useBudget } from '../../../../../../contexts/BudgetContext';
import Modal from '../../../../../common/Modal/Modal';
import { DiasEjecucion } from './DiasEjecucion';
import { DiaEjecucion } from './DiaEjecucion';
import { MetricasSemana } from './MetricasSemana';

export const SemanaEjecucion = ({
  semana,
  onBack,
  selectedDia,
  onSelectDia,
  dias,
  setDias,
}) => {
  const [vista, setVista] = useState('dias'); // 'dias' | 'metricas'
  const [showReporteSemana, setShowReporteSemana] = useState(false);
  const { budget: presupuestoData } = useBudget();

  const ejecutado = semana.monto_ejecutado || 0;
  const planificado = semana.monto_planificado || 0;
  const diff = Math.max(0, planificado - ejecutado);
  const porcentaje = planificado > 0 ? Math.min(100, (ejecutado / planificado) * 100) : 0;

  const fechaInicioStr = semana.fecha_inicio
    ? new Date(semana.fecha_inicio + "T00:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const fechaFinStr = semana.fecha_fin
    ? new Date(semana.fecha_fin + "T00:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  // Si hay un día seleccionado, mostramos directamente la vista del día (sin tarjeta semanal redundante)
  if (selectedDia) {
    return (
      <div className="ejecucion-detail-container">
        <DiaEjecucion
          dia={selectedDia}
          onBack={() => onSelectDia && onSelectDia(null)}
        />
      </div>
    );
  }

  return (
    <div className="ejecucion-detail-container">
      {/* Barra Superior de Acciones de la Semana */}
      <div className="header-top" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
        <div className="header-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowReporteSemana(true)}
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", padding: "0.6rem 1.1rem" }}
          >
            📋 Reporte Semanal
          </button>

          <button
            type="button"
            onClick={() => setVista('dias')}
            className={`btn-toggle-view ${vista === 'dias' ? 'active' : ''}`}
          >
            📅 Días de Ejecución
          </button>

          <button
            type="button"
            onClick={() => setVista('metricas')}
            className={`btn-toggle-view ${vista === 'metricas' ? 'active' : ''}`}
          >
            📊 Métricas Semanales
          </button>
        </div>
      </div>

      {/* Ficha Resumen de la Semana (Estilo ValuacionDetail Card) */}
      <div className="detail-info-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span className="tag-badge primary">SEMANA {semana.numero_semana}</span>
          {presupuestoData?.contratoNumero && (
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Contrato Nº: <strong>{presupuestoData.contratoNumero}</strong>
            </span>
          )}
          <span
            className="tag-badge status status-success"
            style={{ marginLeft: "auto", fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
          >
            Avance: {porcentaje.toFixed(1)}%
          </span>
        </div>

        <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "1.35rem", fontWeight: "800", color: "#0f172a" }}>
          CONTROL DE EJECUCIÓN SEMANAL
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.25rem",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "0.85rem",
            marginBottom: "1rem"
          }}
        >
          <div>
            <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>
              PERIODO DE TRABAJO
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b" }}>
              📅 {fechaInicioStr} — {fechaFinStr}
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>
              ESTADO OPERATIVO
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>
              {semana.estado ? semana.estado.replace('_', ' ').toUpperCase() : "EN SEGUIMIENTO"}
            </span>
          </div>

          <div>
            <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>
              ACTIVIDADES DEL CICLO
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#1e40af" }}>
              {semana.cantidad_actividades || 0} registradas
            </span>
          </div>
        </div>

        {/* Métricas Financieras de la Semana (4 Celdas) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "12px",
          }}
        >
          <div className="financial-mini-card">
            <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
              Ejecutado
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#15803d", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
              ${ejecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="financial-mini-card">
            <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
              Planificado
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e40af", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
              ${planificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="financial-mini-card">
            <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
              Pendiente
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: diff > 0 ? "#d97706" : "#64748b", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
              ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="financial-mini-card">
            <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
              Avance Físico/Financiero
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: porcentaje >= 100 ? "#15803d" : "#0f172a", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
              {porcentaje.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ flexGrow: 1 }}>
        {vista === 'dias' ? (
          <DiasEjecucion
            semanaId={semana.id}
            onSelectDia={onSelectDia}
            dias={dias}
            setDias={setDias}
          />
        ) : (
          <MetricasSemana semana={semana} />
        )}
      </div>

      {/* Weekly Report Modal */}
      <WeeklyReportModal
        isOpen={showReporteSemana}
        onClose={() => setShowReporteSemana(false)}
        semanaId={semana.id}
      />
    </div>
  );
};

// Subcomponent: Weekly Report Modal
const WeeklyReportModal = ({ isOpen, onClose, semanaId }) => {
  const [reports, setReports] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const { getReportesSemana } = useExecution();

  useEffect(() => {
    if (isOpen && semanaId) {
      setLoadingReport(true);
      getReportesSemana(semanaId).then(data => {
        setReports(data || []);
        setLoadingReport(false);
      });
    }
  }, [isOpen, semanaId, getReportesSemana]);

  // Grouping Logic by Activity ID
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
    <Modal isOpen={isOpen} onClose={onClose} title="Reporte Semanal de Ejecución">
      <div style={{ padding: '20px' }}>
        {loadingReport ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Cargando reportes de la semana...</div>
        ) : Object.keys(groupedReports).length > 0 ? (
          <div className="reports-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.values(groupedReports).map((group, idx) => (
              <div key={idx} className="activity-group" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: '700' }}>{group.nombre}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📂 {group.partida}</span>
                  </div>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {group.items.length} Reportes
                  </span>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {group.items.map((report) => (
                    <div key={report.id} style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          backgroundColor: report.tipo_accion === 'replanificacion' ? '#fff7ed' : '#f0fdf4',
                          color: report.tipo_accion === 'replanificacion' ? '#c2410c' : '#15803d',
                          padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase'
                        }}>
                          {report.tipo_accion?.replace('_', ' ') || 'AVANCE'}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {new Date(report.fecha_reporte).toLocaleDateString()} • Por: {report.usuario_reporta}
                        </div>
                      </div>

                      <p style={{ margin: '0 0 6px 0', fontSize: '0.875rem', color: '#334155' }}>
                        {report.descripcion_trabajo}
                      </p>

                      <div style={{ fontSize: '0.8rem', display: 'flex', gap: '15px', color: '#475569' }}>
                        <span>Ejec: <strong style={{ color: '#15803d' }}>{report.cantidades_ejecutadas}</strong></span>
                        {report.cantidades_pendientes > 0 && <span>Pend: <strong style={{ color: '#d97706' }}>{report.cantidades_pendientes}</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
            No hay reportes registrados para esta semana.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SemanaEjecucion;
