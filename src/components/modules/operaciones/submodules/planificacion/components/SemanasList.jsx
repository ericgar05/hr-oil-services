// components/planificacion/SemanasList.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { usePersonal } from "../../../../../../contexts/PersonalContext";
import { useProjects } from "../../../../../../contexts/ProjectContext";
import { usePlanning } from "../../../../../../contexts/PlanningContext";
import { calculateDailyLaborCost } from "../../../../../../utils/payrollCalculator";

// Iconos Vectoriales SVG Profesionales
const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

// Iconos Vectoriales SVG Profesionales
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconBarChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const IconDollar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export const SemanasList = ({
  semanas = [],
  onSelectSemana,
  onGenerarPlanificacion,
  generating,
  onSyncTotals,
  onEliminarPlanificacion,
  onShowInfo,
}) => {
  const { getEmployeesByProject } = usePersonal();
  const { selectedProject } = useProjects();
  const { actividades } = usePlanning();
  const [employees, setEmployees] = useState([]);

  // Memorizar fechas activas
  const activeDates = useMemo(() => {
    if (!actividades) return new Set();
    const dates = new Set();
    actividades.forEach((a) => {
      if (a.plan_dias && a.plan_dias.fecha) {
        dates.add(a.plan_dias.fecha.split("T")[0]);
      }
    });
    return dates;
  }, [actividades]);

  useEffect(() => {
    const loadEmps = async () => {
      if (selectedProject?.id) {
        const data = await getEmployeesByProject(selectedProject.id);
        setEmployees(data || []);
      }
    };
    loadEmps();
  }, [selectedProject, getEmployeesByProject]);

  const calculateWeeklyPayroll = useCallback(
    (semana) => {
      if (!employees.length || !semana.fecha_inicio || !semana.fecha_fin) return 0;

      let total = 0;
      const startDate = new Date(semana.fecha_inicio + "T12:00:00");
      const endDate = new Date(semana.fecha_fin + "T12:00:00");

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        if (activeDates.has(dateStr)) {
          employees.forEach((emp) => {
            if (
              emp.estado === "Activo" ||
              emp.estado === "Vacaciones" ||
              emp.estado === "Reposo"
            ) {
              total += calculateDailyLaborCost(emp, dateStr);
            }
          });
        }
      }
      return total;
    },
    [employees, activeDates]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Cálculos globales
  const totalPlanificado = useMemo(() => {
    return semanas.reduce((acc, s) => acc + (s.monto_planificado || 0), 0);
  }, [semanas]);

  const totalEjecutado = useMemo(() => {
    return semanas.reduce((acc, s) => acc + (s.monto_ejecutado || 0), 0);
  }, [semanas]);

  const totalRequerimientos = useMemo(() => {
    return semanas.reduce((acc, s) => acc + (s.monto_requerimientos || 0), 0);
  }, [semanas]);

  const porcentajeGlobal =
    totalPlanificado > 0 ? (totalEjecutado / totalPlanificado) * 100 : 0;

  // Estado vacío si no hay semanas
  if (!semanas || semanas.length === 0) {
    return (
      <div className="planning-list">
        <div className="planning-empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No hay planificación generada</h3>
          <p>
            Genera las semanas de trabajo basadas en la duración del proyecto
            para comenzar a programar actividades y estimar requerimientos.
          </p>
          <button
            type="button"
            onClick={onGenerarPlanificacion}
            disabled={generating}
            className="btn-primary-large"
          >
            {generating ? "Generando..." : "Generar Planificación Inicial"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="planning-list">
      {/* Encabezado del Módulo (Estilo ValuacionesList) */}
      <div className="list-header">
        <div className="header-content">
          <h3>Semanas Planificadas</h3>
          <p>Supervisión cronológica y financiera del cronograma operativo</p>
        </div>

        <div className="header-actions">
          <div className="badge-total-pill">
            <span>TOTAL PLANIFICADO:</span>
            <strong>${totalPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

          <button
            type="button"
            onClick={onSyncTotals}
            className="planning-action-btn"
            title="Sincronizar y recalcular montos"
          >
            <IconRefresh />
          </button>

          <button
            type="button"
            onClick={onEliminarPlanificacion}
            className="planning-action-btn danger"
            title="Eliminar toda la planificación"
          >
            <IconTrash />
          </button>

          <button
            type="button"
            onClick={onShowInfo}
            className="planning-action-btn"
            title="Información del módulo"
          >
            <IconInfo />
          </button>
        </div>
      </div>

      {/* Resumen General y Métricas KPI (Idéntico a Valuaciones) */}
      <div className="resumen-general">
        <div className="resumen-cards">
          {/* Card 1: Total Semanas */}
          <div className="resumen-card">
            <div className="resumen-icon primary">
              <IconBarChart />
            </div>
            <div className="resumen-content">
              <div className="resumen-value">{semanas.length}</div>
              <div className="resumen-label">Semanas Planificadas</div>
              <div className="resumen-subtitle">Cronograma completo</div>
            </div>
          </div>

          {/* Card 2: Monto Planificado */}
          <div className="resumen-card">
            <div className="resumen-icon success">
              <IconDollar />
            </div>
            <div className="resumen-content">
              <div className="resumen-value">
                ${totalPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="resumen-label">Total Planificado</div>
              <div className="resumen-subtitle">
                Req: ${totalRequerimientos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Card 3: Avance Financiero */}
          <div className="resumen-card">
            <div className="resumen-icon info">
              <IconTrendingUp />
            </div>
            <div className="resumen-content">
              <div className="resumen-value">{porcentajeGlobal.toFixed(1)}%</div>
              <div className="resumen-label">Avance Ejecución</div>
              <div className="resumen-subtitle">
                Ejecutado: ${totalEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progreso General */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-title">Ejecución Financiera de la Planificación</span>
            <span className="progress-pct">{porcentajeGlobal.toFixed(1)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
            ></div>
          </div>
          <div className="progress-details">
            ${totalEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ejecutado de ${totalPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} planificado
          </div>
        </div>
      </div>

      {/* Cuadrícula de Tarjetas de Semanas (Estilo Fichas de Valuación) */}
      <div className="planning-grid">
        {semanas.map((semana) => {
          const planificado = semana.monto_planificado || 0;
          const ejecutado = semana.monto_ejecutado || 0;
          const requerimientos = semana.monto_requerimientos || 0;
          const disponible = planificado - requerimientos;
          const pct = planificado > 0 ? (ejecutado / planificado) * 100 : 0;
          const payrollTotal = calculateWeeklyPayroll(semana);

          return (
            <div
              key={semana.id}
              className="semana-card"
              onClick={() => onSelectSemana(semana)}
            >
              {/* Header de la Tarjeta */}
              <div className="card-header">
                <div className="card-title-group">
                  <span className="semana-badge">SEMANA {semana.numero_semana}</span>
                  <span className="fecha-creacion">
                    {semana.estado ? semana.estado.toUpperCase() : "PLANIFICADA"}
                  </span>
                </div>

                <div className="card-actions-group">
                  <button
                    type="button"
                    className="btn-action-icon view"
                    title="Ver Detalle de Semana"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSemana(semana);
                    }}
                  >
                    <IconEye />
                  </button>
                </div>
              </div>

              {/* Cuerpo de la Tarjeta */}
              <div className="card-body">
                {/* Rango de Fechas */}
                <div className="periodo-badge-row">
                  <IconCalendar />
                  <span>
                    {formatDate(semana.fecha_inicio)} — {formatDate(semana.fecha_fin)}
                  </span>
                </div>

                {/* Bloque Financiero de 2 Filas (Homogéneo con Valuaciones) */}
                <div className="card-financial-block">
                  {/* Fila 1: Planificado + Requerimientos */}
                  <div className="financial-row-1">
                    <div className="financial-cell">
                      <span className="cell-label">Planificado</span>
                      <span className="cell-val highlight-blue">
                        ${planificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="financial-cell right">
                      <span className="cell-label">Requerimientos</span>
                      <span className="cell-val highlight-amber">
                        ${requerimientos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Fila 2: Ejecutado + Disponible */}
                  <div className="financial-row-2">
                    <div className="financial-cell">
                      <span className="cell-label">Ejecutado</span>
                      <span className="cell-val highlight-green">
                        ${ejecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="financial-cell right">
                      <span className="cell-label">Disponible</span>
                      <span
                        className="cell-val"
                        style={{ color: disponible < 0 ? "#dc2626" : "#059669" }}
                      >
                        ${disponible.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Progreso de la Semana */}
                <div className="card-progress-section">
                  <div className="card-progress-bar">
                    <div
                      className="card-progress-fill"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: ejecutado > planificado ? "#dc2626" : "#2563eb",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Nómina Estimada si existe */}
                {payrollTotal > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "10px",
                      paddingTop: "8px",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "0.8rem",
                      color: "#0284c7",
                      fontWeight: "600",
                    }}
                  >
                    <IconUsers />
                    <span>Nómina Estimada: ${payrollTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SemanasList;
