// src/components/modules/coordinaciones/components/workspace/tabs/SubirArchivoModal.jsx
import { useState, useRef } from 'react';
import Modal from '../../../../../common/Modal/Modal';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';

const CATEGORIAS = ['Formato', 'Soporte', 'Oficio', 'Reporte', 'Normativa', 'Otro'];

const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

export const SubirArchivoModal = ({
  isOpen,
  onClose,
  coordinacionId,
  departamentoId,
  actividades = [],
  initialActividadId = null,
}) => {
  const { uploadArchivo } = useCoordinaciones();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [categoria, setCategoria] = useState('Formato');
  const [actividadId, setActividadId] = useState(initialActividadId || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      await uploadArchivo(selectedFile, {
        coordinacionId: coordinacionId || departamentoId,
        departamentoId: coordinacionId || departamentoId,
        actividadId: actividadId || null,
        categoria,
      });
      setSelectedFile(null);
      onClose();
    } catch (err) {
      console.error('Error subiendo archivo:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Subir Archivo / Documento"
      size="md"
    >
      <form onSubmit={handleSubmit} className="modal-form-container">
        {/* Zona Drag & Drop */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#1e40af' : '#cbd5e1'}`,
            borderRadius: '10px',
            padding: '1.75rem 1rem',
            textAlign: 'center',
            backgroundColor: dragOver ? '#eff6ff' : '#f8fafc',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ color: '#1e40af', marginBottom: '0.5rem' }}>
            <IconUpload />
          </div>
          {selectedFile ? (
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                {selectedFile.name}
              </p>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB • Clic para cambiar
              </span>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                Haz clic o arrastra un archivo aquí
              </p>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                PDF, Word, Excel, Imágenes o documentos
              </span>
            </div>
          )}
        </div>

        {/* Categoría */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            Categoría del Documento *
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="modal-form-select"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Vínculo a Actividad (Opcional) */}
        <div className="modal-form-group">
          <label className="modal-form-label">
            Vincular como Soporte a una Actividad (Opcional)
          </label>
          <select
            value={actividadId}
            onChange={(e) => setActividadId(e.target.value)}
            className="modal-form-select"
          >
            <option value="">Sin vinculación — Documento General del Departamento</option>
            {actividades.map((act) => (
              <option key={act.id} value={act.id}>
                Soporte de: {act.titulo}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>
            Si seleccionas una actividad, el archivo funcionará como soporte de esa tarea. Si lo dejas vacío, será un documento general.
          </span>
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
            disabled={!selectedFile || uploading}
            className="btn-form-submit"
          >
            {uploading ? 'Subiendo...' : 'Subir Documento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
