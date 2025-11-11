// src/components/modules/operaciones/submodules/planificacion/components/SemanaSelector.jsx
import React, { useState, useEffect } from "react";
import { useProjects } from "../../../../../../contexts/ProjectContext";
import { formatDate } from "../../../../../../utils/formatters";
import "./SemanaSelector.css";

const SemanaSelector = ({
  onSeleccionarSemana,
  planificacionExistente,
  onPlanificacionChange,
}) => {
  const { selectedProject } = useProjects();
  const [semanas, setSemanas] = useState([]);

  useEffect(() => {
    generarSemanasProyecto();
  }, [selectedProject]);

  const generarSemanasProyecto = () => {
    if (!selectedProject?.startDate) return;

    const fechaInicio = new Date(selectedProject.startDate);
    const fechaFin = new Date(
      selectedProject.endDate ||
        new Date().setFullYear(new Date().getFullYear() + 1)
    );

    const semanasGeneradas = [];
    let fechaActual = new Date(fechaInicio);
    let numeroSemana = 1;

    while (fechaActual <= fechaFin) {
      const inicioSemana = new Date(fechaActual);
      const finSemana = new Date(fechaActual);
      finSemana.setDate(finSemana.getDate() + 6);

      semanasGeneradas.push({
        id: `semana-${numeroSemana}`,
        numero: numeroSemana,
        inicio: inicioSemana.toISOString().split("T")[0],
        fin: finSemana.toISOString().split("T")[0],
        rango: `${formatDate(inicioSemana.toISOString().split('T')[0], { day: 'numeric', month: 'long', year: 'numeric' })} - ${formatDate(finSemana.toISOString().split('T')[0], { day: 'numeric', month: 'long', year: 'numeric' })}`,
      });

      fechaActual.setDate(fechaActual.getDate() + 7);
      numeroSemana++;
    }

    setSemanas(semanasGeneradas);
  };

  const getEstadoSemana = (semana) => {
    const planificacion = planificacionExistente[semana.id];
    if (!planificacion) return "no-planificada";

    const tieneActividades = Object.keys(planificacion).some(
      (key) => key !== "requerimientos" && planificacion[key]?.length > 0
    );

    return tieneActividades ? "planificada" : "parcial";
  };

  const getDiasPlanificados = (semana) => {
    const planificacion = planificacionExistente[semana.id];
    if (!planificacion) return 0;

    return Object.keys(planificacion).filter(
      (key) => key !== "requerimientos" && planificacion[key]?.length > 0
    ).length;
  };

  const handleResetearSemana = (semanaId, event) => {
    event.stopPropagation();

    if (
      !window.confirm(
        "¿Estás seguro de que deseas resetear toda la planificación de esta semana? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    const savedPlanificacion = localStorage.getItem(
      `planificacion_${selectedProject?.id}`
    );
    if (savedPlanificacion) {
      const planificacionData = JSON.parse(savedPlanificacion);
      delete planificacionData[semanaId];
      localStorage.setItem(
        `planificacion_${selectedProject?.id}`,
        JSON.stringify(planificacionData)
      );
      onPlanificacionChange(planificacionData); // Notificar al componente padre del cambio
      alert("✅ Planificación de la semana reseteada exitosamente");
    }
  };

  return (
    <div className="semana-selector">
      <div className="selector-header">
        <h3>Seleccionar Semana para Planificar</h3>
        <p>Elige una semana del proyecto para planificar las actividades</p>
      </div>

      <div className="semanas-grid">
        {semanas.map((semana) => {
          const estado = getEstadoSemana(semana);
          const diasPlanificados = getDiasPlanificados(semana);
          const tienePlanificacion = estado !== "no-planificada";

          return (
            <div
              key={semana.id}
              className={`semana-card ${estado}`}
              onClick={() => onSeleccionarSemana(semana)}
            >
              <div className="semana-header">
                <h4>Semana {semana.numero}</h4>
                <div className="header-actions">
                  <span className={`estado-badge ${estado}`}>
                    {estado === "planificada"
                      ? "✅ Completa"
                      : estado === "parcial"
                      ? "🟡 Parcial"
                      : "⚪ Sin planificar"}
                  </span>
                  {tienePlanificacion && (
                    <button
                      className="btn-reset"
                      onClick={(e) => handleResetearSemana(semana.id, e)}
                      title="Resetear planificación de la semana"
                    >
                      🔄
                    </button>
                  )}
                </div>
              </div>

              <div className="semana-info">
                <div className="semana-fechas">{semana.rango}</div>
                <div className="semana-stats">
                  <span>{diasPlanificados}/7 días planificados</span>
                </div>
              </div>

              <div className="semana-actions">
                <button className="btn-primary">
                  {estado === "no-planificada"
                    ? "Comenzar Planificación"
                    : estado === "parcial"
                    ? "Continuar Planificación"
                    : "Ver/Editar Planificación"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {semanas.length === 0 && (
        <div className="no-semanas">
          <div className="empty-icon">🗓️</div>
          <h4>No hay semanas disponibles</h4>
          <p>
            Configura las fechas del proyecto para generar el calendario de
            planificación.
          </p>
        </div>
      )}
    </div>
  );
};

export default SemanaSelector;
