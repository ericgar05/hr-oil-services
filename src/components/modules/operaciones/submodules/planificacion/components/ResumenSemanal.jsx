// src/components/modules/operaciones/submodules/planificacion/components/ResumenSemanal.jsx
import React from 'react'
import { useCurrency } from '../../../../../../contexts/CurrencyContext'
import { formatDate } from '../../../../../../utils/formatters'
import './ResumenSemanal.css'

const ResumenSemanal = ({ semana, planificacionData, presupuestoData }) => {
  const { formatCurrency } = useCurrency()
  
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

  // Calcular estadísticas
  const estadisticas = {
    totalEquipos: 0,
    totalDescripciones: 0,
    totalMonto: 0,
    diasPlanificados: 0,
    partidasUtilizadas: new Set(),
    requerimientos: Array.isArray(planificacionData.requerimientos) ? planificacionData.requerimientos : []
  }

  diasSemana.forEach(dia => {
    const actividades = Array.isArray(planificacionData[dia]) ? planificacionData[dia] : []
    if (actividades.length > 0) {
      estadisticas.diasPlanificados++
      estadisticas.totalEquipos += actividades.length
      estadisticas.totalMonto += actividades.reduce((sum, act) => sum + (act.montoTotal || 0), 0)
      estadisticas.totalDescripciones += actividades.reduce((sum, act) => sum + (act.actividades?.length || 0), 0)
      
      actividades.forEach(act => {
        if (act.partidaId) {
          estadisticas.partidasUtilizadas.add(act.partidaId)
        }
      })
    }
  })

  const totalRequerimientos = estadisticas.requerimientos.reduce((sum, req) => sum + (req.precioTotal || 0), 0)

  return (
    <div className="resumen-semanal">
      <div className="resumen-header">
        <h3>📊 Resumen Semanal - Semana {semana.numero}</h3>
        <div className="semana-rango">
          {formatDate(semana.inicio)} 
          {' - '}
          {formatDate(semana.fin)}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="resumen-cards">
        <div className="resumen-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <div className="card-value">{estadisticas.diasPlanificados}/7</div>
            <div className="card-label">Días Planificados</div>
          </div>
        </div>

        <div className="resumen-card">
          <div className="card-icon">🔧</div>
          <div className="card-content">
            <div className="card-value">{estadisticas.totalEquipos}</div>
            <div className="card-label">Total Equipos</div>
          </div>
        </div>

        <div className="resumen-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <div className="card-value">{estadisticas.totalDescripciones}</div>
            <div className="card-label">Total Actividades</div>
          </div>
        </div>

        <div className="resumen-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-value">
              {formatCurrency(estadisticas.totalMonto, 'USD')}
            </div>
            <div className="card-label">Monto Planificado</div>
          </div>
        </div>
      </div>

      {/* Detalle por día */}
      <div className="detalle-dias">
        <h4>Equipos y Actividades por Día</h4>
        <div className="dias-detalle">
          {diasSemana.map(dia => {
            const actividades = Array.isArray(planificacionData[dia]) ? planificacionData[dia] : []
            const totalDia = actividades.reduce((sum, act) => sum + (act.montoTotal || 0), 0)
            
            if (actividades.length === 0) return null

            return (
              <div key={dia} className="dia-detalle">
                <div className="dia-header">
                  <h5>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h5>
                  <span className="dia-stats">
                    {actividades.length} equipo(s) - {formatCurrency(totalDia, 'USD')}
                  </span>
                </div>
                
                <div className="equipos-detalle">
                  {actividades.map((act, index) => {
                    const partida = presupuestoData?.items?.find(item => item.id === act.partidaId)
                    return (
                      <div key={index} className="equipo-detalle">
                        <div className="equipo-info">
                          <div className="equipo-header">
                            <strong>{act.equipoTag}</strong>
                            <span className="equipo-monto">
                              {formatCurrency(act.montoTotal, partida?.moneda || 'USD')}
                            </span>
                          </div>
                          <div className="equipo-datos">
                            <span>Partida: {partida?.item || 'N/A'}</span>
                            <span>Cantidad: {act.cantidad} {act.unidad}</span>
                            <span>Precio Unit: {formatCurrency(act.montoUnitario, partida?.moneda || 'USD')}</span>
                            {act.valuacionEstimada && (
                              <span>Valuación: {act.valuacionEstimada}</span>
                            )}
                          </div>
                          <div className="actividades-list">
                            <strong>Actividades:</strong>
                            {act.actividades?.map((actividad, idx) => (
                              <div key={idx} className="actividad-item">
                                {idx + 1}. {actividad.descripcionActividad}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen de requerimientos */}
      {estadisticas.requerimientos.length > 0 && (
        <div className="resumen-requerimientos">
          <h4>🛠️ Requerimientos de la Semana</h4>
          <div className="requerimientos-detalle">
            <div className="requerimientos-table">
              <table>
                <thead>
                  <tr>
                    <th>Suministro</th>
                    <th>Categoría</th>
                    <th>Unidad</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Precio Total</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas.requerimientos.map((req, index) => (
                    <tr key={index}>
                      <td>{req.nombre}</td>
                      <td>
                        <span className="categoria-badge">{req.categoria}</span>
                      </td>
                      <td>{req.unidad}</td>
                      <td>{req.cantidad}</td>
                      <td>{formatCurrency(req.precioUnitario, 'USD')}</td>
                      <td>
                        <strong>{formatCurrency(req.precioTotal, 'USD')}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="requerimientos-total">
              <span>Total Requerimientos:</span>
              <span className="total-monto">
                {formatCurrency(totalRequerimientos, 'USD')}
              </span>
            </div>
          </div>
        </div>
      )}

      {estadisticas.totalEquipos === 0 && (
        <div className="no-data">
          <div className="empty-icon">📊</div>
          <h4>No hay equipos planificados para esta semana</h4>
          <p>Comienza a planificar los equipos y actividades para ver el resumen aquí.</p>
        </div>
      )}
    </div>
  )
}

export default ResumenSemanal