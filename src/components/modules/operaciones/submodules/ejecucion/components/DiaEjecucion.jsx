// src/components/modules/operaciones/submodules/ejecucion/components/DiaEjecucion.jsx
import React from 'react'

const DiaEjecucion = ({ semana, onSeleccionarDia, planificacionData, ejecucionData }) => {
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
    return Array.isArray(actividades) ? actividades : []
  }

  const getActividadesEjecutadasDia = (diaKey) => {
    const ejecucionDia = ejecucionData[diaKey] || {}
    return Object.keys(ejecucionDia).length
  }

  const getEstadoDia = (diaKey) => {
    const actividades = getActividadesDia(diaKey)
    const ejecutadas = getActividadesEjecutadasDia(diaKey)
    
    if (actividades.length === 0) return 'sin-planificacion'
    
    // Verificar si todas las actividades están completadas
    const ejecucionDia = ejecucionData[diaKey] || {}
    const todasCompletadas = actividades.every(act => 
      ejecucionDia[act.id]?.estado === 'completado'
    )
    
    if (todasCompletadas) return 'completo'
    
    const algunaEnProgreso = actividades.some(act => 
      ejecucionDia[act.id]?.estado === 'en-progreso' || 
      ejecucionDia[act.id]?.actividadesCompletadas?.length > 0
    )
    
    if (algunaEnProgreso || ejecutadas > 0) return 'parcial'
    
    return 'sin-ejecucion'
  }

  const getEquiposEjecutados = (diaKey) => {
    const ejecucionDia = ejecucionData[diaKey] || {}
    return Object.values(ejecucionDia).filter(act => act.estado === 'completado').length
  }

  const getAvanceFisicoDia = (diaKey) => {
    const actividades = getActividadesDia(diaKey)
    const ejecucionDia = ejecucionData[diaKey] || {}
    
    if (actividades.length === 0) return 0
    
    let avanceTotal = 0
    actividades.forEach(actividad => {
      const ejecucion = ejecucionDia[actividad.id]
      if (ejecucion && actividad.actividades) {
        const actividadesCompletadas = ejecucion.actividadesCompletadas?.length || 0
        const totalActividades = actividad.actividades.length
        avanceTotal += (actividadesCompletadas / totalActividades) * 100
      }
    })
    
    return avanceTotal / actividades.length
  }

  return (
    <div className="dia-ejecucion">
      <div className="semana-header">
        <h3>Ejecución - Semana {semana.numero}</h3>
        <div className="semana-rango">
          {new Date(semana.inicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
          {' - '}
          {new Date(semana.fin).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="dias-grid">
        {diasSemana.map((dia, index) => {
          const fecha = calcularFechaDia(index)
          const actividades = getActividadesDia(dia.key)
          const actividadesEjecutadas = getActividadesEjecutadasDia(dia.key)
          const estado = getEstadoDia(dia.key)
          const equiposEjecutados = getEquiposEjecutados(dia.key)
          const avanceFisico = getAvanceFisicoDia(dia.key)
          const tienePlanificacion = actividades.length > 0
          
          return (
            <div 
              key={dia.key} 
              className={`dia-card ${estado}`}
              onClick={() => tienePlanificacion && onSeleccionarDia(dia.key)}
            >
              <div className="dia-header">
                <h4>{dia.nombre}</h4>
                <span className="fecha-dia">
                  {new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
                <span className={`estado-badge ${estado}`}>
                  {estado === 'completo' ? '✅' : 
                   estado === 'parcial' ? '🟡' : 
                   estado === 'sin-ejecucion' ? '⚪' : '🔵'}
                </span>
              </div>

              <div className="dia-stats">
                <div className="stat">
                  <span className="stat-number">{actividades.length}</span>
                  <span className="stat-label">Equipos Planif.</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{actividadesEjecutadas}</span>
                  <span className="stat-label">Equipos Ejec.</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{equiposEjecutados}</span>
                  <span className="stat-label">Completados</span>
                </div>
              </div>

              {/* Barra de progreso del día */}
              {tienePlanificacion && (
                <div className="avance-dia">
                  <div className="avance-header">
                    <small>Avance Físico: {avanceFisico.toFixed(1)}%</small>
                  </div>
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill"
                      style={{ width: `${avanceFisico}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {tienePlanificacion && (
                <div className="actividades-preview">
                  <div className="preview-header">
                    <small>Equipos:</small>
                  </div>
                  {actividades.slice(0, 2).map((act, idx) => {
                    const ejecucion = ejecucionData[dia.key]?.[act.id]
                    const porcentajeAvance = ejecucion && act.actividades ? 
                      ((ejecucion.actividadesCompletadas?.length || 0) / act.actividades.length) * 100 : 0
                    
                    return (
                      <div key={idx} className={`actividad-preview ${ejecucion ? 'ejecutada' : ''}`}>
                        <span className="actividad-equipo">{act.equipoTag}</span>
                        <span className="actividad-avance">
                          {porcentajeAvance > 0 ? `${porcentajeAvance.toFixed(0)}%` : '⏳'}
                        </span>
                      </div>
                    )
                  })}
                  {actividades.length > 2 && (
                    <div className="mas-actividades">
                      +{actividades.length - 2} equipo(s) más...
                    </div>
                  )}
                </div>
              )}

              <div className="dia-actions">
                <button 
                  className={`btn-primary ${!tienePlanificacion ? 'disabled' : ''}`}
                  disabled={!tienePlanificacion}
                >
                  {estado === 'sin-planificacion' ? 'Sin Actividades' : 
                   estado === 'sin-ejecucion' ? 'Registrar Ejecución' : 
                   estado === 'parcial' ? 'Continuar Ejecución' : 'Ver Ejecución'}
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
              {diasSemana.filter(dia => getActividadesDia(dia.key).length > 0).length}/7
            </div>
            <div className="resumen-label">Días con Actividades</div>
          </div>
        </div>
        
        <div className="resumen-card">
          <div className="resumen-icon">🔧</div>
          <div className="resumen-content">
            <div className="resumen-value">
              {diasSemana.reduce((total, dia) => total + getActividadesEjecutadasDia(dia.key), 0)}
            </div>
            <div className="resumen-label">Equipos Ejecutados</div>
          </div>
        </div>
        
        <div className="resumen-card">
          <div className="resumen-icon">✅</div>
          <div className="resumen-content">
            <div className="resumen-value">
              {diasSemana.reduce((total, dia) => total + getEquiposEjecutados(dia.key), 0)}
            </div>
            <div className="resumen-label">Equipos Completados</div>
          </div>
        </div>

        <div className="resumen-card">
          <div className="resumen-icon">📊</div>
          <div className="resumen-content">
            <div className="resumen-value">
              {diasSemana.reduce((total, dia) => {
                const actividades = getActividadesDia(dia.key)
                if (actividades.length === 0) return total
                return total + getAvanceFisicoDia(dia.key)
              }, 0).toFixed(1)}%
            </div>
            <div className="resumen-label">Avance Promedio</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiaEjecucion