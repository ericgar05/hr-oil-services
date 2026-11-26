// src/components/modules/operaciones/submodules/ejecucion/EjecucionMain.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../../../api/supaBase';
import { usePlanning } from '../../../../../contexts/PlanningContext';
import { useProjects } from '../../../../../contexts/ProjectContext';
import { useBudget } from '../../../../../contexts/BudgetContext';
import { EjecucionDashboard } from './components/EjecucionDashboard';
import { SemanasEjecucion } from './components/SemanasEjecucion';
import { SemanaEjecucion, WeeklyReportModal } from './components/SemanaEjecucion';
import { DailyReportModal } from './components/DiaEjecucion';
import ModuleDescription from '../../../_core/ModuleDescription/ModuleDescription';
import Modal from '../../../../common/Modal/Modal';
import './Ejecucion.css';

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

const IconFileText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const EjecucionMain = () => {
  const navigate = useNavigate();
  const { semanas, getSemanasPlanificacion, actividades, loading } = usePlanning();
  const { selectedProject } = useProjects();
  const { budget: presupuestoData } = useBudget();

  // Estados de navegación jerárquica
  const [activeTab, setActiveTab] = useState("list"); // "list" | "detail" | "dashboard"
  const [selectedSemana, setSelectedSemana] = useState(null);
  const [selectedDia, setSelectedDia] = useState(null);
  const [dias, setDias] = useState([]);
  const [semanaVista, setSemanaVista] = useState("dias"); // "dias" | "metricas"
  const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      getSemanasPlanificacion();
    }
  }, [selectedProject, getSemanasPlanificacion]);

  // Navegación por niveles
  const handleBackToOperaciones = () => {
    navigate("../../../operaciones");
  };

  const handleSelectSemana = async (semana) => {
    setSelectedSemana(semana);
    setSelectedDia(null);
    setSemanaVista("dias");
    setActiveTab("detail");
    setIsDaySelectorOpen(false);
    setShowWeeklyReportModal(false);
    setShowDailyReportModal(false);

    try {
      const { data, error } = await supabase
        .from('plan_dias')
        .select('*')
        .eq('semana_id', semana.id)
        .order('fecha');
      if (!error && data) {
        setDias(data);
      }
    } catch (err) {
      console.error("Error al cargar días de ejecución:", err);
    }
  };

  const handleBackToSemanas = () => {
    setSelectedSemana(null);
    setSelectedDia(null);
    setSemanaVista("dias");
    setActiveTab("list");
    setIsDaySelectorOpen(false);
    setShowDailyReportModal(false);
    setShowWeeklyReportModal(false);
  };

  const handleSelectDia = (dia) => {
    setSelectedDia(dia);
    setActiveTab("detail");
    setIsDaySelectorOpen(false);
    setShowDailyReportModal(false);
  };

  const handleBackToDias = () => {
    setSelectedDia(null);
    setIsDaySelectorOpen(false);
    setActiveTab("detail");
    setShowDailyReportModal(false);
  };

  const handleDayButtonClick = () => {
    if (activeTab !== "detail") {
      setActiveTab("detail");
      setIsDaySelectorOpen(false);
      setShowDailyReportModal(false);
    } else {
      setIsDaySelectorOpen((prev) => !prev);
    }
  };

  const handleSelectDiaFromDrawer = (d) => {
    setSelectedDia(d);
    setActiveTab("detail");
    setIsDaySelectorOpen(false);
    setShowDailyReportModal(false);
  };

  const handleGoToDashboard = () => {
    setActiveTab("dashboard");
    setIsDaySelectorOpen(false);
    setShowDailyReportModal(false);
  };

  // Cálculo de día previo y siguiente
  const currentDayIndex = dias?.findIndex((d) => d.id === selectedDia?.id);
  const prevDia = currentDayIndex > 0 ? dias[currentDayIndex - 1] : null;
  const nextDia = currentDayIndex >= 0 && currentDayIndex < dias?.length - 1 ? dias[currentDayIndex + 1] : null;

  const handlePrevDia = () => {
    if (prevDia) {
      setSelectedDia(prevDia);
      setActiveTab("detail");
      setShowDailyReportModal(false);
    }
  };

  const handleNextDia = () => {
    if (nextDia) {
      setSelectedDia(nextDia);
      setActiveTab("detail");
      setShowDailyReportModal(false);
    }
  };

  // Etiquetas de fecha amigables
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
      <div className="ejecucion-main">
        <div className="planning-no-content">Cargando datos de ejecución...</div>
      </div>
    );
  }

  return (
    <div className="ejecucion-main">
      <ModuleDescription
        title="Ejecución de Obra"
        description={`Seguimiento diario y control financiero de actividades ejecutadas - ${
          selectedProject?.name || ""
        }`}
      />

      {/* Sistema de Pestañas Corporativas Dinámico por Niveles (Barra Inferior Fija) */}
      <div className="ejecucion-tabs-bar">
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

              {/* Franja de 7 días desplegable hacia arriba en Escritorio */}
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

            {/* 3. Reporte del Día */}
            <button
              type="button"
              className={`tab-btn tab-btn-report ${showDailyReportModal ? "active" : ""}`}
              onClick={() => {
                setIsDaySelectorOpen(false);
                setShowDailyReportModal(true);
              }}
              title="Ver Reporte General del Día"
            >
              <div className="tab-icon-wrap">
                <IconFileText />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Reporte del Día</span>
                <span className="tab-label-mobile">Reporte</span>
              </span>
            </button>

            {/* 4. Dashboard de Avance */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={handleGoToDashboard}
              title="Dashboard de Avance"
            >
              <div className="tab-icon-wrap">
                <IconTrendingUp />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Dashboard de Avance</span>
                <span className="tab-label-mobile">Avance</span>
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
              onClick={handleBackToSemanas}
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

            {/* 2. Días de Ejecución de la Semana */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "detail" && semanaVista === "dias" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("detail");
                setSemanaVista("dias");
              }}
              title={`Días de la Semana ${selectedSemana.numero_semana}`}
            >
              <div className="tab-icon-wrap">
                <IconCalendar />
                <span className="tab-count-badge">Sem. {selectedSemana.numero_semana}</span>
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Días Semana {selectedSemana.numero_semana}</span>
                <span className="tab-label-mobile">Sem. {selectedSemana.numero_semana}</span>
              </span>
            </button>

            {/* 3. Métricas Semanales */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "detail" && semanaVista === "metricas" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("detail");
                setSemanaVista("metricas");
              }}
              title="Métricas Semanales"
            >
              <div className="tab-icon-wrap">
                <IconBarChart />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Métricas</span>
                <span className="tab-label-mobile">Métricas</span>
              </span>
            </button>

            {/* 4. Reporte Semanal */}
            <button
              type="button"
              className={`tab-btn tab-btn-report ${showWeeklyReportModal ? "active" : ""}`}
              onClick={() => setShowWeeklyReportModal(true)}
              title="Ver Reporte Semanal"
            >
              <div className="tab-icon-wrap">
                <IconFileText />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Reporte Semanal</span>
                <span className="tab-label-mobile">Reporte</span>
              </span>
            </button>

            {/* 5. Dashboard de Avance */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={handleGoToDashboard}
            >
              <div className="tab-icon-wrap">
                <IconTrendingUp />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Dashboard de Avance</span>
                <span className="tab-label-mobile">Avance</span>
              </span>
            </button>
          </>
        ) : (
          /* ========================================================
             NIVEL 1: Vista General (sin semana seleccionada)
             ======================================================== */
          <>
            {/* 1. Volver a Operaciones */}
            <button
              type="button"
              className="tab-btn tab-btn-nav-back"
              onClick={handleBackToOperaciones}
              title="Volver al menú de operaciones"
            >
              <div className="tab-icon-wrap">
                <IconArrowLeft />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Volver a Operaciones</span>
                <span className="tab-label-mobile">Operaciones</span>
              </span>
            </button>

            {/* 2. Semanas de Ejecución */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
              onClick={handleBackToSemanas}
            >
              <div className="tab-icon-wrap">
                <IconCalendar />
                {semanas.length > 0 && (
                  <span className="tab-count-badge">{semanas.length}</span>
                )}
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Semanas de Ejecución</span>
                <span className="tab-label-mobile">Semanas</span>
              </span>
            </button>

            {/* 3. Dashboard de Avance */}
            <button
              type="button"
              className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={handleGoToDashboard}
            >
              <div className="tab-icon-wrap">
                <IconTrendingUp />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Dashboard de Avance</span>
                <span className="tab-label-mobile">Avance</span>
              </span>
            </button>
          </>
        )}
      </div>

      {/* Backdrop para cerrar el selector de días al hacer click afuera */}
      {isDaySelectorOpen && (
        <div
          className="ejecucion-day-selector-backdrop"
          onClick={() => setIsDaySelectorOpen(false)}
        />
      )}

      {/* Cajón Desplegable de los 7 Días para Pantallas Móviles */}
      {isDaySelectorOpen && dias && dias.length > 0 && (
        <div className="ejecucion-day-selector-drawer">
          <div className="sheet-drag-handle" onClick={() => setIsDaySelectorOpen(false)}>
            <div className="sheet-drag-bar" />
          </div>

          <div className="sheet-month-header">
            <button
              type="button"
              onClick={handlePrevDia}
              disabled={!prevDia}
              className="sheet-nav-arrow"
              title="Día anterior"
            >
              <IconChevronLeft />
            </button>
            <span className="sheet-month-title">{monthYearTitle}</span>
            <button
              type="button"
              onClick={handleNextDia}
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
      <div className="ejecucion-tab-content">
        {activeTab === "detail" && selectedSemana ? (
          <SemanaEjecucion
            semana={selectedSemana}
            onBack={handleBackToSemanas}
            selectedDia={selectedDia}
            onSelectDia={handleSelectDia}
            dias={dias}
            setDias={setDias}
            vista={semanaVista}
          />
        ) : activeTab === "dashboard" ? (
          <div style={{ padding: "1.5rem" }}>
            <EjecucionDashboard
              semanas={semanas}
              actividades={actividades}
            />
          </div>
        ) : (
          <SemanasEjecucion
            semanas={semanas}
            onSelectSemana={handleSelectSemana}
            onShowInfo={() => setShowInfoModal(true)}
          />
        )}
      </div>

      {/* Modal de Reporte Semanal (Disponible sobre cualquier pestaña cuando hay semana seleccionada) */}
      {selectedSemana && !selectedDia && (
        <WeeklyReportModal
          isOpen={showWeeklyReportModal}
          onClose={() => setShowWeeklyReportModal(false)}
          semanaId={selectedSemana.id}
          semanaNumero={selectedSemana.numero_semana}
        />
      )}

      {/* Modal de Reporte Diario (Disponible sobre cualquier pestaña cuando hay día seleccionado) */}
      {selectedDia && (
        <DailyReportModal
          isOpen={showDailyReportModal}
          onClose={() => setShowDailyReportModal(false)}
          diaId={selectedDia.id}
          diaFecha={selectedDia.fecha}
        />
      )}

      {/* Modal Informativo */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="Información de Ejecución"
      >
        <div style={{ padding: "1.5rem" }}>
          <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "1rem" }}>
            Este submódulo permite realizar el seguimiento detallado de la ejecución real de actividades, avances físicos y costos en campo.
          </p>
          <h4 style={{ color: "#0f172a", marginBottom: "0.5rem" }}>Funcionalidades Clave:</h4>
          <ul style={{ color: "#475569", lineHeight: "1.8", paddingLeft: "1.25rem" }}>
            <li><strong>Control Diario:</strong> Registro de subactividades cumplidas y porcentaje de avance.</li>
            <li><strong>Reportes Diarios y Semanales:</strong> Consolidación de avance y notas de campo.</li>
            <li><strong>KPIs Operativos:</strong> Comparativa entre montos planificados y ejecución real certificada.</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default EjecucionMain;
