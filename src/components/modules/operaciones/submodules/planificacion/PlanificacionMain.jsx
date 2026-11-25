// src/components/modules/operaciones/submodules/planificacion/PlanificacionMain.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanning } from "../../../../../contexts/PlanningContext";
import { useGeneradorSemanas } from "../../../../../hooks/useGeneradorSemanas";
import { useProjects } from "../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../contexts/BudgetContext";
import { useNotification } from "../../../../../contexts/NotificationContext.jsx";
import { SemanasList } from "./components/SemanasList";
import { SemanaDetail } from "./components/SemanaDetail";
import AvancePresupuesto from "../../../contrato/submodules/presupuesto/components/AvancePresupuesto";
import supabase from "../../../../../api/supaBase";
import ModuleDescription from "../../../_core/ModuleDescription/ModuleDescription";
import Modal from "../../../../common/Modal/Modal";
import "./Planning.css";

// Iconos Vectoriales SVG Profesionales
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: "2px" }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconChevronUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: "2px" }}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const PlanificacionMain = () => {
  const navigate = useNavigate();
  const {
    semanas,
    dias,
    loading,
    guardarSemanasGeneradas,
    getSemanasPlanificacion,
    eliminarPlanificacion,
    syncProjectTotals,
    selectedSemana,
    setSelectedSemana,
    selectedDia,
    setSelectedDia,
    selectSemana,
    selectDia,
    isDaySelectorOpen,
    setIsDaySelectorOpen,
    triggerNewActividad,
  } = usePlanning();
  const { generarSemanasProyecto } = useGeneradorSemanas();
  const { selectedProject } = useProjects();
  const { budget: presupuestoData } = useBudget();
  const { showToast } = useNotification();

  // Sistema de Pestañas Corporativas: "list" | "detail" | "avance"
  const [activeTab, setActiveTab] = useState("list");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      getSemanasPlanificacion();
    }
  }, [selectedProject, getSemanasPlanificacion]);

  const handleBack = () => {
    navigate("../../../operaciones");
  };

  const handleGenerarPlanificacion = async () => {
    if (!selectedProject) {
      showToast("Por favor, selecciona un proyecto primero.", "warning");
      return;
    }

    setGenerating(true);
    try {
      const { data: fullProject, error } = await supabase
        .from("projects")
        .select("start_date, end_date")
        .eq("id", selectedProject.id)
        .single();

      if (error || !fullProject) {
        showToast("No se pudieron obtener las fechas del proyecto", "error");
        return;
      }

      const semanasGeneradas = generarSemanasProyecto({
        fecha_inicio: fullProject.start_date,
        fecha_fin: fullProject.end_date,
      });

      if (semanasGeneradas && semanasGeneradas.length > 0) {
        await guardarSemanasGeneradas(semanasGeneradas);
        showToast("Planificación generada exitosamente", "success");
      } else {
        showToast("No se generaron semanas. Verifica las fechas del proyecto.", "warning");
      }
    } catch (err) {
      console.error("Error al generar semanas:", err);
      showToast("Error al generar planificación", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectSemana = (semana) => {
    selectSemana(semana);
    setActiveTab("detail");
  };

  const handleBackToList = () => {
    selectSemana(null);
    setActiveTab("list");
    setIsDaySelectorOpen(false);
  };

  const handleBackToDias = () => {
    setSelectedDia(null);
    setIsDaySelectorOpen(false);
    setActiveTab("detail");
  };

  const handleDayButtonClick = () => {
    if (activeTab !== "detail") {
      // Si el usuario estaba en Avance, al pulsar el día vuelve a la vista del día inmediatamente
      setActiveTab("detail");
      setIsDaySelectorOpen(false);
    } else {
      // Si ya está en la vista del día, abre/cierra el desplegable
      setIsDaySelectorOpen((prev) => !prev);
    }
  };

  const handleSelectDiaFromDrawer = (d) => {
    selectDia(d);
    setActiveTab("detail");
    setIsDaySelectorOpen(false);
  };

  const handlePrevDia = () => {
    if (prevDia) {
      selectDia(prevDia);
      setActiveTab("detail");
    }
  };

  const handleNextDia = () => {
    if (nextDia) {
      selectDia(nextDia);
      setActiveTab("detail");
    }
  };

  const handleAddActividad = () => {
    if (activeTab !== "detail") {
      setActiveTab("detail");
    }
    setIsDaySelectorOpen(false);
    triggerNewActividad();
  };

  const handleGoToAvance = () => {
    setActiveTab("avance");
    setIsDaySelectorOpen(false);
  };
  const currentDayMobileLabel = useMemo(() => {
    if (!selectedDia?.fecha) return "Día";
    const clean = selectedDia.fecha.split("T")[0];
    const [y, m, d] = clean.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = dateObj.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${d}`;
  }, [selectedDia?.fecha]);

  const currentDayDesktopLabel = useMemo(() => {
    if (!selectedDia?.fecha) return "Día";
    const clean = selectedDia.fecha.split("T")[0];
    const [y, m, d] = clean.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  }, [selectedDia?.fecha]);

  const monthYearTitle = useMemo(() => {
    if (!selectedDia?.fecha) return "";
    const clean = selectedDia.fecha.split("T")[0];
    const [y, m, d] = clean.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase();
  }, [selectedDia?.fecha]);

  const currentDayIndex = dias?.findIndex(d => d.id === selectedDia?.id);
  const prevDia = currentDayIndex > 0 ? dias[currentDayIndex - 1] : null;
  const nextDia = currentDayIndex >= 0 && currentDayIndex < dias?.length - 1 ? dias[currentDayIndex + 1] : null;

  const parseDayInfo = (d) => {
    if (!d || !d.fecha) return {};
    const clean = d.fecha.split("T")[0];
    const [y, m, day] = clean.split("-").map(Number);
    const dateObj = new Date(y, m - 1, day);
    const weekdayShort = dateObj.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "").slice(0, 2).toUpperCase();
    const dayNum = dateObj.getDate().toString().padStart(2, "0");
    const isSelected = d.id === selectedDia?.id;
    const hasActivities = (d.cantidad_actividades || 0) > 0;
    return { weekdayShort, dayNum, isSelected, hasActivities };
  };

  if (loading && semanas.length === 0) {
    return (
      <div className="planning-main">
        <div className="planning-no-content">Cargando planificación del proyecto...</div>
      </div>
    );
  }

  return (
    <div className="planning-main">
      <ModuleDescription
        title="Planificación del Proyecto"
        description={`Gestión del cronograma semanal, asignación de actividades y recursos - ${
          selectedProject?.name || ""
        }`}
      />

      {/* Sistema de Pestañas Corporativas Dinámico por Niveles */}
      <div className="planning-tabs-bar">
        {selectedSemana && selectedDia ? (
          /* ========================================================
             NIVEL 3: Dentro de un Día (selectedSemana && selectedDia)
             ======================================================== */
          <>
            {/* 1. Volver a Días */}
            <button
              type="button"
              className="tab-btn tab-btn-nav-back"
              onClick={handleBackToDias}
              title="Volver a los días de la semana"
            >
              <div className="tab-icon-wrap">
                <IconArrowLeft />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Volver a Días</span>
                <span className="tab-label-mobile">Días</span>
              </span>
            </button>

            {/* 2. Selector Desplegable de los Días (con expansión horizontal en Desktop) */}
            <div className="tab-day-selector-group">
              <button
                type="button"
                className={`tab-btn tab-btn-day-selector ${activeTab === "detail" ? "active" : ""} ${isDaySelectorOpen ? "open" : ""}`}
                onClick={handleDayButtonClick}
                title="Ver día / Cambiar día"
              >
                <div className="tab-icon-wrap">
                  <IconCalendar />
                </div>
                <span className="tab-label">
                  <span className="tab-label-desktop">
                    {currentDayDesktopLabel} {isDaySelectorOpen ? <IconChevronUp /> : <IconChevronDown />}
                  </span>
                  <span className="tab-label-mobile">
                    {currentDayMobileLabel} {isDaySelectorOpen ? <IconChevronUp /> : <IconChevronDown />}
                  </span>
                </span>
              </button>

              {/* Franja de 7 días desplegable hacia la derecha en Escritorio */}
              {isDaySelectorOpen && dias && dias.length > 0 && (
                <div className="desktop-inline-days-strip">
                  <button
                    type="button"
                    onClick={handlePrevDia}
                    disabled={!prevDia}
                    className="desktop-inline-nav-arrow"
                    title="Día anterior"
                  >
                    <IconChevronLeft />
                  </button>

                  <div className="desktop-inline-days-list">
                    {dias.map((d) => {
                      const info = parseDayInfo(d);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelectDiaFromDrawer(d)}
                          className={`desktop-inline-day-pill ${info.isSelected ? "active" : ""}`}
                          title={`${info.weekdayShort} ${info.dayNum}`}
                        >
                          <span className="inline-day-name">{info.weekdayShort}</span>
                          <span className="inline-day-num">{info.dayNum}</span>
                          {info.hasActivities ? (
                            <span className="inline-day-dot active" />
                          ) : (
                            <span className="inline-day-dot empty" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextDia}
                    disabled={!nextDia}
                    className="desktop-inline-nav-arrow"
                    title="Día siguiente"
                  >
                    <IconChevronRight />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Control de Avance */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "avance" ? "active" : ""}`}
              onClick={handleGoToAvance}
              title="Control de Avance"
            >
              <div className="tab-icon-wrap">
                <IconTrendingUp />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Control de Avance</span>
                <span className="tab-label-mobile">Avance</span>
              </span>
            </button>

            {/* 4. Acción Primaria: + Actividad */}
            <button
              type="button"
              className="tab-btn tab-btn-add-activity"
              onClick={handleAddActividad}
              title="Agregar actividad"
            >
              <div className="tab-icon-wrap">
                <IconPlus />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Nueva Actividad</span>
                <span className="tab-label-mobile">+ Actividad</span>
              </span>
            </button>
          </>
        ) : selectedSemana ? (
          /* ========================================================
             NIVEL 2: Dentro de una Semana (selectedSemana && !selectedDia)
             ======================================================== */
          <>
            {/* 1. Volver a Semanas */}
            <button
              type="button"
              className="tab-btn tab-btn-nav-back"
              onClick={handleBackToList}
              title="Volver al listado de semanas"
            >
              <div className="tab-icon-wrap">
                <IconArrowLeft />
                {semanas.length > 0 && (
                  <span className="tab-count-badge">{semanas.length}</span>
                )}
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Volver a Semanas</span>
                <span className="tab-label-mobile">Semanas</span>
              </span>
            </button>

            {/* 2. Semana Actual (activa) */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "detail" ? "active" : ""}`}
              onClick={() => setActiveTab("detail")}
            >
              <div className="tab-icon-wrap">
                <IconEye />
                <span className="tab-count-badge">Sem. {selectedSemana.numero_semana}</span>
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Semana {selectedSemana.numero_semana}</span>
                <span className="tab-label-mobile">Semana {selectedSemana.numero_semana}</span>
              </span>
            </button>

            {/* 3. Control de Avance */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "avance" ? "active" : ""}`}
              onClick={handleGoToAvance}
            >
              <div className="tab-icon-wrap">
                <IconTrendingUp />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Control de Avance</span>
                <span className="tab-label-mobile">Avance</span>
              </span>
            </button>
          </>
        ) : (
          /* ========================================================
             NIVEL 1: Listado General de Semanas (!selectedSemana)
             ======================================================== */
          <>
            {/* 1. Volver a Operaciones */}
            <button
              type="button"
              className="tab-btn tab-btn-nav-back"
              onClick={handleBack}
              title="Volver al módulo de Operaciones"
            >
              <div className="tab-icon-wrap">
                <IconArrowLeft />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Volver a Operaciones</span>
                <span className="tab-label-mobile">Operaciones</span>
              </span>
            </button>

            {/* 2. Semanas Planificadas (activa) */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              <div className="tab-icon-wrap">
                <IconCalendar />
                {semanas.length > 0 && (
                  <span className="tab-count-badge">{semanas.length}</span>
                )}
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Semanas Planificadas</span>
                <span className="tab-label-mobile">Semanas</span>
              </span>
            </button>

            {/* 3. Control de Avance */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "avance" ? "active" : ""}`}
              onClick={handleGoToAvance}
            >
              <div className="tab-icon-wrap">
                <IconTrendingUp />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Control de Avance</span>
                <span className="tab-label-mobile">Avance</span>
              </span>
            </button>
          </>
        )}
      </div>

      {/* Backdrop del Selector de Día */}
      {isDaySelectorOpen && (
        <div
          className="planning-day-selector-backdrop"
          onClick={() => setIsDaySelectorOpen(false)}
        />
      )}

      {/* Cajón / Desplegable de los 7 Días */}
      {isDaySelectorOpen && dias && dias.length > 0 && (
        <div className="planning-day-selector-drawer">
          <div className="sheet-drag-handle" onClick={() => setIsDaySelectorOpen(false)}>
            <span className="sheet-drag-bar" />
          </div>

          <div className="sheet-month-header">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevDia();
              }}
              disabled={!prevDia}
              className="sheet-nav-arrow"
              title="Día anterior"
            >
              <IconChevronLeft />
            </button>
            <span className="sheet-month-title">{monthYearTitle}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextDia();
              }}
              disabled={!nextDia}
              className="sheet-nav-arrow"
              title="Día siguiente"
            >
              <IconChevronRight />
            </button>
          </div>

          <div className="sheet-days-grid">
            {dias.map((d) => {
              const info = parseDayInfo(d);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDiaFromDrawer(d)}
                  className={`sheet-day-pill ${info.isSelected ? "selected" : ""}`}
                >
                  <span className="sheet-day-name">{info.weekdayShort}</span>
                  <span className="sheet-day-number">{info.dayNum}</span>
                  {info.hasActivities ? (
                    <span className="sheet-day-dot active" />
                  ) : (
                    <span className="sheet-day-dot empty" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenedor de la Vista Activa */}
      <div className="planning-tab-content">
        {activeTab === "detail" && selectedSemana ? (
          <SemanaDetail
            semana={selectedSemana}
            onBack={handleBackToList}
          />
        ) : activeTab === "avance" ? (
          <div style={{ padding: "1.5rem" }}>
            <AvancePresupuesto />
          </div>
        ) : (
          <SemanasList
            semanas={semanas}
            onSelectSemana={handleSelectSemana}
            onGenerarPlanificacion={handleGenerarPlanificacion}
            generating={generating}
            onSyncTotals={async () => {
              await syncProjectTotals();
              showToast("Sincronización de montos detallada completada", "success");
            }}
            onEliminarPlanificacion={() => {
              if (
                window.confirm(
                  "¿Estás seguro de eliminar toda la planificación? Esto borrará semanas, días y actividades de forma permanente."
                )
              ) {
                eliminarPlanificacion();
                showToast("Planificación eliminada", "info");
              }
            }}
            onShowInfo={() => setShowInfoModal(true)}
          />
        )}
      </div>

      {/* Modal Informativo */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Información del Módulo de Planificación"
      >
        <div style={{ padding: "1.5rem" }}>
          <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "1rem" }}>
            Este módulo permite estructurar, supervisar y controlar el cronograma operativo y financiero del proyecto por semanas y días de trabajo.
          </p>
          <h4 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>Capacidades:</h4>
          <ul style={{ color: "#475569", lineHeight: "1.8", paddingLeft: "1.25rem" }}>
            <li><strong>Generación Automática:</strong> Calcula las semanas de lunes a domingo basándose en la vigencia del proyecto.</li>
            <li><strong>Programación Diaria:</strong> Asignación de partidas contractuales con control de disponibilidad de cantidades.</li>
            <li><strong>Desglose Operativo:</strong> Subactividades tipo checklist con persistencia de avance.</li>
            <li><strong>Control de Recursos:</strong> Estimación de costos diarios y semanales de mano de obra y personal.</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default PlanificacionMain;
