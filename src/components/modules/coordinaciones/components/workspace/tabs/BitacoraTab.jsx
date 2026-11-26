// src/components/modules/coordinaciones/components/workspace/tabs/BitacoraTab.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';
import { NotaModal } from './NotaModal';

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

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconBookOpen = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

export const BitacoraTab = ({ coordinacion, departamento, actionTrigger }) => {
  const currentCoord = coordinacion || departamento;
  const { notas, toggleFijarNota, deleteNota } = useCoordinaciones();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNota, setEditingNota] = useState(null);
  const lastActionTime = useRef(actionTrigger?.time || 0);

  // Escuchar trigger de acción rápida desde la barra inferior (solo para 'bitacora')
  useEffect(() => {
    if (
      actionTrigger?.tab === 'bitacora' &&
      actionTrigger.time &&
      actionTrigger.time !== lastActionTime.current
    ) {
      lastActionTime.current = actionTrigger.time;
      setEditingNota(null);
      setModalOpen(true);
    }
  }, [actionTrigger]);

  const deptNotas = useMemo(() => {
    return notas
      .filter((n) => n.coordinacion_id === currentCoord.id || n.departamento_id === currentCoord.id)
      .sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0));
  }, [notas, currentCoord.id]);

  const filteredNotas = useMemo(() => {
    return deptNotas.filter((n) => {
      const matchSearch =
        n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.contenido.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCat === 'Todas' || n.categoria_nota === filterCat;
      return matchSearch && matchCat;
    });
  }, [deptNotas, searchTerm, filterCat]);

  const handleEdit = (nota) => {
    setEditingNota(nota);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNota(null);
    setModalOpen(true);
  };

  const handleDelete = (id, titulo) => {
    if (window.confirm(`¿Estás seguro de eliminar la nota "${titulo}"?`)) {
      deleteNota(id);
    }
  };

  return (
    <div>
      {/* Barra de Herramientas y Filtros */}
      <div className="tab-toolbar">
        <div className="coordinaciones-search-wrap" style={{ maxWidth: '300px' }}>
          <IconSearch />
          <input
            type="text"
            className="coordinaciones-search-input"
            placeholder="Buscar en la bitácora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tab-filters-group">
          <select
            className="select-filter"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="Todas">Categoría: Todas</option>
            <option value="General">General</option>
            <option value="Acuerdo">Acuerdo</option>
            <option value="Procedimiento">Procedimiento</option>
            <option value="Contacto">Contacto</option>
            <option value="Recordatorio">Recordatorio</option>
          </select>
        </div>
      </div>

      {/* Cuadrícula de Notas */}
      {filteredNotas.length > 0 ? (
        <div className="notas-grid">
          {filteredNotas.map((n) => (
            <div key={n.id} className={`nota-card ${n.fijado ? 'fijada' : ''}`}>
              <div className="nota-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => toggleFijarNota(n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      padding: 0,
                      opacity: n.fijado ? 1 : 0.45,
                    }}
                    title={n.fijado ? 'Desfijar nota' : 'Fijar nota al inicio'}
                  >
                    📌
                  </button>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: n.fijado ? '#fef08a' : '#eff6ff',
                      color: n.fijado ? '#854d0e' : '#1e40af',
                    }}
                  >
                    {n.categoria_nota || 'General'}
                  </span>
                </div>

                <div className="coordinacion-actions">
                  <button
                    type="button"
                    className="btn-action-icon"
                    onClick={() => handleEdit(n)}
                    title="Editar nota"
                  >
                    <IconEdit />
                  </button>
                  <button
                    type="button"
                    className="btn-action-icon delete"
                    onClick={() => handleDelete(n.id, n.titulo)}
                    title="Eliminar nota"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>

              <div style={{ padding: '1rem 1rem 0 1rem' }}>
                <h5 className="nota-title">{n.titulo}</h5>
              </div>

              <div className="nota-card-body">
                {n.contenido}
              </div>

              <div className="nota-card-footer">
                <span>{n.usuario_creador ? `Por: ${n.usuario_creador}` : 'Nota'}</span>
                <span>{new Date(n.updated_at || n.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="coordinaciones-empty-state">
          <div className="empty-state-icon">
            <IconBookOpen />
          </div>
          <h4>Sin notas o bitácoras</h4>
          <p>No se encontraron notas registradas en este departamento.</p>
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleCreate}
          >
            <IconPlus /> Crear Primera Nota
          </button>
        </div>
      )}

      {/* Modal Crear / Editar Nota */}
      <NotaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        nota={editingNota}
        coordinacionId={currentCoord.id}
        departamentoId={currentCoord.id}
      />
    </div>
  );
};
