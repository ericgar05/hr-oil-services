import React, { useState, useEffect } from 'react'
import supabase from '../../../../../../../../api/supaBase'
import { useNotification } from '../../../../../../../../contexts/NotificationContext'
import Modal from '../../../../../../../common/Modal/Modal'

const SubcategoriasManager = () => {
    const { showToast } = useNotification()
    const [subcategorias, setSubcategorias] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({ nombre: '' })

    const fetchSubcategorias = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('subcategorias_compras')
            .select('*')
            .order('nombre')

        if (error) {
            console.error('Error fetching subcategorias:', error)
            // Don't show error toast immediately as table might not exist yet during dev
        } else {
            setSubcategorias(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchSubcategorias()
    }, [])

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({ nombre: item.nombre })
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta subcategoría?')) {
            const { error } = await supabase
                .from('subcategorias_compras')
                .delete()
                .eq('id', id)

            if (error) {
                showToast('Error al eliminar: ' + error.message, 'error')
            } else {
                showToast('Subcategoría eliminada', 'success')
                fetchSubcategorias()
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.nombre.trim()) return

        try {
            if (editingItem) {
                if (window.confirm('¿Desea editar esta subcategoría?')) {
                    const { error } = await supabase
                        .from('subcategorias_compras')
                        .update({ nombre: formData.nombre })
                        .eq('id', editingItem.id)

                    if (error) throw error
                    showToast('Subcategoría actualizada', 'success')
                } else {
                    return;
                }
            } else {
                const { error } = await supabase
                    .from('subcategorias_compras')
                    .insert({ nombre: formData.nombre })

                if (error) throw error
                showToast('Subcategoría creada', 'success')
            }

            setIsModalOpen(false)
            setEditingItem(null)
            setFormData({ nombre: '' })
            fetchSubcategorias()
        } catch (error) {
            showToast('Error: ' + error.message, 'error')
        }
    }

    return (
        <div className="manager-container">
            <div className="manager-header">
                <h3>Gestión de Subcategorías</h3>
                <button className="btn-add" onClick={() => {
                    setEditingItem(null)
                    setFormData({ nombre: '' })
                    setIsModalOpen(true)
                }}>
                    + Nueva Subcategoría
                </button>
            </div>

            <div className="items-list">
                {loading ? <p>Cargando...</p> : subcategorias.map(sub => (
                    <div key={sub.id} className="list-item">
                        <span>{sub.nombre}</span>
                        <div className="item-actions">
                            <button className="btn-edit" onClick={() => handleEdit(sub)}>Editar</button>
                            <button className="btn-delete" onClick={() => handleDelete(sub.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
                {!loading && subcategorias.length === 0 && <p>No hay subcategorías registradas.</p>}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
            >
                <form onSubmit={handleSubmit}>
                    <div className="config-form-group">
                        <label>Nombre de la Subcategoría</label>
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

export default SubcategoriasManager
