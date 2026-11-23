// src/components/modules/contrato/submodules/presupuesto/components/ItemsTable.jsx
import React, { useState, useEffect } from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { useValuation } from "../../../../../../contexts/ValuationContext";
import {
  getUnidadesMedida,
  UNIDADES_BASE_CATALOG,
} from "../../../../../../services/unidadesService";
import "./ItemsTable.css";

// Iconos Vectoriales SVG Profesionales
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconCross = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconShieldAlert = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconWarning = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconSave = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const ItemsTable = ({ items, onEditItem, onDeleteItem, onNavigateToAdd, readOnly = false }) => {
  const { formatCurrency } = useCurrency();
  const { valuations } = useValuation();

  // Modal de edición de partida
  const [editingModalItem, setEditingModalItem] = useState(null);
  const [editForm, setEditForm] = useState({
    item: "",
    descripcion: "",
    unidad: "",
    cantidad: "",
    precioUnitario: "",
    aplicaIVA: true,
    moneda: "USD",
  });

  // Modales de protección e integridad
  const [blockedModalData, setBlockedModalData] = useState(null);
  const [confirmDeleteData, setConfirmDeleteData] = useState(null);

  const [unidadesList, setUnidadesList] = useState(UNIDADES_BASE_CATALOG);

  // Cargar catálogo de unidades para edición
  useEffect(() => {
    let isMounted = true;
    async function fetchUnits() {
      const units = await getUnidadesMedida();
      if (isMounted && units && units.length > 0) {
        setUnidadesList(units);
      }
    }
    fetchUnits();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenEditModal = (item) => {
    setEditingModalItem(item);
    setEditForm({
      item: item.item || "",
      descripcion: item.descripcion || "",
      unidad: item.unidad || "",
      cantidad: item.cantidad ?? "",
      precioUnitario: item.precioUnitario ?? "",
      aplicaIVA: item.aplicaIVA ?? true,
      moneda: item.moneda || items[0]?.moneda || "USD",
    });
  };

  const handleCloseEditModal = () => {
    setEditingModalItem(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveModalEdit = (e) => {
    e.preventDefault();
    if (!editingModalItem) return;

    const qty = parseFloat(editForm.cantidad) || 0;
    const price = parseFloat(editForm.precioUnitario) || 0;

    if (!editForm.item?.trim() || !editForm.descripcion?.trim() || !editForm.unidad?.trim()) {
      return;
    }

    if (qty <= 0 || price <= 0) {
      return;
    }

    onEditItem(editingModalItem.id, {
      ...editForm,
      cantidad: qty,
      precioUnitario: price,
      montoContrato: qty * price,
    });

    handleCloseEditModal();
  };

  const getTotalMonto = () => {
    return items.reduce((total, item) => total + (item.montoContrato || 0), 0);
  };

  // Pre-flight check antes de eliminar partida
  const handleInitiateDelete = (item) => {
    // Escaneo cruzado: verificar si tiene cantidad ejecutada en alguna valuación
    const activeValuationHits = (valuations || [])
      .map((v) => {
        const partidaMatch = (v.partidas || []).find(
          (p) =>
            (p.partidaId === item.id || p.item === item.item) &&
            parseFloat(p.cantidadEjecutada || 0) > 0
        );
        if (partidaMatch) {
          return {
            valuacionNumero: v.numero || "Valuación",
            cantidadEjecutada: parseFloat(partidaMatch.cantidadEjecutada),
            unidad: item.unidad,
            periodo: `${v.periodoInicio || ""} al ${v.periodoFin || ""}`,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (activeValuationHits.length > 0) {
      // Bloqueo preventivo defensivo
      setBlockedModalData({
        item,
        valuations: activeValuationHits,
      });
      return;
    }

    // Si no tiene dependencias activas, solicitar confirmación
    setConfirmDeleteData(item);
  };

  const handleExecuteDelete = () => {
    if (confirmDeleteData) {
      onDeleteItem(confirmDeleteData.id);
      setConfirmDeleteData(null);
    }
  };

  // Cálculos en vivo para el modal de edición
  const modalQty = parseFloat(editForm.cantidad) || 0;
  const modalPrice = parseFloat(editForm.precioUnitario) || 0;
  const modalSubtotal = modalQty * modalPrice;
  const modalIva = editForm.aplicaIVA ? modalSubtotal * 0.16 : 0;
  const modalTotal = modalSubtotal + modalIva;

  return (
    <div className="items-table-card">
      <div className="table-header-bar">
        <div className="table-title-group">
          <h4>Partidas del Contrato</h4>
          <span className="table-subtitle">Listado de partidas contractuales registradas</span>
        </div>
        <div className="table-header-actions">
          {onNavigateToAdd && !readOnly && (
            <button
              type="button"
              className="btn-add-item-shortcut"
              onClick={onNavigateToAdd}
              title="Cargar nueva partida al presupuesto"
            >
              <IconPlus />
              <span>Cargar Partida</span>
            </button>
          )}
          <div className="table-total-badge">
            <span className="total-label">Monto Total Contratado:</span>
            <span className="total-value">
              {formatCurrency(getTotalMonto(), items[0]?.moneda || "USD")}
            </span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-items-box-wrapper">
          <div className="empty-items-box">
            <p className="empty-title">No hay partidas registradas en este presupuesto</p>
            <p className="empty-sub">
              Comience cargando la primera partida contractual para definir el alcance y los costos.
            </p>
            {onNavigateToAdd && !readOnly && (
              <button
                type="button"
                className="btn-add-item-shortcut empty-action-btn"
                onClick={onNavigateToAdd}
              >
                <IconPlus />
                <span>Cargar Primera Partida</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Vista 1: Tabla Corporativa para Escritorio / Pantallas Grandes */}
          <div className="table-container">
            <table className="corporate-table">
              <thead>
                <tr>
                  <th className="col-item">ÍTEM</th>
                  <th className="col-descripcion">DESCRIPCIÓN TÉCNICA</th>
                  <th className="col-unidad">UNIDAD</th>
                  <th className="col-cantidad">CANTIDAD</th>
                  <th className="col-precio">P. UNITARIO</th>
                  <th className="col-monto">MONTO CONTRATO</th>
                  <th className="col-iva">IVA</th>
                  {!readOnly && <th className="col-acciones">ACCIONES</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="row-regular">
                    {/* ÍTEM */}
                    <td className="col-item">
                      <span className="item-code-tag">{item.item}</span>
                    </td>

                    {/* DESCRIPCIÓN */}
                    <td className="col-descripcion">
                      <div className="descripcion-cell">{item.descripcion}</div>
                    </td>

                    {/* UNIDAD */}
                    <td className="col-unidad">
                      <span className="unit-badge">{item.unidad}</span>
                    </td>

                    {/* CANTIDAD */}
                    <td className="col-cantidad">
                      <span className="num-val">
                        {item.cantidad.toLocaleString("es-VE")}
                      </span>
                    </td>

                    {/* PRECIO UNITARIO */}
                    <td className="col-precio">
                      <span className="num-val">
                        {formatCurrency(item.precioUnitario, item.moneda)}
                      </span>
                    </td>

                    {/* MONTO DEL CONTRATO */}
                    <td className="col-monto">
                      <span className="amount-highlight">
                        {formatCurrency(item.montoContrato, item.moneda)}
                      </span>
                    </td>

                    {/* IVA */}
                    <td className="col-iva">
                      <span
                        className={`iva-pill ${
                          item.aplicaIVA ? "iva-yes" : "iva-no"
                        }`}
                      >
                        {item.aplicaIVA ? "16%" : "Exento"}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    {!readOnly && (
                      <td className="col-acciones">
                        <div className="table-actions-group">
                          <button
                            type="button"
                            className="table-btn-action edit"
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar partida"
                          >
                            <IconEdit />
                          </button>
                          <button
                            type="button"
                            className="table-btn-action delete"
                            onClick={() => handleInitiateDelete(item)}
                            title="Eliminar partida"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista 2: Fichas Móviles (Cards) para Teléfonos y Pantallas Pequeñas */}
          <div className="mobile-cards-container">
            {items.map((item) => (
              <div key={item.id} className="mobile-item-card">
                {/* Cabecera de la Ficha: Badges a la izquierda, Acciones a la derecha */}
                <div className="card-top-row">
                  <div className="card-badge-group">
                    <span className="card-item-code">{item.item}</span>
                    <span className="card-unit-badge">{item.unidad}</span>
                    <span className={`card-iva-pill ${item.aplicaIVA ? "iva-yes" : "iva-no"}`}>
                      {item.aplicaIVA ? "16% IVA" : "Exento"}
                    </span>
                  </div>
                  {!readOnly && (
                    <div className="card-actions-group">
                      <button
                        type="button"
                        className="card-btn-action edit"
                        onClick={() => handleOpenEditModal(item)}
                        title="Editar partida"
                        aria-label="Editar partida"
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className="card-btn-action delete"
                        onClick={() => handleInitiateDelete(item)}
                        title="Eliminar partida"
                        aria-label="Eliminar partida"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cuerpo: Descripción Técnica */}
                <div className="card-desc-box">
                  <h5 className="card-desc-title">{item.descripcion}</h5>
                </div>

                {/* Bloque Financiero Estructurado en 2 Filas */}
                <div className="card-finance-box">
                  {/* Fila 1: Cantidad y Precio Unitario (50% / 50%) */}
                  <div className="finance-row-sub">
                    <div className="finance-col">
                      <span className="finance-col-label">CANTIDAD</span>
                      <span className="finance-col-val">
                        {item.cantidad.toLocaleString("es-VE")} <small>{item.unidad}</small>
                      </span>
                    </div>
                    <div className="finance-col">
                      <span className="finance-col-label">PRECIO UNITARIO</span>
                      <span className="finance-col-val">
                        {formatCurrency(item.precioUnitario, item.moneda)}
                      </span>
                    </div>
                  </div>

                  {/* Fila 2: Total Contrato (Ancho Completo, Destacado) */}
                  <div className="finance-row-total">
                    <span className="finance-total-label">TOTAL CONTRATADO</span>
                    <span className="finance-total-val">
                      {formatCurrency(item.montoContrato, item.moneda)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {items.length > 0 && (
        <div className="table-footer-bar">
          <div className="footer-stats-chips">
            <span className="stat-chip">
              Total Partidas: <strong>{items.length}</strong>
            </span>
            <span className="stat-chip">
              Con IVA: <strong>{items.filter((item) => item.aplicaIVA).length}</strong>
            </span>
            <span className="stat-chip">
              Exentas: <strong>{items.filter((item) => !item.aplicaIVA).length}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Modal: Edición de Partida en Ventana Flotante */}
      {editingModalItem && (
        <div
          className="contract-modal-overlay"
          onClick={handleCloseEditModal}
        >
          <div
            className="contract-modal-content edit-item-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="contract-modal-header">
              <div className="modal-title-with-icon">
                <IconEdit />
                <div>
                  <h4>Editar Partida {editingModalItem.item}</h4>
                  <span className="modal-subtitle">Modifique los parámetros técnicos y económicos</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={handleCloseEditModal}
                title="Cerrar ventana"
              >
                <IconCross />
              </button>
            </div>

            <form onSubmit={handleSaveModalEdit}>
              <div className="contract-modal-body edit-modal-scrollable-body">
                {/* Fila 1: Item, Unidad, Moneda */}
                <div className="edit-modal-row-classification">
                  <div className="form-group edit-col-item">
                    <label>N° Ítem *</label>
                    <input
                      type="text"
                      value={editForm.item || ""}
                      onChange={(e) => handleEditChange("item", e.target.value)}
                      placeholder="010"
                      required
                    />
                  </div>

                  <div className="form-group edit-col-unit">
                    <label>Unidad de Medida *</label>
                    <select
                      value={editForm.unidad || ""}
                      onChange={(e) => handleEditChange("unidad", e.target.value)}
                      required
                    >
                      {unidadesList.map((u) => {
                        const code = typeof u === "string" ? u : u.codigo;
                        const desc = typeof u === "string" ? u : u.descripcion || u.codigo;
                        return (
                          <option key={code} value={code}>
                            {code} - {desc}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group edit-col-currency">
                    <label>Moneda</label>
                    <div className="edit-currency-readonly-tag">
                      <strong>{editForm.moneda || "USD"}</strong>
                    </div>
                  </div>
                </div>

                {/* Fila 2: Descripción Técnica */}
                <div className="form-group">
                  <label>Descripción Técnica Contractual *</label>
                  <textarea
                    value={editForm.descripcion || ""}
                    onChange={(e) => handleEditChange("descripcion", e.target.value)}
                    placeholder="Descripción detallada de la partida contractual..."
                    rows="3"
                    required
                  />
                </div>

                {/* Fila 3: Cantidad y Precio Unitario */}
                <div className="edit-modal-row-financial">
                  <div className="form-group edit-col-qty">
                    <label>Cantidad Contractual *</label>
                    <input
                      type="number"
                      value={editForm.cantidad ?? ""}
                      onChange={(e) => handleEditChange("cantidad", e.target.value)}
                      min="0.0001"
                      step="any"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group edit-col-price">
                    <label>Precio Unitario *</label>
                    <input
                      type="number"
                      value={editForm.precioUnitario ?? ""}
                      onChange={(e) => handleEditChange("precioUnitario", e.target.value)}
                      min="0.0001"
                      step="any"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Fila 4: Cálculo y Preview Estimado */}
                <div className="edit-modal-preview-box">
                  <div className="preview-stat-item">
                    <span className="preview-stat-label">Subtotal Base:</span>
                    <span className="preview-stat-value">
                      {formatCurrency(modalSubtotal, editForm.moneda || "USD")}
                    </span>
                  </div>
                  <div className="preview-stat-item">
                    <span className="preview-stat-label">IVA ({editForm.aplicaIVA ? "16%" : "Exento"}):</span>
                    <span className="preview-stat-value">
                      {formatCurrency(modalIva, editForm.moneda || "USD")}
                    </span>
                  </div>
                  <div className="preview-stat-item total-item">
                    <span className="preview-stat-label">Total Partida:</span>
                    <span className="preview-stat-value total-highlight">
                      {formatCurrency(modalTotal, editForm.moneda || "USD")}
                    </span>
                  </div>
                </div>

                {/* Fila 5: Checkbox IVA */}
                <div className="checkbox-group" style={{ margin: "0.25rem 0 0 0" }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editForm.aplicaIVA ?? true}
                      onChange={(e) => handleEditChange("aplicaIVA", e.target.checked)}
                    />
                    <span>Aplica Impuesto al Valor Agregado (IVA 16%)</span>
                  </label>
                </div>
              </div>

              <div className="contract-modal-footer">
                <button
                  type="button"
                  className="btn-ghost-modal"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  style={{ height: "42px", padding: "0 1.35rem" }}
                >
                  <IconSave />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1: Dependency Guard (Bloqueo Defensivo por Avance Existente) */}
      {blockedModalData && (
        <div
          className="contract-modal-overlay"
          onClick={() => setBlockedModalData(null)}
        >
          <div
            className="contract-modal-content guard-modal-pro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="guard-modal-pro-header">
              <div className="guard-icon-badge danger">
                <IconShieldAlert />
              </div>
              <div>
                <h4>Acción Bloqueada: Partida con Avance Registrado</h4>
                <p>No se puede eliminar porque posee dependencias contractuales activas</p>
              </div>
            </div>

            <div className="guard-modal-pro-body">
              <p className="guard-lead-text">
                La partida <strong>{blockedModalData.item.item}</strong> (<em>{blockedModalData.item.descripcion}</em>) está vinculada a las siguientes valuaciones ejecutadas:
              </p>

              <div className="guard-table-wrapper">
                <table className="guard-dep-table">
                  <thead>
                    <tr>
                      <th>Valuación</th>
                      <th>Cantidad Ejecutada</th>
                      <th>Período</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedModalData.valuations.map((hit, idx) => (
                      <tr key={idx}>
                        <td><strong>{hit.valuacionNumero}</strong></td>
                        <td>{hit.cantidadEjecutada.toFixed(2)} {hit.unidad}</td>
                        <td>{hit.periodo || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="guard-rule-box">
                <div className="rule-title">Regla de Integridad de Datos:</div>
                <p>
                  Para salvaguardar la coherencia contable y evitar inconsistencias en el avance acumulado, debes primero revertir o desvincular el avance de esta partida en las valuaciones señaladas.
                </p>
              </div>
            </div>

            <div className="contract-modal-footer">
              <button
                type="button"
                className="btn-primary-action"
                onClick={() => setBlockedModalData(null)}
              >
                <IconCheck />
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmación Destructiva Segura */}
      {confirmDeleteData && (
        <div
          className="contract-modal-overlay"
          onClick={() => setConfirmDeleteData(null)}
        >
          <div
            className="contract-modal-content confirm-modal-pro"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="guard-modal-pro-header">
              <div className="guard-icon-badge warning">
                <IconWarning />
              </div>
              <div>
                <h4>¿Confirmar Eliminación de Partida?</h4>
                <p>Esta acción removerá la partida del presupuesto base del proyecto</p>
              </div>
            </div>

            <div className="guard-modal-pro-body">
              <div className="confirm-item-card">
                <div className="confirm-item-num">{confirmDeleteData.item}</div>
                <div className="confirm-item-info">
                  <p className="confirm-item-desc">{confirmDeleteData.descripcion}</p>
                  <p className="confirm-item-calc">
                    Cantidad: <strong>{confirmDeleteData.cantidad} {confirmDeleteData.unidad}</strong> &bull; Total:{" "}
                    <strong>{formatCurrency(confirmDeleteData.montoContrato, confirmDeleteData.moneda)}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="contract-modal-footer">
              <button
                type="button"
                className="btn-ghost-modal"
                onClick={() => setConfirmDeleteData(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger-action"
                onClick={handleExecuteDelete}
              >
                <IconTrash />
                Confirmar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;
