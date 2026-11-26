// src/components/modules/coordinaciones/components/CoordinacionModal.jsx
import { useState, useEffect } from 'react';
import Modal from '../../../common/Modal/Modal';
import { useCoordinaciones } from '../../../../contexts/CoordinacionesContext';

const COLOR_PALETTE = [
  { name: 'Azul Corporativo', value: '#1e40af' },
  { name: 'Verde Esmeralda', value: '#059669' },
  { name: 'Violeta / Púrpura', value: '#7c3aed' },
  { name: 'Ámbar / Naranja', value: '#d97706' },
  { name: 'Rojo / Rubí', value: '#e11d48' },
  { name: 'Cian / Marino', value: '#0891b2' },
  { name: 'Pizarra / Gris', value: '#475569' },
];

export const CoordinacionModal = ({ isOpen, onClose, coordinacion = null }) => {
  const { createCoordinacion, updateCoordinacion } = useCoordinaciones();
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    responsable: '',
    color: '#1e40af',
    icono: 'folder',
    descripcion: '',
    estado: 'activo',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (coordinacion) {
      setFormData({
        nombre: coordinacion.nombre || '',
        codigo: coordinacion.codigo || '',
        responsable: coordinacion.responsable || '',
        color: coordinacion.color || '#1e40af',
        icono: coordinacion.icono || 'folder',
        descripcion: coordinacion.descripcion || '',
        estado: coordinacion.estado || 'activo',
      });
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        responsable: '',
        color: '#1e40af',
        icono: 'folder',
        descripcion: '',
        estado: 'activo',
      });
    }
  }, [coordinacion, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    setSubmitting(true);
    try {
      if (coordinacion) {
        await updateCoordinacion(coordinacion.id, formData);
      } else {
        await createCoordinacion(formData);
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
      title={coordinacion ? 'Editar Coordinación' : 'Nueva Coordinación'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="modal-form-container">
        {/* Nombre de la Coordinación */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            Nombre de la Coordinación *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Coordinación de Operaciones, Calidad, Laborales..."
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="modal-form-input"
          />
        </div>

        {/* Código y Responsable */}
        <div className="modal-form-grid-2">
          <div className="modal-form-group">
            <label className="modal-form-label">
              Código / Siglas (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. COORD-OPS, CALIDAD"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
              className="modal-form-input"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              Responsable / Coordinador
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

        {/* Selector de Color Temático */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            Color Distintivo
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: c.value })}
                title={c.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: c.value,
                  border: formData.color === c.value ? '3px solid #0f172a' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: formData.color === c.value ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Descripción */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            Descripción o Alcance (Opcional)
          </label>
          <textarea
            rows="3"
            placeholder="Breve detalle sobre las funciones, alcance o atribuciones de esta coordinación..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="modal-form-textarea"
          />
        </div>

        {/* Estado */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            Estado Operativo
          </label>
          <select
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            className="modal-form-select"
          >
            <option value="activo">Activo (En Operación)</option>
            <option value="inactivo">Inactivo / En Pausa</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        {/* Botones de acción */}
        <div className="modal-form-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn-form-cancel"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.nombre.trim()}
            className="btn-form-submit"
          >
            {submitting ? 'Guardando...' : coordinacion ? 'Guardar Cambios' : 'Crear Coordinación'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
