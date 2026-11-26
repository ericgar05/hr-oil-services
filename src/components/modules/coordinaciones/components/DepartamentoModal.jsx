// src/components/modules/coordinaciones/components/DepartamentoModal.jsx
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

export const DepartamentoModal = ({
  isOpen,
  onClose,
  departamento = null,
  coordinacionId = null,
}) => {
  const { coordinaciones, createDepartamento, updateDepartamento } = useCoordinaciones();
  const [formData, setFormData] = useState({
    coordinacion_id: '',
    nombre: '',
    descripcion: '',
    color: '#1e40af',
    icono: 'folder',
    estado: 'activo',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (departamento) {
      setFormData({
        coordinacion_id: departamento.coordinacion_id || coordinacionId || '',
        nombre: departamento.nombre || '',
        descripcion: departamento.descripcion || '',
        color: departamento.color || '#1e40af',
        icono: departamento.icono || 'folder',
        estado: departamento.estado || 'activo',
      });
    } else {
      setFormData({
        coordinacion_id: coordinacionId || (coordinaciones[0]?.id || ''),
        nombre: '',
        descripcion: '',
        color: '#1e40af',
        icono: 'folder',
        estado: 'activo',
      });
    }
  }, [departamento, coordinacionId, coordinaciones, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.coordinacion_id) return;

    setSubmitting(true);
    try {
      if (departamento) {
        await updateDepartamento(departamento.id, formData);
      } else {
        await createDepartamento(formData);
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
      title={departamento ? 'Editar Departamento' : 'Nuevo Departamento'}
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Coordinación Perteneciente *
          </label>
          <select
            required
            value={formData.coordinacion_id}
            onChange={(e) => setFormData({ ...formData, coordinacion_id: e.target.value })}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#ffffff',
            }}
          >
            <option value="">Seleccione una Coordinación</option>
            {coordinaciones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo ? `[${c.codigo}] ` : ''}{c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Nombre del Departamento *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Departamento de Laborales / Calidad / Compras"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Selector de Color Distintivo */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.45rem' }}>
            Color Distintivo
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {COLOR_PALETTE.map((pal) => (
              <button
                key={pal.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: pal.value })}
                title={pal.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: pal.value,
                  border: formData.color === pal.value ? '3px solid #0f172a' : '2px solid transparent',
                  cursor: 'pointer',
                  transform: formData.color === pal.value ? 'scale(1.15)' : 'none',
                  transition: 'all 0.15s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Descripción / Funciones
          </label>
          <textarea
            rows="3"
            placeholder="Área de responsabilidad, objetivos operativos del departamento..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary-action"
          >
            {submitting ? 'Guardando...' : departamento ? 'Guardar Cambios' : 'Crear Departamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
