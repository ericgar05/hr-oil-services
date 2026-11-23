// src/components/modules/contrato/submodules/valuaciones/ValuacionesMain.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../contexts/BudgetContext";
import { useValuation } from "../../../../../contexts/ValuationContext";
import { useCurrency } from "../../../../../contexts/CurrencyContext";
import { useNotification } from "../../../../../contexts/NotificationContext";
import { getMainCurrency } from "../../../../../utils/mainCurrency";

import ModuleDescription from "../../../_core/ModuleDescription/ModuleDescription";
import ValuacionForm from "./components/ValuacionForm";
import ValuacionesList from "./components/ValuacionesList";
import ValuacionDetail from "./components/ValuacionDetail";
import AvancePresupuesto from "../presupuesto/components/AvancePresupuesto";

import "./ValuacionesMain.css";

// Iconos Vectoriales SVG Profesionales Estilo Lineal / Outline
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconList = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconEye = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconEdit = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconWarning = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ValuacionesMain = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  const { showToast } = useNotification();
  const { budget: presupuestoData } = useBudget();
  const {
    valuations,
    loading,
    error,
    saveValuation,
    deleteValuation,
    getNextValuationNumber,
  } = useValuation();

  const { formatCurrency } = useCurrency();
  const mainCurrency = getMainCurrency(presupuestoData);

  // Sistema de pestañas: "list" | "create" | "avance" | "detail" | "edit"
  const [activeTab, setActiveTab] = useState("list");
  const [selectedValuacion, setSelectedValuacion] = useState(null);

  // Modal corporativo de confirmación de eliminación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    itemDetails: null,
    onConfirm: null,
  });

  const handleBack = () => {
    navigate("../../../contrato");
  };

  const handleCreateValuacion = () => {
    if (!presupuestoData || !presupuestoData.items || presupuestoData.items.length === 0) {
      showToast("No hay presupuesto cargado. Debes crear un presupuesto primero.", "warning");
      return;
    }
    setSelectedValuacion(null);
    setActiveTab("create");
  };

  const handleSaveValuacion = async (valuacionData) => {
    const isEditing = activeTab === "edit" || !!selectedValuacion;
    const result = await saveValuation(valuacionData);

    if (result.success) {
      setActiveTab("list");
      setSelectedValuacion(null);
      showToast(
        `Valuación ${isEditing ? "actualizada" : "guardada"} exitosamente`,
        "success"
      );
    } else {
      showToast(`Error al guardar la valuación: ${result.error}`, "error");
    }
  };

  const handleViewValuacion = (valuacion) => {
    setSelectedValuacion(valuacion);
    setActiveTab("detail");
  };

  const handleEditValuacion = (valuacion) => {
    setSelectedValuacion(valuacion);
    setActiveTab("edit");
  };

  const requestDeleteValuacion = (valuacion) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Valuación",
      message: "¿Estás seguro de que deseas eliminar permanentemente esta valuación? Esta acción recalculará los saldos disponibles en el presupuesto.",
      itemDetails: {
        numero: valuacion.numero || "Sin número",
        periodo: `${valuacion.periodoInicio || "N/A"} a ${valuacion.periodoFin || "N/A"}`,
        monto: formatCurrency(valuacion.totales?.total || 0, mainCurrency),
      },
      onConfirm: async () => {
        const result = await deleteValuation(valuacion.id);
        if (result.success) {
          if (selectedValuacion?.id === valuacion.id) {
            setSelectedValuacion(null);
            setActiveTab("list");
          }
          showToast("Valuación eliminada exitosamente", "success");
        } else {
          showToast(`Error al eliminar la valuación: ${result.error}`, "error");
        }
      },
    });
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setSelectedValuacion(null);
  };

  // Total acumulado de todas las valuaciones registradas
  const calcularTotalAcumulado = () => {
    return valuations.reduce((total, valuacion) => {
      return total + (valuacion.totales?.total || 0);
    }, 0);
  };

  const totalAcumulado = calcularTotalAcumulado();
  const totalValuacionesCount = valuations?.length || 0;

  if (loading) {
    return (
      <div className="valuaciones-main">
        <div className="loading-state">
          <p>Cargando valuaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="valuaciones-main">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="valuaciones-main">
      <button className="back-button" onClick={handleBack}>
        <IconArrowLeft /> Volver a Contrato
      </button>

      <ModuleDescription
        title="Valuaciones de Obra"
        description={`Seguimiento y control de ejecución de partidas presupuestarias - ${
          selectedProject?.name || ""
        }`}
      />

      {/* Tarjeta de Identidad Contractual Permanente */}
      {presupuestoData && (
        <div className="contract-identity-card">
          <div className="identity-content">
            <div className="identity-header-tags">
              <span className="tag-badge primary">CONTRATO OFICIAL</span>
              <span className="tag-badge currency">
                Moneda: <strong>{mainCurrency}</strong>
              </span>
              <span
                className={`tag-badge status ${
                  presupuestoData.estado === "finalizado"
                    ? "status-success"
                    : "status-draft"
                }`}
              >
                {presupuestoData.estado === "finalizado"
                  ? "Finalizado"
                  : "En Ejecución"}
              </span>
            </div>
            <h3 className="identity-number">{presupuestoData.contratoNumero}</h3>
            <p className="identity-name">{presupuestoData.nombreContrato}</p>
          </div>

          <div className="identity-finance-pill">
            <span className="finance-pill-label">Total Acumulado Valuado</span>
            <span className="finance-pill-value">
              {formatCurrency(totalAcumulado, mainCurrency)}
            </span>
          </div>
        </div>
      )}

      {/* Sistema de Pestañas (Desktop Pills / Mobile Fixed Bottom Bar) */}
      {presupuestoData && (
        <div className="valuaciones-tabs-bar">
          {/* Pestaña 1: Valuaciones Registradas */}
          <button
            type="button"
            className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={handleBackToList}
          >
            <div className="tab-icon-wrap">
              <IconList />
              {totalValuacionesCount > 0 && (
                <span className="tab-count-badge">{totalValuacionesCount}</span>
              )}
            </div>
            <span className="tab-label">
              <span className="tab-label-desktop">Valuaciones Registradas</span>
              <span className="tab-label-mobile">Valuaciones</span>
            </span>
          </button>

          {/* Pestaña 2: Nueva Valuación (Siempre fija y sin cambiar de nombre) */}
          <button
            type="button"
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={handleCreateValuacion}
          >
            <div className="tab-icon-wrap">
              <IconPlus />
            </div>
            <span className="tab-label">
              <span className="tab-label-desktop">Nueva Valuación</span>
              <span className="tab-label-mobile">Nueva</span>
            </span>
          </button>

          {/* Pestaña 3: Control de Avance */}
          <button
            type="button"
            className={`tab-btn ${activeTab === "avance" ? "active" : ""}`}
            onClick={() => setActiveTab("avance")}
          >
            <div className="tab-icon-wrap">
              <IconTrendingUp />
            </div>
            <span className="tab-label">
              <span className="tab-label-desktop">Control de Avance</span>
              <span className="tab-label-mobile">Avance</span>
            </span>
          </button>

          {/* Pestaña Dinámica 4: Detalle Valuación (Solo visible al visualizar) */}
          {selectedValuacion && activeTab === "detail" && (
            <button
              type="button"
              className="tab-btn active"
              onClick={() => setActiveTab("detail")}
            >
              <div className="tab-icon-wrap">
                <IconEye />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Detalle Valuación</span>
                <span className="tab-label-mobile">Detalle</span>
              </span>
            </button>
          )}

          {/* Pestaña Dinámica 4: Editar Valuación (Solo visible al entrar en modo edición) */}
          {selectedValuacion && activeTab === "edit" && (
            <button
              type="button"
              className="tab-btn active"
              onClick={() => setActiveTab("edit")}
            >
              <div className="tab-icon-wrap">
                <IconEdit />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Editar Valuación</span>
                <span className="tab-label-mobile">Editar</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Contenido Dinámico de la Pestaña Activa */}
      {presupuestoData && (
        <div className="valuaciones-tab-content">
          {activeTab === "list" && (
            <ValuacionesList
              valuaciones={valuations}
              presupuestoData={presupuestoData}
              onCreateValuacion={handleCreateValuacion}
              onViewValuacion={handleViewValuacion}
              onEditValuacion={handleEditValuacion}
              onDeleteValuacion={(id) => {
                const val = valuations.find((v) => v.id === id);
                if (val) requestDeleteValuacion(val);
              }}
            />
          )}

          {activeTab === "create" && (
            <ValuacionForm
              presupuestoData={presupuestoData}
              valuacionEdit={null}
              nextValuationNumber={getNextValuationNumber()}
              onSave={handleSaveValuacion}
              onCancel={handleBackToList}
            />
          )}

          {activeTab === "edit" && selectedValuacion && (
            <ValuacionForm
              presupuestoData={presupuestoData}
              valuacionEdit={selectedValuacion}
              nextValuationNumber={getNextValuationNumber()}
              onSave={handleSaveValuacion}
              onCancel={handleBackToList}
            />
          )}

          {activeTab === "avance" && (
            <AvancePresupuesto
              presupuestoData={presupuestoData}
              projectId={selectedProject?.id}
            />
          )}

          {activeTab === "detail" && selectedValuacion && (
            <ValuacionDetail
              valuacion={selectedValuacion}
              presupuestoData={presupuestoData}
              onEdit={() => handleEditValuacion(selectedValuacion)}
              onDelete={() => requestDeleteValuacion(selectedValuacion)}
              onBack={handleBackToList}
            />
          )}
        </div>
      )}

      {!presupuestoData && (
        <div className="no-presupuesto-warning">
          <div className="warning-icon-wrap">
            <IconWarning />
          </div>
          <h4>No hay presupuesto contractual cargado</h4>
          <p>
            Para generar y registrar valuaciones de obra, primero debes
            establecer el presupuesto en el módulo de Presupuesto.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("../presupuesto")}
          >
            Ir al Módulo de Presupuesto
          </button>
        </div>
      )}

      {/* Modal Corporativo de Confirmación de Eliminación */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-card">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon-badge danger">
                <IconWarning />
              </div>
              <div>
                <h4 className="confirm-modal-title">{confirmModal.title}</h4>
                <p className="confirm-modal-desc">{confirmModal.message}</p>
              </div>
            </div>

            {confirmModal.itemDetails && (
              <div className="confirm-modal-item-preview">
                <div className="item-preview-code">
                  {confirmModal.itemDetails.numero}
                </div>
                <div className="item-preview-desc">
                  Periodo: {confirmModal.itemDetails.periodo}
                </div>
                <div className="item-preview-price">
                  Total Valuado: {confirmModal.itemDetails.monto}
                </div>
              </div>
            )}

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    itemDetails: null,
                    onConfirm: null,
                  })
                }
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    itemDetails: null,
                    onConfirm: null,
                  });
                }}
              >
                <IconTrash />
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValuacionesMain;
