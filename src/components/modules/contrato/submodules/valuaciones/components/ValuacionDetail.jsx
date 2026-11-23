// src/components/modules/contrato/submodules/valuaciones/components/ValuacionDetail.jsx
import React from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { getMainCurrency } from "../../../../../../utils/mainCurrency";
import { useBudget } from "../../../../../../contexts/BudgetContext";
import "./ValuacionDetail.css";

// Iconos Vectoriales SVG Profesionales
const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
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

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ValuacionDetail = ({
  valuacion,
  presupuestoData,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { formatCurrency } = useCurrency();
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

  const partidasConIva = valuacion.partidas?.filter((p) => p.aplicaIVA) || [];
  const partidasSinIva = valuacion.partidas?.filter((p) => !p.aplicaIVA) || [];

  return (
    <div className="valuacion-detail">
      {/* Barra de Acciones Superior */}
      <div className="detail-header">
        <button type="button" className="btn-back-header" onClick={onBack}>
          <IconArrowLeft /> Volver al Listado
        </button>

        <div className="header-actions">
          <button type="button" className="btn-edit-action" onClick={onEdit}>
            <IconEdit /> Editar Valuación
          </button>
          <button type="button" className="btn-delete-action" onClick={onDelete}>
            <IconTrash /> Eliminar
          </button>
        </div>
      </div>

      {/* Ficha Resumen del Encabezado */}
      <div className="detail-info-card">
        <div className="info-badge-row">
          <span className="valuacion-main-badge">
            {valuacion.numero || "VALUACIÓN"}
          </span>
          <span className="contract-tag">
            Contrato N°: <strong>{presupuestoData?.contratoNumero || "N/A"}</strong>
          </span>
        </div>

        <h3 className="detail-contract-name">
          {presupuestoData?.nombreContrato || "Sin descripción"}
        </h3>

        <div className="info-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Periodo de Ejecución</span>
            <div className="meta-value with-icon">
              <IconCalendar />
              <span>
                {formatDate(valuacion.periodoInicio)} — {formatDate(valuacion.periodoFin)}
              </span>
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-label">Fecha de Registro</span>
            <div className="meta-value">
              {formatDate(valuacion.fechaCreacion)}
            </div>
          </div>

          <div className="meta-item">
            <span className="meta-label">Partidas Certificadas</span>
            <div className="meta-value">
              {valuacion.partidas?.length || 0} partida{valuacion.partidas?.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Partidas Certificadas */}
      <div className="detail-partidas-section">
        <div className="section-header-row">
          <h4 className="section-title">
            Partidas Ejecutadas ({valuacion.partidas?.length || 0})
          </h4>
          <div className="section-badges">
            <span className="badge-pill count">{partidasConIva.length} con IVA</span>
            {partidasSinIva.length > 0 && (
              <span className="badge-pill exento">{partidasSinIva.length} exentas</span>
            )}
          </div>
        </div>

        {/* Versión Tabla Desktop (>= 769px) */}
        <div className="desktop-table-container">
          <table className="partidas-table">
            <thead>
              <tr>
                <th className="col-item">ITEM</th>
                <th className="col-descripcion">DESCRIPCIÓN</th>
                <th className="col-unidad">UNIDAD</th>
                <th className="col-cantidad">CANTIDAD</th>
                <th className="col-precio">PRECIO UNITARIO</th>
                <th className="col-monto">MONTO TOTAL</th>
                <th className="col-iva">IVA</th>
              </tr>
            </thead>
            <tbody>
              {(!valuacion.partidas || valuacion.partidas.length === 0) ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No hay partidas registradas en esta valuación
                  </td>
                </tr>
              ) : (
                valuacion.partidas.map((partida) => (
                  <tr key={partida.id || partida.partidaId}>
                    <td className="col-item">
                      <span className="item-badge">{partida.item}</span>
                    </td>
                    <td className="col-descripcion">{partida.descripcion}</td>
                    <td className="col-unidad">
                      <span className="unit-badge">{partida.unidad}</span>
                    </td>
                    <td className="col-cantidad font-mono">
                      {partida.cantidadEjecutada}
                    </td>
                    <td className="col-precio font-mono">
                      {formatCurrency(partida.precioUnitario, partida.moneda || mainCurrency)}
                    </td>
                    <td className="col-monto font-mono font-bold">
                      {formatCurrency(partida.montoTotal, partida.moneda || mainCurrency)}
                    </td>
                    <td className="col-iva">
                      <span
                        className={`badge-iva ${
                          partida.aplicaIVA ? "with-iva" : "exempt"
                        }`}
                      >
                        {partida.aplicaIVA ? "16% IVA" : "Exento"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Versión Fichas Móviles (<= 768px) */}
        <div className="mobile-cards-container mobile-partidas-cards">
          {(!valuacion.partidas || valuacion.partidas.length === 0) ? (
            <div className="no-data-card">
              No hay partidas registradas en esta valuación
            </div>
          ) : (
            valuacion.partidas.map((partida) => (
              <div key={partida.id || partida.partidaId} className="mobile-item-card">
                <div className="card-top-row">
                  <div className="badge-group">
                    <span className="item-badge">{partida.item}</span>
                    <span className="unit-badge">{partida.unidad}</span>
                    <span
                      className={`badge-iva ${
                        partida.aplicaIVA ? "with-iva" : "exempt"
                      }`}
                    >
                      {partida.aplicaIVA ? "16% IVA" : "Exento"}
                    </span>
                  </div>
                </div>

                <p className="card-desc">{partida.descripcion}</p>

                {/* BLOQUE FINANCIERO CALIBRADO EN 2 FILAS */}
                <div className="card-finance-box">
                  <div className="finance-row-top">
                    <div className="finance-col">
                      <span className="finance-col-label">CANTIDAD</span>
                      <span className="finance-col-val">
                        {partida.cantidadEjecutada}
                      </span>
                    </div>
                    <div className="finance-col">
                      <span className="finance-col-label">P. UNITARIO</span>
                      <span className="finance-col-val">
                        {formatCurrency(
                          partida.precioUnitario,
                          partida.moneda || mainCurrency
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="finance-row-total">
                    <span className="finance-total-label">TOTAL VALUADO</span>
                    <span className="finance-total-val">
                      {formatCurrency(
                        partida.montoTotal,
                        partida.moneda || mainCurrency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resumen de Totales Económicos */}
      {valuacion.partidas && valuacion.partidas.length > 0 && (
        <div className="detail-totales-section">
          <div className="totales-grid">
            <div className="total-box">
              <span className="total-box-label">SUB-TOTAL</span>
              <span className="total-box-val">
                {formatCurrency(
                  valuacion.totales?.subtotal || 0,
                  mainCurrency
                )}
              </span>
            </div>

            <div className="total-box">
              <span className="total-box-label">16% IVA</span>
              <span className="total-box-val">
                {formatCurrency(
                  valuacion.totales?.iva || 0,
                  mainCurrency
                )}
              </span>
            </div>

            <div className="total-box highlight">
              <span className="total-box-label">TOTAL VALUADO</span>
              <span className="total-box-val">
                {formatCurrency(
                  valuacion.totales?.total || 0,
                  mainCurrency
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValuacionDetail;
