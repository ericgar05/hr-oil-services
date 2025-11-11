// src/components/modules/contrato/submodules/presupuesto/components/ItemsTable.jsx
import React, { useState } from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import "./ItemsTable.css";

const ItemsTable = ({ items, onEditItem, onDeleteItem, readOnly = false }) => {
  const { formatCurrency } = useCurrency();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = (itemId) => {
    onEditItem(itemId, editForm);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTotalMonto = () => {
    return items.reduce((total, item) => total + item.montoContrato, 0);
  };

  return (
    <div className="items-table">
      <div className="table-header">
        <h4>Partidas Presupuestarias</h4>
        <div className="table-info">
          {items.length} ítem(s) - Total:{" "}
          {formatCurrency(getTotalMonto(), items[0]?.moneda || "USD")}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-item">ITEM</th>
              <th className="col-descripcion">DESCRIPCIÓN</th>
              <th className="col-unidad">UNIDAD</th>
              <th className="col-cantidad">CANTIDAD</th>
              <th className="col-precio">PRECIO UNITARIO</th>
              <th className="col-monto">MONTO DEL CONTRATO</th>
              <th className="col-iva">IVA</th>
              {!readOnly && <th className="col-acciones">ACCIONES</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 7 : 8} className="no-items">
                  No hay ítems agregados al presupuesto
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className={editingId === item.id ? "editing" : ""}
                >
                  {/* ITEM */}
                  <td className="col-item">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editForm.item || ""}
                        onChange={(e) =>
                          handleEditChange("item", e.target.value)
                        }
                        className="edit-input"
                        placeholder="8.1, 8.2, etc."
                      />
                    ) : (
                      <strong>{item.item}</strong>
                    )}
                  </td>

                  {/* DESCRIPCIÓN */}
                  <td className="col-descripcion">
                    {editingId === item.id ? (
                      <textarea
                        value={editForm.descripcion || ""}
                        onChange={(e) =>
                          handleEditChange("descripcion", e.target.value)
                        }
                        className="edit-textarea"
                        rows="2"
                      />
                    ) : (
                      <div className="descripcion-text">{item.descripcion}</div>
                    )}
                  </td>

                  {/* UNIDAD */}
                  <td className="col-unidad">
                    {editingId === item.id ? (
                      <select
                        value={editForm.unidad || ""}
                        onChange={(e) =>
                          handleEditChange("unidad", e.target.value)
                        }
                        className="edit-select"
                      >
                        <option value="SG">SG</option>
                        <option value="DIA">DIA</option>
                        <option value="M3">M3</option>
                        <option value="UNIDAD">UNIDAD</option>
                        <option value="H-H">H-H</option>
                        <option value="ML">ML</option>
                        <option value="M2">M2</option>
                        <option value="KG">KG</option>
                        <option value="TON">TON</option>
                        <option value="LTS">LTS</option>
                        <option value="GLN">GLN</option>
                      </select>
                    ) : (
                      item.unidad
                    )}
                  </td>

                  {/* CANTIDAD */}
                  <td className="col-cantidad">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={editForm.cantidad || 0}
                        onChange={(e) =>
                          handleEditChange(
                            "cantidad",
                            parseFloat(e.target.value)
                          )
                        }
                        min="0"
                        step="0.01"
                        className="edit-input number"
                      />
                    ) : (
                      item.cantidad.toLocaleString("es-VE")
                    )}
                  </td>

                  {/* PRECIO UNITARIO */}
                  <td className="col-precio">
                    {editingId === item.id ? (
                      <div className="price-edit">
                        <select
                          value={editForm.moneda || "USD"}
                          onChange={(e) =>
                            handleEditChange("moneda", e.target.value)
                          }
                          className="currency-select"
                        >
                          <option value="USD">USD$</option>
                          <option value="EUR">EUR€</option>
                          <option value="BS">Bs</option>
                        </select>
                        <input
                          type="number"
                          value={editForm.precioUnitario || 0}
                          onChange={(e) =>
                            handleEditChange(
                              "precioUnitario",
                              parseFloat(e.target.value)
                            )
                          }
                          min="0"
                          step="0.01"
                          className="edit-input number"
                        />
                      </div>
                    ) : (
                      formatCurrency(item.precioUnitario, item.moneda)
                    )}
                  </td>

                  {/* MONTO DEL CONTRATO */}
                  <td className="col-monto">
                    <strong>
                      {formatCurrency(item.montoContrato, item.moneda)}
                    </strong>
                  </td>

                  {/* IVA */}
                  <td className="col-iva">
                    {editingId === item.id ? (
                      <label className="iva-checkbox">
                        <input
                          type="checkbox"
                          checked={editForm.aplicaIVA || false}
                          onChange={(e) =>
                            handleEditChange("aplicaIVA", e.target.checked)
                          }
                        />
                        <span className="checkmark"></span>
                        Aplica IVA
                      </label>
                    ) : (
                      <span
                        className={`iva-badge ${
                          item.aplicaIVA ? "with-iva" : "without-iva"
                        }`}
                      >
                        {item.aplicaIVA ? "16%" : "Exento"}
                      </span>
                    )}
                  </td>

                  {/* ACCIONES */}
                  {!readOnly && (
                    <td className="col-acciones">
                      {editingId === item.id ? (
                        <div className="edit-actions">
                          <button
                            className="btn-save"
                            onClick={() => handleSaveEdit(item.id)}
                          >
                            ✅
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={handleCancelEdit}
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="btn-edit"
                            onClick={() => handleEditClick(item)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="table-footer">
          <div className="footer-stats">
            <span>
              <strong>Total Ítems:</strong> {items.length}
            </span>
            <span>
              <strong>Ítems con IVA:</strong>{" "}
              {items.filter((item) => item.aplicaIVA).length}
            </span>
            <span>
              <strong>Ítems sin IVA:</strong>{" "}
              {items.filter((item) => !item.aplicaIVA).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;
