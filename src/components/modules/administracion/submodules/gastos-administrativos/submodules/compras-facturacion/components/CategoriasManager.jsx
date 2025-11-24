import React, { useState, useEffect } from 'react'
import supabase from '../../../../../../../../api/supaBase'
import { useNotification } from '../../../../../../../../contexts/NotificationContext'
import Modal from '../../../../../../../common/Modal/Modal'

const CategoriasManager = () => {
    const { showToast } = useNotification()
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({ nombre: '' })

    const fetchCategorias = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('categorias_compras')
            .select('*')
            .order('nombre')

        if (error) {
            console.error('Error fetching categorias:', error)
            showToast('Error al cargar categorías', 'error')
        } else {
            setCategorias(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCategorias()
    }, [])

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({ nombre: item.nombre })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta categoría? Esta acción afectará a todas las compras asociadas.')) {
            const { error } = await supabase
                .from('categorias_compras')
                .delete()
                .eq('id', id)

            if (error) {
                showToast('Error al eliminar: ' + error.message, 'error')
            } else {
                showToast('Categoría eliminada', 'success')
                fetchCategorias()
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre.trim()) return

        try {
            if (editingItem) {
                if (window.confirm('¿Desea editar esta categoría? El cambio se reflejará en todas las compras asociadas.')) {
                    const { error } = await supabase
                        .from('categorias_compras')
                        .update({ nombre: formData.nombre })
                        .eq('id', editingItem.id)

                    if (error) throw error
                    showToast('Categoría actualizada', 'success')
                } else {
                    return; // Cancelled by user
                }
            } else {
                const { error } = await supabase
                    .from('categorias_compras')
                    .insert({ nombre: formData.nombre })

                if (error) throw error
                showToast('Categoría creada', 'success')
            }

            setIsModalOpen(false)
            setEditingItem(null)
            setFormData({ nombre: '' })
            fetchCategorias()
        } catch (error) {
            showToast('Error: ' + error.message, 'error')
        }
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <h3>Gestión de Categorías</h3>
                <button className="btn-add" onClick={() => {
                    setEditingItem(null)
                    setFormData({ nombre: '' })
                    setIsModalOpen(true)
                }}>
                    + Nueva Categoría
                </button>
            </div>

            <div className="items-list">
                {loading ? <p>Cargando...</p> : categorias.map(cat => (
                    <div key={cat.id} className="list-item">
                        <span>{cat.nombre}</span>
                        <div className="item-actions">
                            <button className="btn-edit" onClick={() => handleEdit(cat)}>Editar</button>
                            <button className="btn-delete" onClick={() => handleDelete(cat.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="config-form-group">
                        <label>Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn-save">Guardar</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default CategoriasManager
