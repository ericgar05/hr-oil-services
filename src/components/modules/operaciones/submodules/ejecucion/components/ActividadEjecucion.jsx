import { useState, useEffect } from 'react';
import { useExecution } from '../../../../../../contexts/ExecutionContext';
import { useNotification } from '../../../../../../contexts/NotificationContext';
import { usePersonal } from '../../../../../../contexts/PersonalContext';
import { useOperaciones } from '../../../../../../contexts/OperacionesContext';
import { useBudget } from '../../../../../../contexts/BudgetContext';
import { SubactividadesList } from './SubactividadesList';
import Modal from '../../../../../common/Modal/Modal';

// Iconos Vectoriales SVG Profesionales
const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconChevronDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconChevronUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
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

  // New States for Replan Alert Flow
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

  const { iniciarEjecucionActividad, finalizarActividad, registrarCierreDiario, agregarPersonalActividad, eliminarPersonalActividad, loading, getReportes } = useExecution();
  const { showToast } = useNotification();
  const { getEmployeesByProject } = usePersonal();
  const { inventory, withdrawInventory } = useOperaciones();
  const { budget } = useBudget();

  // ... (rest of component code remains same until end)

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

  // ... (existing code) ...

  const handleCloseDayClick = (e) => {
    e.stopPropagation();
    setSelectedDate(new Date().toISOString().split('T')[0]);
    // Pre-fill with programmed amount or existing real amount (but usually empty for 'what did you do today')
    setCantidadRealInput('');
    setReporteData({ usuario: '', descripcion: '', justificacion: '' });
    // Reset Material State
    setMaterialsToConsume([]);
    setSelectedMaterialId('');
    setMaterialQuantity('');
    setShowCloseDayModal(true);
  };

  // Helper to add material to list
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

  const processMaterialWithdrawals = async (materials, reporteUsuario) => {
    if (!materials || materials.length === 0) return true;

    // We execute withdrawals one by one. If one fails, we might have partials.
    // In a real app we'd want a transaction or batch endpoint.
    // Here we will try best effort.
    for (const mat of materials) {
      // We reuse the existing withdrawInventory function which likely updates DB state
      // We need to pass valid payload.
      try {
        await withdrawInventory({
          inventario_id: mat.id,
          cantidad_retirada: mat.cantidad,
          retirado_por: reporteData.usuario, // Explicitly use the report user
          observaciones: `Actividad: ${actividadPlanificada.descripcion}` // Clean connection info
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
      // 1. Withdraw Materials
      const withdrawalsSuccess = await processMaterialWithdrawals(materialsToConsume, reporteData.usuario);
      if (!withdrawalsSuccess) return; // Stop if inventory fail

      // 2. Register Close Day with Materials
      await registrarCierreDiario(actividadPlanificada.id, selectedDate, cantidadRealInput, reporteData, materialsToConsume);

      setShowCloseDayModal(false);
      onUpdate();
      showToast("Cierre diario registrado y reporte generado", "success");
    } catch (error) {
      showToast("Error al registrar cierre diario: " + error.message, "error");
    }
  };


  const estadoActual = actividadPlanificada.estado || 'pendiente';
  // Avance se basa en subactividades completadas ahora? O manual?
  // Por ahora, simple: 0 si pendiente, 50 en proceso, 100 completada. 
  // O mejor, calcular based on subactividades checklist if available.

  const subTotal = actividadPlanificada.subactividades?.length || 0;
  const subCompleted = actividadPlanificada.subactividades?.filter(s => s.completada).length || 0;

  // Prefer stored 'avance' if available (from DB update), otherwise fallback to live calculation
  // NOTE: DB 'avance' seems to track Physical progress based on subactivities.
  const avanceFisico = actividadPlanificada.avance !== undefined
    ? actividadPlanificada.avance
    : (subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : (estadoActual === 'completada' ? 100 : 0));

  // Financial Progress logic: Executed Units / Planned Units
  // If finalized, we strictly use 'cantidad_real' if present.
  const cantProgramada = parseFloat(actividadPlanificada.cantidad_programada) || 1;
  const cantReal = parseFloat(actividadPlanificada.cantidad_real) || 0;

  // If pending/in_progress, cantReal might be 0 unless we track partials. Assume 0 until finalized? 
  // Or if completed, calculate ratio.
  const avanceFinanciero = (estadoActual === 'completada' || actividadPlanificada.cantidad_real)
    ? Math.min(Math.round((cantReal / cantProgramada) * 100), 100)
    : 0;

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
    // Validar si todas las subactividades están listas? 
    // Por ahora flexible.
    setSelectedDate(new Date().toISOString().split('T')[0]);
    // Pre-fill with programmed amount or existing real amount
    setCantidadRealInput(actividadPlanificada.cantidad_real || actividadPlanificada.cantidad_programada || '');
    setReporteData({ usuario: '', descripcion: '', justificacion: '' });
    setReplanData({ replanificar: true, fechaNueva: '', autoTomorrow: true }); // Default to Auto Replan if partial
    // Reset Material State
    setMaterialsToConsume([]);
    setSelectedMaterialId('');
    setMaterialQuantity('');
    setShowFinishModal(true);
  };

  const confirmFinish = async () => {
    // Validation
    if (!reporteData.usuario || !reporteData.descripcion || cantidadRealInput === '') {
      showToast("Complete todos los campos obligatorios", "error");
      return;
    }

    const executed = parseFloat(cantidadRealInput || 0);
    const planned = parseFloat(actividadPlanificada.cantidad_programada);
    const diff = planned - executed;

    if (diff > 0) {
      // Pending units detected -> Trigger Alert Flow
      setPendingDiff(diff);

      // Calculate Tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      // Default to tomorrow, preset value
      setReplanData({ replanificar: true, fechaNueva: tomorrowStr, autoTomorrow: false });
      setShowFinishModal(false); // Close main modal
      setShowReplanConfirmModal(true); // Open decision modal
      return;
    }

    // If complete or over-executed, finalize immediately
    if (window.confirm("¿Confirma que desea FINALIZAR esta actividad? Esta acción es irreversible.")) {
      performFinalize(null);
    }
  };

  const performFinalize = async (replanPayload) => {
    try {
      // 1. Withdraw Materials
      const withdrawalsSuccess = await processMaterialWithdrawals(materialsToConsume, reporteData.usuario);
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
      // Validate Date if custom
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
      // Finalize without replanning (just close with partials)
      if (window.confirm("¿Seguro que desea finalizar con cantidades pendientes SIN replanificar? Las unidades restantes NO se programarán para otro día.")) {
        performFinalize(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada': return '#22c55e'; // Green
      case 'en_progreso': return '#3b82f6'; // Blue
      case 'replanificada': return '#a855f7'; // Purple (Distinct)
      default: return '#94a3b8'; // Slate
    }
  };

  // Helper for Date Display (YYYY-MM-DD to Local UI without TZ shift)
  const formatDateNoTZ = (dateStr) => {
    if (!dateStr) return 'N/A';
    // If it's full ISO with T, split it. If it's YYYY-MM-DD, split it.
    const parts = dateStr.includes('T') ? dateStr.split('T')[0].split('-') : dateStr.split('-');
    if (parts.length === 3) {
      // Create date at noon to avoid timezone rollover
      return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).toLocaleDateString();
    }
    return dateStr;
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

      {/* Header de la Tarjeta (Homogéneo con Semanas y Valuaciones) */}
      <div className="actividad-card-header" onClick={handleToggleExpand} style={{ cursor: 'pointer' }}>
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
              backgroundColor: `${getStatusColor(estadoActual)}18`,
              color: getStatusColor(estadoActual),
              border: `1px solid ${getStatusColor(estadoActual)}35`,
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              flexShrink: 0
            }}
          >
            {estadoActual.replace('_', ' ')}
          </span>
        </div>

        {/* Grupo de Acciones del Header */}
        <div className="actividad-card-actions-group" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReportModal(true);
            }}
            className="btn-action-icon report"
            title="Ver Informes de la Actividad"
            style={{ width: 'auto', padding: '0 8px', fontSize: '0.75rem', gap: '4px' }}
          >
            📄 <span className="action-text-hide-mobile">Informes</span>
          </button>

          {(estadoActual === 'pendiente' || estadoActual === 'replanificada') && (
            <button
              type="button"
              onClick={handleStartClick}
              disabled={loading}
              className="btn-action-primary start"
              title="Iniciar Ejecución"
            >
              ▶ Iniciar
            </button>
          )}

          {estadoActual === 'en_progreso' && (
            <>
              <button
                type="button"
                onClick={handleCloseDayClick}
                disabled={loading}
                className="btn-action-warning pause"
                title="Cierre Parcial del Día"
              >
                ⏸ Cerrar Día
              </button>
              <button
                type="button"
                onClick={handleFinishClick}
                disabled={loading}
                className="btn-action-success finish"
                title="Finalizar Actividad"
              >
                ✓ Finalizar
              </button>
            </>
          )}

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

        {/* Bloque Financiero y Operativo idéntico a semanas y valuaciones */}
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
                <span className="pill-badge checklist">
                  ✅ {subCompleted}/{subTotal} Tareas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="execution-item-details" style={{ borderTop: '1px solid #dae1e7', padding: '15px', backgroundColor: '#f8fafc' }}>

          {/* Personal Section */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h5 style={{ margin: 0, fontSize: '0.9rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Asignado</h5>
              <button
                onClick={() => setShowAddPersonalModal(true)}
                style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', borderRadius: '4px', cursor: 'pointer' }}
              >
                + Agregar
              </button>
            </div>
            {actividadPlanificada.personal && actividadPlanificada.personal.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {actividadPlanificada.personal.map(p => (
                  <span key={p.id} style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    paddingRight: (estadoActual === 'pendiente' || estadoActual === 'en_progreso') ? '28px' : '8px'
                  }}>
                    <span style={{ fontSize: '1rem' }}>👤</span>
                    <span style={{ fontWeight: 500 }}>{p.nombre_personal}</span>
                    {p.rol_en_actividad && <span style={{ color: '#64748b', fontSize: '0.8rem' }}>• {p.rol_en_actividad}</span>}

                    {(estadoActual === 'pendiente' || estadoActual === 'en_progreso') && (
                      <button
                        onClick={() => handleRemovePersonal(p.id, p.nombre_personal)}
                        title="Remover personal"
                        style={{
                          position: 'absolute',
                          right: '2px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          padding: '2px 5px',
                          lineHeight: 1
                        }}
                      >
                        ✖
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>No hay personal asignado.</p>
            )}
          </div>
          {(estadoActual === 'pendiente' || estadoActual === 'replanificada') ? (
            <p className="text-center text-muted">Inicia la actividad para gestionar el checklist.</p>
          ) : (
            <div className="details-grid">
              <h5 style={{ marginBottom: '10px' }}>Checklist de Subactividades</h5>
              <SubactividadesList
                actividadId={actividadPlanificada.id}
                initialData={actividadPlanificada.subactividades}
                readOnly={estadoActual === 'completada'}
              />
            </div>
          )}
        </div>
      )}

      {/* Start Modal */}
      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)} title="Iniciar Actividad">
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Fecha de Inicio Real:</label>
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setShowStartModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={confirmStart} disabled={loading}>Confirmar Inicio</button>
          </div>
        </div>
      </Modal>

      {/* Close Day Modal */}
      <Modal isOpen={showCloseDayModal} onClose={() => setShowCloseDayModal(false)} title="Cerrar Día (Avance Diario)">
        <div style={{ padding: '20px' }}>
          <p style={{ marginBottom: '10px', color: '#64748b', fontSize: '0.9rem' }}>Registre el avance del día para generar un reporte parcial y pausar/guardar estado.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Fecha Cierre:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Ejecutado Hoy:</label>
              <input
                type="number"
                className="form-control"
                value={cantidadRealInput}
                onChange={e => setCantidadRealInput(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
              <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Ejec: {actividadPlanificada.cantidad_real || 0}</span>
                <span>Disp: {(parseFloat(actividadPlanificada.cantidad_programada || 0) - parseFloat(actividadPlanificada.cantidad_real || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Reportado Por: *</label>
            <input
              type="text"
              className="form-control"
              value={reporteData.usuario}
              onChange={e => setReporteData(prev => ({ ...prev, usuario: e.target.value }))}
              placeholder="Supervisor"
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Actividades Realizadas Hoy: *</label>
            <textarea
              className="form-control"
              rows="2"
              value={reporteData.descripcion}
              onChange={e => setReporteData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Detalle de trabajos..."
            />
          </div>

          {/* Material Selection UI */}
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
            <h5 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#0369a1' }}>Consumo de Materiales (Opcional)</h5>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select
                className="form-control"
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">-- Seleccionar Material --</option>
                {inventory.filter(i => i.cantidad_disponible > 0).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.nombre_producto} (Disp: {item.cantidad_disponible} {item.unidad})
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="form-control"
                style={{ width: '100px', fontSize: '0.85rem' }}
                placeholder="Cant."
                value={materialQuantity}
                onChange={e => setMaterialQuantity(e.target.value)}
              />
              <button
                type="button"
                className="btn-info"
                onClick={handleAddMaterial}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                +
              </button>
            </div>

            {/* List of pending materials */}
            {materialsToConsume.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                {materialsToConsume.map((mat, idx) => (
                  <li key={idx}>
                    {mat.nombre}: <strong>{mat.cantidad} {mat.unidad}</strong>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(idx)}
                      style={{ marginLeft: '10px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Observaciones:</label>
            <textarea
              className="form-control"
              rows="2"
              value={reporteData.justificacion}
              onChange={e => setReporteData(prev => ({ ...prev, justificacion: e.target.value }))}
              placeholder="Incidentes, pendientes..."
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setShowCloseDayModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={confirmCloseDay} disabled={loading}>Guardar Cierre Diario</button>
          </div>
        </div>
      </Modal>

      {/* Finish Modal (Step 1) */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="Finalizar Actividad">
        <div style={{ padding: '20px' }}>
          <p>Complete los datos para finalizar la actividad.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Fecha Culminación:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Total Ejecutado Final:</label>
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
          <small style={{ display: 'block', marginTop: '5px', color: '#64748b' }}>Nota: Ingrese el TOTAL acumulado ejecutado.</small>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

          <h5 style={{ marginBottom: '10px', color: '#475569' }}>Informe de Ejecución Final</h5>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Reportado Por (Responsable): *</label>
            <input
              type="text"
              className="form-control"
              value={reporteData.usuario}
              onChange={e => setReporteData(prev => ({ ...prev, usuario: e.target.value }))}
              placeholder="Nombre del supervisor/responsable"
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Descripción del Trabajo: *</label>
            <textarea
              className="form-control"
              rows="2"
              value={reporteData.descripcion}
              onChange={e => setReporteData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Detalles de la ejecución..."
            />
          </div>

          {/* Material Selection UI */}
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
            <h5 style={{ fontSize: '0.9rem', marginBottom: '10px', color: '#0369a1' }}>Consumo de Materiales (Opcional)</h5>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <select
                className="form-control"
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                <option value="">-- Seleccionar Material --</option>
                {inventory.filter(i => i.cantidad_disponible > 0).map(item => (
                  <option key={item.id} value={item.id}>
                    {item.nombre_producto} (Disp: {item.cantidad_disponible} {item.unidad})
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="form-control"
                style={{ width: '100px', fontSize: '0.85rem' }}
                placeholder="Cant."
                value={materialQuantity}
                onChange={e => setMaterialQuantity(e.target.value)}
              />
              <button
                type="button"
                className="btn-info"
                onClick={handleAddMaterial}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                +
              </button>
            </div>
            {materialsToConsume.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                {materialsToConsume.map((mat, idx) => (
                  <li key={idx}>
                    {mat.nombre}: <strong>{mat.cantidad} {mat.unidad}</strong>
                    <button
                      type="button"
                      onClick={() => handleRemoveMaterial(idx)}
                      style={{ marginLeft: '10px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Justificación / Comentarios:</label>
            <textarea
              className="form-control"
              rows="2"
              value={reporteData.justificacion}
              onChange={e => setReporteData(prev => ({ ...prev, justificacion: e.target.value }))}
              placeholder="Alguna observación final..."
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setShowFinishModal(false)}>Cancelar</button>
            <button className="btn-success" onClick={confirmFinish} disabled={loading} style={{ backgroundColor: '#22c55e', color: 'white' }}>Continuar</button>
          </div>
        </div>
      </Modal>

      {/* NEW: Replan Confirm Modal (Step 2 if pending) */}
      <Modal isOpen={showReplanConfirmModal} onClose={() => setShowReplanConfirmModal(false)} title="Unidades Pendientes Detectadas">
        <div style={{ padding: '20px' }}>
          <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px', padding: '15px', color: '#9a3412', marginBottom: '15px' }}>
            <strong>¡Atención!</strong>
            <p style={{ margin: '5px 0' }}>Has reportado <strong>{cantidadRealInput}</strong> de <strong>{actividadPlanificada.cantidad_programada}</strong> unidades planificadas.</p>
            <p style={{ margin: '0' }}>Quedan <strong>{pendingDiff}</strong> unidades pendientes.</p>
          </div>

          <p style={{ marginBottom: '10px', fontWeight: 600 }}>Seleccione fecha para la replanificación:</p>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#64748b' }}>Nueva Fecha (Por defecto: Mañana)</label>
            <input
              type="date"
              className="form-control"
              value={replanData.fechaNueva}
              onChange={e => setReplanData(prev => ({ ...prev, fechaNueva: e.target.value, autoTomorrow: false }))}
            />
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              className="btn-secondary"
              onClick={() => handleReplanDecision(false)}
              title="Finalizará la tarea concluyendo solo lo ejecutado."
            >
              No, Finalizar Parcial (Cierra Item)
            </button>
            <button
              className="btn-primary"
              onClick={() => handleReplanDecision(true)}
              style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
            >
              Sí, Replanificar Pendientes
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Personal Modal */}
      <Modal isOpen={showAddPersonalModal} onClose={() => setShowAddPersonalModal(false)} title="Agregar Personal a Actividad">
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Seleccionar Personal:</label>
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
              <option value="">-- Seleccione --</option>
              {availablePersonal.map(p => (
                <option key={p.id} value={p.id}>
                  {p.isContractor ? '[Contr] ' : ''}{p.nombre} {p.apellido} - {p.cargo}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Rol en esta actividad:</label>
            <input
              type="text"
              className="form-control"
              value={selectedPersonalRol}
              onChange={e => setSelectedPersonalRol(e.target.value)}
              placeholder="Ej. Operador, Ayudante..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => setShowAddPersonalModal(false)}>Cancelar</button>
            <button className="btn-primary" onClick={confirmAddPersonal} disabled={loading}>Agregar</button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal (List) */}
      <ReportViewerModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        actividadId={actividadPlanificada.id}
      />

    </div>
  );
};

// Sub-component for Viewing Reports (Stacked List)
const ReportViewerModal = ({ isOpen, onClose, actividadId }) => {
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

  // Date format helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  // Date display helper (no tz)
  const displayDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return new Date(dateStr).toLocaleDateString();
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historial de Reportes">
      <div style={{ padding: '20px' }}>
        {loadingReport ? (
          <p>Cargando reportes...</p>
        ) : reports.length > 0 ? (
          <div className="reports-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reports.map((report) => (
              <div key={report.id} className="report-card" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Header of Report Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <span style={{
                      backgroundColor: report.tipo_accion === 'replanificacion' ? '#fff7ed' : (report.tipo_accion === 'avance_diario' ? '#eff6ff' : '#f0fdf4'),
                      color: report.tipo_accion === 'replanificacion' ? '#c2410c' : (report.tipo_accion === 'avance_diario' ? '#1d4ed8' : '#15803d'),
                      padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                    }}>
                      {report.tipo_accion?.replace('_', ' ') || 'REPORTE'}
                    </span>
                    <div style={{ marginTop: '5px', fontWeight: 600, fontSize: '0.9rem' }}>{new Date(report.fecha_reporte).toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Por: {report.usuario_reporta}</div>
                  </div>
                  {report.detalles?.partida_asociada && (
                    <div style={{ textAlign: 'right', maxWidth: '40%' }}>
                      <small style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Partida Asociada</small>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#334155' }}>{report.detalles.partida_asociada.nombre}</span>
                    </div>
                  )}
                </div>

                {/* Body of Report Card */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  {/* Dates */}
                  {report.detalles && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                      <small style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>
                        {report.tipo_accion === 'avance_diario' ? 'Fecha Cierre:' : 'Período Ejecución:'}
                      </small>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {report.tipo_accion === 'avance_diario'
                          ? displayDate(report.detalles.fecha_cierre_diario)
                          : `${displayDate(report.detalles.fecha_inicio_real)} - ${displayDate(report.detalles.fecha_fin_real)}`
                        }
                      </div>
                    </div>
                  )}
                  {/* Quantities */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <small style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Ejecutado (Reporte):</small>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#22c55e' }}>
                      {report.cantidades_ejecutadas} Units
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <small style={{ fontWeight: 600, color: '#475569' }}>Descripción / Actividades:</small>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', whiteSpace: 'pre-wrap', color: '#334155' }}>{report.descripcion_trabajo}</p>
                </div>

                {report.justificacion && (
                  <div style={{ marginBottom: '10px' }}>
                    <small style={{ fontWeight: 600, color: '#be123c' }}>Observaciones:</small>
                    <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#be123c' }}>{report.justificacion}</p>
                  </div>
                )}

                {/* Materials Used Section */}
                {report.detalles?.materiales && report.detalles.materiales.length > 0 && (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    <small style={{ fontWeight: 600, color: '#0369a1', display: 'block', marginBottom: '5px' }}>📦 Materiales Utilizados:</small>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                      {report.detalles.materiales.map((mat, idx) => (
                        <li key={idx} style={{ color: '#0c4a6e' }}>
                          {mat.nombre}: <strong>{mat.cantidad} {mat.unidad}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Snapshots (Collapsible or Small) */}
                {(report.detalles?.personal_snapshot || report.detalles?.subactividades_snapshot) && (
                  <details style={{ marginTop: '10px', borderTop: '1px dashed #e2e8f0', paddingTop: '5px' }}>
                    <summary style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#64748b' }}>Ver Detalles Snapshot (Personal/Checklist)</summary>
                    <div style={{ marginTop: '10px', paddingLeft: '10px' }}>
                      {report.detalles.personal_snapshot && (
                        <div style={{ marginBottom: '8px' }}>
                          <small style={{ fontWeight: 600 }}>Personal:</small>
                          <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>
                            {report.detalles.personal_snapshot.map(p => p.nombre_personal).join(', ')}
                          </span>
                        </div>
                      )}
                      {report.detalles.subactividades_snapshot && (
                        <div>
                          <small style={{ fontWeight: 600 }}>Checklist:</small>
                          <ul style={{ margin: '4px 0 0 20px', fontSize: '0.8rem', padding: 0 }}>
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
          <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>No hay reportes registrados para esta actividad.</p>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </Modal >
  );
};