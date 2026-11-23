// src/components/modules/contrato/submodules/valuaciones/components/ValuacionForm.jsx
import React, { useState, useEffect } from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import { useProjects } from "../../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../../contexts/BudgetContext";
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

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconWarning = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
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
  const { budget } = useBudget();
  const { valuations } = useValuation();
  const { showToast } = useNotification();

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

  // Modal para confirmar eliminación de partida de la valuación
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    partidaId: null,
    partidaItem: "",
  });

  // Modal para ajuste rápido de cantidad de una partida ya agregada (Opción 1)
  const [editItemModal, setEditItemModal] = useState({
    isOpen: false,
    partida: null,
    maxDisponible: 0,
    nuevaCantidad: "",
  });

  // Cargar datos de edición y calcular fechas iniciales
  useEffect(() => {
    if (valuacionEdit) {
      setFormData(valuacionEdit);
    } else {
      let fechaInicio = new Date();
      if (valuations && valuations.length > 0) {
        const ultimaValuacion = [...valuations]
          .sort((a, b) => new Date(a.periodoFin) - new Date(b.periodoFin))
          .pop();
        if (ultimaValuacion?.periodoFin) {
          const ultimaFechaFin = new Date(ultimaValuacion.periodoFin);
          fechaInicio = new Date(
            ultimaFechaFin.setDate(ultimaFechaFin.getDate() + 1)
          );
        }
      }

      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + 30);

      setFormData((prev) => ({
        ...prev,
        numero: `VALUACIÓN ${nextValuationNumber || 1}`,
        periodoInicio: fechaInicio.toISOString().split("T")[0],
        periodoFin: fechaFin.toISOString().split("T")[0],
      }));
    }
  }, [
    valuacionEdit,
    nextValuationNumber,
    selectedProject,
    valuations,
  ]);

  // Recalcular balance real del presupuesto cuando cambian los datos o las partidas agregadas
  useEffect(() => {
    calcularAvanceRealPresupuesto();
  }, [presupuestoData, valuations, valuacionEdit, formData.partidas]);

  // Cálculo en tiempo real considerando valuaciones anteriores Y la actual
  const calcularAvanceRealPresupuesto = () => {
    if (!presupuestoData || !presupuestoData.items) return;

    const ejecucionAcumulada = {};

    // 1. Inicializar con datos del contrato
    presupuestoData.items.forEach((item) => {
      ejecucionAcumulada[item.id] = {
        ...item,
        cantidadValuacionesAnteriores: 0,
        montoValuacionesAnteriores: 0,
        cantidadValuacionActual: 0,
        montoValuacionActual: 0,
        cantidadTotalEjecutada: 0,
        montoTotalEjecutado: 0,
        cantidadDisponible: item.cantidad,
        montoDisponible: item.montoContrato,
      };
    });

    // 2. Sumar ejecución de valuaciones históricas anteriores (excluyendo la actual si estamos en modo edición)
    valuations?.forEach((valuacion) => {
      if (valuacionEdit && valuacion.id === valuacionEdit.id) {
        return; // Excluir la que se está editando
      }

      valuacion.partidas?.forEach((partida) => {
        if (ejecucionAcumulada[partida.partidaId]) {
          ejecucionAcumulada[partida.partidaId].cantidadValuacionesAnteriores += parseFloat(
            partida.cantidadEjecutada || 0
          );
          ejecucionAcumulada[partida.partidaId].montoValuacionesAnteriores +=
            partida.montoTotal || 0;
        }
      });
    });

    // 3. Sumar ejecución de las partidas añadidas en la valuación en curso (formData.partidas)
    formData.partidas?.forEach((partida) => {
      if (ejecucionAcumulada[partida.partidaId]) {
        ejecucionAcumulada[partida.partidaId].cantidadValuacionActual += parseFloat(
          partida.cantidadEjecutada || 0
        );
        ejecucionAcumulada[partida.partidaId].montoValuacionActual +=
          partida.montoTotal || 0;
      }
    });

    // 4. Calcular disponibles y porcentajes consolidados
    const avance = Object.values(ejecucionAcumulada).map((partida) => {
      const cantidadTotalEjecutada =
        partida.cantidadValuacionesAnteriores + partida.cantidadValuacionActual;
      const montoTotalEjecutado =
        partida.montoValuacionesAnteriores + partida.montoValuacionActual;

      const cantidadDisponible = Math.max(
        0,
        partida.cantidad - cantidadTotalEjecutada
      );
      const montoDisponible = Math.max(
        0,
        partida.montoContrato - montoTotalEjecutado
      );

      const porcentajeCantidad =
        partida.cantidad > 0
          ? (cantidadTotalEjecutada / partida.cantidad) * 100
          : 0;
      const porcentajeMonto =
        partida.montoContrato > 0
          ? (montoTotalEjecutado / partida.montoContrato) * 100
          : 0;

      return {
        ...partida,
        cantidadTotalEjecutada,
        montoTotalEjecutado,
        cantidadDisponible,
        montoDisponible,
        porcentajeEjecutadoCantidad: porcentajeCantidad,
        porcentajeEjecutadoMonto: porcentajeMonto,
        estaEnValuacionActual: partida.cantidadValuacionActual > 0,
      };
    });

    setAvancePartidas(avance);
  };

  // Conjunto de IDs de partidas que YA están agregadas en la valuación actual
  const partidasYaEnValuacionSet = new Set(
    formData.partidas.map((p) => p.partidaId)
  );

  // FILTRADO ESTRICTO: Solo partidas con saldo disponible > 0 Y que NO hayan sido agregadas aún a esta valuación
  const partidasDisponibles = avancePartidas.filter(
    (partida) =>
      partida.cantidadDisponible > 0 &&
      !partidasYaEnValuacionSet.has(partida.id)
  );

  const handleAddPartida = () => {
    if (
      !selectedPartida ||
      !cantidadEjecutada ||
      parseFloat(cantidadEjecutada) <= 0
    ) {
      showToast(
        "Por favor selecciona una partida e ingresa una cantidad válida",
        "warning"
      );
      return;
    }

    // Regla de Unicidad: verificar que no esté ya agregada en esta valuación
    const yaAgregada = formData.partidas.some(
      (p) => p.partidaId === selectedPartida
    );
    if (yaAgregada) {
      showToast(
        "Esta partida ya ha sido agregada a la valuación actual",
        "warning"
      );
      setSelectedPartida("");
      setCantidadEjecutada("");
      return;
    }

    const partidaPresupuesto = presupuestoData.items.find(
      (item) => item.id === selectedPartida
    );
    if (!partidaPresupuesto) return;

    const cantidad = parseFloat(cantidadEjecutada);
    const partidaAvance = avancePartidas.find((p) => p.id === selectedPartida);
    const cantidadDisponibleReal = partidaAvance?.cantidadDisponible || 0;

    if (cantidad > cantidadDisponibleReal) {
      showToast(
        `No hay suficiente cantidad disponible. Máximo disponible: ${cantidadDisponibleReal.toFixed(
          2
        )} ${partidaPresupuesto.unidad}`,
        "warning"
      );
      return;
    }

    const montoTotal = cantidad * (partidaPresupuesto.precioUnitario || 0);

    const nuevaPartida = {
      id: Date.now().toString(),
      partidaId: partidaPresupuesto.id,
      item: partidaPresupuesto.item,
      descripcion: partidaPresupuesto.descripcion,
      unidad: partidaPresupuesto.unidad,
      precioUnitario: partidaPresupuesto.precioUnitario,
      moneda: partidaPresupuesto.moneda || mainCurrency,
      cantidadEjecutada: cantidad,
      montoTotal: montoTotal,
      aplicaIVA: partidaPresupuesto.aplicaIVA,
    };

    setFormData((prev) => ({
      ...prev,
      partidas: [...prev.partidas, nuevaPartida],
    }));

    // Limpieza inmediata para la siguiente partida
    setSelectedPartida("");
    setCantidadEjecutada("");
    showToast(
      `Partida ${partidaPresupuesto.item} agregada a la valuación`,
      "success"
    );
  };

  // Abrir Modal de Ajuste Rápido de Cantidad (Opción 1)
  const handleOpenEditModal = (partida) => {
    const partidaAvance = avancePartidas.find((p) => p.id === partida.partidaId);
    // El máximo disponible permitido al editar es: saldo restante + la cantidad que ya tiene esta partida
    const saldoRestante = partidaAvance?.cantidadDisponible || 0;
    const maxPermitido = saldoRestante + parseFloat(partida.cantidadEjecutada || 0);

    setEditItemModal({
      isOpen: true,
      partida,
      maxDisponible: maxPermitido,
      nuevaCantidad: partida.cantidadEjecutada.toString(),
    });
  };

  // Guardar Ajuste de Cantidad en la Partida
  const handleSaveEditItem = () => {
    const cantidadNum = parseFloat(editItemModal.nuevaCantidad);

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      showToast("Ingresa una cantidad numérica válida mayor a 0", "warning");
      return;
    }

    if (cantidadNum > editItemModal.maxDisponible) {
      showToast(
        `La cantidad excede el saldo máximo disponible (${editItemModal.maxDisponible.toFixed(
          2
        )} ${editItemModal.partida.unidad})`,
        "warning"
      );
      return;
    }

    const montoTotal = cantidadNum * (editItemModal.partida.precioUnitario || 0);

    setFormData((prev) => ({
      ...prev,
      partidas: prev.partidas.map((p) =>
        p.id === editItemModal.partida.id
          ? {
              ...p,
              cantidadEjecutada: cantidadNum,
              montoTotal,
            }
          : p
      ),
    }));

    showToast(
      `Cantidad de partida ${editItemModal.partida.item} actualizada a ${cantidadNum} ${editItemModal.partida.unidad}`,
      "success"
    );

    setEditItemModal({
      isOpen: false,
      partida: null,
      maxDisponible: 0,
      nuevaCantidad: "",
    });
  };

  const requestRemovePartida = (partidaId) => {
    const partida = formData.partidas.find((p) => p.id === partidaId);
    setConfirmDeleteModal({
      isOpen: true,
      partidaId,
      partidaItem: partida ? partida.item : "esta partida",
    });
  };

  const confirmRemovePartida = () => {
    if (confirmDeleteModal.partidaId) {
      setFormData((prev) => ({
        ...prev,
        partidas: prev.partidas.filter(
          (p) => p.id !== confirmDeleteModal.partidaId
        ),
      }));
      showToast("Partida retirada de la valuación actual", "info");
    }
    setConfirmDeleteModal({ isOpen: false, partidaId: null, partidaItem: "" });
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

    const subtotal = formData.partidas.reduce(
      (sum, partida) => sum + (partida.montoTotal || 0),
      0
    );
    const partidasConIva = formData.partidas.filter((p) => p.aplicaIVA);
    const iva = partidasConIva.reduce(
      (sum, partida) => sum + (partida.montoTotal || 0) * 0.16,
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
        currency: formData.partidas[0]?.moneda || mainCurrency,
      },
      fechaCreacion: valuacionEdit?.fechaCreacion || new Date().toISOString(),
      projectId: selectedProject?.id,
    };

    onSave(valuacionCompleta);
  };

  const subtotal = formData.partidas.reduce(
    (sum, partida) => sum + (partida.montoTotal || 0),
    0
  );
  const partidasConIva = formData.partidas.filter((p) => p.aplicaIVA);
  const iva = partidasConIva.reduce(
    (sum, partida) => sum + (partida.montoTotal || 0) * 0.16,
    0
  );
  const total = subtotal + iva;

  const getTotalEjecutado = () => {
    return avancePartidas.reduce(
      (total, partida) => total + (partida.montoTotalEjecutado || 0),
      0
    );
  };

  const getTotalPresupuestado = () => {
    return avancePartidas.reduce(
      (total, partida) => total + (partida.montoContrato || 0),
      0
    );
  };

  const getPorcentajeTotal = () => {
    const totalPresupuestado = getTotalPresupuestado();
    return totalPresupuestado > 0
      ? (getTotalEjecutado() / totalPresupuestado) * 100
      : 0;
  };

  const partidaSeleccionadaObj = avancePartidas.find(
    (p) => p.id === selectedPartida
  );

  return (
    <div className="valuacion-form">
      {/* Cabecera del Formulario */}
      <div className="form-header">
        <div className="form-header-title">
          <h3>{valuacionEdit ? "Editar Valuación" : "Nueva Valuación"}</h3>
          <p>Registro y certificación de partidas ejecutadas en obra</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-back-header" onClick={onCancel}>
            <IconArrowLeft /> Volver a Lista
          </button>
        </div>
      </div>

      {/* 1. Información Básica de la Valuación */}
      <div className="form-card-section">
        <h4 className="section-title">Datos Básicos de la Valuación</h4>
        <div className="basic-fields-grid">
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

      {/* 2. Control de Avance y Balance Real del Presupuesto */}
      {avancePartidas.length > 0 && (
        <div className="form-card-section avance-section">
          <div className="avance-header-row">
            <div>
              <h4 className="section-title">
                Balance del Presupuesto (Ejecución Real)
              </h4>
              <p className="section-sub">
                Actualizado en tiempo real con valuaciones anteriores y partidas en curso
              </p>
            </div>
            <div className="avance-kpi-badge">
              <span className="kpi-label">Avance Global:</span>
              <span className="kpi-val">{getPorcentajeTotal().toFixed(1)}%</span>
            </div>
          </div>

          {/* Versión Tabla Desktop (>= 769px) */}
          <div className="desktop-table-container">
            <table className="avance-table">
              <thead>
                <tr>
                  <th className="col-item">ITEM</th>
                  <th className="col-descripcion">DESCRIPCIÓN</th>
                  <th className="col-unidad">UNIDAD</th>
                  <th className="col-presupuestado">PRESUPUESTADO</th>
                  <th className="col-ejecutado">EJECUTADO</th>
                  <th className="col-en-curso">EN ESTA VALUACIÓN</th>
                  <th className="col-disponible">DISPONIBLE</th>
                  <th className="col-porcentaje">% AVANCE</th>
                </tr>
              </thead>
              <tbody>
                {avancePartidas.map((partida) => {
                  const isDone = partida.cantidadDisponible <= 0;
                  const isCurrent = partida.cantidadValuacionActual > 0;

                  return (
                    <tr
                      key={partida.id}
                      className={
                        isDone
                          ? "completada"
                          : isCurrent
                          ? "en-valuacion-row"
                          : ""
                      }
                    >
                      <td className="col-item">
                        <span className="item-badge">{partida.item}</span>
                      </td>
                      <td className="col-descripcion">{partida.descripcion}</td>
                      <td className="col-unidad">
                        <span className="unit-badge">{partida.unidad}</span>
                      </td>
                      <td className="col-presupuestado">
                        <div className="num-primary">
                          {partida.cantidad.toLocaleString("es-VE")}
                        </div>
                        <div className="num-secondary">
                          {formatCurrency(partida.montoContrato, partida.moneda)}
                        </div>
                      </td>
                      <td className="col-ejecutado">
                        <div className="num-primary">
                          {partida.cantidadValuacionesAnteriores.toLocaleString("es-VE")}
                        </div>
                        <div className="num-secondary">
                          {formatCurrency(partida.montoValuacionesAnteriores, partida.moneda)}
                        </div>
                      </td>
                      <td className="col-en-curso">
                        {isCurrent ? (
                          <div className="en-valuacion-tag">
                            +{partida.cantidadValuacionActual.toLocaleString("es-VE")}{" "}
                            {partida.unidad}
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="col-disponible">
                        <div className={`num-primary ${isDone ? "depleted" : "available"}`}>
                          {partida.cantidadDisponible.toLocaleString("es-VE")}
                        </div>
                        <div className="num-secondary">
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Versión Fichas Móviles (<= 768px) */}
          <div className="mobile-cards-container mobile-avance-cards">
            {avancePartidas.map((partida) => {
              const pct = Math.min(partida.porcentajeEjecutadoCantidad, 100);
              const isDone = partida.cantidadDisponible <= 0;
              const isCurrent = partida.cantidadValuacionActual > 0;

              return (
                <div
                  key={partida.id}
                  className={`mobile-avance-card ${
                    isDone ? "done" : isCurrent ? "in-valuation-card" : ""
                  }`}
                >
                  <div className="card-top-row">
                    <span className="item-badge">{partida.item}</span>
                    <span className="unit-badge">{partida.unidad}</span>
                    <span
                      className={`status-chip ${
                        isDone
                          ? "done"
                          : isCurrent
                          ? "in-valuation"
                          : "available"
                      }`}
                    >
                      {isDone
                        ? "Completada"
                        : isCurrent
                        ? `En Valuación (+${partida.cantidadValuacionActual})`
                        : `${pct.toFixed(0)}% Ejecutado`}
                    </span>
                  </div>

                  <p className="card-desc">{partida.descripcion}</p>

                  <div className="card-progress-bar">
                    <div
                      className="card-progress-fill"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="card-finance-box">
                    <div className="finance-row-top">
                      <div className="finance-col">
                        <span className="finance-col-label">Presupuestado</span>
                        <span className="finance-col-val">
                          {partida.cantidad.toLocaleString("es-VE")} {partida.unidad}
                        </span>
                      </div>
                      <div className="finance-col">
                        <span className="finance-col-label">
                          {isCurrent ? "Total Ejecutado" : "Ejecutado"}
                        </span>
                        <span className="finance-col-val">
                          {partida.cantidadTotalEjecutada.toLocaleString("es-VE")} {partida.unidad}
                        </span>
                      </div>
                    </div>
                    <div className="finance-row-total">
                      <span className="finance-total-label">Saldo Disponible</span>
                      <span className="finance-total-val">
                        {partida.cantidadDisponible.toLocaleString("es-VE")} {partida.unidad}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Panel de Carga de Partidas */}
      <div className="form-card-section add-partida-card">
        <h4 className="section-title">Agregar Partidas a la Valuación</h4>
        <div className="add-partida-layout">
          <div className="form-group select-partida-group">
            <label>Seleccionar Partida Presupuestaria</label>
            <select
              value={selectedPartida}
              onChange={(e) => {
                setSelectedPartida(e.target.value);
                setCantidadEjecutada("");
              }}
              disabled={partidasDisponibles.length === 0}
            >
              <option value="">
                {partidasDisponibles.length === 0
                  ? "— Todas las partidas disponibles ya fueron agregadas —"
                  : "Seleccionar partida..."}
              </option>
              {partidasDisponibles.map((partida) => (
                <option key={partida.id} value={partida.id}>
                  {partida.item} — {partida.descripcion.substring(0, 50)}...
                  {` (Disponible: ${partida.cantidadDisponible.toFixed(2)} ${
                    partida.unidad
                  })`}
                </option>
              ))}
            </select>

            {partidasDisponibles.length === 0 ? (
              <div className="all-added-notice">
                <span className="check-icon-badge">
                  <IconCheck />
                </span>
                <span>
                  Todas las partidas con saldo disponible ya han sido incorporadas a esta valuación.
                </span>
              </div>
            ) : (
              <small className="hint-info">
                Mostrando únicamente partidas con saldo disponible que aún no han sido agregadas.
              </small>
            )}
          </div>

          <div className="form-group cantidad-input-group">
            <div className="label-with-chips-bar">
              <label>Cantidad Ejecutada *</label>
              {selectedPartida &&
                partidaSeleccionadaObj?.cantidadDisponible > 0 && (
                  <div className="quick-fill-chips-group">
                    <span className="fill-help-text">Rellenar:</span>
                    <button
                      type="button"
                      className="quick-chip"
                      onClick={() =>
                        setCantidadEjecutada(
                          (partidaSeleccionadaObj.cantidadDisponible * 0.25).toFixed(2)
                        )
                      }
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      className="quick-chip"
                      onClick={() =>
                        setCantidadEjecutada(
                          (partidaSeleccionadaObj.cantidadDisponible * 0.5).toFixed(2)
                        )
                      }
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      className="quick-chip"
                      onClick={() =>
                        setCantidadEjecutada(
                          (partidaSeleccionadaObj.cantidadDisponible * 0.75).toFixed(2)
                        )
                      }
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      className="quick-chip-max"
                      onClick={() =>
                        setCantidadEjecutada(
                          partidaSeleccionadaObj.cantidadDisponible.toString()
                        )
                      }
                      title="Rellenar el 100% del saldo pendiente"
                    >
                      <IconZap /> Saldo (
                      {partidaSeleccionadaObj.cantidadDisponible.toFixed(2)})
                    </button>
                  </div>
                )}
            </div>

            <div className="input-action-combine">
              <input
                type="number"
                value={cantidadEjecutada}
                onChange={(e) => setCantidadEjecutada(e.target.value)}
                min="0.001"
                step="any"
                placeholder="0.00"
                disabled={!selectedPartida || partidasDisponibles.length === 0}
                className="input-cantidad"
              />

              <button
                type="button"
                className="btn-add-partida-cta"
                onClick={handleAddPartida}
                disabled={!selectedPartida || !cantidadEjecutada}
              >
                <IconPlus /> Agregar
              </button>
            </div>

            {selectedPartida && partidaSeleccionadaObj && (
              <div className="saldo-info-bar">
                <span className="saldo-available">
                  Saldo Disponible:{" "}
                  <strong>
                    {partidaSeleccionadaObj.cantidadDisponible.toFixed(2)}{" "}
                    {partidaSeleccionadaObj.unidad}
                  </strong>
                </span>
                {parseFloat(cantidadEjecutada) > 0 && (
                  <span className="saldo-percentage">
                    {(
                      (parseFloat(cantidadEjecutada) /
                        partidaSeleccionadaObj.cantidadDisponible) *
                      100
                    ).toFixed(1)}
                    % del saldo
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Lista de Partidas Agregadas a la Valuación */}
      {formData.partidas.length > 0 && (
        <div className="form-card-section current-items-section">
          <div className="current-items-header">
            <h4 className="section-title">
              Partidas en esta Valuación ({formData.partidas.length})
            </h4>
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
                  <th className="col-acciones">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {formData.partidas.map((partida) => (
                  <tr key={partida.id}>
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
                      {formatCurrency(partida.precioUnitario, partida.moneda)}
                    </td>
                    <td className="col-monto font-mono font-bold">
                      {formatCurrency(partida.montoTotal, partida.moneda)}
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
                    <td className="col-acciones">
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="btn-action-icon edit"
                          onClick={() => handleOpenEditModal(partida)}
                          title="Modificar cantidad"
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          onClick={() => requestRemovePartida(partida.id)}
                          title="Quitar partida de la valuación"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Versión Fichas Móviles (<= 768px) */}
          <div className="mobile-cards-container mobile-partidas-cards">
            {formData.partidas.map((partida) => (
              <div key={partida.id} className="mobile-item-card">
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

                  <div className="card-actions-group">
                    <button
                      type="button"
                      className="btn-action-icon edit"
                      onClick={() => handleOpenEditModal(partida)}
                      title="Modificar cantidad"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon delete"
                      onClick={() => requestRemovePartida(partida.id)}
                      title="Quitar partida"
                    >
                      <IconTrash />
                    </button>
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
                        {formatCurrency(partida.precioUnitario, partida.moneda)}
                      </span>
                    </div>
                  </div>

                  <div className="finance-row-total">
                    <span className="finance-total-label">TOTAL VALUADO</span>
                    <span className="finance-total-val">
                      {formatCurrency(partida.montoTotal, partida.moneda)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen de Totales de la Valuación */}
          <div className="resumen-valuacion-box">
            <div className="resumen-grid">
              <div className="resumen-cell">
                <span className="resumen-label">SUB-TOTAL</span>
                <span className="resumen-amount">
                  {formatCurrency(subtotal, mainCurrency)}
                </span>
              </div>
              <div className="resumen-cell">
                <span className="resumen-label">16% IVA</span>
                <span className="resumen-amount">
                  {formatCurrency(iva, mainCurrency)}
                </span>
              </div>
              <div className="resumen-cell highlight">
                <span className="resumen-label">TOTAL VALUADO</span>
                <span className="resumen-amount">
                  {formatCurrency(total, mainCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Acciones Finales del Formulario */}
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

      {/* Modal de Ajuste Rápido de Cantidad (Opción 1) */}
      {editItemModal.isOpen && editItemModal.partida && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card edit-item-modal-card">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-badge primary">
                <IconEdit />
              </div>
              <div>
                <h4 className="confirm-modal-title">Modificar Cantidad</h4>
                <p className="confirm-modal-desc">
                  Ajusta la cantidad certificada para la partida en esta valuación.
                </p>
              </div>
            </div>

            {/* Ficha Informativa de la Partida */}
            <div className="edit-item-meta-box">
              <div className="edit-meta-header">
                <span className="item-badge">{editItemModal.partida.item}</span>
                <span className="unit-badge">{editItemModal.partida.unidad}</span>
              </div>
              <p className="edit-meta-desc">
                {editItemModal.partida.descripcion}
              </p>
              <div className="edit-meta-stats">
                <div className="stat-pill">
                  <span className="stat-label">Precio Unitario:</span>
                  <span className="stat-val font-mono">
                    {formatCurrency(
                      editItemModal.partida.precioUnitario,
                      editItemModal.partida.moneda
                    )}
                  </span>
                </div>
                <div className="stat-pill highlight">
                  <span className="stat-label">Máx. Permitido:</span>
                  <span className="stat-val font-mono font-bold">
                    {editItemModal.maxDisponible.toFixed(2)}{" "}
                    {editItemModal.partida.unidad}
                  </span>
                </div>
              </div>
            </div>

            {/* Campo de Nueva Cantidad con Chips de Porcentaje Rápido */}
            <div className="form-group edit-input-group">
              <div className="label-with-chips-bar">
                <label>Nueva Cantidad a Certificar *</label>
                <div className="quick-fill-chips-group">
                  <span className="fill-help-text">Rellenar:</span>
                  <button
                    type="button"
                    className="quick-chip"
                    onClick={() =>
                      setEditItemModal((prev) => ({
                        ...prev,
                        nuevaCantidad: (prev.maxDisponible * 0.25).toFixed(2),
                      }))
                    }
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    className="quick-chip"
                    onClick={() =>
                      setEditItemModal((prev) => ({
                        ...prev,
                        nuevaCantidad: (prev.maxDisponible * 0.5).toFixed(2),
                      }))
                    }
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    className="quick-chip"
                    onClick={() =>
                      setEditItemModal((prev) => ({
                        ...prev,
                        nuevaCantidad: (prev.maxDisponible * 0.75).toFixed(2),
                      }))
                    }
                  >
                    75%
                  </button>
                  <button
                    type="button"
                    className="quick-chip-max"
                    onClick={() =>
                      setEditItemModal((prev) => ({
                        ...prev,
                        nuevaCantidad: prev.maxDisponible.toString(),
                      }))
                    }
                    title="Rellenar el 100% del saldo disponible"
                  >
                    <IconZap /> Máx ({editItemModal.maxDisponible.toFixed(2)})
                  </button>
                </div>
              </div>

              <input
                type="number"
                value={editItemModal.nuevaCantidad}
                onChange={(e) =>
                  setEditItemModal((prev) => ({
                    ...prev,
                    nuevaCantidad: e.target.value,
                  }))
                }
                min="0.001"
                max={editItemModal.maxDisponible}
                step="any"
                placeholder="0.00"
                className="input-cantidad"
                autoFocus
              />

              {/* Vista previa en tiempo real del nuevo monto total */}
              {parseFloat(editItemModal.nuevaCantidad) > 0 && (
                <div className="new-total-preview-box">
                  <span className="preview-label">Nuevo Monto Valuado:</span>
                  <span className="preview-val font-mono">
                    {formatCurrency(
                      parseFloat(editItemModal.nuevaCantidad) *
                        (editItemModal.partida.precioUnitario || 0),
                      editItemModal.partida.moneda
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() =>
                  setEditItemModal({
                    isOpen: false,
                    partida: null,
                    maxDisponible: 0,
                    nuevaCantidad: "",
                  })
                }
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-save"
                onClick={handleSaveEditItem}
                disabled={
                  !editItemModal.nuevaCantidad ||
                  parseFloat(editItemModal.nuevaCantidad) <= 0 ||
                  parseFloat(editItemModal.nuevaCantidad) > editItemModal.maxDisponible
                }
              >
                <IconCheck /> Guardar Cantidad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Quitar Partida */}
      {confirmDeleteModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-badge danger">
                <IconWarning />
              </div>
              <div>
                <h4 className="confirm-modal-title">Quitar Partida</h4>
                <p className="confirm-modal-desc">
                  ¿Estás seguro de que deseas retirar la partida{" "}
                  <strong>{confirmDeleteModal.partidaItem}</strong> de esta
                  valuación? Su saldo volverá a quedar disponible en el selector.
                </p>
              </div>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() =>
                  setConfirmDeleteModal({
                    isOpen: false,
                    partidaId: null,
                    partidaItem: "",
                  })
                }
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={confirmRemovePartida}
              >
                <IconTrash /> Quitar Partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValuacionForm;
