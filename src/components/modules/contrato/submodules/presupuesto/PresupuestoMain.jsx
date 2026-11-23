// src/components/modules/contrato/submodules/presupuesto/PresupuestoMain.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../contexts/BudgetContext";
import { useNotification } from "../../../../../contexts/NotificationContext";
import ModuleDescription from "../../../_core/ModuleDescription/ModuleDescription";
import PresupuestoForm from "./components/PresupuestoForm";
import ItemsTable from "./components/ItemsTable";
import ResumenPresupuesto from "./components/ResumenPresupuesto";
import AvancePresupuesto from "./components/AvancePresupuesto";
import "./PresupuestoMain.css";

// Iconos Vectoriales SVG Profesionales Estilo Lineal / Outline
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconCross = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
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

const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const PresupuestoMain = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  const { showToast } = useNotification();
  const {
    budget,
    loading,
    error,
    saveBudget,
    updateBudgetHeader,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    finalizeBudget,
    resetBudget,
  } = useBudget();

  const [currentStep, setCurrentStep] = useState("formulario");
  const [activeTab, setActiveTab] = useState("items"); // "items" | "nueva-partida" | "resumen" | "avance"
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerFormData, setHeaderFormData] = useState({
    contratoNumero: "",
    nombreContrato: "",
    monedaPrincipal: "USD",
    propagateToItems: false,
  });

  useEffect(() => {
    // Determinar el paso actual basado en el presupuesto cargado
    if (budget) {
      if (budget.contratoNumero) {
        setCurrentStep("items");
        // Si no tiene partidas aún, enfocar directamente la pestaña de nueva partida
        if (!budget.items || budget.items.length === 0) {
          setActiveTab("nueva-partida");
        }
      }
    }
  }, [budget]);

  const handleBack = () => {
    navigate("../../../contrato");
  };

  const handleContratoSubmit = async (contratoData) => {
    const budgetData = {
      ...contratoData,
      items: budget?.items || [],
      estado: budget?.estado || "borrador",
      currency: contratoData.monedaPrincipal || "USD",
      monedaPrincipal: contratoData.monedaPrincipal || "USD",
    };

    const result = await saveBudget(budgetData);
    if (result.success) {
      setCurrentStep("items");
      setActiveTab("nueva-partida");
      showToast("Datos generales del contrato guardados exitosamente", "success");
    } else {
      showToast("Error al guardar datos del contrato: " + result.error, "error");
    }
  };

  const handleOpenEditHeader = () => {
    setHeaderFormData({
      contratoNumero: budget?.contratoNumero || "",
      nombreContrato: budget?.nombreContrato || "",
      monedaPrincipal: budget?.monedaPrincipal || budget?.currency || "USD",
      propagateToItems: false,
    });
    setIsEditingHeader(true);
  };

  const handleSaveHeader = async (e) => {
    e.preventDefault();
    if (!headerFormData.contratoNumero.trim() || !headerFormData.nombreContrato.trim()) {
      showToast("Complete todos los campos requeridos", "warning");
      return;
    }

    const result = await updateBudgetHeader(headerFormData);
    if (result.success) {
      showToast("Cabecera del contrato actualizada", "success");
      setIsEditingHeader(false);
    } else {
      showToast("Error actualizando cabecera: " + result.error, "error");
    }
  };

  const handleAddItem = async (newItem) => {
    const result = await addBudgetItem(newItem);
    if (!result.success) {
      showToast("Error al agregar el ítem: " + result.error, "error");
    } else {
      // Al agregar la partida, ofrecemos cambiar a la pestaña de partidas
      setActiveTab("items");
    }
  };

  const handleEditItem = async (itemId, itemData) => {
    const result = await updateBudgetItem(itemId, itemData);
    if (!result.success) {
      showToast("Error al actualizar el ítem: " + result.error, "error");
    }
  };

  const handleDeleteItem = async (itemId) => {
    const result = await deleteBudgetItem(itemId);
    if (!result.success) {
      showToast("Error al eliminar el ítem: " + result.error, "error");
    } else {
      showToast("Partida eliminada exitosamente", "info");
    }
  };

  const handleFinalizarPresupuesto = async () => {
    const result = await finalizeBudget();
    if (result.success) {
      showToast("Presupuesto finalizado exitosamente", "success");
    } else {
      showToast("Error al finalizar el presupuesto: " + result.error, "error");
    }
  };

  const handleReiniciar = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas reiniciar todo el presupuesto? Se eliminarán todas las partidas asociadas."
      )
    ) {
      await resetBudget();
      setCurrentStep("formulario");
      setActiveTab("nueva-partida");
      showToast("Presupuesto reiniciado a estado inicial", "info");
    }
  };

  if (loading) {
    return (
      <div className="presupuesto-main">
        <div className="loading-state">
          <p>Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="presupuesto-main">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  const contractCurrency =
    budget?.monedaPrincipal ||
    budget?.currency ||
    budget?.items?.[0]?.moneda ||
    "USD";

  const totalItemsCount = budget?.items?.length || 0;

  return (
    <div className="presupuesto-main">
      <button className="back-button" onClick={handleBack}>
        <IconArrowLeft />
        Volver a Contrato
      </button>

      <ModuleDescription
        title="Presupuesto de Contrato"
        description={`Creación y gestión del presupuesto contractual - ${
          selectedProject?.name || ""
        }`}
      />

      {/* Navegador Tipo Wizard Ejecutivo */}
      <div className="presupuesto-wizard-stepper">
        <button
          type="button"
          className={`wizard-step-btn ${currentStep === "formulario" ? "active" : ""} ${
            budget?.contratoNumero ? "completed" : ""
          }`}
          onClick={() => {
            if (budget?.contratoNumero) handleOpenEditHeader();
          }}
          title={budget?.contratoNumero ? "Clic para editar datos del contrato" : "Paso 1: Datos Generales"}
        >
          <span className="step-num-badge">1</span>
          <div className="step-text-wrap">
            <span className="step-title">Identificación</span>
            <span className="step-sub">
              {budget?.contratoNumero ? budget.contratoNumero : "N° Contrato"}
            </span>
          </div>
          {budget?.contratoNumero && (
            <span className="step-check-badge">
              <IconCheck />
            </span>
          )}
        </button>

        <div className="wizard-connector-line"></div>

        <button
          type="button"
          className={`wizard-step-btn ${currentStep === "items" ? "active" : ""} ${
            totalItemsCount > 0 ? "completed" : ""
          }`}
          onClick={() => {
            if (budget?.contratoNumero) setCurrentStep("items");
          }}
          disabled={!budget?.contratoNumero}
          title={
            budget?.contratoNumero
              ? "Ir a la gestión de partidas"
              : "Complete el Paso 1 para desbloquear"
          }
        >
          <span className="step-num-badge">2</span>
          <div className="step-text-wrap">
            <span className="step-title">Partidas</span>
            <span className="step-sub">
              {totalItemsCount > 0
                ? `${totalItemsCount} cargadas`
                : "Carga partidas"}
            </span>
          </div>
          {totalItemsCount > 0 && (
            <span className="step-check-badge">
              <IconCheck />
            </span>
          )}
        </button>
      </div>

      <div className="presupuesto-content">
        {/* Paso 1: Formulario inicial de contrato */}
        {currentStep === "formulario" && (
          <PresupuestoForm
            presupuesto={budget || {}}
            onSubmit={handleContratoSubmit}
            onCancel={handleBack}
          />
        )}

        {/* Paso 2: Gestión mediante Pestañas Especializadas */}
        {currentStep === "items" && (
          <div className="items-section">
            {/* Tarjeta de Identidad y Cabecera del Contrato (Siempre visible en el encabezado) */}
            <div className="contract-identity-card">
              <div className="identity-content">
                <div className="identity-header-tags">
                  <span className="tag-badge primary">CONTRATO OFICIAL</span>
                  <span className="tag-badge currency">
                    Moneda: <strong>{contractCurrency}</strong>
                  </span>
                  <span
                    className={`tag-badge status ${
                      budget?.estado === "finalizado" ? "status-success" : "status-draft"
                    }`}
                  >
                    {budget?.estado === "finalizado" ? "Finalizado" : "Borrador"}
                  </span>
                </div>
                <h3 className="identity-number">{budget?.contratoNumero}</h3>
                <p className="identity-name">{budget?.nombreContrato}</p>
              </div>
              <button
                type="button"
                className="btn-edit-header"
                onClick={handleOpenEditHeader}
                title="Editar número de contrato, nombre y moneda"
              >
                <IconEdit />
                <span>Modificar Datos</span>
              </button>
            </div>

            {/* Barra de Pestañas por Apartado (Sub-Navegación / Bottom Navigation en Móvil) */}
            <div className="presupuesto-tabs-bar">
              <button
                type="button"
                className={`tab-btn ${activeTab === "items" ? "active" : ""}`}
                onClick={() => setActiveTab("items")}
              >
                <div className="tab-icon-wrap">
                  <IconList />
                  {totalItemsCount > 0 && (
                    <span className="tab-count-badge">{totalItemsCount}</span>
                  )}
                </div>
                <span className="tab-label">
                  <span className="tab-label-desktop">Partidas del Contrato</span>
                  <span className="tab-label-mobile">Partidas</span>
                </span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "nueva-partida" ? "active" : ""}`}
                onClick={() => setActiveTab("nueva-partida")}
              >
                <div className="tab-icon-wrap">
                  <IconPlus />
                </div>
                <span className="tab-label">
                  <span className="tab-label-desktop">Cargar Partida</span>
                  <span className="tab-label-mobile">Cargar</span>
                </span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "resumen" ? "active" : ""}`}
                onClick={() => setActiveTab("resumen")}
              >
                <div className="tab-icon-wrap">
                  <IconBarChart />
                </div>
                <span className="tab-label">
                  <span className="tab-label-desktop">Resumen Económico</span>
                  <span className="tab-label-mobile">Resumen</span>
                </span>
              </button>

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
            </div>

            {/* Contenido Dinámico de la Pestaña Activa */}
            <div className="presupuesto-tab-content">
              {/* Pestaña 1: Catálogo de Partidas */}
              {activeTab === "items" && (
                <ItemsTable
                  items={budget?.items || []}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onNavigateToAdd={() => setActiveTab("nueva-partida")}
                />
              )}

              {/* Pestaña 2: Cargar Nueva Partida */}
              {activeTab === "nueva-partida" && (
                <PresupuestoForm
                  presupuesto={budget || {}}
                  onSubmit={handleContratoSubmit}
                  onCancel={() => setActiveTab("items")}
                  showItemsForm={true}
                  onAddItem={handleAddItem}
                />
              )}

              {/* Pestaña 3: Resumen Económico */}
              {activeTab === "resumen" && (
                <ResumenPresupuesto totales={budget} />
              )}

              {/* Pestaña 4: Control de Avance */}
              {activeTab === "avance" && (
                <AvancePresupuesto
                  presupuestoData={budget}
                  projectId={selectedProject?.id}
                />
              )}
            </div>

            {/* Barra de Acciones Finales (Finalizar / Reiniciar) */}
            <div className="actions-section-bar">
              <button
                className="btn-finalize-budget"
                onClick={handleFinalizarPresupuesto}
                disabled={budget?.estado === "finalizado"}
              >
                <IconCheck />
                {budget?.estado === "finalizado"
                  ? "Presupuesto Finalizado"
                  : "Finalizar Presupuesto"}
              </button>
              <button className="btn-reset-budget" onClick={handleReiniciar}>
                <IconRefresh />
                Reiniciar Presupuesto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Corporativo de Edición de Cabecera */}
      {isEditingHeader && (
        <div
          className="contract-modal-overlay"
          onClick={() => setIsEditingHeader(false)}
        >
          <div
            className="contract-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="contract-modal-header">
              <div className="modal-title-with-icon">
                <IconEdit />
                <h4>Modificar Datos Principales del Contrato</h4>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setIsEditingHeader(false)}
              >
                <IconCross />
              </button>
            </div>
            <form onSubmit={handleSaveHeader}>
              <div className="contract-modal-body">
                <div className="form-group">
                  <label>Número de Contrato *</label>
                  <input
                    type="text"
                    value={headerFormData.contratoNumero}
                    onChange={(e) =>
                      setHeaderFormData({
                        ...headerFormData,
                        contratoNumero: e.target.value,
                      })
                    }
                    placeholder="Ej: SAP 4600139869"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nombre Completo del Contrato *</label>
                  <textarea
                    rows="3"
                    value={headerFormData.nombreContrato}
                    onChange={(e) =>
                      setHeaderFormData({
                        ...headerFormData,
                        nombreContrato: e.target.value,
                      })
                    }
                    placeholder="Descripción del alcance contractual..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Moneda Principal del Presupuesto *</label>
                  <select
                    value={headerFormData.monedaPrincipal}
                    onChange={(e) =>
                      setHeaderFormData({
                        ...headerFormData,
                        monedaPrincipal: e.target.value,
                      })
                    }
                  >
                    <option value="USD">Dólares Estadounidenses (USD $)</option>
                    <option value="BS">Bolívares Digitales (Bs.)</option>
                    <option value="EUR">Euros (EUR €)</option>
                  </select>
                </div>

                {budget?.items?.length > 0 && (
                  <div className="currency-warning-box">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={headerFormData.propagateToItems}
                        onChange={(e) =>
                          setHeaderFormData({
                            ...headerFormData,
                            propagateToItems: e.target.checked,
                          })
                        }
                      />
                      <span>
                        Actualizar también la moneda de todas las partidas existentes ({budget.items.length} partidas)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="contract-modal-footer">
                <button
                  type="button"
                  className="btn-ghost-modal"
                  onClick={() => setIsEditingHeader(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-action">
                  <IconSave />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresupuestoMain;
