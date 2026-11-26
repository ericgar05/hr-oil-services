// src/components/modules/coordinaciones/components/workspace/tabs/NotaModal.jsx
import { useState, useEffect } from 'react';
import Modal from '../../../../../common/Modal/Modal';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';

const CATEGORIAS_NOTA = ['General', 'Acuerdo', 'Procedimiento', 'Contacto', 'Recordatorio'];

export const NotaModal = ({
  isOpen,
  onClose,
  nota = null,
  coordinacionId,
  departamentoId,
}) => {
  const { createNota, updateNota } = useCoordinaciones();
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoria_nota: 'General',
    fijado: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (nota) {
      setFormData({
        titulo: nota.titulo || '',
        contenido: nota.contenido || '',
        categoria_nota: nota.categoria_nota || 'General',
        fijado: Boolean(nota.fijado),
      });
    } else {
      setFormData({
        titulo: '',
        contenido: '',
        categoria_nota: 'General',
        fijado: false,
      });
    }
  }, [nota, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.contenido.trim()) return;

    setSubmitting(true);
    try {
      if (nota) {
        await updateNota(nota.id, formData);
      } else {
        await createNota({
          ...formData,
          coordinacion_id: coordinacionId || departamentoId,
          departamento_id: coordinacionId || departamentoId,
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
      title={nota ? 'Editar Nota / Entrada de Bitácora' : 'Nueva Nota / Entrada de Bitácora'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="modal-form-container">
        <div className="modal-form-group">
          <label className="modal-form-label">
            Título o Asunto *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Acuerdo de reunión semanal / Contactos clave de proveedores"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="modal-form-input"
          />
        </div>

        <div className="modal-form-grid-2">
          <div className="modal-form-group">
            <label className="modal-form-label">
              Categoría
            </label>
            <select
              value={formData.categoria_nota}
              onChange={(e) => setFormData({ ...formData, categoria_nota: e.target.value })}
              className="modal-form-select"
            >
              {CATEGORIAS_NOTA.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form-group" style={{ justifyContent: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginTop: '1.25rem' }}>
              <input
                type="checkbox"
                checked={formData.fijado}
                onChange={(e) => setFormData({ ...formData, fijado: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1e40af' }}
              />
              📌 Fijar / Anclar al inicio
            </label>
          </div>
        </div>

        <div className="modal-form-group">
          <label className="modal-form-label">
            Contenido de la Nota *
          </label>
          <textarea
            rows="5"
            required
            placeholder="Escribe aquí los acuerdos, procedimientos, datos de contacto o recordatorios..."
            value={formData.contenido}
            onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
            className="modal-form-textarea"
          />
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
            {submitting ? 'Guardando...' : nota ? 'Guardar Cambios' : 'Registrar Nota'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
