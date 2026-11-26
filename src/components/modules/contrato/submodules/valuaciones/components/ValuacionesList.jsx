// src/components/modules/contrato/submodules/valuaciones/components/ValuacionesList.jsx
import React from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { useBudget } from "../../../../../../contexts/BudgetContext";
import { getMainCurrency } from "../../../../../../utils/mainCurrency";
import "./ValuacionesList.css";

// Iconos Vectoriales SVG Profesionales
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

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

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconClipboard = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
);

const ValuacionesList = ({
  valuaciones = [],
  presupuestoData,
  onCreateValuacion,
  onViewValuacion,
  onEditValuacion,
  onDeleteValuacion,
}) => {
  const { formatCurrency, convertToUSD } = useCurrency();
  const { budget } = useBudget();
  const mainCurrency = getMainCurrency(budget || presupuestoData);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const getProgressPercentage = () => {
    if (!presupuestoData || !presupuestoData.items) return 0;

    const totalPresupuestoUSD = presupuestoData.items.reduce((sum, item) => {
      const montoUSD = convertToUSD
        ? convertToUSD(item.montoContrato || 0, item.moneda || mainCurrency)
        : (item.montoContrato || 0);
      return sum + montoUSD;
    }, 0);

    const totalValuadoUSD = valuaciones.reduce((sumVal, valuacion) => {
      const sumaPartidas =
        valuacion.partidas?.reduce((sumPar, partida) => {
          const montoUSD = convertToUSD
            ? convertToUSD(
                partida.montoTotal || 0,
                partida.moneda || valuacion.totales?.currency || mainCurrency
              )
            : (partida.montoTotal || 0);
          return sumPar + montoUSD;
        }, 0) || 0;
      return sumVal + sumaPartidas;
    }, 0);

    return totalPresupuestoUSD > 0
      ? (totalValuadoUSD / totalPresupuestoUSD) * 100
      : 0;
  };

  const getTotalPresupuesto = () => {
    if (!presupuestoData || !presupuestoData.items) return 0;
    return presupuestoData.items.reduce(
      (sum, item) => sum + (item.montoContrato || 0),
      0
    );
  };

  const getTotalValuado = () => {
    return valuaciones.reduce(
      (sum, valuacion) => sum + (valuacion.totales?.subtotal || 0),
      0
    );
  };

  const getTotalValuadoConIva = () => {
    return valuaciones.reduce(
      (sum, valuacion) => sum + (valuacion.totales?.total || 0),
      0
    );
  };

  const progressPercentage = getProgressPercentage();
  const totalPresupuestoSinIva = getTotalPresupuesto();
  const totalValuadoSinIva = getTotalValuado();
  const totalValuadoConIva = getTotalValuadoConIva();

  return (
    <div className="valuaciones-list">
      {/* Encabezado del Módulo */}
      <div className="list-header">
        <div className="header-content">
          <h3>Valuaciones Registradas</h3>
          <p>Supervisión cronológica y financiera de avances de obra</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={onCreateValuacion}>
            <IconPlus /> Nueva Valuación
          </button>
        </div>
      </div>

      {/* Resumen General y Métricas KPI */}
      {presupuestoData && (
        <div className="resumen-general">
          <div className="resumen-cards">
            <div className="resumen-card">
              <div className="resumen-icon primary">
                <IconBarChart />
              </div>
              <div className="resumen-content">
                <div className="resumen-value">{valuaciones.length}</div>
                <div className="resumen-label">Valuaciones Registradas</div>
              </div>
            </div>

            <div className="resumen-card">
              <div className="resumen-icon success">
                <IconDollar />
              </div>
              <div className="resumen-content">
                <div className="resumen-value">
                  {formatCurrency(totalValuadoConIva, mainCurrency)}
                </div>
                <div className="resumen-label">Total Valuado (con IVA)</div>
                <div className="resumen-subtitle">
                  Sub-total: {formatCurrency(totalValuadoSinIva, mainCurrency)}
                </div>
              </div>
            </div>

            <div className="resumen-card">
              <div className="resumen-icon info">
                <IconTrendingUp />
              </div>
              <div className="resumen-content">
                <div className="resumen-value">
                  {progressPercentage.toFixed(1)}%
                </div>
                <div className="resumen-label">Avance Global</div>
                <div className="resumen-subtitle">Sobre subtotal de contrato</div>
              </div>
            </div>
          </div>

          {/* Barra de progreso visual del contrato */}
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-title">Ejecución Financiera del Contrato</span>
              <span className="progress-pct">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="progress-details">
              <span>
                {formatCurrency(totalValuadoSinIva, mainCurrency)} acumulado de{" "}
                {formatCurrency(totalPresupuestoSinIva, mainCurrency)} presupuestado
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cuadrícula de Tarjetas de Valuaciones */}
      <div className="valuaciones-grid">
        {valuaciones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <IconClipboard />
            </div>
            <h4>No hay valuaciones registradas aún</h4>
            <p>
              Comienza registrando la primera valuación para realizar seguimiento a las partidas ejecutadas.
            </p>
            <button className="btn-primary" onClick={onCreateValuacion}>
              <IconPlus /> Crear Primera Valuación
            </button>
          </div>
        ) : (
          valuaciones.map((valuacion) => {
            const partidasConIva =
              valuacion.partidas?.filter((p) => p.aplicaIVA) || [];
            const partidasSinIva =
              valuacion.partidas?.filter((p) => !p.aplicaIVA) || [];
            const isCompleted = (valuacion.totales?.total || 0) > 0;

            return (
              <div key={valuacion.id} className="valuacion-card">
                {/* Cabecera de la Ficha */}
                <div className="card-header">
                  <div className="card-title-group">
                    <span className="valuacion-badge">
                      {valuacion.numero || "VALUACIÓN"}
                    </span>
                    <span className="fecha-creacion">
                      {formatDate(valuacion.fechaCreacion)}
                    </span>
                  </div>

                  <div className="card-actions-group">
                    <button
                      type="button"
                      className="btn-action-icon view"
                      onClick={() => onViewValuacion(valuacion)}
                      title="Ver detalle de valuación"
                    >
                      <IconEye />
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon edit"
                      onClick={() => onEditValuacion(valuacion)}
                      title="Editar valuación"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon delete"
                      onClick={() => onDeleteValuacion(valuacion.id)}
                      title="Eliminar valuación"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  {/* Periodo de Ejecución */}
                  <div className="periodo-badge-row">
                    <IconCalendar />
                    <span>
                      {formatDate(valuacion.periodoInicio)} — {formatDate(valuacion.periodoFin)}
                    </span>
                  </div>

                  {/* Etiquetas de desglose de partidas */}
                  <div className="partidas-badges-row">
                    <span className="badge-pill count">
                      {valuacion.partidas?.length || 0} partida{valuacion.partidas?.length !== 1 ? "s" : ""}
                    </span>
                    <span className="badge-pill iva">
                      {partidasConIva.length} con IVA
                    </span>
                    {partidasSinIva.length > 0 && (
                      <span className="badge-pill exento">
                        {partidasSinIva.length} exenta{partidasSinIva.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* BLOQUE FINANCIERO CALIBRADO EN 2 FILAS (Sin cortes de línea) */}
                  <div className="card-finance-box">
                    <div className="finance-row-top">
                      <div className="finance-col">
                        <span className="finance-col-label">SUB-TOTAL</span>
                        <span className="finance-col-val">
                          {formatCurrency(
                            valuacion.totales?.subtotal || 0,
                            mainCurrency
                          )}
                        </span>
                      </div>
                      <div className="finance-col">
                        <span className="finance-col-label">16% IVA</span>
                        <span className="finance-col-val">
                          {formatCurrency(
                            valuacion.totales?.iva || 0,
                            mainCurrency
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="finance-row-total">
                      <span className="finance-total-label">TOTAL VALUADO</span>
                      <span className="finance-total-val">
                        {formatCurrency(
                          valuacion.totales?.total || 0,
                          mainCurrency
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Lista previa resumida de partidas */}
                  {valuacion.partidas && valuacion.partidas.length > 0 && (
                    <div className="partidas-mini-list">
                      {valuacion.partidas.slice(0, 3).map((partida, idx) => (
                        <div key={idx} className="partida-mini-row">
                          <span className="mini-item-code">{partida.item}</span>
                          <span className="mini-item-desc">
                            {partida.descripcion?.substring(0, 32)}
                            {partida.descripcion?.length > 32 ? "..." : ""}
                          </span>
                          <span className="mini-item-qty">
                            {partida.cantidadEjecutada} {partida.unidad}
                          </span>
                        </div>
                      ))}
                      {valuacion.partidas.length > 3 && (
                        <div className="partida-mini-more">
                          +{valuacion.partidas.length - 3} partidas adicionales
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pie de la Ficha */}
                <div className="card-footer">
                  <span
                    className={`status-pill ${
                      isCompleted ? "completed" : "in-progress"
                    }`}
                  >
                    <span className="status-dot"></span>
                    {isCompleted ? "Completada" : "En Progreso"}
                  </span>
                  <span className="footer-timestamp">
                    ID: {valuacion.id?.substring(0, 8) || "N/A"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ValuacionesList;
