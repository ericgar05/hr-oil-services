// src/components/modules/operaciones/submodules/ejecucion/components/ActividadEjecucion.jsx
import React, { useState } from 'react'
import { useCurrency } from '../../../../../../contexts/CurrencyContext'

const ActividadEjecucion = ({ semana, dia, planificacionData, ejecucionData, onSeleccionarActividad, onVerReporte }) => {
  const { formatCurrency } = useCurrency()
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  const getEstadoActividad = (actividad) => {
    const ejecucion = ejecucionData[actividad.id]
    
    if (!ejecucion) return 'pendiente'
    if (ejecucion.estado === 'completado') return 'completado'
    if (ejecucion.estado === 'en-progreso') return 'en-progreso'
    if (ejecucion.estado === 'reprogramado') return 'reprogramado'
    
    return 'pendiente'
  }

  const getPorcentajeAvanceActividad = (actividad) => {
    const ejecucion = ejecucionData[actividad.id]
    if (!ejecucion || !actividad.actividades || actividad.actividades.length === 0) return 0
    
    const actividadesCompletadas = ejecucion.actividadesCompletadas?.length || 0
    const totalActividades = actividad.actividades.length
    
    return (actividadesCompletadas / totalActividades) * 100
  }

  const getActividadesFiltradas = () => {
    if (filtroEstado === 'todos') return planificacionData
    
    return planificacionData.filter(actividad => 
      getEstadoActividad(actividad) === filtroEstado
    )
  }

  const getEstadisticas = () => {
    const total = planificacionData.length
    const completados = planificacionData.filter(act => getEstadoActividad(act) === 'completado').length
    const enProgreso = planificacionData.filter(act => getEstadoActividad(act) === 'en-progreso').length
    const reprogramados = planificacionData.filter(act => getEstadoActividad(act) === 'reprogramado').length
    const pendientes = planificacionData.filter(act => getEstadoActividad(act) === 'pendiente').length
    
    // Calcular avance físico basado en actividades completadas
    let avanceFisicoTotal = 0
    planificacionData.forEach(actividad => {
      avanceFisicoTotal += getPorcentajeAvanceActividad(actividad)
    })
    const porcentajeCompletado = total > 0 ? avanceFisicoTotal / total : 0
    
    return {
      total,
      completados,
      enProgreso,
      reprogramados,
      pendientes,
      porcentajeCompletado
    }
  }

  const stats = getEstadisticas()
  const actividadesFiltradas = getActividadesFiltradas()

  return (
    <div className="actividad-ejecucion">
      <div className="ejecucion-header">
        <h3>Actividades - {diasSemana[dia]} - Semana {semana.numero}</h3>
        <div className="fecha-dia">
          {new Date(semana.inicio).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-dia">
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Equipos</div>
            </div>
          </div>
          
          <div className="stat-card completado">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completados}</div>
              <div className="stat-label">Completados</div>
            </div>
          </div>
          
          <div className="stat-card progreso">
            <div className="stat-icon">🟡</div>
            <div className="stat-content">
              <div className="stat-value">{stats.enProgreso}</div>
              <div className="stat-label">En Progreso</div>
            </div>
          </div>
          
          <div className="stat-card pendiente">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendientes}</div>
              <div className="stat-label">Pendientes</div>
            </div>
          </div>
        </div>

        <div className="progress-overview">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${stats.porcentajeCompletado}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {stats.porcentajeCompletado.toFixed(1)}% completado
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-actividades">
        <div className="filtros-header">
          <h4>Filtrar por Estado:</h4>
        </div>
        <div className="filtros-botones">
          <button 
            className={`filtro-btn ${filtroEstado === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todos')}
          >
            Todos ({stats.total})
          </button>
          <button 
            className={`filtro-btn ${filtroEstado === 'completado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('completado')}
          >
            ✅ Completados ({stats.completados})
          </button>
          <button 
            className={`filtro-btn ${filtroEstado === 'en-progreso' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('en-progreso')}
          >
            🟡 En Progreso ({stats.enProgreso})
          </button>
          <button 
            className={`filtro-btn ${filtroEstado === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('pendiente')}
          >
            ⏳ Pendientes ({stats.pendientes})
          </button>
          <button 
            className={`filtro-btn ${filtroEstado === 'reprogramado' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('reprogramado')}
          >
            🔄 Reprogramados ({stats.reprogramados})
          </button>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="lista-actividades-ejecucion">
        {actividadesFiltradas.map(actividad => {
          const ejecucion = ejecucionData[actividad.id]
          const estado = getEstadoActividad(actividad)
          const porcentajeAvance = getPorcentajeAvanceActividad(actividad)
          
          return (
            <div key={actividad.id} className={`actividad-card ${estado}`}>
              <div className="actividad-header">
                <div className="equipo-info">
                  <h4>{actividad.equipoTag}</h4>
                  <span className="partida-codigo">{actividad.partidaId}</span>
                </div>
                <div className="estado-actividad">
                  <span className={`estado-badge ${estado}`}>
                    {estado === 'completado' ? '✅ Completado' : 
                     estado === 'en-progreso' ? '🟡 En Progreso' : 
                     estado === 'reprogramado' ? '🔄 Reprogramado' : '⏳ Pendiente'}
                  </span>
                </div>
              </div>

              <div className="actividad-detalles">
                <div className="detalle-col">
                  <div className="detalle-item">
                    <label>Unidad:</label>
                    <span>{actividad.unidad}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Cantidad:</label>
                    <span>{actividad.cantidad}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Monto:</label>
                    <span>{formatCurrency(actividad.montoTotal, 'USD')}</span>
                  </div>
                </div>
                
                <div className="detalle-col">
                  <div className="detalle-item">
                    <label>Actividades:</label>
                    <span>{actividad.actividades?.length || 0}</span>
                  </div>
                  <div className="detalle-item">
                    <label>Avance:</label>
                    <span>{porcentajeAvance.toFixed(0)}%</span>
                  </div>
                  {ejecucion && (
                    <>
                      <div className="detalle-item">
                        <label>Iniciado:</label>
                        <span>{new Date(ejecucion.fechaInicio).toLocaleDateString('es-ES')}</span>
                      </div>
                      {ejecucion.fechaFin && (
                        <div className="detalle-item">
                          <label>Finalizado:</label>
                          <span>{new Date(ejecucion.fechaFin).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Barra de progreso individual */}
              <div className="progreso-actividad">
                <div className="progress-bar small">
                  <div 
                    className="progress-fill"
                    style={{ width: `${porcentajeAvance}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {ejecucion?.actividadesCompletadas?.length || 0} de {actividad.actividades?.length || 0} actividades
                </div>
              </div>

              {/* Lista de actividades específicas */}
              <div className="actividades-especificas">
                <h5>Actividades a Realizar:</h5>
                <div className="lista-actividades">
                  {actividad.actividades?.map((act, idx) => {
                    const estaCompletada = ejecucion?.actividadesCompletadas?.includes(idx)
                    return (
                      <div key={idx} className={`actividad-item ${estaCompletada ? 'completada' : ''}`}>
                        <span className="actividad-descripcion">
                          {act.descripcionActividad || act.descripcion}
                        </span>
                        <span className="actividad-estado">
                          {estaCompletada ? '✅' : '⏳'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {ejecucion && ejecucion.observaciones && (
                <div className="observaciones-actividad">
                  <h5>Observaciones:</h5>
                  <p>{ejecucion.observaciones}</p>
                </div>
              )}

              <div className="actividad-actions">
                <button 
                  className="btn-primary"
                  onClick={() => onSeleccionarActividad(actividad)}
                >
                  {ejecucion ? 'Actualizar Ejecución' : 'Registrar Ejecución'}
                </button>
                
                {ejecucion && (
                  <button 
                    className="btn-secondary"
                    onClick={() => onVerReporte(actividad)}
                  >
                    Ver Reporte
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {actividadesFiltradas.length === 0 && (
        <div className="no-actividades">
          <div className="empty-icon">🔧</div>
          <h4>No hay actividades {filtroEstado !== 'todos' ? `con estado "${filtroEstado}"` : ''}</h4>
          <p>
            {filtroEstado === 'todos' 
              ? 'No hay actividades planificadas para este día.' 
              : `No hay actividades con el estado seleccionado.`}
          </p>
        </div>
      )}
    </div>
  )
}

export default ActividadEjecucion