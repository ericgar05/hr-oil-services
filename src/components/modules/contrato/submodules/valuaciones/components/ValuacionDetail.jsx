// src/components/modules/contrato/submodules/valuaciones/components/ValuacionDetail.jsx
import React from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { getMainCurrency } from "../../../../../../utils/mainCurrency";
import { useBudget } from "../../../../../../contexts/BudgetContext";
import "./ValuacionDetail.css";

const ValuacionDetail = ({
  valuacion,
  presupuestoData,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { formatCurrency } = useCurrency();
  const { budget } = useBudget();
  const mainCurrency = getMainCurrency(budget);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="valuacion-detail">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Volver a la lista
        </button>
        <div className="header-actions">
          <button className="btn-edit" onClick={onEdit}>
            ✏️ Editar Valuación
          </button>
          <button className="btn-delete" onClick={onDelete}>
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Información general */}
      <div className="info-section">
        <div className="info-card">
          <h3>{valuacion.numero}</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Contrato N°:</label>
              <span>{presupuestoData?.contratoNumero || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Descripción:</label>
              <span>{presupuestoData?.nombreContrato || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Periodo de Ejecución:</label>
              <span>
                {formatDate(valuacion.periodoInicio)} -{" "}
                {formatDate(valuacion.periodoFin)}
              </span>
            </div>
            <div className="info-item">
              <label>Fecha de Creación:</label>
              <span>{formatDate(valuacion.fechaCreacion)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de partidas */}
      <div className="partidas-section">
        <h4>Partidas Ejecutadas</h4>
        <div className="partidas-table">
          <table>
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
              {valuacion.partidas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No hay partidas en esta valuación
                  </td>
                </tr>
              ) : (
                valuacion.partidas.map((partida) => (
                  <tr key={partida.id}>
                    <td className="col-item">
                      <strong>{partida.item}</strong>
                    </td>
                    <td className="col-descripcion">{partida.descripcion}</td>
                    <td className="col-unidad">{partida.unidad}</td>
                    <td className="col-cantidad">
                      {partida.cantidadEjecutada.toLocaleString("es-VE")}
                    </td>
                    <td className="col-precio">
                      {formatCurrency(partida.precioUnitario, partida.moneda)}
                    </td>
                    <td className="col-monto">
                      <strong>
                        {formatCurrency(partida.montoTotal, partida.moneda)}
                      </strong>
                    </td>
                    <td className="col-iva">
                      <span
                        className={`iva-badge ${
                          partida.aplicaIVA ? "with-iva" : "without-iva"
                        }`}
                      >
                        {partida.aplicaIVA ? "16%" : "Exento"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de totales */}
      {valuacion.partidas.length > 0 && (
        <div className="resumen-section">
          <div className="resumen-totales">
            <div className="totales-grid">
              <div className="total-item">
                <span className="total-label">SUB-TOTAL</span>
                <span className="total-value">
                  //TODO: Cambiar a moneda principal mismo problema que con el
                  total acumulado
                  {formatCurrency(
                    valuacion.totales?.subtotal || 0,
                    mainCurrency
                  )}
                </span>
              </div>
              <div className="total-item">
                <span className="total-label">16% IVA</span>
                <span className="total-value">
                  {formatCurrency(valuacion.totales?.iva || 0, mainCurrency)}
                </span>
              </div>
              <div className="total-item final">
                <span className="total-label">TOTAL VALUADO</span>
                <span className="total-value">
                  {formatCurrency(valuacion.totales?.total || 0, mainCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas adicionales */}
      <div className="estadisticas-section">
        <h4>Estadísticas de la Valuación</h4>
        <div className="estadisticas-grid">
          <div className="estadistica">
            <div className="estadistica-number">
              {valuacion.partidas.length}
            </div>
            <div className="estadistica-label">Partidas Ejecutadas</div>
          </div>
          <div className="estadistica">
            <div className="estadistica-number">
              {valuacion.partidas.filter((p) => p.aplicaIVA).length}
            </div>
            <div className="estadistica-label">Partidas con IVA</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ValuacionDetail;
