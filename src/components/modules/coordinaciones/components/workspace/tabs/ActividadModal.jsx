// src/components/modules/coordinaciones/components/workspace/tabs/ActividadModal.jsx
import { useState, useEffect } from 'react';
import Modal from '../../../../../common/Modal/Modal';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export const ActividadModal = ({
  isOpen,
  onClose,
  actividad = null,
  departamentoId,
  coordinacionId,
}) => {
  const { createPendiente, updatePendiente } = useCoordinaciones();
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'Pendiente',
    prioridad: 'Media',
    fecha_limite: '',
    responsable: '',
    subtareas: [],
  });
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (actividad) {
      setFormData({
        titulo: actividad.titulo || '',
        descripcion: actividad.descripcion || '',
        estado: actividad.estado || 'Pendiente',
        prioridad: actividad.prioridad || 'Media',
        fecha_limite: actividad.fecha_limite || '',
        responsable: actividad.responsable || '',
        subtareas: actividad.subtareas || [],
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        estado: 'Pendiente',
        prioridad: 'Media',
        fecha_limite: '',
        responsable: '',
        subtareas: [],
      });
    }
    setNewSubtaskText('');
  }, [actividad, isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      titulo: newSubtaskText.trim(),
      completada: false,
    };
    setFormData((prev) => ({
      ...prev,
      subtareas: [...prev.subtareas, newItem],
    }));
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id) => {
    setFormData((prev) => ({
      ...prev,
      subtareas: prev.subtareas.filter((s) => s.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;

    setSubmitting(true);
    try {
      if (actividad) {
        await updatePendiente(actividad.id, formData);
      } else {
        await createPendiente({
          ...formData,
          departamento_id: departamentoId,
          coordinacion_id: coordinacionId,
        });
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={actividad ? 'Editar Actividad / Pendiente' : 'Nueva Actividad / Pendiente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="modal-form-container">
        <div className="modal-form-group">
          <label className="modal-form-label">
            Título de la Actividad *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Revisión de nómina quincenal / Auditoría de seguridad"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="modal-form-input"
          />
        </div>

        <div className="modal-form-grid-2">
          <div className="modal-form-group">
            <label className="modal-form-label">
              Estado
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="modal-form-select"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="En espera">En espera</option>
              <option value="Completado">Completado</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              Prioridad
            </label>
            <select
              value={formData.prioridad}
              onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
              className="modal-form-select"
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <div className="modal-form-grid-2">
          <div className="modal-form-group">
            <label className="modal-form-label">
              Fecha Límite (Plazo)
            </label>
            <input
              type="date"
              value={formData.fecha_limite}
              onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
              className="modal-form-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              Responsable Asignado
            </label>
            <input
              type="text"
              placeholder="Ej. Ing. Carlos Pérez"
              value={formData.responsable}
              onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
              className="modal-form-input"
            />
          </div>
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">
            Descripción Detallada
          </label>
          <textarea
            rows="3"
            placeholder="Instrucciones, requisitos o detalles de la actividad..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="modal-form-textarea"
          />
        </div>

        {/* Sección de Subtareas / Checklist */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.5rem' }}>
            Checklist de Subtareas ({formData.subtareas.length})
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              placeholder="Agregar un paso o ítem al checklist..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              className="modal-form-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.45rem 0.85rem',
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <IconPlus /> Agregar
            </button>
          </div>

          {formData.subtareas.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {formData.subtareas.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                  }}
                >
                  <span style={{ color: '#334155' }}>• {sub.titulo}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px 4px' }}
                    title="Quitar subtarea"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-form-cancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-form-submit"
          >
            {submitting ? 'Guardando...' : actividad ? 'Guardar Cambios' : 'Crear Actividad'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
