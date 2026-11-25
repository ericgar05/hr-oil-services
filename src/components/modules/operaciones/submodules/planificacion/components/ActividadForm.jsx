// components/planificacion/ActividadForm.jsx
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { usePlanning } from '../../../../../../contexts/PlanningContext';
import { useBudget } from '../../../../../../contexts/BudgetContext';
import { useCurrency } from '../../../../../../contexts/CurrencyContext';
import { usePersonal } from '../../../../../../contexts/PersonalContext';
import { useProjects } from '../../../../../../contexts/ProjectContext';
import { calculateDailyLaborCost } from '../../../../../../utils/payrollCalculator';
import './ActividadForm.css';

// Iconos Vectoriales SVG Profesionales
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const IconFolder = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const IconLayers = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export const ActividadForm = ({ diaId, diaFecha, allDias, actividadAEditar, onClose, onSuccess }) => {
  const { crearActividadPlanificada, updateActividad, getDisponibilidadPartida } = usePlanning();
  const { budget } = useBudget();
  const { convertToUSD, formatCurrency } = useCurrency();
  const { getEmployeesByProject } = usePersonal();
  const { selectedProject } = useProjects();

  const isEditMode = !!actividadAEditar;

  // Estados del Formulario
  const [formData, setFormData] = useState({
    descripcion: '',
    partida_id: '',
    unidad_medida: '',
    cantidad_programada: '',
    precio_unitario: '',
    subactividades: [''],
    personal_ids: []
  });

  // Segmentación en Subactividades
  const [segmentarActividad, setSegmentarActividad] = useState(false);

  // Replicación en Otros Días de la Semana
  const [replicateEnabled, setReplicateEnabled] = useState(false);
  const [selectedReplicateDays, setSelectedReplicateDays] = useState([]);

  // Búsqueda y Disponibilidad de Partidas
  const [partidaSearch, setPartidaSearch] = useState('');
  const [isSelectingPartida, setIsSelectingPartida] = useState(false);
  const [availableUnits, setAvailableUnits] = useState(null);
  const [totalPresupuestado, setTotalPresupuestado] = useState(0);

  // Personal y Cuadrilla
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [personalSearch, setPersonalSearch] = useState('');

  // Precio Base Contractual
  const [basePrice, setBasePrice] = useState(0);

  // Estado de Envío y Errores
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const subactividadInputRefs = useRef([]);

  // Días de la semana para replicar (excluyendo el día actual)
  const otherDaysOfWeek = useMemo(() => {
    if (!allDias || !diaId) return [];
    return allDias.filter(d => d.id !== diaId);
  }, [allDias, diaId]);

  // Cargar lista de personal del proyecto
  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      const data = await getEmployeesByProject(selectedProject?.id);
      setEmployees(data || []);
      setLoadingEmployees(false);
    };
    if (selectedProject?.id) {
      loadEmployees();
    }
  }, [selectedProject, getEmployeesByProject]);

  // Helper para detectar si la unidad es de tiempo/alquiler continuo
  const isTimeBasedUnit = (unidad) => {
    if (!unidad) return false;
    const u = unidad.toUpperCase().trim();
    return ['DIA', 'DIAS', 'DÍA', 'DÍAS', 'HORA', 'HORAS', 'HR', 'HRS', 'MES', 'MESES', 'ALQUILER'].includes(u);
  };

  // Helper para buscar un trabajador (empleado o contratista) por cualquier variación de ID o nombre
  const findEmployee = useCallback((empList, idOrPid, nameFallback = null) => {
    if (!empList || !empList.length) return null;
    if (!idOrPid && !nameFallback) return null;

    const rawId = idOrPid ? String(idOrPid) : '';
    const cleanId = rawId ? rawId.replace(/^(contractor-|employee-)/, '') : '';
    const targetName = (nameFallback || '').trim().toLowerCase();

    // 1. Coincidencia exacta por ID o ID limpio
    let match = empList.find(e => {
      if (String(e.id) === rawId) return true;
      if (cleanId) {
        if (String(e.id) === `contractor-${cleanId}`) return true;
        if (String(e.originalId) === cleanId) return true;
        if (String(e.id).replace(/^(contractor-|employee-)/, '') === cleanId) return true;
      }
      return false;
    });

    if (match) return match;

    // 2. Coincidencia por nombre (indispensable si personal_id fue null para contratistas)
    if (targetName) {
      match = empList.find(e => {
        const full = `${e.nombre || ''} ${e.apellido || ''}`.trim().toLowerCase();
        const justName = (e.nombre || '').trim().toLowerCase();
        return full === targetName || justName === targetName || targetName.includes(justName);
      });
      if (match) return match;
    }

    return null;
  }, []);

  // Cargar datos en modo Edición o limpiar para Nueva Actividad
  useEffect(() => {
    if (isEditMode && actividadAEditar) {
      const hasSubs = actividadAEditar.subactividades && actividadAEditar.subactividades.length > 0;
      setSegmentarActividad(hasSubs);

      // Mapear el personal asignado resolviendo IDs sintéticos de contratistas ('contractor-...')
      const mappedPersonalIds = (actividadAEditar.personal || []).map(p => {
        const found = findEmployee(employees, p.personal_id, p.nombre_personal);
        return found ? found.id : (p.personal_id || p.id);
      }).filter(Boolean);

      setFormData({
        descripcion: actividadAEditar.descripcion || '',
        partida_id: actividadAEditar.partida_id || '',
        unidad_medida: actividadAEditar.unidad_medida || '',
        cantidad_programada: actividadAEditar.cantidad_programada || '',
        precio_unitario: actividadAEditar.precio_unitario || '',
        subactividades: hasSubs
          ? actividadAEditar.subactividades.map(s => ({ id: s.id, descripcion: s.descripcion, completada: s.completada }))
          : [{ id: null, descripcion: '', completada: false }],
        personal_ids: mappedPersonalIds
      });

      setBasePrice(actividadAEditar.precio_unitario || 0);

      if (actividadAEditar.partida_id) {
        checkAvailability(actividadAEditar.partida_id, parseFloat(actividadAEditar.cantidad_programada));
      }
    } else {
      // Modo Nueva Actividad: Limpiar todos los campos a su estado inicial vacío
      setFormData({
        descripcion: '',
        partida_id: '',
        unidad_medida: '',
        cantidad_programada: '',
        precio_unitario: '',
        subactividades: [{ id: null, descripcion: '', completada: false }],
        personal_ids: []
      });
      setSegmentarActividad(false);
      setReplicateEnabled(false);
      setSelectedReplicateDays([]);
      setPartidaSearch('');
      setIsSelectingPartida(false);
      setAvailableUnits(null);
      setTotalPresupuestado(0);
      setBasePrice(0);
      setErrores({});
    }
  }, [actividadAEditar, isEditMode, employees, findEmployee]);

  // Comprobar disponibilidad presupuestaria
  const checkAvailability = async (partidaId, currentOwnAmount = 0) => {
    const item = budget?.items?.find(i => i.id === partidaId);
    if (item) {
      setTotalPresupuestado(parseFloat(item.cantidad) || 0);
    }
    const available = await getDisponibilidadPartida(partidaId);
    setAvailableUnits(available + currentOwnAmount);
  };

  // Manejador al seleccionar una partida
  const handlePartidaChange = async (itemId) => {
    const item = budget?.items?.find(i => i.id === itemId);
    if (item) {
      const priceUSD = convertToUSD(item.precioUnitario, item.moneda);
      const isTime = isTimeBasedUnit(item.unidad);

      setFormData(prev => ({
        ...prev,
        partida_id: itemId,
        unidad_medida: item.unidad,
        precio_unitario: priceUSD,
      }));

      setSegmentarActividad(!isTime && prevHasSubs(formData.subactividades));
      setBasePrice(priceUSD);
      setIsSelectingPartida(false);

      await checkAvailability(itemId, isEditMode ? parseFloat(actividadAEditar.cantidad_programada) : 0);
    }
  };

  const prevHasSubs = (subs) => {
    return subs && subs.some(s => (typeof s === 'string' ? s.trim() : s.descripcion?.trim()));
  };

  // Partida actualmente seleccionada
  const selectedPartidaItem = useMemo(() => {
    if (!formData.partida_id || !budget?.items) return null;
    return budget.items.find(i => i.id === formData.partida_id);
  }, [budget, formData.partida_id]);

  // Filtrado de partidas por buscador
  const partidasFiltradas = useMemo(() => {
    if (!budget?.items) return [];
    const search = partidaSearch.toLowerCase().trim();
    if (!search) return budget.items;
    return budget.items.filter(item =>
      (item.item || '').toLowerCase().includes(search) ||
      (item.descripcion || '').toLowerCase().includes(search)
    );
  }, [budget, partidaSearch]);

  // Cálculos numéricos y financieros
  const cantidad = parseFloat(formData.cantidad_programada) || 0;
  const precio = parseFloat(formData.precio_unitario) || 0;
  const montoTotal = cantidad * precio;

  // Ya planificado antes de hoy
  const totalYaPlanificado = useMemo(() => {
    if (totalPresupuestado > 0 && availableUnits !== null) {
      return Math.max(0, totalPresupuestado - availableUnits);
    }
    return 0;
  }, [totalPresupuestado, availableUnits]);

  // Saldo restante estimado tras esta actividad
  const saldoRestanteEstimado = availableUnits !== null ? availableUnits - cantidad : 0;
  const isOverBudget = availableUnits !== null && cantidad > availableUnits;

  // Cálculo del Costo Diario de Nómina
  const laborCostTotal = useMemo(() => {
    if (!employees.length || !formData.personal_ids.length) return 0;
    const dateToUse = diaFecha ? String(diaFecha).split('T')[0] : new Date().toISOString().split('T')[0];

    return formData.personal_ids.reduce((sum, pid) => {
      const emp = findEmployee(employees, pid);
      if (!emp) return sum;
      return sum + calculateDailyLaborCost(emp, dateToUse);
    }, 0);
  }, [employees, formData.personal_ids, diaFecha, findEmployee]);

  // Margen operativo interno de cuadrilla (Venta Contractual vs Gasto M.O.)
  const margenOperativo = montoTotal - laborCostTotal;
  const margenPorcentaje = montoTotal > 0 ? (margenOperativo / montoTotal) * 100 : 0;
  const impactoNominaPorcentaje = montoTotal > 0 ? (laborCostTotal / montoTotal) * 100 : 0;

  // Manejo de Subactividades
  const handleSubactividadChange = (index, value) => {
    const newSubs = [...formData.subactividades];
    const current = newSubs[index];
    if (typeof current === 'object' && current !== null) {
      newSubs[index] = { ...current, descripcion: value };
    } else {
      newSubs[index] = { id: null, descripcion: value, completada: false };
    }
    setFormData(prev => ({ ...prev, subactividades: newSubs }));
  };

  const addSubactividad = () => {
    setFormData(prev => ({
      ...prev,
      subactividades: [...prev.subactividades, { id: null, descripcion: '', completada: false }]
    }));
    setTimeout(() => {
      const idx = formData.subactividades.length;
      if (subactividadInputRefs.current[idx]) {
        subactividadInputRefs.current[idx].focus();
      }
    }, 50);
  };

  const handleSubactividadKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubactividad();
    }
  };

  const removeSubactividad = (index) => {
    setFormData(prev => ({
      ...prev,
      subactividades: prev.subactividades.filter((_, i) => i !== index)
    }));
  };

  // Helper para verificar si un trabajador está seleccionado
  const isPersonalChecked = useCallback((empId) => {
    if (!empId) return false;
    if (formData.personal_ids.includes(empId)) return true;
    const cleanId = String(empId).replace(/^(contractor-|employee-)/, '');
    return formData.personal_ids.some(pid => {
      if (!pid) return false;
      const cleanPid = String(pid).replace(/^(contractor-|employee-)/, '');
      return cleanPid === cleanId || pid === `contractor-${cleanId}`;
    });
  }, [formData.personal_ids]);

  // Manejo de Personal
  const togglePersonal = (empId) => {
    const cleanId = String(empId).replace(/^(contractor-|employee-)/, '');
    setFormData(prev => {
      const exists = prev.personal_ids.some(pid => {
        if (!pid) return false;
        const cleanPid = String(pid).replace(/^(contractor-|employee-)/, '');
        return pid === empId || cleanPid === cleanId || pid === `contractor-${cleanId}`;
      });

      if (exists) {
        return {
          ...prev,
          personal_ids: prev.personal_ids.filter(pid => {
            if (!pid) return false;
            const cleanPid = String(pid).replace(/^(contractor-|employee-)/, '');
            return pid !== empId && cleanPid !== cleanId && pid !== `contractor-${cleanId}`;
          })
        };
      } else {
        return {
          ...prev,
          personal_ids: [...prev.personal_ids, empId]
        };
      }
    });
  };

  // Filtrado de Personal por buscador
  const personalFiltrado = useMemo(() => {
    if (!employees) return [];
    const search = personalSearch.toLowerCase().trim();
    if (!search) return employees;
    return employees.filter(e =>
      `${e.nombre || ''} ${e.apellido || ''}`.toLowerCase().includes(search) ||
      (e.cargo || '').toLowerCase().includes(search)
    );
  }, [employees, personalSearch]);

  // Manejo de Selección de Días a Replicar
  const toggleReplicateDay = (dId) => {
    setSelectedReplicateDays(prev =>
      prev.includes(dId) ? prev.filter(id => id !== dId) : [...prev, dId]
    );
  };

  const selectAllWorkdays = () => {
    const workdayIds = otherDaysOfWeek
      .filter(d => {
        const dayNum = new Date(d.fecha + 'T00:00:00').getDay();
        return dayNum >= 1 && dayNum <= 5; // Lunes a Viernes
      })
      .map(d => d.id);
    setSelectedReplicateDays(workdayIds);
  };

  // Validación y Envío del Formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});

    if (!formData.descripcion.trim()) {
      setErrores(prev => ({ ...prev, descripcion: 'La descripción de la actividad es obligatoria' }));
      return;
    }
    if (!formData.partida_id) {
      setErrores(prev => ({ ...prev, partida: 'Debe seleccionar una partida contractual' }));
      return;
    }
    if (cantidad <= 0) {
      setErrores(prev => ({ ...prev, cantidad: 'La cantidad programada debe ser mayor a 0' }));
      return;
    }

    setLoading(true);
    try {
      const subactividadesFiltradas = segmentarActividad
        ? formData.subactividades
            .filter(s => (typeof s === 'string' ? s.trim() : s.descripcion?.trim()))
            .map(s => (typeof s === 'string' ? { id: null, descripcion: s, completada: false } : s))
        : [];

      const personalAsignado = formData.personal_ids.map(pid => {
        const emp = findEmployee(employees, pid);
        if (emp) {
          return {
            id: emp.id,
            nombre: `${emp.nombre || ''} ${emp.apellido || ''}`.trim(),
            rol: emp.cargo || 'Operativo'
          };
        }

        const prevPers = actividadAEditar?.personal?.find(p => {
          const cleanPid = String(pid).replace(/^(contractor-|employee-)/, '');
          const cleanP = String(p.personal_id || p.id).replace(/^(contractor-|employee-)/, '');
          return cleanPid === cleanP;
        });

        return {
          id: pid,
          nombre: prevPers?.nombre_personal || '',
          rol: prevPers?.rol_en_actividad || 'Operativo'
        };
      });

      const payload = {
        dia_id: diaId,
        descripcion: formData.descripcion.trim(),
        partida_id: formData.partida_id,
        nombre_partida: selectedPartidaItem?.descripcion || '',
        unidad_medida: formData.unidad_medida,
        cantidad_programada: cantidad,
        precio_unitario: precio,
        monto_programado: montoTotal,
        subactividades: subactividadesFiltradas,
        personal: personalAsignado
      };

      if (isEditMode) {
        await updateActividad(actividadAEditar.id, payload);
      } else {
        // 1. Crear en el día actual
        await crearActividadPlanificada(payload);

        // 2. Replicar en otros días seleccionados si está activo
        if (replicateEnabled && selectedReplicateDays.length > 0) {
          for (const repDiaId of selectedReplicateDays) {
            await crearActividadPlanificada({
              ...payload,
              dia_id: repDiaId
            });
          }
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Error submit actividad:", error);
      setErrores({ submit: error.message || 'Error al guardar la actividad' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="actividad-form">
      <form onSubmit={handleSubmit}>

        {/* =========================================================
            SECCIÓN 1: IMPUTACIÓN CONTRACTUAL (PARTIDA DEL PRESUPUESTO)
            ========================================================= */}
        <div className="form-card-section">
          <div className="section-header-row">
            <h3 className="section-title">
              <IconFolder /> 1. Partida Contractual
            </h3>
            <span className="section-badge">Contrato</span>
          </div>
          <p className="section-sub">Imputación presupuestaria y saldo disponible del contrato</p>

          {selectedPartidaItem && !isSelectingPartida ? (
            <div className="partida-active-card">
              <div className="partida-active-info">
                <div className="partida-active-title">
                  <span className="partida-code-tag">{selectedPartidaItem.item}</span>
                  <span>{selectedPartidaItem.descripcion}</span>
                </div>
                <div className="partida-active-meta">
                  <span>Unidad: <strong>{selectedPartidaItem.unidad}</strong></span>
                  <span>•</span>
                  <span>Precio Base: <strong>{formatCurrency(basePrice, 'USD')}</strong></span>
                  <span>•</span>
                  <span>Contratado: <strong>{totalPresupuestado.toLocaleString()} {selectedPartidaItem.unidad}</strong></span>
                </div>
              </div>
              <button
                type="button"
                className="btn-switch-partida"
                onClick={() => setIsSelectingPartida(true)}
              >
                Cambiar Partida
              </button>
            </div>
          ) : (
            <div>
              <div className="partida-search-box">
                <span className="partida-search-icon">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Buscar partida por código (ej. 1.0) o descripción técnica..."
                  value={partidaSearch}
                  onChange={e => setPartidaSearch(e.target.value)}
                  autoFocus={!formData.partida_id}
                />
              </div>

              <div className="partidas-scroll-list">
                {partidasFiltradas.length > 0 ? (
                  partidasFiltradas.map(item => (
                    <div
                      key={item.id}
                      className={`partida-row-option ${formData.partida_id === item.id ? 'selected' : ''}`}
                      onClick={() => handlePartidaChange(item.id)}
                    >
                      <span className="partida-code-tag">{item.item}</span>
                      <span className="partida-name-text">{item.descripcion}</span>
                      <div className="partida-meta-pill">
                        <span>{item.unidad}</span>
                        <span>•</span>
                        <strong>{formatCurrency(convertToUSD(item.precioUnitario, item.moneda), 'USD')}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No se encontraron partidas con ese término.
                  </div>
                )}
              </div>
            </div>
          )}

          {errores.partida && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>{errores.partida}</p>}

          {/* Tarjeta de Balance Presupuestario en Tiempo Real */}
          {selectedPartidaItem && (
            <div>
              <div className="balance-kpi-container">
                <div className="balance-kpi-card">
                  <span className="kpi-card-label">Total Contratado</span>
                  <span className="kpi-card-value">{totalPresupuestado.toLocaleString()} {selectedPartidaItem.unidad}</span>
                </div>
                <div className="balance-kpi-card">
                  <span className="kpi-card-label">Ya Planificado</span>
                  <span className="kpi-card-value blue">{totalYaPlanificado.toLocaleString()} {selectedPartidaItem.unidad}</span>
                </div>
                <div className="balance-kpi-card">
                  <span className="kpi-card-label">Disponible Hoy</span>
                  <span className="kpi-card-value green">{(availableUnits || 0).toLocaleString()} {selectedPartidaItem.unidad}</span>
                </div>
                <div className="balance-kpi-card">
                  <span className="kpi-card-label">Saldo Restante</span>
                  <span className={`kpi-card-value ${saldoRestanteEstimado < 0 ? 'red' : 'green'}`}>
                    {saldoRestanteEstimado.toLocaleString()} {selectedPartidaItem.unidad}
                  </span>
                </div>
              </div>

              {/* Barra de progreso de consumo de la partida */}
              <div className="balance-progress-track">
                <div
                  className={`balance-progress-bar ${isOverBudget ? 'overbudget' : ''}`}
                  style={{
                    width: `${totalPresupuestado > 0 ? Math.min(100, Math.max(0, ((totalYaPlanificado + cantidad) / totalPresupuestado) * 100)) : 0}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            SECCIÓN 2: DEFINICIÓN Y METRADO DE LA ACTIVIDAD
            ========================================================= */}
        <div className="form-card-section">
          <div className="section-header-row">
            <h3 className="section-title">
              <IconLayers /> 2. Definición y Cuantificación de la Actividad
            </h3>
            <span className="section-badge">Metrado</span>
          </div>
          <p className="section-sub">Descripción del alcance operativo y volumen físico programado</p>

          <div className="form-group">
            <label>
              Descripción de la Actividad a Ejecutar <span className="required">*</span>
            </label>
            <textarea
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Ej: Tendido de tubería de 4 pulgadas y pruebas de continuidad en sitio..."
              rows={2}
            />
            {errores.descripcion && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '2px 0 0' }}>{errores.descripcion}</p>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>
                Cantidad a Programar ({formData.unidad_medida || 'Unidad'}) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cantidad_programada}
                onChange={e => setFormData({ ...formData, cantidad_programada: e.target.value })}
                placeholder="0.00"
              />
              {errores.cantidad && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '2px 0 0' }}>{errores.cantidad}</p>}
            </div>

            <div className="form-group">
              <label>Monto Estimado de la Actividad</label>
              <div className="monto-estimado-box">
                <span className="monto-estimado-val">
                  {formatCurrency(montoTotal, 'USD')}
                </span>
                <span className="monto-estimado-det">
                  {cantidad || 0} x {formatCurrency(precio, 'USD')}
                </span>
              </div>
            </div>
          </div>

          {/* Alerta Visual de Sobregiro Presupuestario */}
          {isOverBudget && (
            <div className="overbudget-banner">
              <IconAlert />
              <span>
                <strong>Atención de Control:</strong> La cantidad a programar ({cantidad}) excede la disponibilidad contractual restante ({availableUnits?.toFixed(2)} {formData.unidad_medida}).
              </span>
            </div>
          )}
        </div>

        {/* =========================================================
            SECCIÓN 3: SWITCH DE SEGMENTACIÓN EN SUBACTIVIDADES
            ========================================================= */}
        <div className="form-card-section">
          <div
            className="toggle-card-wrapper"
            onClick={() => setSegmentarActividad(!segmentarActividad)}
          >
            <div className="toggle-card-text">
              <h4>¿Segmentar en subactividades o checklist operativo?</h4>
              <p>
                {selectedPartidaItem && isTimeBasedUnit(selectedPartidaItem.unidad)
                  ? 'Partida por tiempo/alquiler continuo: no requiere subactividades por defecto.'
                  : 'Desglosa tareas específicas que la cuadrilla marcará como ejecutadas en campo.'}
              </p>
            </div>
            <div className={`toggle-pill ${segmentarActividad ? 'active' : ''}`}>
              <div className="toggle-thumb"></div>
            </div>
          </div>

          {segmentarActividad && (
            <div className="subactividades-stack">
              {formData.subactividades.map((sub, idx) => (
                <div key={idx} className="subactividad-item-row">
                  <span className="subactividad-num">{idx + 1}</span>
                  <input
                    ref={el => subactividadInputRefs.current[idx] = el}
                    type="text"
                    className="subactividad-input-field"
                    placeholder="Escribe la tarea y pulsa Enter para añadir la siguiente..."
                    value={typeof sub === 'string' ? sub : (sub.descripcion || '')}
                    onChange={e => handleSubactividadChange(idx, e.target.value)}
                    onKeyDown={e => handleSubactividadKeyDown(e, idx)}
                  />
                  {formData.subactividades.length > 1 && (
                    <button
                      type="button"
                      className="btn-delete-subtask"
                      onClick={() => removeSubactividad(idx)}
                      title="Eliminar tarea"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-add-subtask-action"
                onClick={addSubactividad}
              >
                <IconPlus /> Agregar Tarea
              </button>
            </div>
          )}
        </div>

        {/* =========================================================
            SECCIÓN 4: CUADRILLA Y RECURSOS HUMANOS (PERSONAL)
            ========================================================= */}
        <div className="form-card-section">
          <div className="section-header-row">
            <h3 className="section-title">
              <IconUsers /> 3. Cuadrilla y Personal Asignado
            </h3>
            <span className="section-badge">
              {formData.personal_ids.length} Asignados
            </span>
          </div>
          <p className="section-sub">Selección de operadores, técnicos y mano de obra para esta actividad</p>

          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div className="partida-search-box">
              <span className="partida-search-icon">
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Filtrar trabajadores por nombre o cargo (ej. Soldador, Chofer, Capataz)..."
                value={personalSearch}
                onChange={e => setPersonalSearch(e.target.value)}
              />
            </div>
          </div>

          {loadingEmployees ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              Cargando personal del proyecto...
            </div>
          ) : (
            <div className="personal-list-container">
              {personalFiltrado.length > 0 ? (
                personalFiltrado.map(emp => {
                  const isChecked = isPersonalChecked(emp.id);
                  const dailyRate = calculateDailyLaborCost(emp, diaFecha ? String(diaFecha).split('T')[0] : new Date().toISOString().split('T')[0]);

                  return (
                    <div
                      key={emp.id}
                      className={`personal-row-item ${isChecked ? 'checked' : ''}`}
                      onClick={() => togglePersonal(emp.id)}
                    >
                      <div className="personal-info-left">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="personal-checkbox-custom"
                        />
                        <span className="personal-name">
                          {emp.nombre} {emp.apellido}
                        </span>
                        <span className="personal-cargo-badge">
                          {emp.cargo || 'Operativo'}
                        </span>
                      </div>
                      <span className="personal-daily-rate">
                        {formatCurrency(dailyRate, 'USD')} / día
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No hay trabajadores que coincidan con la búsqueda.
                </div>
              )}
            </div>
          )}

          {/* Resumen Operativo y Financiero de Cuadrilla */}
          <div className="cuadrilla-finance-bar">
            <div className="cuadrilla-finance-row">
              <span>Cuadrilla seleccionada: <strong>{formData.personal_ids.length} personas</strong></span>
              <span>Costo operativo de mano de obra: <strong style={{ color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>{formatCurrency(laborCostTotal, 'USD')} / día</strong></span>
            </div>

            {formData.personal_ids.length > 0 && montoTotal > 0 && (
              <div className="cuadrilla-margin-row">
                <div className="margin-item">
                  <span className="margin-label">Ingreso Contractual (Venta):</span>
                  <strong className="margin-val-blue">{formatCurrency(montoTotal, 'USD')}</strong>
                </div>
                <div className="margin-item">
                  <span className="margin-label">Costo Mano de Obra:</span>
                  <strong className="margin-val-slate">{formatCurrency(laborCostTotal, 'USD')} ({impactoNominaPorcentaje.toFixed(1)}%)</strong>
                </div>
                <div className="margin-item">
                  <span className="margin-label">Margen Operativo Bruto:</span>
                  <strong className={margenOperativo >= 0 ? 'margin-val-green' : 'margin-val-red'}>
                    {formatCurrency(margenOperativo, 'USD')} ({margenPorcentaje.toFixed(1)}%)
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            SECCIÓN 5: REPLICACIÓN EN OTROS DÍAS (SOLO CREACIÓN)
            ========================================================= */}
        {!isEditMode && otherDaysOfWeek.length > 0 && (
          <div className="form-card-section">
            <div
              className="toggle-card-wrapper"
              onClick={() => setReplicateEnabled(!replicateEnabled)}
            >
              <div className="toggle-card-text">
                <h4>¿Replicar esta actividad en otros días de esta semana?</h4>
                <p>Crea copias automáticas en los días seleccionados con un solo clic.</p>
              </div>
              <div className={`toggle-pill ${replicateEnabled ? 'active' : ''}`}>
                <div className="toggle-thumb"></div>
              </div>
            </div>

            {replicateEnabled && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Selecciona los días adicionales:</span>
                  <button
                    type="button"
                    onClick={selectAllWorkdays}
                    style={{ background: 'none', border: 'none', color: '#1e40af', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    + Todos los días laborables (Lun-Vie)
                  </button>
                </div>

                <div className="replicate-days-row">
                  {otherDaysOfWeek.map(d => {
                    const isSelected = selectedReplicateDays.includes(d.id);
                    const dateObj = new Date(d.fecha + 'T00:00:00');
                    const label = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

                    return (
                      <div
                        key={d.id}
                        className={`day-selection-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleReplicateDay(d.id)}
                      >
                        {label} {isSelected ? '✓' : '+'}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {errores.submit && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
            {errores.submit}
          </div>
        )}

        {/* =========================================================
            ACCIONES DEL MODAL
            ========================================================= */}
        <div className="form-modal-footer">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-modal-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Actividad' : 'Guardar Actividad')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ActividadForm;
