// src/components/modules/operaciones/submodules/planificacion/components/RequerimientosSemana.jsx
import React, { useState, useEffect } from 'react'
import { useCurrency } from '../../../../../../contexts/CurrencyContext'
import { usePlanificacion } from '../../../../../../contexts/PlanificacionContext'
import './RequerimientosSemana.css'

const RequerimientosSemana = ({ semana, requerimientosExistentes, onGuardar }) => {
  const { formatCurrency } = useCurrency()
  const { saveRequerimiento, deleteRequerimiento } = usePlanificacion()
  const [requerimientos, setRequerimientos] = useState(requerimientosExistentes)
  const [nuevoRequerimiento, setNuevoRequerimiento] = useState({
    nombre: '',
    categoria: '',
    unidad: '',
    cantidad: 1,
    precioUnitario: 0,
    precioTotal: 0,
    prioridad: 'media',
    observaciones: ''
  })
  const [editandoId, setEditandoId] = useState(null)
  const [requerimientoEdit, setRequerimientoEdit] = useState(null)

  const categorias = [
    'Materiales',
    'Repuestos',
    'Herramientas',
    'Equipos',
    'Suministros',
    'Insumos',
    'EPP'
  ]

  const unidades = ['UNIDAD', 'KG', 'LTS', 'M2', 'M3', 'ML', 'ROLLO', 'CAJA', 'PAR']
  const prioridades = [
    { value: 'baja', label: '🟢 Baja' },
    { value: 'media', label: '🟡 Media' },
    { value: 'alta', label: '🟠 Alta' },
    { value: 'urgente', label: '🔴 Urgente' }
  ]

  useEffect(() => {
    setRequerimientos(requerimientosExistentes)
  }, [requerimientosExistentes])

  const handleAgregarRequerimiento = async () => {
    if (!validarRequerimiento()) return

    try {
      const requerimientoCompleto = {
        ...nuevoRequerimiento,
        semanaNumero: semana.numero,
        precioTotal: nuevoRequerimiento.cantidad * nuevoRequerimiento.precioUnitario,
        estado: 'pendiente'
      }

      const requerimientoGuardado = await saveRequerimiento(requerimientoCompleto)
      
      setRequerimientos(prev => [...prev, requerimientoGuardado])
      resetearFormulario()
      
    } catch (error) {
      alert('❌ Error al guardar requerimiento: ' + error.message)
    }
  }

  const handleEditarRequerimiento = async () => {
    if (!validarRequerimiento()) return

    try {
      const requerimientoActualizado = {
        ...requerimientoEdit,
        ...nuevoRequerimiento,
        precioTotal: nuevoRequerimiento.cantidad * nuevoRequerimiento.precioUnitario
      }

      await saveRequerimiento(requerimientoActualizado)
      
      setRequerimientos(prev => prev.map(req => 
        req.id === editandoId ? requerimientoActualizado : req
      ))
      
      setEditandoId(null)
      setRequerimientoEdit(null)
      resetearFormulario()
      
    } catch (error) {
      alert('❌ Error al actualizar requerimiento: ' + error.message)
    }
  }

  const handleIniciarEdicion = (requerimiento) => {
    setEditandoId(requerimiento.id)
    setRequerimientoEdit(requerimiento)
    setNuevoRequerimiento({
      nombre: requerimiento.nombre,
      categoria: requerimiento.categoria,
      unidad: requerimiento.unidad,
      cantidad: requerimiento.cantidad,
      precioUnitario: requerimiento.precioUnitario,
      precioTotal: requerimiento.precioTotal,
      prioridad: requerimiento.prioridad,
      observaciones: requerimiento.observaciones || ''
    })
  }

  const handleEliminarRequerimiento = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este requerimiento?')) {
      return
    }

    try {
      await deleteRequerimiento(id)
      setRequerimientos(prev => prev.filter(req => req.id !== id))
    } catch (error) {
      alert('❌ Error al eliminar requerimiento: ' + error.message)
    }
  }

  const resetearFormulario = () => {
    setNuevoRequerimiento({
      nombre: '',
      categoria: '',
      unidad: '',
      cantidad: 1,
      precioUnitario: 0,
      precioTotal: 0,
      prioridad: 'media',
      observaciones: ''
    })
  }

  const handleCambioCantidad = (cantidad) => {
    setNuevoRequerimiento(prev => ({
      ...prev,
      cantidad: parseFloat(cantidad) || 0,
      precioTotal: (parseFloat(cantidad) || 0) * prev.precioUnitario
    }))
  }

  const handleCambioPrecio = (precio) => {
    setNuevoRequerimiento(prev => ({
      ...prev,
      precioUnitario: parseFloat(precio) || 0,
      precioTotal: prev.cantidad * (parseFloat(precio) || 0)
    }))
  }

  const validarRequerimiento = () => {
    if (!nuevoRequerimiento.nombre.trim()) {
      alert('Ingresa el nombre del suministro')
      return false
    }
    if (!nuevoRequerimiento.categoria) {
      alert('Selecciona una categoría')
      return false
    }
    if (!nuevoRequerimiento.unidad) {
      alert('Selecciona una unidad')
      return false
    }
    if (nuevoRequerimiento.cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return false
    }
    return true
  }

  const getPrioridadBadge = (prioridad) => {
    const prioridadInfo = prioridades.find(p => p.value === prioridad)
    return prioridadInfo ? prioridadInfo.label : '🟡 Media'
  }

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: '🟡 Pendiente',
      aprobado: '🟢 Aprobado',
      rechazado: '🔴 Rechazado',
      comprado: '🔵 Comprado'
    }
    return estados[estado] || '🟡 Pendiente'
  }

  const totalRequerimientos = requerimientos.reduce((sum, req) => sum + req.precioTotal, 0)

  return (
    <div className="requerimientos-semana">
      <div className="requerimientos-header">
        <h4>🛠️ Requerimientos de Planificación - Semana {semana.numero}</h4>
        <p>Suministros, materiales y repuestos requeridos específicamente para esta semana</p>
      </div>

      {/* Formulario para agregar requerimiento */}
      <div className="agregar-requerimiento">
        <h5>{editandoId ? 'Editar Requerimiento' : 'Agregar Nuevo Requerimiento'}</h5>
        <div className="requerimiento-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Suministro *</label>
              <input
                type="text"
                value={nuevoRequerimiento.nombre}
                onChange={(e) => setNuevoRequerimiento(prev => ({ 
                  ...prev, 
                  nombre: e.target.value 
                }))}
                placeholder="Ej: Válvula de control, Tubería, etc."
              />
            </div>

            <div className="form-group">
              <label>Categoría *</label>
              <select
                value={nuevoRequerimiento.categoria}
                onChange={(e) => setNuevoRequerimiento(prev => ({ 
                  ...prev, 
                  categoria: e.target.value 
                }))}
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Unidad *</label>
              <select
                value={nuevoRequerimiento.unidad}
                onChange={(e) => setNuevoRequerimiento(prev => ({ 
                  ...prev, 
                  unidad: e.target.value 
                }))}
              >
                <option value="">Seleccionar unidad...</option>
                {unidades.map(unidad => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Prioridad</label>
              <select
                value={nuevoRequerimiento.prioridad}
                onChange={(e) => setNuevoRequerimiento(prev => ({ 
                  ...prev, 
                  prioridad: e.target.value 
                }))}
              >
                {prioridades.map(pri => (
                  <option key={pri.value} value={pri.value}>{pri.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cantidad Requerida *</label>
              <input
                type="number"
                value={nuevoRequerimiento.cantidad}
                onChange={(e) => handleCambioCantidad(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Precio Unitario Aprox. ($)</label>
              <input
                type="number"
                value={nuevoRequerimiento.precioUnitario}
                onChange={(e) => handleCambioPrecio(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Precio Total ($)</label>
              <div className="precio-total">
                {formatCurrency(nuevoRequerimiento.precioTotal, 'USD')}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              value={nuevoRequerimiento.observaciones}
              onChange={(e) => setNuevoRequerimiento(prev => ({ 
                ...prev, 
                observaciones: e.target.value 
              }))}
              placeholder="Detalles adicionales del requerimiento..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            {editandoId ? (
              <>
                <button 
                  className="btn-primary"
                  onClick={handleEditarRequerimiento}
                >
                  💾 Guardar Cambios
                </button>
                <button 
                  className="btn-outline"
                  onClick={() => {
                    setEditandoId(null)
                    setRequerimientoEdit(null)
                    resetearFormulario()
                  }}
                >
                  ❌ Cancelar Edición
                </button>
              </>
            ) : (
              <button 
                className="btn-primary"
                onClick={handleAgregarRequerimiento}
                disabled={!nuevoRequerimiento.nombre}
              >
                ➕ Agregar Requerimiento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de requerimientos */}
      {requerimientos.length > 0 && (
        <div className="lista-requerimientos">
          <h5>Requerimientos de la Semana ({requerimientos.length})</h5>
          <div className="requerimientos-table">
            <table>
              <thead>
                <tr>
                  <th>SUMINISTRO</th>
                  <th>CATEGORÍA</th>
                  <th>UNIDAD</th>
                  <th>CANTIDAD</th>
                  <th>PRECIO UNIT.</th>
                  <th>PRECIO TOTAL</th>
                  <th>PRIORIDAD</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {requerimientos.map(req => (
                  <tr key={req.id}>
                    <td className="col-nombre">
                      <strong>{req.nombre}</strong>
                      {req.observaciones && (
                        <div className="observaciones">
                          <small>{req.observaciones}</small>
                        </div>
                      )}
                    </td>
                    <td className="col-categoria">
                      <span className="categoria-badge">{req.categoria}</span>
                    </td>
                    <td className="col-unidad">
                      {req.unidad}
                    </td>
                    <td className="col-cantidad">
                      {req.cantidad}
                    </td>
                    <td className="col-precio">
                      {formatCurrency(req.precioUnitario, 'USD')}
                    </td>
                    <td className="col-total">
                      <strong>{formatCurrency(req.precioTotal, 'USD')}</strong>
                    </td>
                    <td className="col-prioridad">
                      <span className={`prioridad-badge ${req.prioridad}`}>
                        {getPrioridadBadge(req.prioridad)}
                      </span>
                    </td>
                    <td className="col-estado">
                      <span className={`estado-badge ${req.estado}`}>
                        {getEstadoBadge(req.estado)}
                      </span>
                    </td>
                    <td className="col-acciones">
                      <button
                        className="btn-edit"
                        onClick={() => handleIniciarEdicion(req)}
                        title="Editar requerimiento"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleEliminarRequerimiento(req.id)}
                        title="Eliminar requerimiento"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen */}
          <div className="resumen-requerimientos">
            <div className="resumen-total">
              <span>Total Requerimientos:</span>
              <span className="total-monto">
                {formatCurrency(totalRequerimientos, 'USD')}
              </span>
            </div>
          </div>
        </div>
      )}

      {requerimientos.length === 0 && (
        <div className="no-requerimientos">
          <div className="empty-icon">📦</div>
          <p>No hay requerimientos agregados para esta semana</p>
        </div>
      )}
    </div>
  )
}

export default RequerimientosSemana