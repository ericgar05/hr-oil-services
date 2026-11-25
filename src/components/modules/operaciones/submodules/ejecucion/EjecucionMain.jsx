// src/components/modules/operaciones/submodules/ejecucion/EjecucionMain.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlanning } from '../../../../../contexts/PlanningContext';
import { useProjects } from '../../../../../contexts/ProjectContext';
import { useBudget } from '../../../../../contexts/BudgetContext';
import { EjecucionDashboard } from './components/EjecucionDashboard';
import { SemanasEjecucion } from './components/SemanasEjecucion';
import { SemanaEjecucion } from './components/SemanaEjecucion';
import ModuleDescription from '../../../_core/ModuleDescription/ModuleDescription';
import Modal from '../../../../common/Modal/Modal';
import './Ejecucion.css';

// Iconos Vectoriales SVG Profesionales
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
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

const EjecucionMain = () => {
  const navigate = useNavigate();
  const { semanas, getSemanasPlanificacion, actividades, loading } = usePlanning();
  const { selectedProject } = useProjects();
  const { budget: presupuestoData } = useBudget();

  // Sistema de Pestañas Corporativas: "list" | "detail" | "dashboard"
  const [activeTab, setActiveTab] = useState("list");
  const [selectedSemana, setSelectedSemana] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      getSemanasPlanificacion();
    }
  }, [selectedProject, getSemanasPlanificacion]);

  const handleBack = () => {
    navigate("../../../operaciones");
  };

  const handleSelectSemana = (semana) => {
    setSelectedSemana(semana);
    setActiveTab("detail");
  };

  const handleBackToList = () => {
    setSelectedSemana(null);
    setActiveTab("list");
  };

  // Cálculo de totales acumulados
  const totalEjecutado = useMemo(() => {
    return semanas?.reduce((acc, s) => acc + (s.monto_ejecutado || 0), 0) || 0;
  }, [semanas]);

  if (loading && semanas.length === 0) {
    return (
      <div className="ejecucion-main">
        <div className="planning-no-content">Cargando datos de ejecución...</div>
      </div>
    );
  }

  return (
    <div className="ejecucion-main">
      {/* Botón Volver Superior */}
      <button type="button" className="back-button" onClick={handleBack}>
        <IconArrowLeft /> Volver a Operaciones
      </button>

      <ModuleDescription
        title="Ejecución de Obra"
        description={`Seguimiento diario y control financiero de actividades ejecutadas - ${
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
                Moneda: <strong>USD</strong>
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
            <span className="finance-pill-label">Total Ejecutado</span>
            <span className="finance-pill-value">
              ${totalEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Sistema de Pestañas Corporativas (Desktop Pills / Mobile Bottom Bar) */}
      <div className="ejecucion-tabs-bar">
        {/* Pestaña 1: Semanas de Ejecución */}
        <button
          type="button"
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={handleBackToList}
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

        {/* Pestaña Dinámica 2: Detalle de Semana */}
        {selectedSemana && (
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
              <span className="tab-label-desktop">Detalle Semana {selectedSemana.numero_semana}</span>
              <span className="tab-label-mobile">Semana {selectedSemana.numero_semana}</span>
            </span>
          </button>
        )}

        {/* Pestaña 3: Dashboard de Avance */}
        <button
          type="button"
          className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <div className="tab-icon-wrap">
            <IconTrendingUp />
          </div>
          <span className="tab-label">
            <span className="tab-label-desktop">Dashboard de Avance</span>
            <span className="tab-label-mobile">Dashboard</span>
          </span>
        </button>
      </div>

      {/* Contenedor de la Vista Activa */}
      <div className="ejecucion-tab-content">
        {activeTab === "detail" && selectedSemana ? (
          <SemanaEjecucion
            semana={selectedSemana}
            onBack={handleBackToList}
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
