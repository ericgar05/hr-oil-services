// src/components/modules/contrato/submodules/presupuesto/components/AvancePresupuesto.jsx
import React, { useState, useEffect } from "react";
import { useValuation } from "../../../../../../contexts/ValuationContext";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import "./AvancePresupuesto.css";

// Iconos Vectoriales SVG Profesionales
const IconTrendingUp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const AvancePresupuesto = ({ presupuestoData, projectId }) => {
  const { valuations } = useValuation();
  const { formatCurrency, convertToUSD } = useCurrency();
  const [avancePartidas, setAvancePartidas] = useState([]);

  useEffect(() => {
    calcularAvancePresupuesto();
  }, [presupuestoData, projectId, valuations]);

  const calcularAvancePresupuesto = () => {
    if (!presupuestoData || !presupuestoData.items) return;

    // Calcular ejecución acumulada por partida
    const ejecucionAcumulada = {};

    presupuestoData.items.forEach((item) => {
      ejecucionAcumulada[item.id] = {
        ...item,
        cantidadEjecutada: 0,
        montoEjecutado: 0,
        cantidadDisponible: item.cantidad,
        montoDisponible: item.montoContrato,
      };
    });

    valuations?.forEach((valuacion) => {
      valuacion.partidas?.forEach((partida) => {
        if (ejecucionAcumulada[partida.partidaId]) {
          ejecucionAcumulada[partida.partidaId].cantidadEjecutada += parseFloat(
            partida.cantidadEjecutada || 0
          );
          ejecucionAcumulada[partida.partidaId].montoEjecutado +=
            partida.montoTotal || 0;
        }
      });
    });

    const avance = Object.values(ejecucionAcumulada).map((partida) => {
      const porcentajeCantidad =
        partida.cantidad > 0
          ? (partida.cantidadEjecutada / partida.cantidad) * 100
          : 0;
      const porcentajeMonto =
        partida.montoContrato > 0
          ? (partida.montoEjecutado / partida.montoContrato) * 100
          : 0;

      return {
        ...partida,
        cantidadDisponible: Math.max(0, partida.cantidad - partida.cantidadEjecutada),
        montoDisponible: Math.max(0, partida.montoContrato - partida.montoEjecutado),
        porcentajeEjecutadoCantidad: Math.min(100, porcentajeCantidad),
        porcentajeEjecutadoMonto: Math.min(100, porcentajeMonto),
      };
    });

    setAvancePartidas(avance);
  };

  const getTotalesPorMoneda = () => {
    return avancePartidas.reduce((acc, partida) => {
      const moneda = partida.moneda || "USD";
      if (!acc[moneda]) {
        acc[moneda] = { ejecutado: 0, presupuestado: 0 };
      }
      acc[moneda].ejecutado += partida.montoEjecutado;
      acc[moneda].presupuestado += partida.montoContrato;
      return acc;
    }, {});
  };

  const totalesPorMoneda = getTotalesPorMoneda();

  const getPorcentajeTotal = () => {
    let totalPresupuestadoUSD = 0;
    let totalEjecutadoUSD = 0;

    avancePartidas.forEach((partida) => {
      const moneda = partida.moneda || "USD";
      const montoContratoUSD = convertToUSD
        ? convertToUSD(partida.montoContrato || 0, moneda)
        : (partida.montoContrato || 0);
      const montoEjecutadoUSD = convertToUSD
        ? convertToUSD(partida.montoEjecutado || 0, moneda)
        : (partida.montoEjecutado || 0);

      totalPresupuestadoUSD += montoContratoUSD;
      totalEjecutadoUSD += montoEjecutadoUSD;
    });

    return totalPresupuestadoUSD > 0
      ? (totalEjecutadoUSD / totalPresupuestadoUSD) * 100
      : 0;
  };

  const porcentajeGlobal = getPorcentajeTotal();

  if (!presupuestoData || avancePartidas.length === 0) {
    return (
      <div className="avance-presupuesto-card">
        <div className="no-data-card">
          <p>No hay datos de avance registrados para este presupuesto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avance-presupuesto-card">
      {/* Header con KPI Global de Avance */}
      <div className="avance-header-bar">
        <div className="avance-title-group">
          <div className="avance-title-badge">
            <IconTrendingUp />
          </div>
          <div>
            <h4>Control de Avance del Presupuesto</h4>
            <span className="avance-subtitle">Seguimiento físico y financiero en tiempo real contrastado con valuaciones</span>
          </div>
        </div>

        {/* Global Progress Pill */}
        <div className="avance-global-kpi">
          <div className="global-kpi-info">
            <span className="global-kpi-label">Avance Global Ejecutado</span>
            <span className="global-kpi-value">{porcentajeGlobal.toFixed(1)}%</span>
          </div>
          <div className="global-progress-bar-wrap">
            <div
              className="global-progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(0, porcentajeGlobal))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabla de Avance Partida a Partida */}
      <div className="table-container">
        <table className="corporate-table">
          <thead>
            <tr>
              <th className="col-item">ÍTEM</th>
              <th className="col-descripcion">DESCRIPCIÓN</th>
              <th className="col-unidad">UNIDAD</th>
              <th className="col-presupuestado">PRESUPUESTADO</th>
              <th className="col-ejecutado">EJECUTADO</th>
              <th className="col-disponible">DISPONIBLE</th>
              <th className="col-porcentaje">% AVANCE</th>
            </tr>
          </thead>
          <tbody>
            {avancePartidas.map((partida) => {
              const isCompleted = partida.cantidadDisponible <= 0;
              const hasProgress = partida.cantidadEjecutada > 0;
              const pct = partida.porcentajeEjecutadoCantidad;

              return (
                <tr
                  key={partida.id}
                  className={`avance-row ${isCompleted ? "row-completed" : ""}`}
                >
                  {/* ÍTEM */}
                  <td className="col-item">
                    <span className="item-code-tag">{partida.item}</span>
                  </td>

                  {/* DESCRIPCIÓN */}
                  <td className="col-descripcion">
                    <div className="descripcion-cell">{partida.descripcion}</div>
                    <div className="status-tag-wrap">
                      {isCompleted ? (
                        <span className="badge-status completed">
                          <IconCheck /> Completado
                        </span>
                      ) : hasProgress ? (
                        <span className="badge-status in-progress">
                          <IconClock /> En Avance
                        </span>
                      ) : (
                        <span className="badge-status pending">Pendiente</span>
                      )}
                    </div>
                  </td>

                  {/* UNIDAD */}
                  <td className="col-unidad">
                    <span className="unit-badge">{partida.unidad}</span>
                  </td>

                  {/* PRESUPUESTADO */}
                  <td className="col-presupuestado">
                    <div className="amount-qty">
                      {partida.cantidad.toLocaleString("es-VE")} {partida.unidad}
                    </div>
                    <div className="amount-money">
                      {formatCurrency(partida.montoContrato, partida.moneda)}
                    </div>
                  </td>

                  {/* EJECUTADO */}
                  <td className="col-ejecutado">
                    <div className="amount-qty executed">
                      {partida.cantidadEjecutada.toLocaleString("es-VE")} {partida.unidad}
                    </div>
                    <div className="amount-money executed">
                      {formatCurrency(partida.montoEjecutado, partida.moneda)}
                    </div>
                  </td>

                  {/* DISPONIBLE */}
                  <td className="col-disponible">
                    <div className="amount-qty available">
                      {partida.cantidadDisponible.toLocaleString("es-VE")} {partida.unidad}
                    </div>
                    <div className="amount-money available">
                      {formatCurrency(partida.montoDisponible, partida.moneda)}
                    </div>
                  </td>

                  {/* % AVANCE */}
                  <td className="col-porcentaje">
                    <div className="progress-cell">
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${isCompleted ? "fill-green" : pct > 40 ? "fill-blue" : "fill-slate"}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="progress-number">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer de Resumen Multimoneda */}
      <div className="avance-footer-card">
        <div className="footer-currencies-grid">
          {Object.entries(totalesPorMoneda).map(([moneda, totales]) => {
            const pctMoneda =
              totales.presupuestado > 0
                ? (totales.ejecutado / totales.presupuestado) * 100
                : 0;
            return (
              <div key={moneda} className="currency-summary-box">
                <div className="currency-box-header">
                  <span className="currency-badge-pill">{moneda}</span>
                  <span className="currency-pct-label">{pctMoneda.toFixed(1)}% ejecutado</span>
                </div>
                <div className="currency-box-values">
                  <div className="val-line">
                    <span>Ejecutado:</span>
                    <strong>{formatCurrency(totales.ejecutado, moneda)}</strong>
                  </div>
                  <div className="val-line">
                    <span>Presupuestado:</span>
                    <span>{formatCurrency(totales.presupuestado, moneda)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvancePresupuesto;
