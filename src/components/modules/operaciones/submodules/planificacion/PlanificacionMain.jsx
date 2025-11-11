// src/components/modules/operaciones/submodules/planificacion/PlanificacionMain.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanificacion } from "../../../../../contexts/PlanificacionContext";
import { useProjects } from "../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../contexts/BudgetContext";
import { calculateElapsedDays, formatDate } from "../../../../../utils/formatters";

import ModuleDescription from "../../../_core/ModuleDescription/ModuleDescription";
import SemanaSelector from "./components/SemanaSelector";
import DiaPlanificacion from "./components/DiaPlanificacion";
import ActividadesDia from "./components/ActividadesDia";
import ResumenSemanal from "./components/ResumenSemanal";
import RequerimientosSemana from "./components/RequerimientosSemana";
import PlanificacionStats from "./components/PlanificacionStats";

import "./PlanificacionMain.css";

const PlanificacionMain = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  const { budget, hasBudget } = useBudget();
  const { 
    planificacionData, 
    semanas, 
    loading, 
    error,
    loadPlanificacionData,
    saveActividad,
    saveRequerimiento,
    deleteActividad,
    totalTareas,
    tareasCompletadas,
    totalMontoPlanificado,
    semanasPlanificadas
  } = usePlanificacion();

  const [currentView, setCurrentView] = useState("semana");
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  useEffect(() => {
    if (selectedProject?.id && hasBudget) {
      loadPlanificacionData();
    }
  }, [selectedProject?.id, hasBudget]);

  const elapsedDays = selectedProject
    ? calculateElapsedDays(selectedProject.startDate)
    : 0;

  const handleBack = () => {
    navigate("../../../operaciones");
  };

  const handleSeleccionarSemana = (semana) => {
    if (!hasBudget) {
      alert("No se puede planificar sin un presupuesto cargado. Primero crea un presupuesto en el módulo de Presupuesto.");
      return;
    }
    setSemanaSeleccionada(semana);
    setCurrentView("dia");
  };

  const handleSeleccionarDia = (dia) => {
    setDiaSeleccionado(dia);
    setCurrentView("actividades");
  };

  const handleGuardarActividades = async (dia, actividades) => {
    try {
      const actividadesGuardadas = [];
      
      for (const actividad of actividades) {
        const actividadGuardada = await saveActividad({
          ...actividad,
          semanaNumero: semanaSeleccionada.numero,
          dia: dia
        });
        actividadesGuardadas.push(actividadGuardada);
      }
      
      await loadPlanificacionData(); // Recargar datos
      setCurrentView("dia");
      alert(`✅ ${actividadesGuardadas.length} actividades guardadas exitosamente`);
    } catch (error) {
      alert("❌ Error al guardar actividades: " + error.message);
    }
  };

  const handleGuardarRequerimientos = async (requerimientos) => {
    try {
      await saveRequerimiento(semanaSeleccionada.numero, requerimientos);
      await loadPlanificacionData(); // Recargar datos
      alert(`✅ ${requerimientos.length} requerimientos guardados exitosamente`);
    } catch (error) {
      alert("❌ Error al guardar requerimientos: " + error.message);
    }
  };

  const handleVerResumen = () => {
    setCurrentView("resumen");
  };

  const handleEliminarActividad = async (actividadId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      return;
    }

    try {
      await deleteActividad(actividadId);
      await loadPlanificacionData(); // Recargar datos
      alert('✅ Actividad eliminada exitosamente');
    } catch (error) {
      alert('❌ Error al eliminar actividad: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="planificacion-main">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando planificación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planificacion-main">
        <div className="error-state">
          <h4>❌ Error al cargar planificación</h4>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadPlanificacionData}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Bloquear navegación si no hay presupuesto
  if (!hasBudget) {
    return (
      <div className="planificacion-main">
        <button className="back-button" onClick={handleBack}>
          ← Volver a Operaciones
        </button>

        <ModuleDescription
          title="Planificación de Operaciones"
          description={`Planificación semanal y diaria de actividades - ${selectedProject?.name || ""}`}
        />

        <div className="no-presupuesto-warning">
          <div className="warning-icon">⚠️</div>
          <h4>Presupuesto Requerido</h4>
          <p>No se puede realizar planificación sin un presupuesto cargado.</p>
          <p>
            Debes crear un presupuesto con partidas en el módulo de Presupuesto
            antes de poder planificar actividades.
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("../../../contrato/presupuesto")}
          >
            Ir a Presupuesto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="planificacion-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Operaciones
      </button>

      <ModuleDescription
        title="Planificación de Operaciones"
        description={`Planificación semanal y diaria de actividades - ${selectedProject?.name || ""}`}
      />

      {/* Estadísticas generales */}
      <PlanificacionStats
        totalTareas={totalTareas}
        tareasCompletadas={tareasCompletadas}
        totalMontoPlanificado={totalMontoPlanificado}
        semanasPlanificadas={semanasPlanificadas}
        totalSemanas={semanas.length}
      />

      {/* Información del proyecto */}
      <div className="project-info-card">
        <div className="project-header">
          <h4>📋 Información del Proyecto</h4>
          <div className="project-id">ID: {selectedProject?.id}</div>
        </div>
        <div className="project-details">
          <div className="project-field">
            <label>Nombre:</label>
            <span>{selectedProject?.name}</span>
          </div>
          <div className="project-field">
            <label>Fecha Inicio:</label>
            <span>
              {selectedProject?.startDate
                ? formatDate(selectedProject.startDate)
                : "No definida"}
            </span>
          </div>
          <div className="project-field">
            <label>Fecha Fin:</label>
            <span>
              {selectedProject?.endDate
                ? formatDate(selectedProject.endDate)
                : "No definida"}
            </span>
          </div>
          <div className="project-field">
            <label>Días Transcurridos:</label>
            <span className="stat-value">{elapsedDays}</span>
          </div>
        </div>
      </div>

      {/* Información del contrato */}
      {budget && (
        <div className="contrato-info-card">
          <div className="contrato-header">
            <h4>📄 Información del Contrato</h4>
            <div className="presupuesto-status">
              <span className={`status-badge ${budget.estado === 'finalizado' ? 'success' : 'warning'}`}>
                {budget.estado === 'finalizado' ? '✅ Finalizado' : '📝 En Progreso'}
              </span>
            </div>
          </div>
          <div className="contrato-details">
            <div className="contrato-field">
              <label>Contrato N°:</label>
              <span>{budget.contratoNumero}</span>
            </div>
            <div className="contrato-field">
              <label>Descripción:</label>
              <span>{budget.nombreContrato}</span>
            </div>
            <div className="contrato-field">
              <label>Partidas Disponibles:</label>
              <span>{budget.items?.length || 0} ítems</span>
            </div>
            <div className="contrato-field">
              <label>Estado:</label>
              <span className={`status-text ${budget.estado}`}>
                {budget.estado?.charAt(0).toUpperCase() + budget.estado?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navegación entre vistas */}
      <div className="planificacion-navigation">
        <button
          className={`nav-btn ${currentView === "semana" ? "active" : ""}`}
          onClick={() => setCurrentView("semana")}
        >
          🗓️ Seleccionar Semana
        </button>
        {semanaSeleccionada && (
          <button
            className={`nav-btn ${currentView === "dia" ? "active" : ""}`}
            onClick={() => setCurrentView("dia")}
          >
            📅 Días de la Semana
          </button>
        )}
        {semanaSeleccionada && (
          <button
            className={`nav-btn ${currentView === "resumen" ? "active" : ""}`}
            onClick={handleVerResumen}
          >
            📊 Resumen Semanal
          </button>
        )}
      </div>

      {/* Contenido según la vista */}
      <div className="planificacion-content">
        {currentView === "semana" && (
          <SemanaSelector
            semanas={semanas}
            onSeleccionarSemana={handleSeleccionarSemana}
            planificacionExistente={planificacionData}
          />
        )}

        {currentView === "dia" && semanaSeleccionada && (
          <DiaPlanificacion
            semana={semanaSeleccionada}
            onSeleccionarDia={handleSeleccionarDia}
            planificacionData={planificacionData[`semana-${semanaSeleccionada.numero}`] || {}}
          />
        )}

        {currentView === "actividades" && semanaSeleccionada && diaSeleccionado && (
          <ActividadesDia
            semana={semanaSeleccionada}
            dia={diaSeleccionado}
            presupuestoData={budget}
            actividadesExistentes={
              planificacionData[`semana-${semanaSeleccionada.numero}`]?.[diaSeleccionado] || []
            }
            onGuardar={handleGuardarActividades}
            onCancelar={() => setCurrentView("dia")}
            onDeleteActividad={handleEliminarActividad}
          />
        )}

        {currentView === "resumen" && semanaSeleccionada && (
          <ResumenSemanal
            semana={semanaSeleccionada}
            planificacionData={planificacionData[`semana-${semanaSeleccionada.numero}`] || {}}
            presupuestoData={budget}
          />
        )}
      </div>

      {/* Requerimientos de la semana */}
      {semanaSeleccionada && currentView !== "actividades" && (
        <RequerimientosSemana
          semana={semanaSeleccionada}
          requerimientosExistentes={
            planificacionData[`semana-${semanaSeleccionada.numero}`]?.requerimientos || []
          }
          onGuardar={handleGuardarRequerimientos}
        />
      )}
    </div>
  );
};

export default PlanificacionMain;