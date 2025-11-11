// src/components/modules/operaciones/submodules/ejecucion/components/ReporteEjecucion.jsx
import React, { useState, useEffect } from 'react'
import { useCurrency } from '../../../../../../contexts/CurrencyContext'

const ReporteEjecucion = ({ 
  semana, 
  dia, 
  actividad, 
  ejecucionExistente, 
  nominaData, 
  inventarioData, 
  onGuardar, 
  onCancelar 
}) => {
  const { formatCurrency } = useCurrency()
  
  const [formData, setFormData] = useState({
    estado: 'en-progreso',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    trabajadores: [],
    materiales: [],
    observaciones: '',
    actividadesCompletadas: [],
    reprogramacion: {
      requiereReprogramacion: false,
      fechaReprogramacion: '',
      motivo: ''
    },
    historialObservaciones: []
  })

  useEffect(() => {
    if (ejecucionExistente) {
      setFormData({
        ...ejecucionExistente,
        fechaInicio: ejecucionExistente.fechaInicio?.split('T')[0] || new Date().toISOString().split('T')[0],
        fechaFin: ejecucionExistente.fechaFin?.split('T')[0] || '',
        reprogramacion: ejecucionExistente.reprogramacion || {
          requiereReprogramacion: false,
          fechaReprogramacion: '',
          motivo: ''
        },
        historialObservaciones: ejecucionExistente.historialObservaciones || []
      })
    }
  }, [ejecucionExistente])

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  const handleTrabajadorChange = (trabajadorId, isChecked) => {
    setFormData(prev => ({
      ...prev,
      trabajadores: isChecked 
        ? [...prev.trabajadores, trabajadorId]
        : prev.trabajadores.filter(id => id !== trabajadorId)
    }))
  }

  const handleMaterialChange = (materialId, cantidad) => {
    setFormData(prev => ({
      ...prev,
      materiales: prev.materiales.map(mat => 
        mat.id === materialId ? { ...mat, cantidadUtilizada: cantidad } : mat
      ).filter(mat => mat.cantidadUtilizada > 0)
    }))
  }

  const handleAgregarMaterial = (material) => {
    if (!formData.materiales.find(mat => mat.id === material.id)) {
      setFormData(prev => ({
        ...prev,
        materiales: [...prev.materiales, {
          ...material,
          cantidadUtilizada: 0
        }]
      }))
    }
  }

  const handleActividadCompletada = (actividadIndex, isChecked) => {
    const nuevasActividadesCompletadas = isChecked 
      ? [...formData.actividadesCompletadas, actividadIndex]
      : formData.actividadesCompletadas.filter(index => index !== actividadIndex)

    // Calcular nuevo estado basado en actividades completadas
    const totalActividades = actividad.actividades?.length || 0
    const porcentajeCompletado = totalActividades > 0 ? 
      (nuevasActividadesCompletadas.length / totalActividades) * 100 : 0

    let nuevoEstado = formData.estado
    
    if (porcentajeCompletado === 100) {
      nuevoEstado = 'completado'
    } else if (porcentajeCompletado > 0) {
      nuevoEstado = 'en-progreso'
    } else {
      nuevoEstado = 'pendiente'
    }

    setFormData(prev => ({
      ...prev,
      actividadesCompletadas: nuevasActividadesCompletadas,
      estado: nuevoEstado
    }))
  }

  const handleAgregarObservacion = () => {
    if (!formData.observaciones.trim()) return

    const nuevaObservacion = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      observacion: formData.observaciones,
      usuario: 'Usuario Actual' // En una app real, esto vendría del contexto de autenticación
    }

    setFormData(prev => ({
      ...prev,
      historialObservaciones: [...prev.historialObservaciones, nuevaObservacion],
      observaciones: '' // Limpiar el campo después de agregar
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validaciones
    if (formData.estado === 'completado' && formData.actividadesCompletadas.length === 0) {
      alert('Debe marcar al menos una actividad como completada antes de finalizar.')
      return
    }

    if (formData.reprogramacion.requiereReprogramacion && !formData.reprogramacion.motivo) {
      alert('Debe especificar el motivo de la reprogramación.')
      return
    }

    // Si hay observación actual sin agregar al historial, agregarla
    let datosFinales = { ...formData }
    if (formData.observaciones.trim()) {
      const observacionActual = {
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        observacion: formData.observaciones,
        usuario: 'Usuario Actual'
      }
      datosFinales.historialObservaciones = [...formData.historialObservaciones, observacionActual]
      datosFinales.observaciones = ''
    }

    // Calcular monto ejecutado basado en actividades completadas
    const totalActividades = actividad.actividades?.length || 0
    const actividadesCompletadas = datosFinales.actividadesCompletadas.length
    const porcentajeEjecucion = totalActividades > 0 ? (actividadesCompletadas / totalActividades) * 100 : 0
    const montoEjecutado = (actividad.montoTotal * porcentajeEjecucion) / 100

    const datosEjecucion = {
      ...datosFinales,
      fechaEjecucion: new Date().toISOString(),
      projectId: actividad.projectId,
      semanaId: semana.id,
      dia: dia,
      equipoTag: actividad.equipoTag,
      partidaId: actividad.partidaId,
      porcentajeAvance: porcentajeEjecucion,
      montoEjecutado: montoEjecutado,
      // Si está completado y no tiene fecha fin, agregarla
      fechaFin: datosFinales.estado === 'completado' && !datosFinales.fechaFin ? 
        new Date().toISOString().split('T')[0] : datosFinales.fechaFin
    }

    onGuardar(actividad.id, datosEjecucion)
  }

  const trabajadoresDisponibles = nominaData.filter(t => t.estado === 'activo')
  const materialesDisponibles = inventarioData.filter(mat => mat.stock > 0)

  const porcentajeAvance = actividad.actividades?.length > 0 ? 
    (formData.actividadesCompletadas.length / actividad.actividades.length) * 100 : 0

  return (
    <div className="reporte-ejecucion">
      <div className="reporte-header">
        <h3>Registro de Ejecución</h3>
        <div className="actividad-info">
          <h4>{actividad.equipoTag}</h4>
          <span className="partida-codigo">{actividad.partidaId}</span>
          <span className="fecha-ejecucion">
            {diasSemana[dia]} - Semana {semana.numero}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-ejecucion">
        {/* Estado de la ejecución */}
        <div className="form-section">
          <h4>Estado de la Ejecución</h4>
          <div className="estado-info">
            <div className="avance-actual">
              <span>Avance Actual: <strong>{porcentajeAvance.toFixed(1)}%</strong></span>
              <span>{formData.actividadesCompletadas.length} de {actividad.actividades?.length || 0} actividades</span>
            </div>
          </div>
          <div className="estado-options">
            <label className="radio-option">
              <input
                type="radio"
                name="estado"
                value="en-progreso"
                checked={formData.estado === 'en-progreso'}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
              />
              <span className="radio-label">
                <span className="estado-icon">🟡</span>
                En Progreso
              </span>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="estado"
                value="completado"
                checked={formData.estado === 'completado'}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
              />
              <span className="radio-label">
                <span className="estado-icon">✅</span>
                Completado
              </span>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="estado"
                value="reprogramado"
                checked={formData.estado === 'reprogramado'}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
              />
              <span className="radio-label">
                <span className="estado-icon">🔄</span>
                Reprogramado
              </span>
            </label>
          </div>
        </div>

        {/* Fechas */}
        <div className="form-section">
          <h4>Fechas de Ejecución</h4>
          <div className="fechas-grid">
            <div className="input-group">
              <label>Fecha de Inicio *</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                required
              />
            </div>
            
            {(formData.estado === 'completado' || porcentajeAvance === 100) && (
              <div className="input-group">
                <label>Fecha de Finalización *</label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Actividades específicas */}
        <div className="form-section">
          <h4>Actividades a Realizar ({formData.actividadesCompletadas.length}/{actividad.actividades?.length || 0})</h4>
          <div className="actividades-lista">
            {actividad.actividades?.map((act, index) => (
              <label key={index} className="actividad-checkbox">
                <input
                  type="checkbox"
                  checked={formData.actividadesCompletadas.includes(index)}
                  onChange={(e) => handleActividadCompletada(index, e.target.checked)}
                />
                <span className="checkmark"></span>
                <div className="actividad-info">
                  <span className="actividad-descripcion">
                    {act.descripcionActividad || act.descripcion}
                  </span>
                  <span className="actividad-cantidad">{act.cantidad} {act.unidad}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Trabajadores involucrados */}
        <div className="form-section">
          <h4>Trabajadores Involucrados</h4>
          <div className="trabajadores-grid">
            {trabajadoresDisponibles.map(trabajador => (
              <label key={trabajador.id} className="trabajador-checkbox">
                <input
                  type="checkbox"
                  checked={formData.trabajadores.includes(trabajador.id)}
                  onChange={(e) => handleTrabajadorChange(trabajador.id, e.target.checked)}
                />
                <span className="checkmark"></span>
                <div className="trabajador-info">
                  <span className="trabajador-nombre">{trabajador.nombre}</span>
                  <span className="trabajador-cargo">{trabajador.cargo}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Materiales utilizados */}
        <div className="form-section">
          <h4>Materiales Utilizados</h4>
          
          <div className="material-selector">
            <label>Agregar Material:</label>
            <select 
              onChange={(e) => {
                const materialId = e.target.value
                if (materialId) {
                  const material = materialesDisponibles.find(mat => mat.id === materialId)
                  if (material) handleAgregarMaterial(material)
                  e.target.value = ''
                }
              }}
            >
              <option value="">Seleccionar material...</option>
              {materialesDisponibles.map(material => (
                <option key={material.id} value={material.id}>
                  {material.nombre} (Stock: {material.stock} {material.unidad})
                </option>
              ))}
            </select>
          </div>

          <div className="materiales-lista">
            {formData.materiales.map(material => (
              <div key={material.id} className="material-item">
                <div className="material-info">
                  <span className="material-nombre">{material.nombre}</span>
                  <span className="material-stock">
                    Stock: {material.stock} {material.unidad}
                  </span>
                </div>
                <div className="material-cantidad">
                  <label>Cantidad utilizada:</label>
                  <input
                    type="number"
                    min="0"
                    max={material.stock}
                    value={material.cantidadUtilizada}
                    onChange={(e) => handleMaterialChange(material.id, parseInt(e.target.value) || 0)}
                  />
                  <span className="material-unidad">{material.unidad}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observaciones del día */}
        <div className="form-section">
          <h4>Observaciones del Día</h4>
          <div className="observacion-actual">
            <div className="input-group">
              <label>Nueva Observación:</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                placeholder="Describa las observaciones de hoy para esta actividad..."
                rows="3"
              />
            </div>
            <button 
              type="button"
              className="btn-outline"
              onClick={handleAgregarObservacion}
              disabled={!formData.observaciones.trim()}
            >
              ➕ Agregar al Historial
            </button>
          </div>

          {/* Historial de observaciones */}
          {formData.historialObservaciones.length > 0 && (
            <div className="historial-observaciones">
              <h5>Historial de Observaciones:</h5>
              <div className="observaciones-lista">
                {formData.historialObservaciones.map(obs => (
                  <div key={obs.id} className="observacion-item">
                    <div className="observacion-header">
                      <span className="observacion-fecha">
                        {new Date(obs.fecha).toLocaleDateString('es-ES')}
                      </span>
                      <span className="observacion-usuario">{obs.usuario}</span>
                    </div>
                    <div className="observacion-texto">
                      {obs.observacion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reprogramación */}
        {formData.estado === 'reprogramado' && (
          <div className="form-section reprogramacion-section">
            <h4>Información de Reprogramación</h4>
            <div className="input-group">
              <label>Motivo de Reprogramación *</label>
              <textarea
                value={formData.reprogramacion.motivo}
                onChange={(e) => setFormData({
                  ...formData, 
                  reprogramacion: {...formData.reprogramacion, motivo: e.target.value}
                })}
                placeholder="Describa el motivo por el cual se reprograma la actividad..."
                required
                rows="3"
              />
            </div>
            <div className="input-group">
              <label>Fecha de Reprogramación</label>
              <input
                type="date"
                value={formData.reprogramacion.fechaReprogramacion}
                onChange={(e) => setFormData({
                  ...formData, 
                  reprogramacion: {...formData.reprogramacion, fechaReprogramacion: e.target.value}
                })}
              />
            </div>
          </div>
        )}

        {/* Resumen de la actividad */}
        <div className="form-section resumen-section">
          <h4>Resumen de la Actividad</h4>
          <div className="resumen-grid">
            <div className="resumen-item">
              <label>Equipo:</label>
              <span>{actividad.equipoTag}</span>
            </div>
            <div className="resumen-item">
              <label>Partida:</label>
              <span>{actividad.partidaId}</span>
            </div>
            <div className="resumen-item">
              <label>Cantidad Planificada:</label>
              <span>{actividad.cantidad} {actividad.unidad}</span>
            </div>
            <div className="resumen-item">
              <label>Monto Planificado:</label>
              <span>{formatCurrency(actividad.montoTotal, 'USD')}</span>
            </div>
            <div className="resumen-item">
              <label>Monto Ejecutado:</label>
              <span>{formatCurrency((actividad.montoTotal * porcentajeAvance) / 100, 'USD')}</span>
            </div>
            <div className="resumen-item">
              <label>Avance Físico:</label>
              <span>{porcentajeAvance.toFixed(1)}%</span>
            </div>
            <div className="resumen-item">
              <label>Trabajadores Asignados:</label>
              <span>{formData.trabajadores.length}</span>
            </div>
            <div className="resumen-item">
              <label>Materiales Utilizados:</label>
              <span>{formData.materiales.length}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            {ejecucionExistente ? 'Actualizar Ejecución' : 'Guardar Ejecución'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReporteEjecucion