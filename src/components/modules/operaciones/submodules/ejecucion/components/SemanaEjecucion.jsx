// components/ejecucion/SemanaEjecucion.jsx
import { useState, useEffect, useMemo } from 'react';
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
  vista = 'dias',
}) => {
  const { budget: presupuestoData } = useBudget();

  const ejecutado = semana.monto_ejecutado || 0;
  const planificado = semana.monto_planificado || 0;
  const diff = Math.max(0, planificado - ejecutado);
  const porcentaje = planificado > 0 ? Math.min(100, (ejecutado / planificado) * 100) : 0;

  const totalActividadesSemana = useMemo(() => {
    if (dias && dias.length > 0) {
      return dias.reduce((acc, d) => acc + (d.cantidad_actividades || 0), 0);
    }
    return semana.cantidad_actividades || 0;
  }, [dias, semana.cantidad_actividades]);

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

  // Si hay un día seleccionado, mostramos directamente la vista del día
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
      {/* Ficha Resumen de la Semana (Limpia, controles en barra inferior) */}
      <div className="detail-info-card semana-ejecucion-summary-card">
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

        <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "clamp(1.1rem, 2.2vw, 1.35rem)", fontWeight: "800", color: "#0f172a" }}>
          CONTROL DE EJECUCIÓN SEMANAL
        </h3>

        <div className="semana-meta-grid">
          <div>
            <span className="meta-label">PERIODO DE TRABAJO</span>
            <span className="meta-value">
              📅 {fechaInicioStr} — {fechaFinStr}
            </span>
          </div>

          <div>
            <span className="meta-label">ESTADO OPERATIVO</span>
            <span className="meta-value strong">
              {semana.estado ? semana.estado.replace('_', ' ').toUpperCase() : "EN SEGUIMIENTO"}
            </span>
          </div>

          <div>
            <span className="meta-label">ACTIVIDADES DEL CICLO</span>
            <span className="meta-value accent">
              {totalActividadesSemana} registradas
            </span>
          </div>
        </div>

        {/* Métricas Financieras de la Semana (4 Celdas) */}
        <div className="semana-financial-grid">
          <div className="financial-mini-card">
            <span className="mini-card-label">Ejecutado</span>
            <div className="mini-card-val green">
              ${ejecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="financial-mini-card">
            <span className="mini-card-label">Planificado</span>
            <div className="mini-card-val blue">
              ${planificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="financial-mini-card">
            <span className="mini-card-label">Pendiente</span>
            <div className="mini-card-val" style={{ color: diff > 0 ? "#d97706" : "#64748b" }}>
              ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="financial-mini-card">
            <span className="mini-card-label">Avance Físico/Financiero</span>
            <div className="mini-card-val" style={{ color: porcentaje >= 100 ? "#15803d" : "#0f172a" }}>
              {porcentaje.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Dinámico (Días de Ejecución o Métricas) */}
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
    </div>
  );
};

// Subcomponent: Weekly Report Modal (Modernizado y Exportado para uso en EjecucionMain)
export const WeeklyReportModal = ({ isOpen, onClose, semanaId, semanaNumero }) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reporte Semanal de Ejecución${semanaNumero ? ` - Semana ${semanaNumero}` : ''}`}
      size="lg"
    >
      <div className="ejecucion-modal-body">
        {loadingReport ? (
          <div className="ejecucion-report-loading">
            <p>Cargando reportes de la semana...</p>
          </div>
        ) : Object.keys(groupedReports).length > 0 ? (
          <div className="ejecucion-reports-stack">
            {Object.values(groupedReports).map((group, idx) => (
              <div key={idx} className="ejecucion-report-group-card">
                <div className="ejecucion-report-group-header">
                  <div className="report-group-title-wrap">
                    <h4 className="report-group-title">{group.nombre}</h4>
                    {group.partida && <span className="report-group-partida">{group.partida}</span>}
                  </div>
                  <span className="report-group-badge">
                    {group.items.length} {group.items.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                <div className="ejecucion-report-group-items">
                  {group.items.map((report, rIdx) => (
                    <div key={report.id || rIdx} className="ejecucion-report-entry">
                      <div className="report-entry-meta">
                        <div className="report-meta-left">
                          <span className={`report-action-pill ${report.tipo_accion || 'cierre'}`}>
                            {report.tipo_accion?.replace('_', ' ') || 'AVANCE'}
                          </span>
                          <span className="report-timestamp">
                            {new Date(report.fecha_reporte).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="report-author">
                          👤 {report.usuario_reporta || 'Supervisor'}
                        </span>
                      </div>

                      <div className="report-entry-content-grid">
                        <div className="report-content-box">
                          <span className="report-box-label">Ejecutado</span>
                          <div className="report-box-value highlight-green">
                            {report.cantidades_ejecutadas} UND
                          </div>
                          {report.cantidades_pendientes > 0 && (
                            <span style={{ fontSize: '0.72rem', color: '#d97706', display: 'block', marginTop: '2px', fontWeight: 600 }}>
                              Pend: {report.cantidades_pendientes}
                            </span>
                          )}
                        </div>

                        <div className="report-content-box details">
                          <span className="report-box-label">Trabajos Realizados</span>
                          <p className="report-box-desc">{report.descripcion_trabajo || 'Sin detalles'}</p>
                        </div>
                      </div>

                      {report.justificacion && (
                        <div className="report-entry-alert">
                          <span className="report-alert-label">Observaciones:</span>
                          <p className="report-alert-text">{report.justificacion}</p>
                        </div>
                      )}

                      {report.detalles?.materiales && report.detalles.materiales.length > 0 && (
                        <div className="report-entry-materials">
                          <span className="materials-title">📦 Materiales Utilizados:</span>
                          <div className="materials-chip-list">
                            {report.detalles.materiales.map((m, mIdx) => (
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
            <p>No hay reportes registrados para esta semana.</p>
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

export default SemanaEjecucion;
