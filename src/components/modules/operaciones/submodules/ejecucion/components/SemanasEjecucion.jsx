// components/ejecucion/SemanasEjecucion.jsx
import { useMemo } from 'react';

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

const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export const SemanasEjecucion = ({ semanas = [], onSelectSemana, onShowInfo }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString + "T00:00:00").toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Cálculos globales
  const totalEjecutado = useMemo(() => {
    return semanas.reduce((acc, s) => acc + (s.monto_ejecutado || 0), 0);
  }, [semanas]);

  const totalPlanificado = useMemo(() => {
    return semanas.reduce((acc, s) => acc + (s.monto_planificado || 0), 0);
  }, [semanas]);

  const totalPendiente = Math.max(0, totalPlanificado - totalEjecutado);
  const porcentajeGlobal =
    totalPlanificado > 0 ? (totalEjecutado / totalPlanificado) * 100 : 0;

  if (!semanas || semanas.length === 0) {
    return (
      <div className="ejecucion-list">
        <div className="planning-empty-state">
          <div className="empty-state-icon">🏗️</div>
          <h3>No hay semanas registradas</h3>
          <p>
            Primero debes generar o configurar las semanas de trabajo en el módulo de Planificación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ejecucion-list">
      {/* Encabezado del Módulo (Estilo ValuacionesList) */}
      <div className="list-header">
        <div className="header-content">
          <h3>Semanas de Ejecución</h3>
          <p>Supervisión cronológica de avances físicos y financieros de obra</p>
        </div>

        <div className="header-actions">
          <div className="badge-total-pill">
            <span>TOTAL EJECUTADO:</span>
            <strong>${totalEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>

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

      {/* Resumen General y Métricas KPI */}
      <div className="resumen-general">
        <div className="resumen-cards">
          {/* Card 1: Total Semanas */}
          <div className="resumen-card">
            <div className="resumen-icon primary">
              <IconBarChart />
            </div>
            <div className="resumen-content">
              <div className="resumen-value">{semanas.length}</div>
              <div className="resumen-label">Semanas en Seguimiento</div>
              <div className="resumen-subtitle">Ciclo operativo activo</div>
            </div>
          </div>

          {/* Card 2: Monto Ejecutado */}
          <div className="resumen-card">
            <div className="resumen-icon success">
              <IconDollar />
            </div>
            <div className="resumen-content">
              <div className="resumen-value">
                ${totalEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="resumen-label">Total Ejecutado</div>
              <div className="resumen-subtitle">
                Plan: ${totalPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              <div className="resumen-label">Avance Financiero Global</div>
              <div className="resumen-subtitle">
                Pendiente: ${totalPendiente.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progreso de Obra */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-title">Ejecución Financiera de la Obra</span>
            <span className="progress-pct">{porcentajeGlobal.toFixed(1)}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(porcentajeGlobal, 100)}%` }}
            ></div>
          </div>
          <div className="progress-details">
            ${totalEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} acumulado de ${totalPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} presupuestado
          </div>
        </div>
      </div>

      {/* Cuadrícula de Tarjetas de Semanas de Ejecución */}
      <div className="ejecucion-grid">
        {semanas.map((semana) => {
          const ejecutado = semana.monto_ejecutado || 0;
          const planificado = semana.monto_planificado || 0;
          const pct = planificado > 0 ? Math.min(100, (ejecutado / planificado) * 100) : 0;
          const diff = Math.max(0, planificado - ejecutado);

          return (
            <div
              key={semana.id}
              className="ejecucion-card"
              onClick={() => onSelectSemana(semana)}
            >
              {/* Header de la Tarjeta */}
              <div className="card-header">
                <div className="card-title-group">
                  <span className="semana-badge">SEMANA {semana.numero_semana}</span>
                  <span className="fecha-creacion">
                    {semana.estado ? semana.estado.replace('_', ' ').toUpperCase() : "EN SEGUIMIENTO"}
                  </span>
                </div>

                <div className="card-actions-group">
                  <button
                    type="button"
                    className="btn-action-icon view"
                    title="Ver Detalle de Ejecución"
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

                {/* Bloque Financiero de 2 Filas */}
                <div className="card-financial-block">
                  {/* Fila 1: Ejecutado + Planificado */}
                  <div className="financial-row-1">
                    <div className="financial-cell">
                      <span className="cell-label">Ejecutado</span>
                      <span className="cell-val highlight-green">
                        ${ejecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="financial-cell right">
                      <span className="cell-label">Planificado</span>
                      <span className="cell-val highlight-blue">
                        ${planificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Fila 2: Avance % + Pendiente */}
                  <div className="financial-row-2">
                    <div className="financial-cell">
                      <span className="cell-label">Avance</span>
                      <span className="cell-val">
                        {pct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="financial-cell right">
                      <span className="cell-label">Pendiente</span>
                      <span className="cell-val highlight-amber">
                        ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="card-progress-section">
                  <div className="card-progress-bar">
                    <div
                      className="card-progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 100 ? "#16a34a" : "#2563eb",
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ textAlign: "right", marginTop: "10px", fontSize: "0.78rem", color: "#2563eb", fontWeight: "600" }}>
                  Ver Ejecución Diaria →
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SemanasEjecucion;
