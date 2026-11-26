// src/components/modules/coordinaciones/CoordinacionesMain.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../contexts/ProjectContext';
import { useCoordinaciones } from '../../../contexts/CoordinacionesContext';
import ModuleDescription from '../_core/ModuleDescription/ModuleDescription';
import { CoordinacionCard } from './components/CoordinacionCard';
import { CoordinacionModal } from './components/CoordinacionModal';
import { DepartamentoWorkspace } from './components/workspace/DepartamentoWorkspace';
import './Coordinaciones.css';

// Iconos Vectoriales SVG Profesionales
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconFolderPlus = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </svg>
);

const IconBuilding = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="22.01"></line>
    <line x1="15" y1="22" x2="15" y2="22.01"></line>
    <line x1="9" y1="6" x2="9" y2="6.01"></line>
    <line x1="15" y1="6" x2="15" y2="6.01"></line>
    <line x1="9" y1="10" x2="9" y2="10.01"></line>
    <line x1="15" y1="10" x2="15" y2="10.01"></line>
    <line x1="9" y1="14" x2="9" y2="14.01"></line>
    <line x1="15" y1="14" x2="15" y2="14.01"></line>
    <line x1="9" y1="18" x2="9" y2="18.01"></line>
    <line x1="15" y1="18" x2="15" y2="18.01"></line>
  </svg>
);

