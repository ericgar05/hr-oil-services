// export default ValuacionForm
// src/components/modules/contrato/submodules/valuaciones/components/ValuacionForm.jsx
import React, { useState, useEffect } from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { useProjects } from "../../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../../contexts/BudgetContext"; // 1. Importar useBudget
import { useValuation } from "../../../../../../contexts/ValuationContext";
import { useNotification } from "../../../../../../contexts/NotificationContext";
import "./ValuacionForm.css";

// Iconos Vectoriales SVG Profesionales
const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

const IconZap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const ValuacionForm = ({
  presupuestoData,
  valuacionEdit,
  nextValuationNumber,
  onSave,
  onCancel,
}) => {
  const { formatCurrency } = useCurrency();
  const { selectedProject } = useProjects();
  const { budget } = useBudget(); // 2. Obtener el presupuesto para sacar la moneda principal
  const { valuations } = useValuation();
  const { showToast } = useNotification();

  // 3. Determinar la moneda principal del proyecto
  const mainCurrency = budget?.monedaPrincipal || "USD";

  const [formData, setFormData] = useState({
    numero: `VALUACIÓN ${nextValuationNumber || 1}`,
    periodoInicio: "",
    periodoFin: "",
    partidas: [],
  });

  const [selectedPartida, setSelectedPartida] = useState("");
  const [cantidadEjecutada, setCantidadEjecutada] = useState("");
  const [avancePartidas, setAvancePartidas] = useState([]);

  // Cargar datos de edición y calcular avance REAL del presupuesto
  useEffect(() => {
    if (valuacionEdit) {
      setFormData(valuacionEdit);
    } else {
      // Configurar fecha de inicio basada en la última valuación del contexto
      let fechaInicio = new Date();
      if (valuations && valuations.length > 0) {
        const ultimaValuacion = [...valuations]
          .sort((a, b) => new Date(a.periodoFin) - new Date(b.periodoFin))
          .pop();
        const ultimaFechaFin = new Date(ultimaValuacion.periodoFin);
        fechaInicio = new Date(
          ultimaFechaFin.setDate(ultimaFechaFin.getDate() + 1)
        );
      }

      setFormData((prev) => ({
        ...prev,
        numero: `VALUACIÓN ${nextValuationNumber || 1}`,
        periodoInicio: fechaInicio.toISOString().split("T")[0],
        periodoFin: new Date(fechaInicio.setDate(fechaInicio.getDate() + 30))
          .toISOString()
          .split("T")[0],
      }));
    }

    // Calcular avance REAL del presupuesto
    calcularAvanceRealPresupuesto();
  }, [
    valuacionEdit,
    presupuestoData,
    nextValuationNumber,
    selectedProject,
    valuations,
  ]); // valuations se agrega como dependencia

  // AGREGAR: useEffect para recalcular cuando cambien las partidas de la valuación actual
  useEffect(() => {
    calcularAvanceRealPresupuesto();
  }, [formData.partidas]);

  // Calcular avance REAL del presupuesto (CORREGIDO)
  const calcularAvanceRealPresupuesto = () => {
    if (!presupuestoData || !presupuestoData.items) return;

    console.log("🔍 DEBUG - Valuaciones cargadas:", valuations);
    console.log("🔍 DEBUG - Project ID:", selectedProject?.id);
    console.log("🔍 DEBUG - Presupuesto items:", presupuestoData.items.length);

    // Calcular ejecución acumulada por partida (SOLO valuaciones anteriores)
    const ejecucionAcumulada = {};

    // Inicializar con datos del presupuesto
    presupuestoData.items.forEach((item) => {
      ejecucionAcumulada[item.id] = {
        ...item,
        cantidadEjecutada: 0,
        montoEjecutado: 0,
        cantidadDisponible: item.cantidad,
        montoDisponible: item.montoContrato,
      };
    });

    // Sumar ejecución de TODAS las valuaciones ANTERIORES (excluyendo la actual si estamos editando)
    valuations?.forEach((valuacion) => {
      // Si estamos editando, excluir la valuación actual para no duplicar
      if (valuacionEdit && valuacion.id === valuacionEdit.id) {
        console.log(
          "🔍 DEBUG - Excluyendo valuación actual:",
          valuacion.numero
        );
        return; // Saltar esta valuación
      }

      console.log("🔍 DEBUG - Procesando valuación:", valuacion.numero);
      valuacion.partidas?.forEach((partida) => {
        if (ejecucionAcumulada[partida.partidaId]) {
          console.log(
            `🔍 DEBUG - Sumando partida ${partida.partidaId}: ${parseFloat(
              partida.cantidadEjecutada
            )} ${partida.unidad}`
          );
          ejecucionAcumulada[partida.partidaId].cantidadEjecutada += parseFloat(
            partida.cantidadEjecutada
          );
          ejecucionAcumulada[partida.partidaId].montoEjecutado +=
            partida.montoTotal;
        }
      });
    });

    // Calcular disponibilidad REAL (sin incluir la valuación actual)
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
        cantidadDisponible: partida.cantidad - partida.cantidadEjecutada,
        montoDisponible: partida.montoContrato - partida.montoEjecutado,
        porcentajeEjecutadoCantidad: porcentajeCantidad,
        porcentajeEjecutadoMonto: porcentajeMonto,
      };
    });

    console.log("🔍 DEBUG - Avance calculado:", avance);
    setAvancePartidas(avance);
  };

  const handleAddPartida = () => {
    if (
      !selectedPartida ||
      !cantidadEjecutada ||
      parseFloat(cantidadEjecutada) <= 0
    ) {
      showToast("Por favor selecciona una partida y ingresa una cantidad válida", "warning");
      return;
    }

    const partidaPresupuesto = presupuestoData.items.find(
      (item) => item.id === selectedPartida
    );
    if (!partidaPresupuesto) return;

    const cantidad = parseFloat(cantidadEjecutada);
    const partidaAvance = avancePartidas.find((p) => p.id === selectedPartida);

    // IMPORTANTE: Usar la cantidadDisponible que ya incluye las valuaciones anteriores
    const cantidadDisponibleReal = partidaAvance?.cantidadDisponible || 0;

    console.log("🔍 DEBUG - Validando cantidad:", {
      cantidad,
      cantidadDisponibleReal,
      partida: partidaAvance?.item,
      unidad: partidaPresupuesto.unidad,
    });

    if (cantidad > cantidadDisponibleReal) {
      showToast(
        `No hay suficiente cantidad disponible. Máximo disponible: ${cantidadDisponibleReal.toFixed(
          2
        )} ${partidaPresupuesto.unidad}`, "warning"
      );
      return;
    }

    const montoTotal = cantidad * partidaPresupuesto.precioUnitario;

    const nuevaPartida = {
      id: Date.now().toString(),
      partidaId: partidaPresupuesto.id,
      item: partidaPresupuesto.item,
      descripcion: partidaPresupuesto.descripcion,
      unidad: partidaPresupuesto.unidad,
      precioUnitario: partidaPresupuesto.precioUnitario,
      moneda: partidaPresupuesto.moneda,
      cantidadEjecutada: cantidad,
      montoTotal: montoTotal,
      aplicaIVA: partidaPresupuesto.aplicaIVA,
    };

    setFormData((prev) => ({
      ...prev,
      partidas: [...prev.partidas, nuevaPartida],
    }));

    // Resetear selección
    setSelectedPartida("");
    setCantidadEjecutada("");
  };

  const handleRemovePartida = (partidaId) => {
    const partida = formData.partidas.find((p) => p.id === partidaId);
    const nombre = partida ? `la partida ${partida.item}` : "esta partida";
    if (window.confirm(`¿Estás seguro de que deseas retirar ${nombre} de la valuación actual?`)) {
      setFormData((prev) => ({
        ...prev,
        partidas: prev.partidas.filter((p) => p.id !== partidaId),
      }));
    }
  };

  const handleSave = () => {
    if (!formData.numero || !formData.periodoInicio || !formData.periodoFin) {
      showToast("Por favor completa todos los campos obligatorios", "warning");
      return;
    }

    if (formData.partidas.length === 0) {
      showToast("Debes agregar al menos una partida ejecutada", "warning");
      return;
    }

    // Calcular totales
    const subtotal = formData.partidas.reduce(
      (sum, partida) => sum + partida.montoTotal,
      0
    );
    const partidasConIva = formData.partidas.filter((p) => p.aplicaIVA);
    const iva = partidasConIva.reduce(
      (sum, partida) => sum + partida.montoTotal * 0.16,
      0
    );
    const total = subtotal + iva;

    const valuacionCompleta = {
      ...formData,
      totales: {
        subtotal,
        iva,
        total,
        cantidadPartidas: formData.partidas.length,
        // AGREGADO: Guardar la moneda de la valuación.
        // Asumimos que es la moneda de la primera partida.
        currency: formData.partidas[0]?.moneda || "USD",
      },
      fechaCreacion: valuacionEdit?.fechaCreacion || new Date().toISOString(),
      projectId: selectedProject?.id, // CORREGIDO: usar selectedProject.id
    };

    onSave(valuacionCompleta);
  };

  // Calcular totales en tiempo real
  const subtotal = formData.partidas.reduce(
    (sum, partida) => sum + partida.montoTotal,
    0
  );
  const partidasConIva = formData.partidas.filter((p) => p.aplicaIVA);
  const iva = partidasConIva.reduce(
    (sum, partida) => sum + partida.montoTotal * 0.16,
    0
  );
  const total = subtotal + iva;

  // Partidas disponibles (basado en el avance REAL)
  const partidasDisponibles = avancePartidas.filter(
    (partida) => partida.cantidadDisponible > 0
  );

  // Calcular totales del avance
  const getTotalEjecutado = () => {
    return avancePartidas.reduce(
      (total, partida) => total + partida.montoEjecutado,
      0
    );
  };

  const getTotalPresupuestado = () => {
    return avancePartidas.reduce(
      (total, partida) => total + partida.montoContrato,
      0
    );
  };

  const getPorcentajeTotal = () => {
    const totalPresupuestado = getTotalPresupuestado();
    return totalPresupuestado > 0
      ? (getTotalEjecutado() / totalPresupuestado) * 100
      : 0;
  };

  return (
    <div className="valuacion-form">
      <div className="form-header">
        <h3>{valuacionEdit ? "Editar Valuación" : "Nueva Valuación"}</h3>
        <div className="header-actions">
          <button type="button" className="btn-back-header" onClick={onCancel}>
            <IconArrowLeft /> Volver
          </button>
        </div>
      </div>

      {/* Información básica de la valuación */}
      <div className="basic-info-section">
        <h4>Información de la Valuación</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Valuación N° *</label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, numero: e.target.value }))
              }
              placeholder="Ej: VALUACIÓN 1"
              required
            />
          </div>
          <div className="form-group">
            <label>Periodo de Ejecución - Inicio *</label>
            <input
              type="date"
              value={formData.periodoInicio}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  periodoInicio: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Periodo de Ejecución - Fin *</label>
            <input
              type="date"
              value={formData.periodoFin}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, periodoFin: e.target.value }))
              }
              required
            />
          </div>
        </div>
      </div>

      {/* TABLA de Avance REAL */}
      {avancePartidas.length > 0 && (
        <div className="avance-presupuesto-section">
          <div className="avance-header">
            <h4>Avance del Presupuesto (Ejecución Real Acumulada)</h4>
            <div className="avance-total">
              <span className="avance-label">Avance Global:</span>
              <span className="avance-value">
                {getPorcentajeTotal().toFixed(1)}%
              </span>
              <span className="avance-monto">
                {formatCurrency(getTotalEjecutado(), "USD")} de{" "}
                {formatCurrency(getTotalPresupuestado(), "USD")}
              </span>
            </div>
          </div>

          <div className="avance-table">
            <table>
              <thead>
                <tr>
                  <th className="col-item">ITEM</th>
                  <th className="col-descripcion">DESCRIPCIÓN</th>
                  <th className="col-unidad">UNIDAD</th>
                  <th className="col-presupuestado">PRESUPUESTADO</th>
                  <th className="col-ejecutado">EJECUTADO</th>
                  <th className="col-disponible">DISPONIBLE</th>
                  <th className="col-porcentaje">% AVANCE</th>
                </tr>
              </thead>
              <tbody>
                {avancePartidas.map((partida) => (
                  <tr
                    key={partida.id}
                    className={
                      partida.cantidadDisponible <= 0 ? "completada" : ""
                    }
                  >
                    <td className="col-item">{partida.item}</td>
                    <td className="col-descripcion">{partida.descripcion}</td>
                    <td className="col-unidad">{partida.unidad}</td>
                    <td className="col-presupuestado">
                      <div>
                        {partida.cantidad.toLocaleString("es-VE")}{" "}
                        {partida.unidad}
                      </div>
                      <div className="monto">
                        {formatCurrency(partida.montoContrato, partida.moneda)}
                      </div>
                    </td>
                    <td className="col-ejecutado">
                      <div>
                        {partida.cantidadEjecutada.toLocaleString("es-VE")}{" "}
                        {partida.unidad}
                      </div>
                      <div className="monto">
                        {formatCurrency(partida.montoEjecutado, partida.moneda)}
                      </div>
                    </td>
                    <td className="col-disponible">
                      <div>
                        {partida.cantidadDisponible.toLocaleString("es-VE")}{" "}
                        {partida.unidad}
                      </div>
                      <div className="monto">
                        {formatCurrency(
                          partida.montoDisponible,
                          partida.moneda
                        )}
                      </div>
                    </td>
                    <td className="col-porcentaje">
                      <div className="progress-container">
                        <div
                          className="progress-bar-avance"
                          style={{
                            width: `${Math.min(
                              partida.porcentajeEjecutadoCantidad,
                              100
                            )}%`,
                          }}
                        ></div>
                        <span className="progress-text">
                          {partida.porcentajeEjecutadoCantidad.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agregar partidas - usando disponibilidad REAL */}
      <div className="add-partida-section">
        <h4>Agregar Partidas Ejecutadas</h4>
        <div className="add-partida-form">
          <div className="form-row">
            <div className="form-group">
              <label>Seleccionar Partida</label>
              <select
                value={selectedPartida}
                onChange={(e) => {
                  setSelectedPartida(e.target.value);
                  setCantidadEjecutada("");
                }}
                disabled={partidasDisponibles.length === 0}
              >
                <option value="">Seleccionar partida...</option>
                {partidasDisponibles.map((partida) => (
                  <option key={partida.id} value={partida.id}>
                    {partida.item} - {partida.descripcion.substring(0, 50)}...
                    {` (Disponible: ${partida.cantidadDisponible.toFixed(2)} ${
                      partida.unidad
                    })`}
                  </option>
                ))}
              </select>
              {partidasDisponibles.length === 0 && (
                <small>No hay partidas disponibles para agregar</small>
              )}
            </div>

            <div className="form-group col-cantidad-ejecutada">
              <div className="label-with-chips-bar">
                <label>Cantidad Ejecutada *</label>
                {selectedPartida && avancePartidas.find((p) => p.id === selectedPartida)?.cantidadDisponible > 0 && (
                  <div className="quick-fill-chips-group">
                    <span className="fill-help-text">Rellenar:</span>
                    <button
                      type="button"
                      className="quick-chip"
                      onClick={() => {
                        const p = avancePartidas.find((it) => it.id === selectedPartida);
                        if (p) setCantidadEjecutada((p.cantidadDisponible * 0.25).toFixed(2));
                      }}
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      className="quick-chip"
                      onClick={() => {
                        const p = avancePartidas.find((it) => it.id === selectedPartida);
                        if (p) setCantidadEjecutada((p.cantidadDisponible * 0.5).toFixed(2));
                      }}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      className="quick-chip"
                      onClick={() => {
                        const p = avancePartidas.find((it) => it.id === selectedPartida);
                        if (p) setCantidadEjecutada((p.cantidadDisponible * 0.75).toFixed(2));
                      }}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      className="quick-chip-max"
                      onClick={() => {
                        const p = avancePartidas.find((it) => it.id === selectedPartida);
                        if (p) setCantidadEjecutada(p.cantidadDisponible.toString());
                      }}
                      title="Rellenar el 100% del saldo pendiente"
                    >
                      <IconZap />
                      Restante ({avancePartidas.find((p) => p.id === selectedPartida)?.cantidadDisponible.toFixed(2)})
                    </button>
                  </div>
                )}
              </div>
              <input
                type="number"
                value={cantidadEjecutada}
                onChange={(e) => setCantidadEjecutada(e.target.value)}
                min="0.001"
                step="any"
                placeholder="0.00"
                disabled={!selectedPartida}
                className="input-cantidad"
              />
              {selectedPartida && (
                <div className="saldo-info-bar">
                  <span className="saldo-available">
                    Disponible:{" "}
                    <strong>
                      {avancePartidas
                        .find((p) => p.id === selectedPartida)
                        ?.cantidadDisponible.toFixed(2) || 0}{" "}
                      {avancePartidas.find((p) => p.id === selectedPartida)?.unidad}
                    </strong>
                  </span>
                  {parseFloat(cantidadEjecutada) > 0 &&
                    avancePartidas.find((p) => p.id === selectedPartida)?.cantidadDisponible > 0 && (
                      <span className="saldo-percentage">
                        {(
                          (parseFloat(cantidadEjecutada) /
                            avancePartidas.find((p) => p.id === selectedPartida).cantidadDisponible) *
                          100
                        ).toFixed(1)}
                        % del saldo
                      </span>
                    )}
                </div>
              )}
            </div>

            <div className="form-group col-btn-add">
              <label className="label-spacer">&nbsp;</label>
              <button
                type="button"
                className="btn-add-partida-cta"
                onClick={handleAddPartida}
                disabled={!selectedPartida || !cantidadEjecutada}
              >
                <IconPlus />
                Agregar Partida
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de partidas agregadas */}
      {formData.partidas.length > 0 && (
        <div className="partidas-list-section">
          <h4>Partidas de la Valuación Actual ({formData.partidas.length})</h4>
          <div className="partidas-table">
            <table>
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>DESCRIPCIÓN</th>
                  <th>UNIDAD</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO UNITARIO</th>
                  <th>MONTO TOTAL</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {formData.partidas.map((partida) => (
                  <tr key={partida.id}>
                    <td className="col-item">{partida.item}</td>
                    <td className="col-descripcion">{partida.descripcion}</td>
                    <td className="col-unidad">{partida.unidad}</td>
                    <td className="col-cantidad">
                      {partida.cantidadEjecutada}
                    </td>
                    <td className="col-precio">
                      {formatCurrency(partida.precioUnitario, partida.moneda)}
                    </td>
                    <td className="col-monto">
                      <strong>
                        {formatCurrency(partida.montoTotal, partida.moneda)}
                      </strong>
                    </td>
                    <td className="col-acciones">
                      <button
                        type="button"
                        className="table-btn-action delete"
                        onClick={() => handleRemovePartida(partida.id)}
                        title="Quitar partida de la valuación"
                      >
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen de totales */}
          <div className="resumen-valuacion">
            <div className="resumen-grid">
              <div className="resumen-item">
                <span className="resumen-label">SUB-TOTAL</span>
                <span className="resumen-value">
                  {formatCurrency(subtotal, mainCurrency)}
                </span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">16% IVA</span>
                <span className="resumen-value">
                  {formatCurrency(iva, mainCurrency)}
                </span>
              </div>
              <div className="resumen-item total">
                <span className="resumen-label">TOTAL VALUADO</span>
                <span className="resumen-value">
                  {formatCurrency(total, mainCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones finales */}
      <div className="form-actions-bar">
        <button
          type="button"
          className="btn-primary-action large"
          onClick={handleSave}
          disabled={formData.partidas.length === 0}
        >
          <IconSave />
          {valuacionEdit ? "Actualizar Valuación" : "Guardar Valuación"}
        </button>
        <button type="button" className="btn-ghost-action" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ValuacionForm;
