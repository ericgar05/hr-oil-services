// src/components/modules/contrato/submodules/presupuesto/components/PresupuestoForm.jsx
import React, { useState, useEffect } from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { useNotification } from "../../../../../../contexts/NotificationContext";
import {
  getUnidadesMedida,
  crearUnidadMedida,
  UNIDADES_BASE_CATALOG,
} from "../../../../../../services/unidadesService";
import "./PresupuestoForm.css";

// Iconos Vectoriales SVG Profesionales
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconCross = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const IconContractDoc = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const PresupuestoForm = ({
  presupuesto,
  onSubmit,
  onCancel,
  showItemsForm = false,
  onAddItem,
}) => {
  const { formatCurrency } = useCurrency();
  const { showToast } = useNotification();

  const contractCurrency =
    presupuesto?.monedaPrincipal ||
    presupuesto?.currency ||
    presupuesto?.items?.[0]?.moneda ||
    "USD";

  const [formData, setFormData] = useState({
    contratoNumero: presupuesto.contratoNumero || "",
    nombreContrato: presupuesto.nombreContrato || "",
    monedaPrincipal: contractCurrency,
  });

  const [unidadesList, setUnidadesList] = useState(UNIDADES_BASE_CATALOG);
  const [showCustomUnitInput, setShowCustomUnitInput] = useState(false);
  const [customUnitValue, setCustomUnitValue] = useState("");
  const [isSavingUnit, setIsSavingUnit] = useState(false);

  const [itemData, setItemData] = useState({
    item: "",
    descripcion: "",
    unidad: "",
    cantidad: "",
    precioUnitario: "",
    moneda: contractCurrency,
    aplicaIVA: true,
  });

  const [allowManualCurrency, setAllowManualCurrency] = useState(false);

  // Cargar catálogo de unidades desde Supabase o Caché al montar
  useEffect(() => {
    let isMounted = true;
    async function loadUnits() {
      const units = await getUnidadesMedida();
      if (isMounted && units && units.length > 0) {
        setUnidadesList(units);
      }
    }
    loadUnits();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sincronizar moneda cuando cambie la cabecera del contrato
  useEffect(() => {
    if (!allowManualCurrency) {
      setItemData((prev) => ({
        ...prev,
        moneda: formData.monedaPrincipal || contractCurrency,
      }));
    }
  }, [formData.monedaPrincipal, contractCurrency, allowManualCurrency]);

  const handleContratoSubmit = (e) => {
    e.preventDefault();
    if (formData.contratoNumero.trim() && formData.nombreContrato.trim()) {
      onSubmit(formData);
    } else {
      showToast("Por favor complete los campos obligatorios del contrato", "warning");
    }
  };

  const handleAddCustomUnit = async () => {
    const cleanUnit = customUnitValue.trim().toUpperCase();
    if (!cleanUnit) {
      showToast("Ingrese el código o sigla de la unidad", "warning");
      return;
    }

    setIsSavingUnit(true);
    try {
      const saved = await crearUnidadMedida({
        codigo: cleanUnit,
        nombre: cleanUnit,
        categoria: "personalizada",
      });

      setUnidadesList((prev) => {
        const exists = prev.some((u) => (u.codigo || u) === cleanUnit);
        return exists ? prev : [...prev, saved];
      });

      setItemData((prev) => ({ ...prev, unidad: cleanUnit }));
      setCustomUnitValue("");
      setShowCustomUnitInput(false);
      showToast(`Unidad "${cleanUnit}" guardada y sincronizada`, "success");
    } catch (err) {
      console.error("Error al registrar unidad:", err);
      showToast("Error al guardar la unidad en la base de datos", "error");
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();

    if (!itemData.item.trim()) {
      showToast("Por favor ingrese el número del ítem (ej: 8.1)", "warning");
      return;
    }

    if (!itemData.descripcion.trim()) {
      showToast("Por favor ingrese la descripción técnica del ítem", "warning");
      return;
    }

    if (!itemData.unidad) {
      showToast("Por favor seleccione la unidad de medida", "warning");
      return;
    }

    const cantidadNum = parseFloat(itemData.cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      showToast("La cantidad debe ser mayor a 0", "warning");
      return;
    }

    const precioNum = parseFloat(itemData.precioUnitario);
    if (isNaN(precioNum) || precioNum <= 0) {
      showToast("El precio unitario debe ser mayor a 0", "warning");
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      item: itemData.item.trim(),
      descripcion: itemData.descripcion.trim(),
      unidad: itemData.unidad,
      cantidad: cantidadNum,
      precioUnitario: precioNum,
      moneda: itemData.moneda || formData.monedaPrincipal || "USD",
      aplicaIVA: itemData.aplicaIVA,
      montoContrato: cantidadNum * precioNum,
    };

    onAddItem(newItem);

    // Sugerir el siguiente número correlativo
    const nextItemNumber = suggestNextItem(itemData.item);

    // Limpiar campos numéricos manteniendo unidad y correlativo
    setItemData({
      item: nextItemNumber,
      descripcion: "",
      unidad: itemData.unidad,
      cantidad: "",
      precioUnitario: "",
      moneda: itemData.moneda,
      aplicaIVA: true,
    });

    showToast(`Partida ${newItem.item} agregada exitosamente`, "success");
  };

  const suggestNextItem = (currentItem) => {
    if (!currentItem) return "";
    const match = currentItem.match(/^(\d+)\.(\d+)$/);
    if (match) {
      const main = parseInt(match[1]);
      const sub = parseInt(match[2]);
      return `${main}.${sub + 1}`;
    }
    return currentItem;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "unidad" && value === "CUSTOM_UNIT") {
      setShowCustomUnitInput(true);
      return;
    }
    setItemData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Cálculos en vivo reactivos
  const cantidadVal = parseFloat(itemData.cantidad) || 0;
  const precioVal = parseFloat(itemData.precioUnitario) || 0;
  const subtotalLive = cantidadVal * precioVal;
  const ivaLive = itemData.aplicaIVA ? subtotalLive * 0.16 : 0;
  const totalLive = subtotalLive + ivaLive;

  // Paso 1: Configuración de la cabecera contractual
  if (!showItemsForm) {
    return (
      <div className="presupuesto-form contract-header-form">
        <div className="form-header-badge">
          <div className="badge-icon-box">
            <IconContractDoc />
          </div>
          <div>
            <h3>Datos Generales del Contrato</h3>
            <p>Define la identificación contractual y la moneda base del proyecto.</p>
          </div>
        </div>

        <form onSubmit={handleContratoSubmit}>
          <div className="form-row-contract-head">
            <div className="form-group col-contract-num">
              <label htmlFor="contratoNumero">Número de Contrato / Orden *</label>
              <input
                type="text"
                id="contratoNumero"
                name="contratoNumero"
                value={formData.contratoNumero}
                onChange={handleInputChange}
                placeholder="Ej: SAP 4600139869"
                required
              />
              <small className="input-help">Identificador contractual oficial</small>
            </div>

            <div className="form-group col-contract-currency">
              <label>Moneda Principal del Presupuesto *</label>
              <div className="currency-segmented-control">
                {[
                  { code: "USD", symbol: "$", label: "USD ($)" },
                  { code: "BS", symbol: "Bs.", label: "Bolívares (Bs.)" },
                  { code: "EUR", symbol: "€", label: "Euros (€)" },
                ].map((c) => {
                  const isSelected = formData.monedaPrincipal === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      className={`currency-pill ${isSelected ? "active" : ""}`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, monedaPrincipal: c.code }))
                      }
                    >
                      <span className="currency-symbol-tag">{c.symbol}</span>
                      <span className="currency-pill-label">{c.label}</span>
                      {isSelected && <span className="currency-pill-indicator">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-group col-contract-scope">
            <label htmlFor="nombreContrato">Nombre Completo del Contrato / Alcance de Obra *</label>
            <textarea
              id="nombreContrato"
              name="nombreContrato"
              value={formData.nombreContrato}
              onChange={handleInputChange}
              placeholder="Ej: MANTENIMIENTO CORRECTIVO A VÁLVULAS DE CONTROL, ON-OFF Y ACTUADORES DE LAS UNIDADES DE PROCESO..."
              rows="3"
              required
            />
            <small className="input-help">Descripción técnica y alcance general del contrato</small>
          </div>

          <div className="form-actions-bar">
            <button type="submit" className="btn-primary-action">
              Continuar a Cargar Partidas
              <IconArrowRight />
            </button>
            <button type="button" className="btn-ghost-action" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Paso 2: Formulario de carga de partidas
  return (
    <div className="presupuesto-form items-form">
      <div className="items-form-header">
        <div className="items-header-title">
          <h4>Agregar Partida al Presupuesto</h4>
          <span className="header-subtitle">Completa los datos técnicos y económicos de la partida</span>
        </div>
      </div>

      <form onSubmit={handleItemSubmit}>
        {/* Fila 1: Clasificación e Identificación de la Partida */}
        <div className="form-row-classification">
          <div className="form-group col-item-num">
            <label htmlFor="item">N° Ítem *</label>
            <input
              type="text"
              id="item"
              name="item"
              value={itemData.item}
              onChange={handleItemChange}
              placeholder="Ej: 8.1"
              required
            />
            <small className="input-help">Correlativo</small>
          </div>

          <div className="form-group col-unit">
            <label htmlFor="unidad">Unidad de Medida *</label>
            {!showCustomUnitInput ? (
              <select
                id="unidad"
                name="unidad"
                value={itemData.unidad}
                onChange={handleItemChange}
                required
              >
                <option value="">Seleccionar unidad...</option>
                <optgroup label="Catálogo Corporativo">
                  {unidadesList.map((u) => {
                    const code = typeof u === "string" ? u : u.codigo;
                    const name = typeof u === "string" ? u : u.nombre ? `${u.codigo} - ${u.nombre}` : u.codigo;
                    return (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    );
                  })}
                </optgroup>
                <option value="CUSTOM_UNIT">+ Otra unidad personalizada...</option>
              </select>
            ) : (
              <div className="custom-unit-input-group">
                <input
                  type="text"
                  placeholder="Código (ej: BBL, PZA)"
                  value={customUnitValue}
                  onChange={(e) => setCustomUnitValue(e.target.value)}
                  autoFocus
                  disabled={isSavingUnit}
                />
                <button
                  type="button"
                  className="btn-unit-save"
                  onClick={handleAddCustomUnit}
                  disabled={isSavingUnit}
                  title="Guardar unidad en base de datos"
                >
                  <IconCheck />
                </button>
                <button
                  type="button"
                  className="btn-unit-cancel"
                  onClick={() => setShowCustomUnitInput(false)}
                  disabled={isSavingUnit}
                  title="Cancelar"
                >
                  <IconCross />
                </button>
              </div>
            )}
            <small className="input-help">Unidad de cómputo</small>
          </div>

          <div className="form-group col-item-currency">
            <label>Moneda de la Partida</label>
            <div className="item-currency-box">
              <span className="currency-badge-text">
                Base: <strong>{itemData.moneda}</strong>
              </span>
              {!allowManualCurrency ? (
                <button
                  type="button"
                  className="btn-currency-override"
                  onClick={() => setAllowManualCurrency(true)}
                  title="Permitir moneda mixta para esta partida específica"
                >
                  (Cambiar)
                </button>
              ) : (
                <select
                  name="moneda"
                  value={itemData.moneda}
                  onChange={handleItemChange}
                  className="currency-override-select"
                >
                  <option value="USD">USD ($)</option>
                  <option value="BS">BS (Bs.)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              )}
            </div>
            <small className="input-help">Heredada del contrato</small>
          </div>
        </div>

        {/* Fila 2: Descripción Técnica */}
        <div className="form-group col-desc">
          <label htmlFor="descripcion">Descripción Técnica de la Partida *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={itemData.descripcion}
            onChange={handleItemChange}
            placeholder="Descripción técnica detallada del trabajo, suministro o servicio a contratar..."
            rows="3"
            required
          />
        </div>

        {/* Fila 3: Cantidad, Precio Unitario y Cálculo Estimado */}
        <div className="form-row-financial">
          <div className="form-group col-qty">
            <label htmlFor="cantidad">Cantidad *</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={itemData.cantidad}
              onChange={handleItemChange}
              min="0.001"
              step="any"
              placeholder="0.00"
              required
            />
            <small className="input-help">Volumen / cómputo</small>
          </div>

          <div className="form-group col-price">
            <label htmlFor="precioUnitario">Precio Unitario ({itemData.moneda}) *</label>
            <input
              type="number"
              id="precioUnitario"
              name="precioUnitario"
              value={itemData.precioUnitario}
              onChange={handleItemChange}
              min="0.001"
              step="any"
              placeholder="0.00"
              required
            />
            <small className="input-help">Costo unitario sin IVA</small>
          </div>

          <div className="form-group col-preview">
            <label>Cálculo Estimado de la Partida</label>
            <div className="live-preview-box">
              <div className="live-preview-main">
                <span className="live-preview-label">Subtotal:</span>
                <span className="live-preview-amount">
                  {formatCurrency(subtotalLive, itemData.moneda)}
                </span>
              </div>
              <div className="live-preview-sub">
                {itemData.aplicaIVA ? (
                  <span>
                    Total c/IVA (16%):{" "}
                    <strong>{formatCurrency(totalLive, itemData.moneda)}</strong>
                  </span>
                ) : (
                  <span className="exempt-badge">Exento de IVA</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 4: Checkbox IVA */}
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="aplicaIVA"
              checked={itemData.aplicaIVA}
              onChange={handleItemChange}
            />
            <span className="checkmark"></span>
            Aplica Impuesto al Valor Agregado (IVA 16%)
          </label>
        </div>

        {/* Fila 5: Acciones */}
        <div className="form-actions-bar">
          <button type="submit" className="btn-primary-action">
            <IconPlus />
            Agregar Partida al Presupuesto
          </button>
          <button
            type="button"
            className="btn-ghost-action"
            onClick={() => {
              setItemData({
                item: "",
                descripcion: "",
                unidad: "",
                cantidad: "",
                precioUnitario: "",
                moneda: formData.monedaPrincipal || contractCurrency,
                aplicaIVA: true,
              });
            }}
          >
            <IconRefresh />
            Limpiar Campos
          </button>
        </div>
      </form>
    </div>
  );
};

export default PresupuestoForm;
