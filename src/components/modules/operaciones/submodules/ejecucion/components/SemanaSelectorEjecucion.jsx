// src/components/modules/operaciones/submodules/ejecucion/components/SemanaSelectorEjecucion.jsx
import React, { useState, useEffect } from 'react'
import { useProjects } from '../../../../../../contexts/ProjectContext'

const SemanaSelectorEjecucion = ({ onSeleccionarSemana, planificacionData, ejecucionData }) => {
  const { selectedProject } = useProjects()
  const [semanas, setSemanas] = useState([])

  useEffect(() => {
    generarSemanasProyecto()
  }, [selectedProject, planificacionData])

  const generarSemanasProyecto = () => {
    if (!selectedProject?.startDate) return

    const fechaInicio = new Date(selectedProject.startDate)
    const fechaFin = new Date(selectedProject.endDate || new Date().setFullYear(new Date().getFullYear() + 1))
    
    const semanasGeneradas = []
    let fechaActual = new Date(fechaInicio)
    let numeroSemana = 1

    while (fechaActual <= fechaFin) {
      const inicioSemana = new Date(fechaActual)
      const finSemana = new Date(fechaActual)
      finSemana.setDate(finSemana.getDate() + 6)

      const semanaId = `semana-${numeroSemana}`
      
      semanasGeneradas.push({
        id: semanaId,
        numero: numeroSemana,
        inicio: inicioSemana.toISOString().split('T')[0],
        fin: finSemana.toISOString().split('T')[0],
        rango: `${inicioSemana.toLocaleDateString('es-ES')} - ${finSemana.toLocaleDateString('es-ES')}`
      })

      fechaActual.setDate(fechaActual.getDate() + 7)
      numeroSemana++
    }

    setSemanas(semanasGeneradas)
  }

  const getEstadoEjecucionSemana = (semana) => {
    const planificacion = planificacionData[semana.id]
    const ejecucion = ejecucionData[semana.id]
    
    if (!planificacion) return 'no-planificada'
    
    const totalActividades = Object.keys(planificacion)
      .filter(key => key !== 'requerimientos')
      .reduce((total, dia) => total + (Array.isArray(planificacion[dia]) ? planificacion[dia].length : 0), 0)
    
    if (totalActividades === 0) return 'no-planificada'
    
    // Verificar si todas las actividades están completadas
    let actividadesCompletadas = 0
    let avanceTotal = 0
    
    Object.keys(planificacion).forEach(diaKey => {
      if (diaKey !== 'requerimientos') {
        const actividadesDia = Array.isArray(planificacion[diaKey]) ? planificacion[diaKey] : []
        actividadesDia.forEach(actividad => {
          const ejecucionActividad = ejecucion?.[diaKey]?.[actividad.id]
          if (ejecucionActividad) {
            if (ejecucionActividad.estado === 'completado') {
              actividadesCompletadas++
              avanceTotal += 100
            } else if (ejecucionActividad.porcentajeAvance) {
              avanceTotal += ejecucionActividad.porcentajeAvance
            } else if (actividad.actividades) {
              const actividadesCompletadasCount = ejecucionActividad.actividadesCompletadas?.length || 0
              avanceTotal += (actividadesCompletadasCount / actividad.actividades.length) * 100
            }
          }
        })
      }
    })
    
    const porcentajeEjecucion = totalActividades > 0 ? (avanceTotal / totalActividades) : 0
    
    if (actividadesCompletadas === totalActividades) return 'completa'
    if (porcentajeEjecucion > 0) return 'parcial'
    
    return 'sin-ejecucion'
  }

  const getEstadisticasSemana = (semana) => {
    const planificacion = planificacionData[semana.id] || {}
    const ejecucion = ejecucionData[semana.id] || {}
    
    const diasPlanificados = Object.keys(planificacion)
      .filter(key => key !== 'requerimientos' && Array.isArray(planificacion[key]) && planificacion[key].length > 0)
      .length
    
    const totalActividades = Object.keys(planificacion)
      .filter(key => key !== 'requerimientos')
      .reduce((total, dia) => total + (Array.isArray(planificacion[dia]) ? planificacion[dia].length : 0), 0)
    
    let actividadesEjecutadas = 0
    let avanceTotal = 0
    let montoEjecutado = 0
    let montoPlanificado = 0
    
    Object.keys(planificacion).forEach(diaKey => {
      if (diaKey !== 'requerimientos') {
        const actividadesDia = Array.isArray(planificacion[diaKey]) ? planificacion[diaKey] : []
        actividadesDia.forEach(actividad => {
          montoPlanificado += actividad.montoTotal || 0
          const ejecucionActividad = ejecucion[diaKey]?.[actividad.id]
          if (ejecucionActividad) {
            actividadesEjecutadas++
            
            let porcentajeAvance = 0
            if (ejecucionActividad.porcentajeAvance) {
              porcentajeAvance = ejecucionActividad.porcentajeAvance
            } else if (actividad.actividades) {
              const actividadesCompletadasCount = ejecucionActividad.actividadesCompletadas?.length || 0
              porcentajeAvance = (actividadesCompletadasCount / actividad.actividades.length) * 100
            }
            
            avanceTotal += porcentajeAvance
            montoEjecutado += (actividad.montoTotal * porcentajeAvance) / 100
          }
        })
      }
    })
    
    const porcentajeEjecucion = totalActividades > 0 ? (avanceTotal / totalActividades) : 0
    const porcentajePresupuesto = montoPlanificado > 0 ? (montoEjecutado / montoPlanificado) * 100 : 0
    
    return {
      diasPlanificados,
      totalActividades,
      actividadesEjecutadas,
      porcentajeEjecucion,
      porcentajePresupuesto,
      montoPlanificado,
      montoEjecutado
    }
  }

  return (
    <div className="semana-selector-ejecucion">
      <div className="selector-header">
        <h3>Seleccionar Semana para Ejecución</h3>
        <p>Elige una semana del proyecto para registrar la ejecución de actividades</p>
      </div>

      <div className="semanas-grid">
        {semanas.map(semana => {
          const estado = getEstadoEjecucionSemana(semana)
          const stats = getEstadisticasSemana(semana)
          const tienePlanificacion = estado !== 'no-planificada'
          
          return (
            <div 
              key={semana.id} 
              className={`semana-card ${estado}`}
              onClick={() => tienePlanificacion && onSeleccionarSemana(semana)}
            >
              <div className="semana-header">
                <h4>Semana {semana.numero}</h4>
                <div className="header-actions">
                  <span className={`estado-badge ${estado}`}>
                    {estado === 'completa' ? '✅ Completa' : 
                     estado === 'parcial' ? '🟡 En Progreso' : 
                     estado === 'sin-ejecucion' ? '⚪ Sin Ejecutar' : 
                     '🔵 Sin Planificar'}
                  </span>
                </div>
              </div>
              
              <div className="semana-info">
                <div className="semana-fechas">
                  {semana.rango}
                </div>
                {tienePlanificacion && (
                  <div className="semana-stats">
                    <div className="stat-item">
                      <span className="stat-label">Días planificados:</span>
                      <span className="stat-value">{stats.diasPlanificados}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Actividades:</span>
                      <span className="stat-value">{stats.actividadesEjecutadas}/{stats.totalActividades}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Avance físico:</span>
                      <span className="stat-value">{stats.porcentajeEjecucion.toFixed(1)}%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Presupuesto:</span>
                      <span className="stat-value">{stats.porcentajePresupuesto.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${stats.porcentajeEjecucion}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {stats.porcentajeEjecucion.toFixed(1)}% ejecutado
                    </div>
                  </div>
                )}
              </div>

              <div className="semana-actions">
                <button 
                  className={`btn-primary ${!tienePlanificacion ? 'disabled' : ''}`}
                  disabled={!tienePlanificacion}
                >
                  {estado === 'no-planificada' ? 'Sin Planificación' : 
                   estado === 'sin-ejecucion' ? 'Comenzar Ejecución' : 
                   estado === 'parcial' ? 'Continuar Ejecución' : 'Ver Ejecución'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {semanas.length === 0 && (
        <div className="no-semanas">
          <div className="empty-icon">🗓️</div>
          <h4>No hay semanas disponibles</h4>
          <p>Configura las fechas del proyecto para generar el calendario de ejecución.</p>
        </div>
      )}
    </div>
  )
}

export default SemanaSelectorEjecucion