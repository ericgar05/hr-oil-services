// src/components/modules/operaciones/submodules/ejecucion/components/ResumenEjecucion.jsx
import React from 'react'
import { useCurrency } from '../../../../../../contexts/CurrencyContext'
import '../EjecucionMain.css'
const ResumenEjecucion = ({ semana, planificacionData, ejecucionData }) => {
  const { formatCurrency } = useCurrency()

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

  // Calcular estadísticas generales
  const getEstadisticasGenerales = () => {
    let totalActividades = 0
    let actividadesCompletadas = 0
    let actividadesEnProgreso = 0
    let actividadesReprogramadas = 0
    let montoEjecutado = 0
    let montoPlanificado = 0

    diasSemana.forEach(dia => {
      const actividadesDia = planificacionData[dia] || []
      const ejecucionDia = ejecucionData[dia] || {}

      actividadesDia.forEach(actividad => {
        totalActividades++
        montoPlanificado += actividad.montoTotal || 0

        const ejecucion = ejecucionDia[actividad.id]
        if (ejecucion) {
          if (ejecucion.estado === 'completado') {
            actividadesCompletadas++
            montoEjecutado += actividad.montoTotal || 0
          } else if (ejecucion.estado === 'en-progreso') {
            actividadesEnProgreso++
          } else if (ejecucion.estado === 'reprogramado') {
            actividadesReprogramadas++
          }
        }
      })
    })

    const actividadesPendientes = totalActividades - actividadesCompletadas - actividadesEnProgreso - actividadesReprogramadas
    const porcentajeAvance = totalActividades > 0 ? (actividadesCompletadas / totalActividades) * 100 : 0
    const porcentajeEjecucionPresupuesto = montoPlanificado > 0 ? (montoEjecutado / montoPlanificado) * 100 : 0

    return {
      totalActividades,
      actividadesCompletadas,
      actividadesEnProgreso,
      actividadesReprogramadas,
      actividadesPendientes,
      porcentajeAvance,
      montoPlanificado,
      montoEjecutado,
      porcentajeEjecucionPresupuesto
    }
  }

  const stats = getEstadisticasGenerales()

  // Obtener actividades por estado
  const getActividadesPorEstado = () => {
    const actividades = []

    diasSemana.forEach(dia => {
      const actividadesDia = planificacionData[dia] || []
      const ejecucionDia = ejecucionData[dia] || {}

      actividadesDia.forEach(actividad => {
        const ejecucion = ejecucionDia[actividad.id]
        const estado = ejecucion?.estado || 'pendiente'
        
        actividades.push({
          ...actividad,
          dia,
          estado,
          ejecucion
        })
      })
    })

    return actividades
  }

  const actividades = getActividadesPorEstado()

  return (
    <div className="resumen-ejecucion">
      <div className="resumen-header">
        <h3>Resumen de Ejecución - Semana {semana.numero}</h3>
        <div className="semana-rango">
          {new Date(semana.inicio).toLocaleDateString('es-ES')} - {new Date(semana.fin).toLocaleDateString('es-ES')}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="resumen-cards">
        <div className="resumen-card total">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <div className="card-value">{stats.totalActividades}</div>
            <div className="card-label">Total Actividades</div>
          </div>
        </div>

        <div className="resumen-card completado">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-value">{stats.actividadesCompletadas}</div>
            <div className="card-label">Completadas</div>
          </div>
        </div>

        <div className="resumen-card progreso">
          <div className="card-icon">🟡</div>
          <div className="card-content">
            <div className="card-value">{stats.actividadesEnProgreso}</div>
            <div className="card-label">En Progreso</div>
          </div>
        </div>

        <div className="resumen-card pendiente">
          <div className="card-icon">⏳</div>
          <div className="card-content">
            <div className="card-value">{stats.actividadesPendientes}</div>
            <div className="card-label">Pendientes</div>
          </div>
        </div>

        <div className="resumen-card reprogramado">
          <div className="card-icon">🔄</div>
          <div className="card-content">
            <div className="card-value">{stats.actividadesReprogramadas}</div>
            <div className="card-label">Reprogramadas</div>
          </div>
        </div>
      </div>

      {/* Barras de progreso */}
      <div className="progress-sections">
        <div className="progress-section">
          <div className="progress-header">
            <h4>Avance Físico</h4>
            <span>{stats.porcentajeAvance.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill fisico"
              style={{ width: `${stats.porcentajeAvance}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span>{stats.actividadesCompletadas} de {stats.totalActividades} actividades</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <h4>Ejecución Presupuestaria</h4>
            <span>{stats.porcentajeEjecucionPresupuesto.toFixed(1)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill presupuesto"
              style={{ width: `${stats.porcentajeEjecucionPresupuesto}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span>{formatCurrency(stats.montoEjecutado, 'USD')} de {formatCurrency(stats.montoPlanificado, 'USD')}</span>
          </div>
        </div>
      </div>

      {/* Detalle por día */}
      <div className="detalle-dias">
        <h4>Detalle por Día</h4>
        <div className="dias-grid">
          {diasSemana.map(dia => {
            const actividadesDia = planificacionData[dia] || []
            const ejecucionDia = ejecucionData[dia] || {}
            
            const totalDia = actividadesDia.length
            const completadasDia = actividadesDia.filter(act => 
              ejecucionDia[act.id]?.estado === 'completado'
            ).length
            const enProgresoDia = actividadesDia.filter(act => 
              ejecucionDia[act.id]?.estado === 'en-progreso'
            ).length
            const porcentajeDia = totalDia > 0 ? (completadasDia / totalDia) * 100 : 0

            return (
              <div key={dia} className="dia-resumen-card">
                <div className="dia-header">
                  <h5>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h5>
                  <span className={`estado-dia ${totalDia === 0 ? 'sin-actividades' : completadasDia === totalDia ? 'completo' : 'parcial'}`}>
                    {totalDia === 0 ? '🔵' : completadasDia === totalDia ? '✅' : '🟡'}
                  </span>
                </div>
                
                <div className="dia-stats">
                  <div className="stat">
                    <span className="stat-value">{totalDia}</span>
                    <span className="stat-label">Planif.</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{completadasDia}</span>
                    <span className="stat-label">Compl.</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{enProgresoDia}</span>
                    <span className="stat-label">Prog.</span>
                  </div>
                </div>

                <div className="dia-progress">
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill"
                      style={{ width: `${porcentajeDia}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{porcentajeDia.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista de actividades con problemas */}
      <div className="actividades-problemas">
        <h4>Actividades con Observaciones</h4>
        <div className="problemas-lista">
          {actividades
            .filter(act => act.ejecucion?.observaciones || act.ejecucion?.estado === 'reprogramado')
            .map((act, index) => (
              <div key={index} className="problema-card">
                <div className="problema-header">
                  <span className="equipo-tag">{act.equipoTag}</span>
                  <span className={`estado-badge ${act.estado}`}>
                    {act.estado === 'reprogramado' ? '🔄 Reprogramado' : '📝 Con Observaciones'}
                  </span>
                </div>
                <div className="problema-info">
                  <span className="problema-dia">{act.dia}</span>
                  <span className="problema-partida">{act.partidaId}</span>
                </div>
                {act.ejecucion?.observaciones && (
                  <div className="problema-observacion">
                    <strong>Observación:</strong> {act.ejecucion.observaciones}
                  </div>
                )}
                {act.ejecucion?.reprogramacion?.motivo && (
                  <div className="problema-reprogramacion">
                    <strong>Motivo reprogramación:</strong> {act.ejecucion.reprogramacion.motivo}
                  </div>
                )}
              </div>
            ))}
        </div>

        {actividades.filter(act => act.ejecucion?.observaciones || act.ejecucion?.estado === 'reprogramado').length === 0 && (
          <div className="sin-problemas">
            <div className="success-icon">✅</div>
            <p>No hay actividades con observaciones o reprogramaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumenEjecucion