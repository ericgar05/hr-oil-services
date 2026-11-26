// src/components/modules/contrato/submodules/presupuesto/components/ResumenPresupuesto.jsx
import React from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { calculateBudgetSummary } from "../../../../../../utils/calculations";
import "./ResumenPresupuesto.css";

// Iconos Vectoriales SVG Profesionales
const IconBarChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const IconFileText = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconReceipt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path>
    <line x1="8" y1="7" x2="16" y2="7"></line>
    <line x1="8" y1="11" x2="16" y2="11"></line>
    <line x1="8" y1="15" x2="13" y2="15"></line>
  </svg>
);

const IconDollarSign = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const IconExchange = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"></polyline>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
    <polyline points="7 23 3 19 7 15"></polyline>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
  </svg>
);

const IconLayers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const ResumenPresupuesto = ({ totales }) => {
  const { customRates, convertToUSD, formatCurrency } = useCurrency();

  const {
    mainCurrency,
    subtotalConIVA_Main,
    subtotalSinIVA_Main,
    ivaCalculado_Main,
    totalGeneral_Main,
    subtotalConIVA_USD,
    subtotalSinIVA_USD,
    ivaCalculado_USD,
    totalGeneral_USD,
    itemsConIva,
    itemsSinIva,
  } = calculateBudgetSummary(totales, convertToUSD, customRates);

  return (
    <div className="resumen-presupuesto-card">
      <div className="resumen-header-bar">
        <div className="resumen-title-group">
          <div className="resumen-title-badge">
            <IconLayers />
          </div>
          <div>
            <h4>Resumen Económico del Presupuesto</h4>
            <span className="resumen-subtitle">Consolidado contractual de partidas gravables, exentas e impuestos</span>
          </div>
        </div>
        <div className="resumen-currency-badge">
          <span className="badge-currency-label">Moneda Base:</span>
          <span className="badge-currency-val">{mainCurrency}</span>
        </div>
      </div>

      {/* Tarjetas de Indicadores Principales */}
      <div className="resumen-kpi-grid">
        {/* KPI 1: Subtotal con IVA */}
        <div className="kpi-card con-iva">
          <div className="kpi-icon-box con-iva">
            <IconBarChart />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Subtotal Gravable</span>
            <span className="kpi-value">
              {formatCurrency(subtotalConIVA_Main, mainCurrency)}
            </span>
            <div className="kpi-usd-pill">
              ≈ {formatCurrency(subtotalConIVA_USD, "USD")}
            </div>
            <span className="kpi-meta-desc">
              {itemsConIva || 0} partida(s) con IVA
            </span>
          </div>
        </div>

        {/* KPI 2: Subtotal sin IVA */}
        <div className="kpi-card sin-iva">
          <div className="kpi-icon-box sin-iva">
            <IconFileText />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Reembolsables / Exento</span>
            <span className="kpi-value">
              {formatCurrency(subtotalSinIVA_Main, mainCurrency)}
            </span>
            <div className="kpi-usd-pill">
              ≈ {formatCurrency(subtotalSinIVA_USD, "USD")}
            </div>
            <span className="kpi-meta-desc">
              {itemsSinIva || 0} partida(s) exentas
            </span>
          </div>
        </div>

        {/* KPI 3: IVA (16%) */}
        <div className="kpi-card iva">
          <div className="kpi-icon-box iva">
            <IconReceipt />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Impuesto al Valor Agregado</span>
            <span className="kpi-value">
              {formatCurrency(ivaCalculado_Main, mainCurrency)}
            </span>
            <div className="kpi-usd-pill">
              ≈ {formatCurrency(ivaCalculado_USD, "USD")}
            </div>
            <span className="kpi-meta-desc">
              Alícuota 16% sobre gravables
            </span>
          </div>
        </div>

        {/* KPI 4: Total General */}
        <div className="kpi-card total-general">
          <div className="kpi-icon-box total-general">
            <IconDollarSign />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Monto Total del Contrato</span>
            <span className="kpi-value total-highlight">
              {formatCurrency(totalGeneral_Main, mainCurrency)}
            </span>
            <div className="kpi-usd-pill total">
              ≈ {formatCurrency(totalGeneral_USD, "USD")}
            </div>
            <span className="kpi-meta-desc">
              Compromiso contractual final
            </span>
          </div>
        </div>
      </div>

      {/* Desglose Detallado y Conversión en Paneles Gemelos */}
      <div className="resumen-detail-panels">
        {/* Panel Izquierdo: Desglose */}
        <div className="detail-panel">
          <h5 className="panel-title">Estructura del Presupuesto</h5>
          <div className="detail-table-card">
            <div className="detail-row">
              <span className="detail-label">Subtotal Partidas con IVA ({itemsConIva || 0}):</span>
              <span className="detail-value">{formatCurrency(subtotalConIVA_Main, mainCurrency)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subtotal Partidas sin IVA ({itemsSinIva || 0}):</span>
              <span className="detail-value">{formatCurrency(subtotalSinIVA_Main, mainCurrency)}</span>
            </div>
            <div className="detail-row subtotal-row">
              <span className="detail-label">Subtotal Neto General:</span>
              <span className="detail-value">{formatCurrency(subtotalConIVA_Main + subtotalSinIVA_Main, mainCurrency)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">IVA Calculado (16%):</span>
              <span className="detail-value">{formatCurrency(ivaCalculado_Main, mainCurrency)}</span>
            </div>
            <div className="detail-row total-contract-row">
              <span className="detail-label">TOTAL DEL CONTRATO:</span>
              <span className="detail-value">{formatCurrency(totalGeneral_Main, mainCurrency)}</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Equivalencia USD y Tasas */}
        <div className="detail-panel">
          <h5 className="panel-title">Equivalente Financiero en Dólares (USD)</h5>
          <div className="detail-table-card usd-card">
            <div className="detail-row">
              <span className="detail-label">Subtotal Gravable en USD:</span>
              <span className="detail-value">{formatCurrency(subtotalConIVA_USD, "USD")}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subtotal Exento en USD:</span>
              <span className="detail-value">{formatCurrency(subtotalSinIVA_USD, "USD")}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">IVA (16%) en USD:</span>
              <span className="detail-value">{formatCurrency(ivaCalculado_USD, "USD")}</span>
            </div>
            <div className="detail-row total-usd-row">
              <span className="detail-label">TOTAL EQUIVALENTE USD:</span>
              <span className="detail-value">{formatCurrency(totalGeneral_USD, "USD")}</span>
            </div>
          </div>

          <div className="rate-info-chip">
            <IconExchange />
            <span>
              Tasas de referencia aplicadas: <strong>1 USD = {customRates?.EUR || 0.858} EUR</strong> &bull;{" "}
              <strong>1 USD = {customRates?.BS || 36.5} BS</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Estadísticas de Pie */}
      <div className="resumen-footer-stats">
        <div className="footer-stat-item">
          <span className="stat-label">Total Partidas:</span>
          <span className="stat-count">{(itemsConIva || 0) + (itemsSinIva || 0)}</span>
        </div>
        <div className="footer-stat-item">
          <span className="stat-label">Con IVA:</span>
          <span className="stat-count">{itemsConIva || 0}</span>
        </div>
        <div className="footer-stat-item">
          <span className="stat-label">Exentas:</span>
          <span className="stat-count">{itemsSinIva || 0}</span>
        </div>
        <div className="footer-stat-item">
          <span className="stat-label">Moneda:</span>
          <span className="stat-count">{mainCurrency}</span>
        </div>
      </div>
    </div>
  );
};

export default ResumenPresupuesto;