const IconCheckSquare = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconBookOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const CoordinacionesMain = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  const {
    loading,
    coordinaciones,
    selectedCoordinacion,
    setSelectedCoordinacion,
    deleteCoordinacion,
    getCoordinacionStats,
  } = useCoordinaciones();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos'); // 'todos' | 'activo' | 'inactivo'

  // Estado para la pestaña activa dentro del Espacio de Trabajo
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('actividades');
  const [actionTrigger, setActionTrigger] = useState(null);

  // Modal de Coordinación
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [editingCoord, setEditingCoord] = useState(null);

  const handleOpenNewCoord = () => {
    setEditingCoord(null);
    setIsCoordModalOpen(true);
  };

  const handleOpenEditCoord = (coord) => {
    setEditingCoord(coord);
    setIsCoordModalOpen(true);
  };

  // Filtrado de Coordinaciones
  const filteredCoordinaciones = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return coordinaciones.filter((coord) => {
      if (filterEstado !== 'todos' && coord.estado !== filterEstado) {
        return false;
      }
      if (!term) return true;

      return (
        (coord.nombre || '').toLowerCase().includes(term) ||
        (coord.codigo || '').toLowerCase().includes(term) ||
        (coord.responsable || '').toLowerCase().includes(term) ||
        (coord.descripcion || '').toLowerCase().includes(term)
      );
    });
  }, [coordinaciones, searchTerm, filterEstado]);

  // Estadísticas de la coordinación seleccionada (Nivel 2)
  const selectedStats = useMemo(() => {
    if (!selectedCoordinacion) {
      return { totalPendientes: 0, totalArchivos: 0, totalNotas: 0, vencidas: 0, porVencer: 0 };
    }
    return getCoordinacionStats(selectedCoordinacion.id);
  }, [selectedCoordinacion, getCoordinacionStats]);

  return (
    <div className="coordinaciones-main">
      {/* ========================================================
          VISTA NIVEL 2: Espacio de Trabajo de la Coordinación
          ======================================================== */}
      {selectedCoordinacion ? (
        <DepartamentoWorkspace
          coordinacion={selectedCoordinacion}
          onBack={() => setSelectedCoordinacion(null)}
          activeTab={activeWorkspaceTab}
          setActiveTab={setActiveWorkspaceTab}
          actionTrigger={actionTrigger}
        />
      ) : (
        /* ========================================================
           VISTA NIVEL 1: Directorio General de Coordinaciones
           ======================================================== */
        <>
          <ModuleDescription
            title="Módulo de Coordinaciones"
            description={`Espacios de trabajo operativos, gestión de actividades, plazos, repositorios documentales y bitácora del proyecto ${selectedProject?.name || ''}`}
          />

          {/* Barra de Acciones y Búsqueda */}
          <div className="coordinaciones-toolbar">
            <div className="coordinaciones-search-wrap">
              <IconSearch />
              <input
                type="text"
                className="coordinaciones-search-input"
                placeholder="Buscar por nombre, código o responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="coordinaciones-filter-group">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="coordinaciones-filter-select"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activo">Solo Activas</option>
                <option value="inactivo">Solo Inactivas</option>
              </select>
            </div>
          </div>

          {/* Listado de Coordinaciones o Estados Vacíos */}
          {loading && coordinaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
              <p>Cargando coordinaciones...</p>
            </div>
          ) : coordinaciones.length === 0 ? (
            <div className="coordinaciones-empty-state">
              <IconFolderPlus />
              <h4>No hay coordinaciones registradas</h4>
              <p>
                Crea la primera coordinación para gestionar las actividades, cronograma y documentos del proyecto (ej: Coordinación de Operaciones, Calidad, Laborales, Compras).
              </p>
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleOpenNewCoord}
              >
                <IconPlus /> Crear Primera Coordinación
              </button>
            </div>
          ) : filteredCoordinaciones.length === 0 ? (
            <div className="coordinaciones-empty-state">
              <h4>Sin coincidencias</h4>
              <p>
                No se encontraron coordinaciones que coincidan con <strong>"{searchTerm}"</strong>.
              </p>
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#475569', borderColor: '#475569' }}
                onClick={() => { setSearchTerm(''); setFilterEstado('todos'); }}
              >
                Restablecer búsqueda
              </button>
            </div>
          ) : (
            <div className="coordinaciones-grid">
              {filteredCoordinaciones.map((coord) => (
                <CoordinacionCard
                  key={coord.id}
                  coordinacion={coord}
                  onSelect={(c) => {
                    setSelectedCoordinacion(c);
                    setActiveWorkspaceTab('actividades');
                  }}
                  onEdit={handleOpenEditCoord}
                  onDelete={deleteCoordinacion}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================================
          BARRA DE NAVEGACIÓN FIJA INFERIOR (DESKTOP & MOBILE COMMAND BAR)
          Homogénea con Planificación
          ======================================================== */}
      <div className="coordinaciones-tabs-bar">
        {selectedCoordinacion ? (
          /* ========================================================
             NIVEL 2: Dentro del Espacio de Trabajo de la Coordinación
             ======================================================== */
          <>
            {/* 1. Volver al Directorio */}
            <button
              type="button"
              className="tab-btn tab-btn-nav-back"
              onClick={() => setSelectedCoordinacion(null)}
              title="Volver a Coordinaciones"
            >
              <div className="tab-icon-wrap">
                <IconArrowLeft />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Volver a Coordinaciones</span>
                <span className="tab-label-mobile">Volver</span>
              </span>
            </button>

            {/* 2. Pestaña: Actividades */}
            <button
              type="button"
              className={`tab-btn ${activeWorkspaceTab === 'actividades' ? 'active' : ''}`}
              onClick={() => setActiveWorkspaceTab('actividades')}
              title="Pendientes y Actividades"
            >
              <div className="tab-icon-wrap">
                <IconCheckSquare />
                <span className="tab-count-badge">{selectedStats.totalPendientes}</span>
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Actividades</span>
                <span className="tab-label-mobile">Tareas</span>
              </span>
            </button>

            {/* 3. Pestaña: Archivos */}
            <button
              type="button"
              className={`tab-btn ${activeWorkspaceTab === 'archivos' ? 'active' : ''}`}
              onClick={() => setActiveWorkspaceTab('archivos')}
              title="Repositorio de Archivos"
            >
              <div className="tab-icon-wrap">
                <IconFolder />
                <span className="tab-count-badge">{selectedStats.totalArchivos}</span>
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Archivos</span>
                <span className="tab-label-mobile">Archivos</span>
              </span>
            </button>

            {/* 4. Pestaña: Control de Plazos */}
            <button
              type="button"
              className={`tab-btn ${activeWorkspaceTab === 'agenda' ? 'active' : ''}`}
              onClick={() => setActiveWorkspaceTab('agenda')}
              title="Control de Plazos"
            >
              <div className="tab-icon-wrap">
                <IconClock />
                {selectedStats.vencidas > 0 ? (
                  <span className="tab-count-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                    {selectedStats.vencidas}
                  </span>
                ) : selectedStats.porVencer > 0 ? (
                  <span className="tab-count-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                    {selectedStats.porVencer}
                  </span>
                ) : null}
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Control de Plazos</span>
                <span className="tab-label-mobile">Plazos</span>
              </span>
            </button>

            {/* 5. Pestaña: Bitácora */}
            <button
              type="button"
              className={`tab-btn ${activeWorkspaceTab === 'bitacora' ? 'active' : ''}`}
              onClick={() => setActiveWorkspaceTab('bitacora')}
              title="Cuestiones Generales / Bitácora"
            >
              <div className="tab-icon-wrap">
                <IconBookOpen />
                <span className="tab-count-badge">{selectedStats.totalNotas}</span>
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Bitácora</span>
                <span className="tab-label-mobile">Notas</span>
              </span>
            </button>

            {/* 6. Botón de Acción Primaria Contextual (Azul) */}
            <button
              type="button"
              className="tab-btn tab-btn-primary-action"
              onClick={() => {
                const targetTab = activeWorkspaceTab === 'agenda' ? 'actividades' : activeWorkspaceTab;
                if (activeWorkspaceTab === 'agenda') {
                  setActiveWorkspaceTab('actividades');
                }
                setActionTrigger({ tab: targetTab, time: Date.now() });
              }}
              title={
                activeWorkspaceTab === 'archivos'
                  ? 'Subir Archivo'
                  : activeWorkspaceTab === 'bitacora'
                  ? 'Nueva Nota'
                  : 'Nueva Actividad'
              }
            >
              <div className="tab-icon-wrap">
                <IconPlus />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">
                  {activeWorkspaceTab === 'archivos'
                    ? 'Subir Archivo'
                    : activeWorkspaceTab === 'bitacora'
                    ? 'Nueva Nota'
                    : 'Nueva Actividad'}
                </span>
                <span className="tab-label-mobile">
                  {activeWorkspaceTab === 'archivos'
                    ? '+ Subir'
                    : activeWorkspaceTab === 'bitacora'
                    ? '+ Nota'
                    : '+ Actividad'}
                </span>
              </span>
            </button>
          </>
        ) : (
          /* ========================================================
             NIVEL 1: Directorio General de Coordinaciones
             ======================================================== */
          <>
            {/* 1. Volver a Proyectos */}
            <button
              type="button"
              className="tab-btn tab-btn-nav-back"
              onClick={() => navigate('/projects')}
              title="Volver a Proyectos"
            >
              <div className="tab-icon-wrap">
                <IconArrowLeft />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Volver a Proyectos</span>
                <span className="tab-label-mobile">Proyectos</span>
              </span>
            </button>

            {/* 2. Directorio de Coordinaciones (Activo) */}
            <button
              type="button"
              className="tab-btn active"
              onClick={() => {}}
              title="Coordinaciones del Proyecto"
            >
              <div className="tab-icon-wrap">
                <IconBuilding />
                {coordinaciones.length > 0 && (
                  <span className="tab-count-badge">{coordinaciones.length}</span>
                )}
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Coordinaciones Registradas</span>
                <span className="tab-label-mobile">Coordinaciones</span>
              </span>
            </button>

            {/* 3. Acción Primaria Destacada: Nueva Coordinación */}
            <button
              type="button"
              className="tab-btn tab-btn-primary-action"
              onClick={handleOpenNewCoord}
              title="Crear Nueva Coordinación"
            >
              <div className="tab-icon-wrap">
                <IconPlus />
              </div>
              <span className="tab-label">
                <span className="tab-label-desktop">Nueva Coordinación</span>
                <span className="tab-label-mobile">+ Coordinación</span>
              </span>
            </button>
          </>
        )}
      </div>

      {/* Modal de Crear / Editar Coordinación */}
      <CoordinacionModal
        isOpen={isCoordModalOpen}
        onClose={() => {
          setIsCoordModalOpen(false);
          setEditingCoord(null);
        }}
        coordinacion={editingCoord}
      />
    </div>
  );
};

export default CoordinacionesMain;
