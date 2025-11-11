// src/components/modules/contrato/submodules/presupuesto/components/PresupuestoForm.jsx
import React, { useState } from "react";
import "./PresupuestoForm.css";

const PresupuestoForm = ({
  presupuesto,
  onSubmit,
  onCancel,
  showItemsForm = false,
  onAddItem,
}) => {
  const [formData, setFormData] = useState({
    contratoNumero: presupuesto.contratoNumero || "",
    nombreContrato: presupuesto.nombreContrato || "",
  });

  const [itemData, setItemData] = useState({
    item: "",
    descripcion: "",
    unidad: "",
    cantidad: 1,
    precioUnitario: 0,
    moneda: "USD",
    aplicaIVA: true,
  });

  const unidades = [
    "SG",
    "DIA",
    "M3",
    "UNIDAD",
    "H-H",
    "ML",
    "M2",
    "KG",
    "TON",
    "LTS",
    "GLN",
  ];

  const handleContratoSubmit = (e) => {
    e.preventDefault();
    if (formData.contratoNumero && formData.nombreContrato) {
      onSubmit(formData);
    } else {
      alert("Por favor complete todos los campos del contrato");
    }
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();

    // Validar que el número de ítem esté completo
    if (!itemData.item) {
      alert("Por favor ingrese el número del ítem (ej: 8.1, 8.2, etc.)");
      return;
    }

    if (!itemData.descripcion) {
      alert("Por favor ingrese la descripción del ítem");
      return;
    }

    if (!itemData.unidad) {
      alert("Por favor seleccione la unidad");
      return;
    }

    if (itemData.cantidad <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (itemData.precioUnitario <= 0) {
      alert("El precio unitario debe ser mayor a 0");
      return;
    }
    //Crea un objeto con los datos del ítem incluido la propiedad de moneda la moneda se maneja en el contexto de CurrencyContext y se manipula como un string
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      montoContrato: itemData.cantidad * itemData.precioUnitario,
    };

    onAddItem(newItem);

    // Resetear formulario de ítem (mantener el número de ítem para facilitar la secuencia)
    const currentItemNumber = itemData.item;
    const nextItemNumber = suggestNextItem(currentItemNumber);

    setItemData({
      item: nextItemNumber,
      descripcion: "",
      unidad: "",
      cantidad: 1,
      precioUnitario: 0,
      moneda: "USD",
      aplicaIVA: true,
    });
  };

  // Función para sugerir el siguiente ítem basado en el actual
  const suggestNextItem = (currentItem) => {
    if (!currentItem) return "";

    // Intentar extraer el número y aumentar en 0.1
    const match = currentItem.match(/^(\d+)\.(\d+)$/);
    if (match) {
      const main = parseInt(match[1]);
      const sub = parseInt(match[2]);
      return `${main}.${sub + 1}`;
    }

    // Si no coincide el formato, devolver el mismo
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
    setItemData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Calcular monto automáticamente
  const montoCalculado = itemData.cantidad * itemData.precioUnitario;

  if (!showItemsForm) {
    return (
      <div className="presupuesto-form">
        <form onSubmit={handleContratoSubmit}>
          <div className="form-group">
            <label htmlFor="contratoNumero">Contrato N° *</label>
            <input
              type="text"
              id="contratoNumero"
              name="contratoNumero"
              value={formData.contratoNumero}
              onChange={handleInputChange}
              placeholder="Ej: 3N-069-035-D-24-S-0201 / SAP 4600139869"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombreContrato">
              Nombre Completo del Contrato *
            </label>
            <textarea
              id="nombreContrato"
              name="nombreContrato"
              value={formData.nombreContrato}
              onChange={handleInputChange}
              placeholder="Ej: MANTENIMIENTO CORRECTIVO A VÁLVULAS DE CONTROL, ON-OFF Y VÁLVULAS SP Y ACTUADORES DE LAS UNIDADES DE PROCESO..."
              rows="3"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              ➡️ Continuar a Agregar Ítems
            </button>
            <button type="button" className="btn-outline" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="presupuesto-form items-form">
      <h4>Agregar Nuevo Ítem</h4>
      <form onSubmit={handleItemSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="item">Número de Ítem *</label>
            <input
              type="text"
              id="item"
              name="item"
              value={itemData.item}
              onChange={handleItemChange}
              placeholder="Ej: 8.1, 8.2, 8.3, etc."
              required
            />
            <small className="input-help">
              Formato: número principal.subítem (ej: 8.1, 8.2, 9.1, etc.)
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="unidad">Unidad *</label>
            <select
              id="unidad"
              name="unidad"
              value={itemData.unidad}
              onChange={handleItemChange}
              required
            >
              <option value="">Seleccionar unidad...</option>
              {unidades.map((unidad) => (
                <option key={unidad} value={unidad}>
                  {unidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción *</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={itemData.descripcion}
            onChange={handleItemChange}
            placeholder="Descripción detallada del ítem..."
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad *</label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={itemData.cantidad}
              onChange={handleItemChange}
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="precioUnitario">Precio Unitario *</label>
            <div className="price-input-group">
              <select
                name="moneda"
                value={itemData.moneda}
                onChange={handleItemChange}
                className="currency-select"
              >
                <option value="USD">USD$</option>
                <option value="EUR">EUR€</option>
                <option value="BS">Bs</option>
              </select>
              <input
                type="number"
                id="precioUnitario"
                name="precioUnitario"
                value={itemData.precioUnitario}
                onChange={handleItemChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Monto Calculado</label>
            <div className="monto-calculado">
              {montoCalculado.toLocaleString("es-VE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {itemData.moneda === "USD"
                ? "$"
                : itemData.moneda === "EUR"
                ? "€"
                : "Bs"}
            </div>
            <small className="calculation-help">
              = {itemData.cantidad} × {itemData.precioUnitario}
            </small>
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="aplicaIVA"
              checked={itemData.aplicaIVA}
              onChange={handleItemChange}
            />
            <span className="checkmark"></span>
            Aplicar IVA (16%) a este ítem
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            ➕ Agregar Ítem al Presupuesto
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              // Resetear formulario completamente
              setItemData({
                item: "",
                descripcion: "",
                unidad: "",
                cantidad: 1,
                precioUnitario: 0,
                moneda: "USD",
                aplicaIVA: true,
              });
            }}
          >
            🔄 Limpiar Formulario
          </button>
        </div>
      </form>
    </div>
  );
};

export default PresupuestoForm;
