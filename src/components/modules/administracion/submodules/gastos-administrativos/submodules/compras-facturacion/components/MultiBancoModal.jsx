import React, { useState, useEffect } from 'react'
import supabase from '../../../../../../../../api/supaBase'
import './MultiBancoModal.css'

const MultiBancoModal = ({ isOpen, onClose, onConfirm, montoTotal, montoLabel = "Monto Total" }) => {
    const [bancos, setBancos] = useState([{ banco: '', monto: 0 }])
    const [bancosEmpresa, setBancosEmpresa] = useState([])
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)
    const [showAddConfirm, setShowAddConfirm] = useState(false)

    // Cargar bancos de la empresa desde la BD
    useEffect(() => {
        const fetchBancos = async () => {
            const { data, error } = await supabase
                .from('bancos_empresa')
                .select('nombre')
                .order('nombre', { ascending: true })

            if (error) {
                console.error('Error cargando bancos:', error)
            } else if (data) {
                setBancosEmpresa(data.map(b => b.nombre))
            }
        }

        if (isOpen) {
            fetchBancos()
        }
    }, [isOpen])

    // Calcular el total pagado y el restante
    const totalPagado = bancos.reduce((sum, b) => sum + (parseFloat(b.monto) || 0), 0)
    const restante = montoTotal - totalPagado

    // LÓGICA MEJORADA: Usar un efecto separado para el autocompletado
    useEffect(() => {
        if (bancos.length > 1) {
            const ultimoIndex = bancos.length - 1

            // Verificar que TODOS los campos anteriores tengan monto > 0
            const todosAnterioresConMonto = bancos.slice(0, -1).every(b => b.monto > 0)

            if (todosAnterioresConMonto) {
                const totalAnteriores = bancos.slice(0, -1).reduce((sum, b) => sum + (parseFloat(b.monto) || 0), 0)
                const montoRestante = Math.max(0, montoTotal - totalAnteriores)

                // Solo actualizar si el monto actual es diferente del calculado
                if (Math.abs(bancos[ultimoIndex].monto - montoRestante) > 0.01) {
                    setBancos(prev => {
                        const newBancos = [...prev]
                        newBancos[ultimoIndex] = { ...newBancos[ultimoIndex], monto: montoRestante }
                        return newBancos
                    })
                }
            }
        }
    }, [bancos.length, montoTotal]) // Solo dependencias estables

    // EFECTO ADICIONAL: Recalcular cuando cambian los montos de los bancos anteriores
    useEffect(() => {
        if (bancos.length > 1) {
            const ultimoIndex = bancos.length - 1
            const bancosAnteriores = bancos.slice(0, -1)

            // Verificar que TODOS los campos anteriores tengan monto > 0
            const todosAnterioresConMonto = bancosAnteriores.every(b => b.monto > 0)

            if (todosAnterioresConMonto) {
                const totalAnteriores = bancosAnteriores.reduce((sum, b) => sum + (parseFloat(b.monto) || 0), 0)
                const montoRestante = Math.max(0, montoTotal - totalAnteriores)

                // Solo actualizar si el monto actual es diferente del calculado
                if (Math.abs(bancos[ultimoIndex].monto - montoRestante) > 0.01) {
                    setBancos(prev => {
                        const newBancos = [...prev]
                        newBancos[ultimoIndex] = { ...newBancos[ultimoIndex], monto: montoRestante }
                        return newBancos
                    })
                }
            }
        }
    }, [bancos.map(b => b.monto).slice(0, -1).join(',')]) // Dependencia de los montos anteriores

    // Determinar si un campo debe estar deshabilitado
    const campoDeshabilitado = (index) => {
        // Solo deshabilitar el último campo si TODOS los anteriores tienen monto > 0
        if (index === bancos.length - 1 && bancos.length > 1) {
            const todosAnterioresConMonto = bancos.slice(0, -1).every(b => b.monto > 0)
            if (todosAnterioresConMonto) {
                const totalAnteriores = bancos.slice(0, -1).reduce((sum, b) => sum + (parseFloat(b.monto) || 0), 0)
                const montoRestante = Math.max(0, montoTotal - totalAnteriores)
                // Solo deshabilitar si el monto actual es igual al monto restante calculado
                return Math.abs(bancos[index].monto - montoRestante) < 0.01
            }
        }
        return false
    }

    const handleBancoChange = (index, field, value) => {
        const newBancos = [...bancos]

        // Si estamos editando un campo que no es el último y tiene monto > 0, 
        // permitir que el último campo sea editable
        if (field === 'monto' && index < bancos.length - 1 && value > 0) {
            newBancos[index] = { ...newBancos[index], [field]: value }
            setBancos(newBancos)
        } else {
            newBancos[index] = { ...newBancos[index], [field]: value }
            setBancos(newBancos)
        }
    }

    const agregarBanco = () => {
        setBancos([...bancos, { banco: '', monto: 0 }])
    }

    const eliminarBanco = (index) => {
        if (bancos.length > 1) {
            const newBancos = bancos.filter((_, i) => i !== index)
            setBancos(newBancos)
        }
    }

    const handleCancel = () => {
        if (bancos.some(b => b.banco || b.monto > 0)) {
            setShowCancelConfirm(true)
        } else {
            resetAndClose()
        }
    }

    const handleConfirm = () => {
        // Validar que todos los bancos tengan nombre y monto
        const bancosValidos = bancos.filter(b => b.banco && b.monto > 0)

        if (bancosValidos.length === 0) {
            alert('Debe agregar al menos un banco con monto')
            return
        }

        if (Math.abs(totalPagado - montoTotal) > 0.01) {
            alert(`El total pagado (${totalPagado.toFixed(2)}) debe ser igual al ${montoLabel} (${montoTotal.toFixed(2)})`)
            return
        }

        setShowAddConfirm(true)
    }

    const confirmarAgregar = () => {
        const bancosValidos = bancos.filter(b => b.banco && b.monto > 0)
        const texto = bancosValidos.map(b => `${b.banco}: ${b.monto} Bs`).join('\n')
        onConfirm(texto)
        resetAndClose()
    }

    const resetAndClose = () => {
        setBancos([{ banco: '', monto: 0 }])
        setShowCancelConfirm(false)
        setShowAddConfirm(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            <div className="modal-overlay" onClick={handleCancel}>
                <div className="modal-content multi-banco-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3>Pago Multi-Banco</h3>
                        <button type="button" className="btn-close" onClick={handleCancel}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="multi-banco-info">
                            <div className="info-row">
                                <span className="info-label">{montoLabel}:</span>
                                <span className="info-value">Bs {montoTotal.toFixed(2)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Total Pagado:</span>
                                <span className={`info-value ${Math.abs(totalPagado - montoTotal) < 0.01 ? 'text-success' : 'text-danger'}`}>
                                    Bs {totalPagado.toFixed(2)}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Restante:</span>
                                <span className={`info-value ${restante === 0 ? 'text-success' : 'text-warning'}`}>
                                    Bs {restante.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="bancos-list">
                            {bancos.map((banco, index) => (
                                <div key={index} className="banco-item">
                                    <div className="banco-numero">Banco {index + 1}</div>
                                    <div className="banco-inputs">
                                        <input
                                            type="text"
                                            placeholder="Nombre del banco"
                                            value={banco.banco}
                                            onChange={(e) => handleBancoChange(index, 'banco', e.target.value)}
                                            className="input-banco-nombre"
                                            list="bancos-empresa-list"
                                        />
                                        <datalist id="bancos-empresa-list">
                                            {bancosEmpresa.map((nombreBanco, idx) => (
                                                <option key={idx} value={nombreBanco} />
                                            ))}
                                        </datalist>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={banco.monto}
                                            onChange={(e) => handleBancoChange(index, 'monto', parseFloat(e.target.value) || 0)}
                                            className="input-banco-monto"
                                            disabled={campoDeshabilitado(index)}
                                        />
                                        {bancos.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => eliminarBanco(index)}
                                                className="btn-remove-banco"
                                                title="Eliminar banco"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={agregarBanco} className="btn-add-banco">
                            + Añadir Banco
                        </button>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-primary" onClick={handleConfirm}>
                            Aceptar
                        </button>
                        <button type="button" className="btn-secondary" onClick={handleCancel}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de cancelación */}
            {showCancelConfirm && (
                <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
                    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirmar Cancelación</h3>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro que desea cancelar? Se perderán los datos ingresados.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-danger" onClick={resetAndClose}>
                                Sí, Cancelar
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setShowCancelConfirm(false)}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de agregar */}
            {showAddConfirm && (
                <div className="modal-overlay" onClick={() => setShowAddConfirm(false)}>
                    <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirmar Pago Multi-Banco</h3>
                        </div>
                        <div className="modal-body">
                            <p>¿Desea agregar el pago con los siguientes bancos?</p>
                            <ul className="bancos-confirmacion">
                                {bancos.filter(b => b.banco && b.monto > 0).map((b, i) => (
                                    <li key={i}>
                                        <strong>{b.banco}:</strong> Bs {b.monto.toFixed(2)}
                                    </li>
                                ))}
                            </ul>
                            <p className="total-confirmacion">
                                <strong>Total:</strong> Bs {totalPagado.toFixed(2)}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-primary" onClick={confirmarAgregar}>
                                Sí, Agregar
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setShowAddConfirm(false)}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default MultiBancoModal
