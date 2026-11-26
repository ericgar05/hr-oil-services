// components/planificacion/DiaPlanning.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '../../../../../../api/supaBase';
import { usePlanning } from '../../../../../../contexts/PlanningContext';
import { useBudget } from '../../../../../../contexts/BudgetContext';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import { ActividadForm } from './ActividadForm';
import { ActividadesList } from './ActividadesList';
import Modal from '../../../../../common/Modal/Modal';

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const IconClipboardCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <polyline points="9 14 11 16 15 11"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconCheckSquare = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconChevronDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconChevronUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

export const DiaPlanning = ({ dia, onBack, allDias, onNavigate }) => {
    const {
        getSemanaById,
        recalcularMontosSemana,
        deleteActividad,
        showActividadModal,
        setShowActividadModal,
        actividadParaEditar,
        setActividadParaEditar,
    } = usePlanning();
    const { showToast } = useNotification();
    const [actividades, setActividades] = useState([]);
    const [currentDia, setCurrentDia] = useState(dia);
    const [loading, setLoading] = useState(false);
    const { budget } = useBudget();

    // Actualizar currentDia cuando cambia la prop dia
    useEffect(() => {
        setCurrentDia(dia);
    }, [dia]);

    const getActividadesPorDia = useCallback(async (diaId) => {
        if (!diaId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('plan_actividades')
            .select(`
        *,
        subactividades:plan_subactividades(*),
        personal:plan_actividad_personal(*)
      `)
            .eq('dia_id', diaId)
            .order('created_at');

        if (error) {
            console.error('Error fetching actividades:', error);
        } else {
            setActividades(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (currentDia?.id) {
            getActividadesPorDia(currentDia.id);
        }
    }, [currentDia?.id, getActividadesPorDia]);

    const getDiaData = async (diaId) => {
        const { data, error } = await supabase
            .from('plan_dias')
            .select('*')
            .eq('id', diaId)
            .single();
        if (data) {
            setCurrentDia(data);
        }
    };

    const handleSuccess = async () => {
        setActividadParaEditar(null);
        setShowActividadModal(false);
        // Refrescar todo para ver los montos actualizados por el trigger
        await getActividadesPorDia(currentDia.id);
        await getDiaData(currentDia.id);
        await getSemanaById(currentDia.semana_id);
        await recalcularMontosSemana(currentDia.semana_id);
    };

    const handleEdit = (actividad) => {
        setActividadParaEditar(actividad);
        setShowActividadModal(true);
    };

    // Métricas operativas no redundantes del día
    const totalPersonalAsignado = useMemo(() => {
        const pids = new Set();
        actividades.forEach(a => {
            (a.personal || []).forEach(p => {
                if (p.personal_id) pids.add(p.personal_id);
                else if (p.id) pids.add(p.id);
            });
        });
        return pids.size;
    }, [actividades]);

    const totalSubactividades = useMemo(() => {
        return actividades.reduce((acc, a) => acc + (a.subactividades?.length || 0), 0);
    }, [actividades]);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actividadToDelete, setActividadToDelete] = useState(null);

    const handleDelete = (actividadId) => {
        setActividadToDelete(actividadId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!actividadToDelete) return;
        try {
            await deleteActividad(actividadToDelete);
            // Refrescar datos después de eliminar
            handleSuccess();
            showToast('Actividad eliminada exitosamente', 'success');
        } catch (error) {
            showToast('No se pudo eliminar la actividad.', 'error');
        } finally {
            setShowDeleteModal(false);
            setActividadToDelete(null);
        }
    };

    // Navegación entre días
    const currentIndex = allDias?.findIndex(d => d.id === currentDia.id);
    const prevDia = currentIndex > 0 ? allDias[currentIndex - 1] : null;
    const nextDia = currentIndex < allDias?.length - 1 ? allDias[currentIndex + 1] : null;

    const handlePrevDia = () => {
        if (prevDia && onNavigate) {
            onNavigate(prevDia);
        }
    };

    const handleNextDia = () => {
        if (nextDia && onNavigate) {
            onNavigate(nextDia);
        }
    };

    // Estado del Drawer Móvil
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Etiqueta corta para el botón central de la barra de comandos móvil: ej "Lun 27"
    const currentDayShortLabel = useMemo(() => {
        if (!currentDia?.fecha) return '';
        const clean = currentDia.fecha.split('T')[0];
        const [y, m, d] = clean.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const weekday = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
        const day = dateObj.getDate();
        return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day}`;
    }, [currentDia?.fecha]);

    // Mes y Año del día seleccionado para cabecera del cajón móvil
    const monthYearTitle = useMemo(() => {
        if (!currentDia?.fecha) return '';
        const clean = currentDia.fecha.split('T')[0];
        const [y, m, d] = clean.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    }, [currentDia?.fecha]);

    // Parseo de días para selectores Desktop y Móvil
    const parseDayInfo = useCallback((d) => {
        if (!d || !d.fecha) {
            return {
                weekdayShort: '',
                weekdayDesktop: '',
                dayNum: '',
                monthShort: '',
                isSelected: false,
                hasActivities: false
            };
        }
        const clean = d.fecha.split('T')[0];
        const [y, m, day] = clean.split('-').map(Number);
        const dateObj = new Date(y, m - 1, day);

        const weekdayShort = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').slice(0, 2).toUpperCase();
        const weekdayDesktop = dateObj.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').slice(0, 3).toUpperCase();
        const dayNum = dateObj.getDate().toString().padStart(2, '0');
        const monthShort = dateObj.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase();
        const isSelected = d.id === currentDia?.id;
        const hasActivities = (d.cantidad_actividades || 0) > 0;

        return {
            dateObj,
            weekdayShort,
            weekdayDesktop,
            dayNum,
            monthShort,
            isSelected,
            hasActivities
        };
    }, [currentDia?.id]);

    return (
        <div className="planning-dia-detail" style={{ padding: '0.5rem 0' }}>
            {/* Ficha Resumen Ejecutiva del Día (Todo Unificado en una Sola Tarjeta) */}
            <div className="detail-info-card dia-planning-unified-card">
                {/* Contenido Principal de la Tarjeta */}
                <div className="dia-card-main-content">
                    <div className="dia-card-main-left">
                        {/* Etiqueta de contexto */}
                        <div className="dia-card-badge-row">
                            <span className="dia-context-badge">
                                Planificación Diaria
                            </span>
                        </div>

                        {/* Título único de fecha (Sin redundancias) */}
                        <h2 className="dia-main-title">
                            {new Date(currentDia.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </h2>

                        {/* Badges de Métricas Operativas */}
                        <div className="dia-metrics-pill-row">
                            <div className="dia-metric-badge">
                                <IconClipboardCheck />
                                <span><strong>{actividades.length}</strong> {actividades.length === 1 ? 'actividad programada' : 'actividades programadas'}</span>
                            </div>

                            {totalPersonalAsignado > 0 && (
                                <div className="dia-metric-badge crew" title="Personal asignado a las actividades de hoy">
                                    <IconUsers />
                                    <span><strong>{totalPersonalAsignado}</strong> {totalPersonalAsignado === 1 ? 'persona en cuadrilla' : 'personas en cuadrilla'}</span>
                                </div>
                            )}

                            {totalSubactividades > 0 && (
                                <div className="dia-metric-badge tasks" title="Tareas operativas desglosadas para hoy">
                                    <IconCheckSquare />
                                    <span><strong>{totalSubactividades}</strong> {totalSubactividades === 1 ? 'tarea operativa' : 'tareas operativas'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hero Metric: Total Estimado Día */}
                    <div className="dia-card-main-right">
                        <div className="dia-hero-finance-box">
                            <span className="dia-hero-finance-label">
                                Total Estimado Día
                            </span>
                            <div className="dia-hero-finance-val">
                                ${(currentDia.monto_planificado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Actividades */}
            <div className="planning-detail-content">
                <ActividadesList
                    loading={loading}
                    actividades={actividades}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modal de Formulario */}
            <Modal
                isOpen={showActividadModal}
                onClose={() => { setShowActividadModal(false); setActividadParaEditar(null); }}
                title={actividadParaEditar ? "Editar Actividad Planificada" : "Nueva Actividad Planificada"}
                size="lg"
            >
                <ActividadForm
                    diaId={currentDia.id}
                    diaFecha={currentDia.fecha}
                    allDias={allDias}
                    actividadAEditar={actividadParaEditar}
                    onClose={() => { setShowActividadModal(false); setActividadParaEditar(null); }}
                    onSuccess={handleSuccess}
                />
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setActividadToDelete(null); }}
                title="Confirmar Eliminación"
            >
                <div style={{ padding: '20px' }}>
                    <p>¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="btn-danger"
                            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px' }}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};