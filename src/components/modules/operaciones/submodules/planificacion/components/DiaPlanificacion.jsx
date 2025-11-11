// src/components/modules/operaciones/submodules/planificacion/components/DiaPlanificacion.jsx
import React from 'react'
import { formatDate } from '../../../../../../utils/formatters'
import './DiaPlanificacion.css'

const DiaPlanificacion = ({ semana, onSeleccionarDia, planificacionData }) => {
  const diasSemana = [
    { nombre: 'Lunes', key: 'lunes' },
    { nombre: 'Martes', key: 'martes' },
    { nombre: 'Miércoles', key: 'miercoles' },
    { nombre: 'Jueves', key: 'jueves' },
    { nombre: 'Viernes', key: 'viernes' },
    { nombre: 'Sábado', key: 'sabado' },
    { nombre: 'Domingo', key: 'domingo' }
  ]

  const calcularFechaDia = (diaIndex) => {
    const fechaBase = new Date(semana.inicio)
    fechaBase.setDate(fechaBase.getDate() + diaIndex)
    return fechaBase.toISOString().split('T')[0]
  }

  const getActividadesDia = (diaKey) => {
    const actividades = planificacionData[diaKey]
    // Asegurar que siempre sea un array
    return Array.isArray(actividades) ? actividades : []
  }

  const getTotalMontoDia = (diaKey) => {
    const actividades = getActividadesDia(diaKey)
    return actividades.reduce((total, act) => total + (act.montoTotal || 0), 0)
  }

  const getCantidadActividades = (diaKey) => {
    const actividades = getActividadesDia(diaKey)
    return actividades.length
  }

  const getTotalDescripcionesActividades = (diaKey) => {
    const actividades = getActividadesDia(diaKey)
    return actividades.reduce((total, act) => total + (act.actividades?.length || 0), 0)
  }

  return (
    <div className="dia-planificacion">
      <div className="semana-header">
        <h3>Planificación - Semana {semana.numero}</h3>
        <div className="semana-rango">
          {formatDate(semana.inicio)} 
          {' - '}
          {formatDate(semana.fin)}
        </div>
      </div>

      <div className="dias-grid">
        {diasSemana.map((dia, index) => {
          const fecha = calcularFechaDia(index)
          const actividades = getActividadesDia(dia.key)
          const totalMonto = getTotalMontoDia(dia.key)
          const cantidadEquipos = getCantidadActividades(dia.key)
          const cantidadDescripciones = getTotalDescripcionesActividades(dia.key)
          
          return (
            <div 
              key={dia.key} 
              className={`dia-card ${actividades.length > 0 ? 'con-actividades' : 'sin-actividades'}`}
              onClick={() => onSeleccionarDia(dia.key)}
            >
              <div className="dia-header">
                <h4>{dia.nombre}</h4>
                <span className="fecha-dia">
                  {formatDate(fecha, { day: 'numeric', month: 'short' })}
                </span>
              </div>

              <div className="dia-stats">
                <div className="stat">
                  <span className="stat-number">{cantidadEquipos}</span>
                  <span className="stat-label">Equipos</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{cantidadDescripciones}</span>
                  <span className="stat-label">Actividades</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    ${totalMonto.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="stat-label">Monto Planificado</span>
                </div>
              </div>

              {actividades.length > 0 && (
                <div className="actividades-preview">
                  <div className="preview-header">
                    <small>Equipos:</small>
                  </div>
                  {actividades.slice(0, 2).map((act, idx) => (
                    <div key={idx} className="actividad-preview">
                      <span className="actividad-equipo">{act.equipoTag}</span>
                      <span className="actividad-partida">
                        {act.partidaId ? `Partida: ${act.partidaId.substring(0, 10)}...` : 'Sin partida'}
                      </span>
                    </div>
                  ))}
                  {actividades.length > 2 && (
                    <div className="mas-actividades">
                      +{actividades.length - 2} equipo(s) más...
                    </div>
                  )}
                </div>
              )}

              <div className="dia-actions">
                <button className="btn-primary">
                  {actividades.length > 0 ? 'Editar Actividades' : 'Agregar Actividades'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="resumen-semana">
        <div className="resumen-card">
          <div className="resumen-icon">📅</div>
          <div className="resumen-content">
            <div className="resumen-value">
              {Object.keys(planificacionData)
                .filter(key => key !== 'requerimientos' && Array.isArray(planificacionData[key]))
                .filter(key => planificacionData[key].length > 0).length}/7
            </div>
            <div className="resumen-label">Días Planificados</div>
          </div>
        </div>
        
        <div className="resumen-card">
          <div className="resumen-icon">🔧</div>
          <div className="resumen-content">
            <div className="resumen-value">
              {Object.keys(planificacionData)
                .filter(key => key !== 'requerimientos' && Array.isArray(planificacionData[key]))
                .reduce((total, dia) => total + planificacionData[dia].length, 0)}
            </div>
            <div className="resumen-label">Total Equipos</div>
          </div>
        </div>
        
        <div className="resumen-card">
          <div className="resumen-icon">💰</div>
          <div className="resumen-content">
            <div className="resumen-value">
              ${Object.keys(planificacionData)
                .filter(key => key !== 'requerimientos' && Array.isArray(planificacionData[key]))
                .reduce((total, dia) => total + getTotalMontoDia(dia), 0)
                .toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="resumen-label">Total Planificado</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiaPlanificacion