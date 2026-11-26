// src/components/modules/coordinaciones/components/workspace/tabs/ArchivosTab.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';
import { SubirArchivoModal } from './SubirArchivoModal';
import Modal from '../../../../../common/Modal/Modal';

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconFolder = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

export const ArchivosTab = ({ coordinacion, departamento, actionTrigger }) => {
  const currentCoord = coordinacion || departamento;
  const { archivos, pendientes, deleteArchivo } = useCoordinaciones();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [filterTipo, setFilterTipo] = useState('Todos'); // 'Todos' | 'Generales' | 'Soportes'
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const lastActionTime = useRef(actionTrigger?.time || 0);

  // Escuchar trigger de acción rápida desde la barra inferior (solo para 'archivos')
  useEffect(() => {
    if (
      actionTrigger?.tab === 'archivos' &&
      actionTrigger.time &&
      actionTrigger.time !== lastActionTime.current
    ) {
      lastActionTime.current = actionTrigger.time;
      setUploadModalOpen(true);
    }
  }, [actionTrigger]);

  // Archivos de esta coordinación
  const deptArchivos = useMemo(() => {
    return archivos.filter(
      (a) => a.coordinacion_id === currentCoord.id || a.departamento_id === currentCoord.id
    );
  }, [archivos, currentCoord.id]);

  // Pendientes de esta coordinación para resolver nombres de actividad vinculada
  const deptPendientes = useMemo(() => {
    return pendientes.filter(
      (p) => p.coordinacion_id === currentCoord.id || p.departamento_id === currentCoord.id
    );
  }, [pendientes, currentCoord.id]);

  const filteredArchivos = useMemo(() => {
    return deptArchivos.filter((item) => {
      const matchSearch = item.nombre_archivo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategoria === 'Todas' || item.categoria === filterCategoria;
      const matchTipo =
        filterTipo === 'Todos' ||
        (filterTipo === 'Generales' && !item.actividad_id) ||
        (filterTipo === 'Soportes' && Boolean(item.actividad_id));

      return matchSearch && matchCat && matchTipo;
    });
  }, [deptArchivos, searchTerm, filterCategoria, filterTipo]);

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar el archivo "${nombre}"?`)) {
      deleteArchivo(id);
    }
  };

  const getFileIcon = (mimeType = '', filename = '') => {
    const ext = filename.split('.').pop().toLowerCase();
    if (mimeType.includes('pdf') || ext === 'pdf') return '📕';
    if (mimeType.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return '🖼️';
    if (mimeType.includes('sheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
    if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) return '📄';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Barra de Herramientas y Filtros */}
      <div className="tab-toolbar">
        <div className="coordinaciones-search-wrap">
          <IconSearch />
          <input
            type="text"
            className="coordinaciones-search-input"
            placeholder="Buscar por nombre de archivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tab-filters-group">
          <select
            className="select-filter"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="Todos">Tipo: Todos</option>
            <option value="Generales">Documentos Generales</option>
            <option value="Soportes">Soportes de Actividades</option>
          </select>

          <select
            className="select-filter"
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
          >
            <option value="Todas">Categoría: Todas</option>
            <option value="Formato">Formato</option>
            <option value="Soporte">Soporte</option>
            <option value="Oficio">Oficio</option>
            <option value="Reporte">Reporte</option>
            <option value="Normativa">Normativa</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Cuadrícula de Archivos */}
      {filteredArchivos.length > 0 ? (
        <div className="archivos-grid">
          {filteredArchivos.map((arc) => {
            const task = arc.actividad_id
              ? deptPendientes.find((p) => p.id === arc.actividad_id)
              : null;
            const isImage = arc.tipo_mime?.includes('image') || arc.archivo_url?.startsWith('data:image');
            const isPdf = arc.tipo_mime?.includes('pdf') || arc.nombre_archivo?.endsWith('.pdf');

            return (
              <div key={arc.id} className="archivo-card">
                <div className="archivo-card-header">
                  <span className="archivo-cat-badge">{arc.categoria || 'Otro'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {new Date(arc.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="archivo-card-body">
                  <div className="archivo-type-icon">
                    {getFileIcon(arc.tipo_mime, arc.nombre_archivo)}
                  </div>
                  <div className="archivo-info">
                    <h5 className="archivo-name" title={arc.nombre_archivo}>
                      {arc.nombre_archivo}
                    </h5>
                    <div className="archivo-meta">
                      <span>{formatFileSize(arc.tamanio)}</span>
                      {arc.usuario_subida && <span>• Por {arc.usuario_subida}</span>}
                    </div>
                    {task && (
                      <span className="archivo-task-link" title={`Vinculado a: ${task.titulo}`}>
                        📎 Soporte: {task.titulo}
                      </span>
                    )}
                  </div>
                </div>

                <div className="archivo-card-actions">
                  {(isImage || isPdf) && (
                    <button
                      type="button"
                      className="btn-action-icon"
                      onClick={() => setPreviewFile(arc)}
                      title="Previsualizar archivo"
                    >
                      <IconEye />
                    </button>
                  )}

                  <a
                    href={arc.archivo_url}
                    download={arc.nombre_archivo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-action-icon"
                    title="Descargar archivo"
                    style={{ textDecoration: 'none' }}
                  >
                    <IconDownload />
                  </a>

                  <button
                    type="button"
                    className="btn-action-icon delete"
                    onClick={() => handleDelete(arc.id, arc.nombre_archivo)}
                    title="Eliminar archivo"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="coordinaciones-empty-state">
          <div className="empty-state-icon">
            <IconFolder />
          </div>
          <h4>Sin archivos subidos</h4>
          <p>No se encontraron archivos en este departamento con los filtros actuales.</p>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => setUploadModalOpen(true)}
          >
            <IconPlus /> Subir Primer Archivo
          </button>
        </div>
      )}

      {/* Modal Subir Archivo */}
      <SubirArchivoModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        coordinacionId={currentCoord.id}
        departamentoId={currentCoord.id}
        actividades={deptPendientes}
      />

      {/* Modal Previsualización */}
      {previewFile && (
        <Modal
          isOpen={Boolean(previewFile)}
          onClose={() => setPreviewFile(null)}
          title={`Vista Previa: ${previewFile.nombre_archivo}`}
          size="lg"
        >
          <div style={{ padding: '1.25rem', textAlign: 'center', maxHeight: '75vh', overflow: 'auto' }}>
            {previewFile.tipo_mime?.includes('image') || previewFile.archivo_url?.startsWith('data:image') ? (
              <img
                src={previewFile.archivo_url}
                alt={previewFile.nombre_archivo}
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            ) : (
              <iframe
                src={previewFile.archivo_url}
                title={previewFile.nombre_archivo}
                style={{ width: '100%', height: '65vh', border: 'none', borderRadius: '8px' }}
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
