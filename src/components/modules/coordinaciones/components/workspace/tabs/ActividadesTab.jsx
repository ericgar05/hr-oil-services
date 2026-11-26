// src/components/modules/coordinaciones/components/workspace/tabs/ActividadesTab.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useCoordinaciones } from '../../../../../../contexts/CoordinacionesContext';
import { ActividadModal } from './ActividadModal';

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

const IconCheckSquare = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const IconPaperclip = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

export const ActividadesTab = ({ departamento, coordinacion, actionTrigger }) => {
  const currentCoord = coordinacion || departamento;
  const { pendientes, archivos, updatePendiente, toggleSubtarea, deletePendiente } = useCoordinaciones();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterPrioridad, setFilterPrioridad] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const lastActionTime = useRef(actionTrigger?.time || 0);

  // Escuchar trigger de acción rápida desde la barra inferior (solo para 'actividades')
  useEffect(() => {
    if (
      actionTrigger?.tab === 'actividades' &&
      actionTrigger.time &&
      actionTrigger.time !== lastActionTime.current
    ) {
      lastActionTime.current = actionTrigger.time;
      setEditingActividad(null);
      setModalOpen(true);
    }
  }, [actionTrigger]);

  // Filtrar pendientes de este departamento / coordinación
  const deptPendientes = useMemo(() => {
    return pendientes.filter((p) => p.coordinacion_id === currentCoord.id || p.departamento_id === currentCoord.id);
  }, [pendientes, currentCoord.id]);

  // Cálculo de Semáforo de Plazos
  const getSemaforoInfo = (actividad) => {
    if (actividad.estado === 'Completado') {
      return { label: 'Completada', className: 'completada', icon: '✓' };
    }
    if (!actividad.fecha_limite) {
      return { label: 'Sin Plazo', className: 'completada', icon: '⏱' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const in48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (actividad.fecha_limite < todayStr) {
      return { label: 'Vencida', className: 'vencida', icon: '🔴' };
    }
    if (actividad.fecha_limite <= in48Hours) {
      return { label: 'Vence en 48h', className: 'por-vencer', icon: '🟡' };
    }
    return { label: 'A tiempo', className: 'a-tiempo', icon: '🟢' };
  };

  // Filtrar lista
  const filteredList = useMemo(() => {
    return deptPendientes.filter((item) => {
      const matchSearch =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.responsable && item.responsable.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchEstado = filterEstado === 'Todos' || item.estado === filterEstado;
      const matchPrioridad = filterPrioridad === 'Todas' || item.prioridad === filterPrioridad;

      return matchSearch && matchEstado && matchPrioridad;
    });
  }, [deptPendientes, searchTerm, filterEstado, filterPrioridad]);

  const handleEdit = (actividad) => {
    setEditingActividad(actividad);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingActividad(null);
    setModalOpen(true);
  };

  const handleDelete = (id, titulo) => {
    if (window.confirm(`¿Estás seguro de eliminar la actividad "${titulo}"?`)) {
      deletePendiente(id);
    }
  };

  const handleQuickStatusChange = (id, newEstado) => {
    updatePendiente(id, { estado: newEstado });
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
            placeholder="Buscar actividad o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="tab-filters-group">
          <select
            className="select-filter"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="En espera">En espera</option>
            <option value="Completado">Completado</option>
          </select>

          <select
            className="select-filter"
            value={filterPrioridad}
            onChange={(e) => setFilterPrioridad(e.target.value)}
          >
            <option value="Todas">Prioridad: Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Listado de Actividades */}
      {filteredList.length > 0 ? (
        <div className="actividades-list-stack">
          {filteredList.map((act) => {
            const semaforo = getSemaforoInfo(act);
            const subCount = act.subtareas ? act.subtareas.length : 0;
            const subDone = act.subtareas ? act.subtareas.filter((s) => s.completada).length : 0;
            const actArchivos = archivos.filter((a) => a.actividad_id === act.id);

            return (
              <div key={act.id} className="actividad-card">
                {/* Header en Dos Zonas (Idéntico a Planificación/Valuaciones) */}
                <div className="actividad-card-header">
                  <div className="actividad-card-title-group">
                    {/* Selector Rápido de Estado */}
                    <select
                      value={act.estado}
                      onChange={(e) => handleQuickStatusChange(act.id, e.target.value)}
                      className={`status-pill ${act.estado.toLowerCase().replace(/\s+/g, '-')}`}
                      style={{ cursor: 'pointer', outline: 'none', border: 'none' }}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En proceso">En proceso</option>
                      <option value="En espera">En espera</option>
                      <option value="Completado">Completado</option>
                    </select>

                    {/* Semáforo Visual de Plazos */}
                    <span className={`semaforo-badge ${semaforo.className}`}>
                      {semaforo.icon} {semaforo.label}
                    </span>

                    {/* Badge de Prioridad */}
                    <span className={`priority-badge ${act.prioridad.toLowerCase()}`}>
                      {act.prioridad}
                    </span>
                  </div>

                  <div className="card-actions-group">
                    <button
                      type="button"
                      className="btn-action-icon"
                      onClick={() => handleEdit(act)}
                      title="Editar actividad"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon delete"
                      onClick={() => handleDelete(act.id, act.titulo)}
                      title="Eliminar actividad"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="actividad-card-body">
                  <h4 className="actividad-title">{act.titulo}</h4>
                  {act.descripcion && <p className="actividad-desc">{act.descripcion}</p>}

                  {/* Bloque KPI */}
                  <div className="actividad-kpi-block">
                    <div className="kpi-cell">
                      <span className="cell-label">Responsable</span>
                      <span className="cell-value">
                        {act.responsable || 'No asignado'}
                      </span>
                    </div>

                    <div className="kpi-cell">
                      <span className="cell-label">Fecha Límite</span>
                      <span className="cell-value">
                        {act.fecha_limite ? new Date(act.fecha_limite + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha'}
                      </span>
                    </div>

                    <div className="kpi-cell">
                      <span className="cell-label">Checklist</span>
                      <span className="cell-value" style={{ color: subDone === subCount && subCount > 0 ? '#16a34a' : 'inherit' }}>
                        {subCount > 0 ? `${subDone}/${subCount} completadas` : 'Sin subtareas'}
                      </span>
                    </div>

                    <div className="kpi-cell">
                      <span className="cell-label">Soportes Adjuntos</span>
                      <span className="cell-value" style={{ color: actArchivos.length > 0 ? '#1e40af' : '#64748b' }}>
                        📎 {actArchivos.length} archivo{actArchivos.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Checklist Interactivo */}
                  {subCount > 0 && (
                    <div className="subtareas-section">
                      <div className="subtareas-header">Subtareas / Checklist</div>
                      <div className="subtareas-list">
                        {act.subtareas.map((sub) => (
                          <label
                            key={sub.id}
                            className={`subtarea-item ${sub.completada ? 'completed' : ''}`}
                            onClick={() => toggleSubtarea(act.id, sub.id)}
                          >
                            <input
                              type="checkbox"
                              checked={sub.completada}
                              onChange={() => {}} // Manejado por onClick del label
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{sub.titulo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de Soportes Vinculados */}
                  {actArchivos.length > 0 && (
                    <div className="actividad-soportes-bar">
                      <span className="soportes-title">
                        Soportes:
                      </span>
                      {actArchivos.map((arc) => (
                        <a
                          key={arc.id}
                          href={arc.archivo_url}
                          download={arc.nombre_archivo}
                          target="_blank"
                          rel="noreferrer"
                          className="soporte-chip"
                          title={`Descargar ${arc.nombre_archivo}`}
                        >
                          <IconPaperclip /> {arc.nombre_archivo}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="coordinaciones-empty-state">
          <div className="empty-state-icon">
            <IconCheckSquare />
          </div>
          <h4>Sin actividades registradas</h4>
          <p>No se encontraron actividades con los filtros seleccionados.</p>
          <button
            type="button"
            className="btn-primary-action"
            onClick={handleCreate}
          >
            <IconPlus /> Crear Primera Actividad
          </button>
        </div>
      )}

      {/* Modal para Crear / Editar Actividad */}
      <ActividadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        actividad={editingActividad}
        departamentoId={currentCoord.id}
        coordinacionId={currentCoord.id}
      />
    </div>
  );
};
