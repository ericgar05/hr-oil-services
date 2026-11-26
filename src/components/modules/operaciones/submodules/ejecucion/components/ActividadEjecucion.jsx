import { useState, useEffect } from 'react';
import { useExecution } from '../../../../../../contexts/ExecutionContext';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import { usePersonal } from '../../../../../../contexts/PersonalContext';
import { useOperaciones } from '../../../../../../contexts/OperacionesContext';
import { useBudget } from '../../../../../../contexts/BudgetContext';
import { SubactividadesList } from './SubactividadesList';
import Modal from '../../../../../common/Modal/Modal';

// Modern Lucide-Style Vector SVG Icons
const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconChevronDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconChevronUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconPlay = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ flexShrink: 0 }}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const IconPause = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ flexShrink: 0 }}>
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export const ActividadEjecucion = ({ actividadPlanificada, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [cantidadRealInput, setCantidadRealInput] = useState('');

  // Reporting & Replanning State
  const [showCloseDayModal, setShowCloseDayModal] = useState(false);
  const [reporteData, setReporteData] = useState({ usuario: '', descripcion: '', justificacion: '' });
  const [replanData, setReplanData] = useState({ replanificar: false, fechaNueva: '', autoTomorrow: true });

  // Replan Alert Flow
  const [showReplanConfirmModal, setShowReplanConfirmModal] = useState(false);
  const [pendingDiff, setPendingDiff] = useState(0);

  // Add Personal Feature
  const [showAddPersonalModal, setShowAddPersonalModal] = useState(false);
  const [availablePersonal, setAvailablePersonal] = useState([]);
  const [selectedPersonalId, setSelectedPersonalId] = useState('');
  const [selectedPersonalRol, setSelectedPersonalRol] = useState('');

  // Inventory Integration State
  const [materialsToConsume, setMaterialsToConsume] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('');

  const { iniciarEjecucionActividad, finalizarActividad, registrarCierreDiario, agregarPersonalActividad, eliminarPersonalActividad, loading } = useExecution();
  const { showToast } = useNotification();
  const { getEmployeesByProject } = usePersonal();
  const { inventory, withdrawInventory } = useOperaciones();
  const { budget } = useBudget();

  // Load Personal on demand
  useEffect(() => {
    if (showAddPersonalModal) {
      getEmployeesByProject().then(data => setAvailablePersonal(data || []));
    }
  }, [showAddPersonalModal, getEmployeesByProject]);

  const confirmAddPersonal = async () => {
    if (!selectedPersonalId) {
      showToast("Seleccione un personal", "error");
      return;
    }
    const personal = availablePersonal.find(p => p.id === selectedPersonalId);
    if (!personal) return;

    try {
      await agregarPersonalActividad(actividadPlanificada.id, personal, selectedPersonalRol);
      setShowAddPersonalModal(false);
      onUpdate();
      showToast("Personal agregado exitosamente", "success");
    } catch (error) {
      showToast("Error al agregar personal: " + error.message, "error");
    }
  };

  const handleRemovePersonal = async (assignmentId, nombre) => {
    if (window.confirm(`¿Estás seguro de quitar a "${nombre}" de esta actividad?`)) {
      try {
        await eliminarPersonalActividad(assignmentId);
        onUpdate();
        showToast("Personal removido exitosamente", "success");
      } catch (error) {
        showToast("Error al remover personal: " + error.message, "error");
      }
    }
  };

  const handleCloseDayClick = (e) => {
    e.stopPropagation();
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCantidadRealInput('');
    setReporteData({ usuario: '', descripcion: '', justificacion: '' });
    setMaterialsToConsume([]);
    setSelectedMaterialId('');
    setMaterialQuantity('');
    setShowCloseDayModal(true);
  };

  const handleAddMaterial = () => {
    if (!selectedMaterialId || !materialQuantity || parseFloat(materialQuantity) <= 0) {
      showToast("Seleccione un material y una cantidad válida", "error");
      return;
    }
    const item = inventory.find(i => String(i.id) === String(selectedMaterialId));
    if (!item) return;

    if (parseFloat(materialQuantity) > item.cantidad_disponible) {
      showToast(`Stock insuficiente. Disponible: ${item.cantidad_disponible}`, "error");
      return;
    }

    setMaterialsToConsume(prev => [
      ...prev,
      {
        id: item.id,
        nombre: item.nombre_producto,
        unidad: item.unidad,
        cantidad: parseFloat(materialQuantity)
      }
    ]);
    setSelectedMaterialId('');
    setMaterialQuantity('');
  };

  const handleRemoveMaterial = (index) => {
    setMaterialsToConsume(prev => prev.filter((_, i) => i !== index));
  };

  const processMaterialWithdrawals = async (materials) => {
    if (!materials || materials.length === 0) return true;

    for (const mat of materials) {
      try {
        await withdrawInventory({
          inventario_id: mat.id,
          cantidad_retirada: mat.cantidad,
          retirado_por: reporteData.usuario,
          observaciones: `Actividad: ${actividadPlanificada.descripcion}`
        });
      } catch (err) {
        console.error("Error withdrawing material:", mat, err);
        showToast(`Error al retirar ${mat.nombre}. Verifique stock.`, "error");
        return false;
      }
    }
    return true;
  };

  const confirmCloseDay = async () => {
    if (!reporteData.usuario || !reporteData.descripcion || !cantidadRealInput) {
      showToast("Complete todos los campos del cierre diario", "error");
      return;
    }

    if (!window.confirm("¿Está seguro que desea registrar el cierre diario? Esto generará un reporte y actualizará el avance.")) {
      return;
    }

    try {
      const withdrawalsSuccess = await processMaterialWithdrawals(materialsToConsume);
      if (!withdrawalsSuccess) return;

      await registrarCierreDiario(actividadPlanificada.id, selectedDate, cantidadRealInput, reporteData, materialsToConsume);

      setShowCloseDayModal(false);
      onUpdate();
      showToast("Cierre diario registrado y reporte generado", "success");
    } catch (error) {
      showToast("Error al registrar cierre diario: " + error.message, "error");
    }
  };

  const estadoActual = actividadPlanificada.estado || 'pendiente';

  const subTotal = actividadPlanificada.subactividades?.length || 0;
  const subCompleted = actividadPlanificada.subactividades?.filter(s => s.completada).length || 0;
  const hasSubactividades = subTotal > 0;

  const cantProgramada = parseFloat(actividadPlanificada.cantidad_programada) || 1;
  const cantReal = parseFloat(actividadPlanificada.cantidad_real) || 0;

  const avanceFinanciero = (estadoActual === 'completada' || actividadPlanificada.cantidad_real)
    ? Math.min(Math.round((cantReal / cantProgramada) * 100), 100)
    : 0;

  // Si no tiene subactividades asignadas, el avance físico es igual al avance financiero
  const avanceFisico = hasSubactividades
    ? (actividadPlanificada.avance !== undefined
        ? actividadPlanificada.avance
        : Math.round((subCompleted / subTotal) * 100))
    : avanceFinanciero;

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleStartClick = (e) => {
    e.stopPropagation();
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setShowStartModal(true);
  };

  const confirmStart = async () => {
    try {
      await iniciarEjecucionActividad(actividadPlanificada.id, selectedDate);
      setShowStartModal(false);
      onUpdate();
      showToast("Actividad iniciada exitosamente", "success");
      setIsExpanded(true);
    } catch (error) {
      showToast("Error al iniciar actividad", "error");
    }
  };

  const handleFinishClick = (e) => {
    e.stopPropagation();
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCantidadRealInput(actividadPlanificada.cantidad_real || actividadPlanificada.cantidad_programada || '');
    setReporteData({ usuario: '', descripcion: '', justificacion: '' });
    setReplanData({ replanificar: true, fechaNueva: '', autoTomorrow: true });
    setMaterialsToConsume([]);
    setSelectedMaterialId('');
    setMaterialQuantity('');
    setShowFinishModal(true);
  };

  const confirmFinish = async () => {
    if (!reporteData.usuario || !reporteData.descripcion || cantidadRealInput === '') {
      showToast("Complete todos los campos obligatorios", "error");
      return;
    }

    const executed = parseFloat(cantidadRealInput || 0);
    const planned = parseFloat(actividadPlanificada.cantidad_programada);
    const diff = planned - executed;

    if (diff > 0) {
      setPendingDiff(diff);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      setReplanData({ replanificar: true, fechaNueva: tomorrowStr, autoTomorrow: false });
      setShowFinishModal(false);
      setShowReplanConfirmModal(true);
      return;
    }

    if (window.confirm("¿Confirma que desea FINALIZAR esta actividad? Esta acción es irreversible.")) {
      performFinalize(null);
    }
  };

  const performFinalize = async (replanPayload) => {
    try {
      const withdrawalsSuccess = await processMaterialWithdrawals(materialsToConsume);
      if (!withdrawalsSuccess) return;

      await finalizarActividad(
        actividadPlanificada.id,
        selectedDate,
        cantidadRealInput,
        reporteData,
        replanPayload,
        materialsToConsume
      );
      setShowFinishModal(false);
      setShowReplanConfirmModal(false);
      onUpdate();
      showToast("Actividad finalizada exitosamente" + (replanPayload ? " y replanificada." : "."), "success");
      setIsExpanded(false);
    } catch (error) {
      showToast("Error al finalizar: " + error.message, "error");
    }
  };

  const handleReplanDecision = (shouldReplan) => {
    if (shouldReplan) {
      if (!replanData.autoTomorrow && !replanData.fechaNueva) {
        showToast("Seleccione una fecha para la replanificación", "error");
        return;
      }

      const payload = {
        cantidadPendiente: pendingDiff,
        fechaNueva: replanData.fechaNueva,
        autoTomorrow: replanData.autoTomorrow
      };
      performFinalize(payload);
    } else {
      if (window.confirm("¿Seguro que desea finalizar con cantidades pendientes SIN replanificar? Las unidades restantes NO se programarán para otro día.")) {
        performFinalize(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada': return '#16a34a'; // Green
      case 'en_progreso': return '#2563eb'; // Blue
      case 'replanificada': return '#9333ea'; // Purple
      default: return '#64748b'; // Slate
    }
  };

  const budItem = budget?.items?.find(i => i.id === actividadPlanificada.partida_id);
  const itemCode = budItem?.item || actividadPlanificada.item || actividadPlanificada.partida_codigo || null;
  const partidaNombre = actividadPlanificada.nombre_partida || budItem?.descripcion || actividadPlanificada.budget_items?.description || 'Partida no asignada';

  const cantRealVal = actividadPlanificada.cantidad_real;
  const cantProg = actividadPlanificada.cantidad_programada || 0;
  const pu = actividadPlanificada.precio_unitario || 0;
  const montoProgramado = actividadPlanificada.monto_programado || (cantProg * pu);
  const montoEjecutadoReal = (cantRealVal !== null && cantRealVal !== undefined && cantRealVal !== '')
    ? Number(cantRealVal) * pu
    : (estadoActual === 'completada' ? montoProgramado : 0);

  return (
    <div className={`execution-item planning-actividad-card ejecucion-actividad-card status-${estadoActual}`}>

      {/* Header de la Tarjeta con Distribución Adaptativa PC/Móvil */}
      <div className="actividad-card-header" onClick={handleToggleExpand}>
        {/* Fila/Grupo de Título y Badges */}
        <div className="actividad-card-title-group">
          <span className="actividad-partida-badge">
            <IconFolder />
            <span>{itemCode ? `Partida ${itemCode}` : 'Partida'}</span>
          </span>
          <span className="actividad-partida-nombre" title={partidaNombre}>
            {partidaNombre}
          </span>
          <span
            className="status-badge"
            style={{
              backgroundColor: `${getStatusColor(estadoActual)}14`,
              color: getStatusColor(estadoActual),
              borderColor: `${getStatusColor(estadoActual)}35`
            }}
          >
            {estadoActual.replace('_', ' ')}
          </span>
        </div>

        {/* Grupo de Botones de Acción */}
        <div className="actividad-card-actions-group" onClick={(e) => e.stopPropagation()}>
          {/* Botón Informes */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReportModal(true);
            }}
            className="btn-activity-reports"
            title="Ver Informes de la Actividad"
          >
            <IconFileText />
            <span>Informes</span>
          </button>

          {/* Botón Iniciar (Pendiente o Replanificada) */}
          {(estadoActual === 'pendiente' || estadoActual === 'replanificada') && (
            <button
              type="button"
              onClick={handleStartClick}
              disabled={loading}
              className="btn-action-primary start"
              title="Iniciar Ejecución de la Actividad"
            >
              <IconPlay />
              <span className="action-btn-text">Iniciar</span>
            </button>
          )}

          {/* Botones En Progreso: Cerrar Día y Finalizar */}
          {estadoActual === 'en_progreso' && (
            <>
              <button
                type="button"
                onClick={handleCloseDayClick}
                disabled={loading}
                className="btn-action-warning pause"
                title="Registrar Cierre Parcial del Día"
              >
                <IconPause />
                <span className="action-btn-text">Cerrar Día</span>
              </button>
              <button
                type="button"
                onClick={handleFinishClick}
                disabled={loading}
                className="btn-action-success finish"
                title="Finalizar Actividad Definitivamente"
              >
                <IconCheck />
                <span className="action-btn-text">Finalizar</span>
              </button>
            </>
          )}

          {/* Botón Acordeón / Expansión */}
          <button
            type="button"
            className="btn-action-icon expand"
            onClick={handleToggleExpand}
            title={isExpanded ? "Colapsar detalles" : "Expandir detalles"}
          >
            {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
          </button>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="actividad-card-body">
        {/* Descripción Principal de la Actividad */}
        <h4 className="actividad-card-descripcion">
          {actividadPlanificada.descripcion || 'Sin descripción'}
        </h4>

        {/* Barras de Progreso Físico y Financiero */}
        {hasSubactividades ? (
          <div className="ejecucion-progress-row">
            <div className="ejecucion-progress-track">
              <div className="track-header">
                <span>Avance Físico (Checklist)</span>
                <strong>{avanceFisico}%</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill physical" style={{ width: `${avanceFisico}%` }} />
              </div>
            </div>

            <div className="ejecucion-progress-track">
              <div className="track-header">
                <span>Avance Financiero (Unidades)</span>
                <strong style={{ color: avanceFinanciero < 100 && estadoActual === 'completada' ? '#ea580c' : '#15803d' }}>
                  {avanceFinanciero}%
                </strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill financial" style={{ width: `${avanceFinanciero}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="ejecucion-progress-row single-track">
            <div className="ejecucion-progress-track">
              <div className="track-header">
                <span>Avance Físico y Financiero (Unidades)</span>
                <strong style={{ color: avanceFinanciero < 100 && estadoActual === 'completada' ? '#ea580c' : '#15803d' }}>
                  {avanceFinanciero}%
                </strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill financial" style={{ width: `${avanceFinanciero}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Bloque Financiero y Operativo Homogéneo */}
        <div className="actividad-financial-block">
          <div className="actividad-financial-cell">
            <span className="cell-label">Volumen / Cantidad</span>
            <div className="cell-value-group">
              <span className="cell-value-primary">
                {cantRealVal !== null && cantRealVal !== undefined && cantRealVal !== '' ? `${cantRealVal} / ` : ''}
                {actividadPlanificada.cantidad_programada || 0} {actividadPlanificada.unidad_medida || 'UND'}
              </span>
              {cantRealVal !== null && cantRealVal !== undefined && cantRealVal !== '' && (
                <span className="cell-sub-info" style={{ color: '#16a34a' }}>
                  Ejecutado: {cantRealVal} {actividadPlanificada.unidad_medida || 'UND'}
                </span>
              )}
            </div>
          </div>

          <div className="actividad-financial-cell">
            <span className="cell-label">Monto Estimado</span>
            <div className="cell-value-group">
              <span className="cell-value-primary highlight">
                ${montoProgramado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="cell-sub-info">
                P.U: ${(actividadPlanificada.precio_unitario || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="actividad-financial-cell">
            <span className="cell-label">Monto Ejecutado Real</span>
            <div className="cell-value-group">
              <span className="cell-value-primary" style={{ color: '#15803d' }}>
                ${montoEjecutadoReal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="cell-sub-info">
                {avanceFinanciero}% ejecutado
              </span>
            </div>
          </div>

          <div className="actividad-financial-cell">
            <span className="cell-label">Recursos Asignados</span>
            <div className="cell-value-group">
              <div className="cell-badges-row">
                <span className="pill-badge crew">
                  👤 {actividadPlanificada.personal?.length || 0} Personal
                </span>
                {hasSubactividades && (
                  <span className="pill-badge checklist">
                    ✅ {subCompleted}/{subTotal} Tareas
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="execution-item-details">
          {/* Personal Section */}
          <div className="ejecucion-personal-section">
            <div className="ejecucion-section-header">
              <h5 className="section-title">Personal Asignado</h5>
              <button
                type="button"
                onClick={() => setShowAddPersonalModal(true)}
                className="btn-add-pill"
              >
                <IconPlus />
                <span>Agregar Personal</span>
              </button>
            </div>

            {actividadPlanificada.personal && actividadPlanificada.personal.length > 0 ? (
              <div className="ejecucion-personal-list">
                {actividadPlanificada.personal.map(p => (
                  <span key={p.id} className="personal-badge-chip">
                    <span className="personal-avatar">👤</span>
                    <span className="personal-name">{p.nombre_personal}</span>
                    {p.rol_en_actividad && (
                      <span className="personal-role">• {p.rol_en_actividad}</span>
                    )}

                    {(estadoActual === 'pendiente' || estadoActual === 'en_progreso') && (
                      <button
                        type="button"
                        onClick={() => handleRemovePersonal(p.id, p.nombre_personal)}
                        title="Remover personal"
                        className="personal-remove-btn"
                      >
                        <IconX />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ejecucion-empty-hint">No hay personal asignado a esta actividad.</p>
            )}
          </div>

          {/* Subactividades Section (Solo si tiene subactividades asignadas desde planificación) */}
          {hasSubactividades && (
            (estadoActual === 'pendiente' || estadoActual === 'replanificada') ? (
              <p className="ejecucion-empty-hint text-center">Inicia la actividad para gestionar el checklist de tareas operativas.</p>
            ) : (
              <div className="ejecucion-subactividades-section">
                <h5 className="section-title">Checklist de Tareas Operativas</h5>
                <SubactividadesList
                  actividadId={actividadPlanificada.id}
                  initialData={actividadPlanificada.subactividades}
                  readOnly={estadoActual === 'completada'}
                />
              </div>
            )
          )}
        </div>
      )}

      {/* Start Modal */}
      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)} title="Iniciar Actividad">
        <div className="ejecucion-modal-body">
          <p className="modal-intro-text">
            Confirme la fecha de inicio oficial para registrar los avances de esta actividad.
          </p>
          <div className="form-group">
            <label className="form-label">Fecha de Inicio Real:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="ejecucion-modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowStartModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={confirmStart} disabled={loading}>
              Confirmar Inicio
            </button>
          </div>
        </div>
      </Modal>

      {/* Close Day Modal */}
      <Modal isOpen={showCloseDayModal} onClose={() => setShowCloseDayModal(false)} title="Cerrar Día (Avance Diario)">
        <div className="ejecucion-modal-body">
          <p className="modal-intro-text">
            Registre el avance parcial ejecutado hoy para generar un reporte diario y actualizar los datos.
          </p>

          <div className="ejecucion-form-grid">
            <div className="form-group">
              <label className="form-label">Fecha de Cierre:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ejecutado Hoy ({actividadPlanificada.unidad_medida || 'UND'}):</label>
              <input
                type="number"
                className="form-control"
                value={cantidadRealInput}
                onChange={e => setCantidadRealInput(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
              <div className="field-hint-row">
                <span>Acumulado: {actividadPlanificada.cantidad_real || 0}</span>
                <span>Restante: {(parseFloat(actividadPlanificada.cantidad_programada || 0) - parseFloat(actividadPlanificada.cantidad_real || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reportado Por (Responsable): *</label>
            <input
              type="text"
              className="form-control"
              value={reporteData.usuario}
              onChange={e => setReporteData(prev => ({ ...prev, usuario: e.target.value }))}
              placeholder="Nombre del supervisor o responsable"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Actividades Realizadas Hoy: *</label>
            <textarea
              className="form-control"
              rows="3"
              value={reporteData.descripcion}
              onChange={e => setReporteData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describa el trabajo ejecutado durante la jornada..."
            />
          </div>

          {/* Consumo de Materiales Opcional */}
          <div className="ejecucion-material-section">
            <h5 className="material-section-title">📦 Consumo de Materiales (Opcional)</h5>
            <div className="material-inputs-row">
              <select
                className="form-control material-select"
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
              >
                <option value="">-- Seleccionar Material en Almacén --</option>
                {inventory.filter(i => i.cantidad_disponible > 0).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.nombre_producto} (Disponible: {item.cantidad_disponible} {item.unidad})
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="form-control material-qty-input"
                placeholder="Cant."
                value={materialQuantity}
                onChange={e => setMaterialQuantity(e.target.value)}
                step="0.01"
              />
              <button
                type="button"
                className="btn-info material-add-btn"
                onClick={handleAddMaterial}
                title="Agregar material"
              >
                <IconPlus />
              </button>
            </div>

            {materialsToConsume.length > 0 && (
              <div className="materials-chips-stack">
                {materialsToConsume.map((mat, idx) => (
                  <span key={idx} className="material-item-chip">
                    <span>{mat.nombre}: <strong>{mat.cantidad} {mat.unidad}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(idx)}
                      className="material-chip-remove"
                      title="Eliminar material"
                    >
                      <IconX />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones / Incidentes:</label>
            <textarea
              className="form-control"
              rows="2"
              value={reporteData.justificacion}
              onChange={e => setReporteData(prev => ({ ...prev, justificacion: e.target.value }))}
              placeholder="Notas adicionales, dificultades encontradas o condiciones climáticas..."
            />
          </div>

          <div className="ejecucion-modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowCloseDayModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={confirmCloseDay} disabled={loading}>
              Guardar Cierre Diario
            </button>
          </div>
        </div>
      </Modal>

      {/* Finish Modal (Step 1) */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="Finalizar Actividad">
        <div className="ejecucion-modal-body">
          <p className="modal-intro-text">
            Complete el balance final de la actividad para cerrar la ejecución y emitir el informe final.
          </p>

          <div className="ejecucion-form-grid">
            <div className="form-group">
              <label className="form-label">Fecha de Culminación:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Acumulado Ejecutado ({actividadPlanificada.unidad_medida || 'UND'}):</label>
              <input
                type="number"
                className="form-control"
                value={cantidadRealInput}
                onChange={e => setCantidadRealInput(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          <small className="field-hint-text">Nota: Ingrese la cantidad TOTAL final acumulada de la actividad.</small>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Reportado Por (Responsable): *</label>
            <input
              type="text"
              className="form-control"
              value={reporteData.usuario}
              onChange={e => setReporteData(prev => ({ ...prev, usuario: e.target.value }))}
              placeholder="Nombre del supervisor o responsable"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción del Trabajo Final Realizado: *</label>
            <textarea
              className="form-control"
              rows="3"
              value={reporteData.descripcion}
              onChange={e => setReporteData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Resumen ejecutivo del trabajo culminado..."
            />
          </div>

          {/* Consumo de Materiales Opcional */}
          <div className="ejecucion-material-section">
            <h5 className="material-section-title">📦 Consumo de Materiales en Cierre (Opcional)</h5>
            <div className="material-inputs-row">
              <select
                className="form-control material-select"
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
              >
                <option value="">-- Seleccionar Material en Almacén --</option>
                {inventory.filter(i => i.cantidad_disponible > 0).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.nombre_producto} (Disponible: {item.cantidad_disponible} {item.unidad})
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="form-control material-qty-input"
                placeholder="Cant."
                value={materialQuantity}
                onChange={e => setMaterialQuantity(e.target.value)}
                step="0.01"
              />
              <button
                type="button"
                className="btn-info material-add-btn"
                onClick={handleAddMaterial}
                title="Agregar material"
              >
                <IconPlus />
              </button>
            </div>

            {materialsToConsume.length > 0 && (
              <div className="materials-chips-stack">
                {materialsToConsume.map((mat, idx) => (
                  <span key={idx} className="material-item-chip">
                    <span>{mat.nombre}: <strong>{mat.cantidad} {mat.unidad}</strong></span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(idx)}
                      className="material-chip-remove"
                      title="Eliminar material"
                    >
                      <IconX />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones Finales:</label>
            <textarea
              className="form-control"
              rows="2"
              value={reporteData.justificacion}
              onChange={e => setReporteData(prev => ({ ...prev, justificacion: e.target.value }))}
              placeholder="Comentarios adicionales de cierre..."
            />
          </div>

          <div className="ejecucion-modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowFinishModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-success" onClick={confirmFinish} disabled={loading}>
              Continuar Finalización
            </button>
          </div>
        </div>
      </Modal>

      {/* Replan Confirm Modal (Step 2 if pending units exist) */}
      <Modal isOpen={showReplanConfirmModal} onClose={() => setShowReplanConfirmModal(false)} title="Unidades Pendientes Detectadas">
        <div className="ejecucion-modal-body">
          <div className="ejecucion-alert-card warning">
            <IconAlertCircle />
            <div className="alert-content">
              <strong>¡Diferencia de Unidades Detectada!</strong>
              <p>Has reportado <strong>{cantidadRealInput}</strong> de <strong>{actividadPlanificada.cantidad_programada}</strong> {actividadPlanificada.unidad_medida || 'unidades'} planificadas.</p>
              <p className="pending-highlight">Quedan <strong>{pendingDiff}</strong> unidades pendientes de ejecución.</p>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Fecha para Replanificar las Unidades Pendientes:</label>
            <input
              type="date"
              className="form-control"
              value={replanData.fechaNueva}
              onChange={e => setReplanData(prev => ({ ...prev, fechaNueva: e.target.value, autoTomorrow: false }))}
            />
            <small className="field-hint-text">Por defecto se sugiere para mañana, o elija el día deseado.</small>
          </div>

          <div className="ejecucion-modal-actions stacked-mobile">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleReplanDecision(false)}
              title="Finalizará la tarea concluyendo solo lo ejecutado sin replanificar pendientes."
            >
              No, Finalizar Parcial (Cierra Item)
            </button>
            <button
              type="button"
              className="btn-primary btn-replan"
              onClick={() => handleReplanDecision(true)}
            >
              Sí, Replanificar Pendientes
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Personal Modal */}
      <Modal isOpen={showAddPersonalModal} onClose={() => setShowAddPersonalModal(false)} title="Agregar Personal a la Actividad">
        <div className="ejecucion-modal-body">
          <div className="form-group">
            <label className="form-label">Seleccionar Personal:</label>
            <select
              className="form-control"
              value={selectedPersonalId}
              onChange={e => {
                const val = e.target.value;
                setSelectedPersonalId(val);
                const p = availablePersonal.find(x => x.id === val);
                if (p) setSelectedPersonalRol(p.cargo || '');
              }}
            >
              <option value="">-- Seleccione del personal del proyecto --</option>
              {availablePersonal.map(p => (
                <option key={p.id} value={p.id}>
                  {p.isContractor ? '[Contratista] ' : ''}{p.nombre} {p.apellido} - {p.cargo || 'Sin cargo'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Rol en esta actividad:</label>
            <input
              type="text"
              className="form-control"
              value={selectedPersonalRol}
              onChange={e => setSelectedPersonalRol(e.target.value)}
              placeholder="Ej. Cuadrillero, Operador, Caporal, Soldador..."
            />
          </div>

          <div className="ejecucion-modal-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAddPersonalModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={confirmAddPersonal} disabled={loading}>
              Agregar Personal
            </button>
          </div>
        </div>
      </Modal>

      {/* View Reports Modal */}
      <ReportViewerModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        actividadId={actividadPlanificada.id}
        actividadTitulo={actividadPlanificada.descripcion}
      />

    </div>
  );
};

// Sub-component for Viewing Activity Reports
const ReportViewerModal = ({ isOpen, onClose, actividadId, actividadTitulo }) => {
  const [reports, setReports] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const { getReportes } = useExecution();

  useEffect(() => {
    if (isOpen && actividadId) {
      setLoadingReport(true);
      getReportes(actividadId).then(data => {
        setReports(data || []);
        setLoadingReport(false);
      });
    }
  }, [isOpen, actividadId, getReportes]);

  const displayDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return new Date(dateStr).toLocaleDateString();
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historial de Informes de Ejecución" size="lg">
      <div className="ejecucion-modal-body">
        {actividadTitulo && (
          <div className="report-viewer-subtitle">
            <span>Actividad: <strong>{actividadTitulo}</strong></span>
          </div>
        )}

        {loadingReport ? (
          <div className="ejecucion-report-loading">
            <p>Cargando informes de la actividad...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="ejecucion-reports-stack">
            {reports.map((report) => (
              <div key={report.id} className="ejecucion-report-card">
                {/* Header of Report Card */}
                <div className="report-card-header">
                  <div>
                    <span className={`report-action-pill ${report.tipo_accion || 'cierre'}`}>
                      {report.tipo_accion?.replace('_', ' ') || 'REPORTE'}
                    </span>
                    <div className="report-date-title">
                      {new Date(report.fecha_reporte).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div className="report-author-subtitle">
                      Por: <strong>{report.usuario_reporta || 'Supervisor'}</strong>
                    </div>
                  </div>

                  {report.detalles?.partida_asociada && (
                    <div className="report-partida-box">
                      <small>Partida</small>
                      <span>{report.detalles.partida_asociada.nombre}</span>
                    </div>
                  )}
                </div>

                {/* Body of Report Card */}
                <div className="report-entry-content-grid">
                  {report.detalles && (
                    <div className="report-content-box">
                      <span className="report-box-label">
                        {report.tipo_accion === 'avance_diario' ? 'Fecha Cierre:' : 'Período Ejecutado:'}
                      </span>
                      <div className="report-box-value-text">
                        {report.tipo_accion === 'avance_diario'
                          ? displayDate(report.detalles.fecha_cierre_diario)
                          : `${displayDate(report.detalles.fecha_inicio_real)} - ${displayDate(report.detalles.fecha_fin_real)}`
                        }
                      </div>
                    </div>
                  )}

                  <div className="report-content-box">
                    <span className="report-box-label">Cantidad Reportada:</span>
                    <div className="report-box-value highlight-green">
                      {report.cantidades_ejecutadas} UND
                    </div>
                  </div>
                </div>

                <div className="report-desc-block">
                  <span className="report-box-label">Descripción de Trabajos:</span>
                  <p className="report-box-desc">{report.descripcion_trabajo || 'Sin detalles'}</p>
                </div>

                {report.justificacion && (
                  <div className="report-entry-alert">
                    <span className="report-alert-label">Observaciones / Incidentes:</span>
                    <p className="report-alert-text">{report.justificacion}</p>
                  </div>
                )}

                {report.detalles?.materiales && report.detalles.materiales.length > 0 && (
                  <div className="report-entry-materials">
                    <span className="materials-title">📦 Materiales Utilizados:</span>
                    <div className="materials-chip-list">
                      {report.detalles.materiales.map((mat, idx) => (
                        <span key={idx} className="material-chip">
                          {mat.nombre}: <strong>{mat.cantidad} {mat.unidad}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(report.detalles?.personal_snapshot || report.detalles?.subactividades_snapshot) && (
                  <details className="report-snapshot-details">
                    <summary>Ver Detalles Snapshot (Personal y Checklist)</summary>
                    <div className="snapshot-content">
                      {report.detalles.personal_snapshot && (
                        <div className="snapshot-row">
                          <strong>Personal:</strong>
                          <span>
                            {report.detalles.personal_snapshot.map(p => p.nombre_personal).join(', ')}
                          </span>
                        </div>
                      )}
                      {report.detalles.subactividades_snapshot && (
                        <div className="snapshot-row">
                          <strong>Checklist:</strong>
                          <ul>
                            {report.detalles.subactividades_snapshot.map((s, i) => (
                              <li key={i}>{s.descripcion} {s.completada ? '✅' : '⚪'}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="ejecucion-report-empty">
            <p>No hay informes registrados para esta actividad.</p>
          </div>
        )}

        <div className="ejecucion-modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActividadEjecucion;
