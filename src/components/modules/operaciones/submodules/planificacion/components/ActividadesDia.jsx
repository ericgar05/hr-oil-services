// src/components/modules/operaciones/submodules/planificacion/components/ActividadesDia.jsx
import React, { useState, useEffect } from 'react'
import { useCurrency } from '../../../../../../contexts/CurrencyContext'
import { formatDate } from '../../../../../../utils/formatters'
import { useProjects } from '../../../../../../contexts/ProjectContext'
import './ActividadesDia.css'

const ActividadesDia = ({ semana, dia, presupuestoData, actividadesExistentes, onGuardar, onCancelar }) => {
  const { formatCurrency } = useCurrency()
  const { selectedProject } = useProjects()
  const [actividades, setActividades] = useState(actividadesExistentes)
  const [nuevaActividad, setNuevaActividad] = useState({
    partidaId: '',
    equipoTag: '',
    unidad: '',
    cantidad: 1,
    montoUnitario: 0,
    montoTotal: 0,
    valuacionEstimada: '',
    actividades: [{
      id: Date.now().toString(),
      descripcionActividad: ''
    }]
  })
  const [editandoId, setEditandoId] = useState(null)
  const [actividadEdit, setActividadEdit] = useState(null)

  const diasSemana = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  useEffect(() => {
    // Calcular fecha del día seleccionado
    const fechaBase = new Date(semana.inicio)
    const diaIndex = Object.keys(diasSemana).indexOf(dia)
    fechaBase.setDate(fechaBase.getDate() + diaIndex)
    
    setNuevaActividad(prev => ({
      ...prev,
      fechaInicio: fechaBase.toISOString().split('T')[0]
    }))
  }, [semana, dia])

  // Verificar si el equipo ya existe para la misma partida
  const equipoYaExiste = (partidaId, equipoTag) => {
    return actividades.some(act => 
      act.partidaId === partidaId && 
      act.equipoTag.toLowerCase() === equipoTag.toLowerCase()
    )
  }

  // Agregar nueva descripción de actividad
  const handleAgregarDescripcionActividad = () => {
    setNuevaActividad(prev => ({
      ...prev,
      actividades: [
        ...prev.actividades,
        {
          id: Date.now().toString(),
          descripcionActividad: ''
        }
      ]
    }))
  }

  // Eliminar descripción de actividad
  const handleEliminarDescripcionActividad = (actividadId) => {
    if (nuevaActividad.actividades.length <= 1) {
      alert('Debe haber al menos una actividad descrita')
      return
    }
    
    setNuevaActividad(prev => ({
      ...prev,
      actividades: prev.actividades.filter(act => act.id !== actividadId)
    }))
  }

  // Actualizar descripción específica
  const handleCambioDescripcionActividad = (actividadId, descripcion) => {
    setNuevaActividad(prev => ({
      ...prev,
      actividades: prev.actividades.map(act => 
        act.id === actividadId 
          ? { ...act, descripcionActividad: descripcion }
          : act
      )
    }))
  }

  const handleAgregarActividad = () => {
    if (!validarActividad()) return

    // Verificar si el equipo ya existe para esta partida
    if (equipoYaExiste(nuevaActividad.partidaId, nuevaActividad.equipoTag)) {
      alert(`❌ El equipo "${nuevaActividad.equipoTag}" ya está registrado para esta partida. No se puede duplicar.`)
      return
    }

    const actividadCompleta = {
      id: Date.now().toString(),
      projectId: selectedProject?.id,
      semanaId: semana.id,
      dia: dia,
      ...nuevaActividad,
      // Filtrar actividades que tengan descripción
      actividades: nuevaActividad.actividades.filter(act => act.descripcionActividad.trim() !== '')
    }

    setActividades(prev => [...prev, actividadCompleta])
    resetearFormulario()
  }

  const handleEditarActividad = () => {
    if (!validarActividad()) return

    // Verificar si otro equipo ya existe para esta partida (excluyendo el actual en edición)
    const otroEquipoExiste = actividades.some(act => 
      act.id !== editandoId &&
      act.partidaId === nuevaActividad.partidaId && 
      act.equipoTag.toLowerCase() === nuevaActividad.equipoTag.toLowerCase()
    )

    if (otroEquipoExiste) {
      alert(`❌ El equipo "${nuevaActividad.equipoTag}" ya está registrado para esta partida. No se puede duplicar.`)
      return
    }

    const actividadActualizada = {
      ...actividadEdit,
      ...nuevaActividad,
      actividades: nuevaActividad.actividades.filter(act => act.descripcionActividad.trim() !== '')
    }

    setActividades(prev => prev.map(act => 
      act.id === editandoId ? actividadActualizada : act
    ))
    
    setEditandoId(null)
    setActividadEdit(null)
    resetearFormulario()
  }

  const handleIniciarEdicion = (actividad) => {
    setEditandoId(actividad.id)
    setActividadEdit(actividad)
    setNuevaActividad({
      partidaId: actividad.partidaId,
      equipoTag: actividad.equipoTag,
      unidad: actividad.unidad,
      cantidad: actividad.cantidad,
      montoUnitario: actividad.montoUnitario,
      montoTotal: actividad.montoTotal,
      valuacionEstimada: actividad.valuacionEstimada,
      actividades: actividad.actividades.length > 0 ? actividad.actividades : [{
        id: Date.now().toString(),
        descripcionActividad: ''
      }]
    })
  }

  const handleCancelarEdicion = () => {
    setEditandoId(null)
    setActividadEdit(null)
    resetearFormulario()
  }

  const handleEliminarActividad = (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este equipo y todas sus actividades?')) {
      return
    }
    setActividades(prev => prev.filter(act => act.id !== id))
  }

  const resetearFormulario = () => {
    setNuevaActividad({
      partidaId: '',
      equipoTag: '',
      unidad: '',
      cantidad: 1,
      montoUnitario: 0,
      montoTotal: 0,
      valuacionEstimada: '',
      actividades: [{
        id: Date.now().toString(),
        descripcionActividad: ''
      }]
    })
  }

  const handleCambioPartida = (partidaId) => {
    const partida = presupuestoData.items.find(item => item.id === partidaId)
    if (partida) {
      setNuevaActividad(prev => ({
        ...prev,
        partidaId,
        unidad: partida.unidad,
        montoUnitario: partida.precioUnitario,
        montoTotal: prev.cantidad * partida.precioUnitario
      }))
    }
  }

  const handleCambioCantidad = (cantidad) => {
    setNuevaActividad(prev => ({
      ...prev,
      cantidad: parseFloat(cantidad) || 0,
      montoTotal: (parseFloat(cantidad) || 0) * prev.montoUnitario
    }))
  }

  const handleCambioValuacion = (valuacion) => {
    setNuevaActividad(prev => ({
      ...prev,
      valuacionEstimada: valuacion
    }))
  }

  const validarActividad = () => {
    if (!nuevaActividad.partidaId) {
      alert('Selecciona una partida del presupuesto')
      return false
    }
    if (!nuevaActividad.equipoTag.trim()) {
      alert('Ingresa el TAG o serial del equipo')
      return false
    }
    if (nuevaActividad.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return false
    }
    
    // Validar que al menos una actividad tenga descripción
    const actividadesValidas = nuevaActividad.actividades.filter(act => 
      act.descripcionActividad.trim() !== ''
    )
    if (actividadesValidas.length === 0) {
      alert('Debe haber al menos una actividad con descripción')
      return false
    }
    
    return true
  }

  const handleGuardar = () => {
    const actividadesConProjectId = actividades.map(act => ({
      ...act,
      projectId: selectedProject?.id,
      semanaId: semana.id
    }))
    onGuardar(dia, actividadesConProjectId)
  }

  const getPartidaSeleccionada = () => {
    return presupuestoData.items.find(item => item.id === nuevaActividad.partidaId)
  }

  const totalMonto = actividades.reduce((sum, act) => sum + act.montoTotal, 0)

  return (
    <div className="actividades-dia">
      <div className="actividades-header">
        <button className="back-button" onClick={onCancelar}>
          ← Volver a Días
        </button>
        <h3>Actividades - {diasSemana[dia]}</h3>
        <div className="fecha-dia">
          {formatDate(semana.inicio)}
        </div>
        <div className="project-info">
          <small>Proyecto: {selectedProject?.name} (ID: {selectedProject?.id})</small>
        </div>
      </div>

      {/* Formulario para agregar/editar equipo con actividades */}
      <div className="agregar-actividad">
        <h4>{editandoId ? 'Editar Equipo y Actividades' : 'Agregar Nuevo Equipo con Actividades'}</h4>
        <div className="actividad-form">
          {/* Información fija del equipo */}
          <div className="seccion-equipo">
            <h5>Información del Equipo</h5>
            <div className="form-row">
              <div className="form-group">
                <label>Partida del Presupuesto *</label>
                <select
                  value={nuevaActividad.partidaId}
                  onChange={(e) => handleCambioPartida(e.target.value)}
                >
                  <option value="">Seleccionar partida...</option>
                  {presupuestoData.items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.item} - {item.descripcion.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>TAG/Serial del Equipo *</label>
                <input
                  type="text"
                  value={nuevaActividad.equipoTag}
                  onChange={(e) => setNuevaActividad(prev => ({ 
                    ...prev, 
                    equipoTag: e.target.value 
                  }))}
                  placeholder="Ej: V-001, P-123, etc."
                />
                {nuevaActividad.partidaId && nuevaActividad.equipoTag && 
                 equipoYaExiste(nuevaActividad.partidaId, nuevaActividad.equipoTag) && (
                  <small className="error-text">
                    ⚠️ Este equipo ya está registrado para esta partida
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Unidad</label>
                <input
                  type="text"
                  value={nuevaActividad.unidad}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cantidad *</label>
                <input
                  type="number"
                  value={nuevaActividad.cantidad}
                  onChange={(e) => handleCambioCantidad(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Precio Unitario</label>
                <input
                  type="number"
                  value={nuevaActividad.montoUnitario}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Monto Total</label>
                <div className="monto-total">
                  {formatCurrency(nuevaActividad.montoTotal, getPartidaSeleccionada()?.moneda || 'USD')}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Valuación Estimada</label>
              <input
                type="text"
                value={nuevaActividad.valuacionEstimada}
                onChange={(e) => handleCambioValuacion(e.target.value)}
                placeholder="Ej: VALUACIÓN 1, VALUACIÓN 2, etc."
              />
            </div>
          </div>

          {/* Lista de descripciones de actividades */}
          <div className="seccion-actividades">
            <div className="actividades-header">
              <h5>Descripciones de Actividades ({nuevaActividad.actividades.length})</h5>
              <button 
                type="button"
                className="btn-outline small"
                onClick={handleAgregarDescripcionActividad}
              >
                ➕ Agregar Descripción
              </button>
            </div>

            {nuevaActividad.actividades.map((actividad, index) => (
              <div key={actividad.id} className="actividad-desc-item">
                <div className="descripcion-header">
                  <h6>Actividad {index + 1}</h6>
                  {nuevaActividad.actividades.length > 1 && (
                    <button
                      type="button"
                      className="btn-delete small"
                      onClick={() => handleEliminarDescripcionActividad(actividad.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Descripción de la Actividad</label>
                  <textarea
                    value={actividad.descripcionActividad}
                    onChange={(e) => handleCambioDescripcionActividad(actividad.id, e.target.value)}
                    placeholder="Describe detalladamente la actividad a realizar..."
                    rows="2"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            {editandoId ? (
              <>
                <button 
                  className="btn-primary"
                  onClick={handleEditarActividad}
                >
                  💾 Guardar Cambios
                </button>
                <button 
                  className="btn-outline"
                  onClick={handleCancelarEdicion}
                >
                  ❌ Cancelar Edición
                </button>
              </>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleAgregarActividad}
                disabled={!nuevaActividad.partidaId || !nuevaActividad.equipoTag}
              >
                ➕ Agregar Equipo con Actividades
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de equipos con actividades agregadas */}
      {actividades.length > 0 && (
        <div className="lista-actividades">
          <h4>Equipos con Actividades Planificadas ({actividades.length})</h4>
          <div className="actividades-table">
            <table>
              <thead>
                <tr>
                  <th>EQUIPO</th>
                  <th>PARTIDA</th>
                  <th>ACTIVIDADES</th>
                  <th>UNIDAD</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO UNIT.</th>
                  <th>MONTO TOTAL</th>
                  <th>VALUACIÓN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map(actividad => {
                  const partida = presupuestoData.items.find(item => item.id === actividad.partidaId)
                  
                  return (
                    <tr key={actividad.id}>
                      <td className="col-equipo">
                        <strong>{actividad.equipoTag}</strong>
                      </td>
                      <td className="col-partida">
                        <div>
                          <strong>{partida?.item}</strong>
                        </div>
                        <div className="partida-desc">
                          {partida?.descripcion?.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="col-actividades">
                        <div className="actividades-list">
                          {actividad.actividades.map((act, idx) => (
                            <div key={idx} className="actividad-desc">
                              <span className="actividad-num">{idx + 1}.</span>
                              {act.descripcionActividad}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="col-unidad">
                        {actividad.unidad}
                      </td>
                      <td className="col-cantidad">
                        {actividad.cantidad.toLocaleString('es-VE')}
                      </td>
                      <td className="col-precio">
                        {formatCurrency(actividad.montoUnitario, partida?.moneda || 'USD')}
                      </td>
                      <td className="col-monto">
                        <strong>
                          {formatCurrency(actividad.montoTotal, partida?.moneda || 'USD')}
                        </strong>
                      </td>
                      <td className="col-valuacion">
                        {actividad.valuacionEstimada || 'N/A'}
                      </td>
                      <td className="col-acciones">
                        <button
                          className="btn-edit"
                          onClick={() => handleIniciarEdicion(actividad)}
                          title="Editar equipo y actividades"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleEliminarActividad(actividad.id)}
                          title="Eliminar equipo y actividades"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="resumen-actividades">
            <div className="resumen-total">
              <span>Total Planificado:</span>
              <span className="total-monto">
                {formatCurrency(totalMonto, 'USD')}
              </span>
            </div>
            <div className="resumen-detalle">
              <small>
                {actividades.length} equipo(s) - {
                  actividades.reduce((sum, act) => sum + act.actividades.length, 0)
                } actividad(es)
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Acciones finales */}
      <div className="actividades-actions">
        <button 
          className="btn-primary large"
          onClick={handleGuardar}
        >
          💾 Guardar Actividades
        </button>
        <button className="btn-outline" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default ActividadesDia