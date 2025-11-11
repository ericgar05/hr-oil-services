// src/contexts/PlanificacionContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useProjects } from './ProjectContext';
import { useBudget } from './BudgetContext';
import supabase from '../api/supaBase';

const PlanificacionContext = createContext();

export const usePlanificacion = () => {
  const context = useContext(PlanificacionContext);
  if (!context) {
    throw new Error('usePlanificacion debe ser usado dentro de un PlanificacionProvider');
  }
  return context;
};

export const PlanificacionProvider = ({ children }) => {
  const { selectedProject } = useProjects();
  const { budget } = useBudget();
  const [planificacionData, setPlanificacionData] = useState({});
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tablesExist, setTablesExist] = useState(true);

  const hasBudget = useMemo(() => {
    return !!(budget && budget.items && budget.items.length > 0);
  }, [budget]);

  // Función para verificar si las tablas existen
  const checkTablesExist = async () => {
    try {
      // Verificar si ambas tablas existen
      const { error: actividadesError } = await supabase
        .from('planificacion_actividades')
        .select('id')
        .limit(1);
      console.log('Error actividades:', actividadesError);
      
      const { error: requerimientosError } = await supabase
        .from('planificacion_requerimientos')
        .select('id')
        .limit(1);
      console.log('Error requerimientos:', requerimientosError);
      
      const actividadesExist = !actividadesError || actividadesError.code !== '42P01';
      const requerimientosExist = !requerimientosError || requerimientosError.code !== '42P01';
      
      const allTablesExist = actividadesExist && requerimientosExist;
      setTablesExist(allTablesExist);
      
      return allTablesExist;
    } catch (err) {
      console.warn('Error verificando tablas:', err);
      setTablesExist(false);
      return false;
    }
  };

  const generarSemanasProyecto = () => {
    if (!selectedProject?.startDate) return [];

    const fechaInicio = new Date(selectedProject.startDate);
    const fechaFin = new Date(
      selectedProject.endDate || new Date().setFullYear(new Date().getFullYear() + 1)
    );

    const semanasGeneradas = [];
    let fechaActual = new Date(fechaInicio);
    let numeroSemana = 1;

    while (fechaActual <= fechaFin && numeroSemana <= 52) {
      const inicioSemana = new Date(fechaActual);
      const finSemana = new Date(fechaActual);
      finSemana.setDate(finSemana.getDate() + 6);

      semanasGeneradas.push({
        id: `semana-${numeroSemana}`,
        numero: numeroSemana,
        inicio: inicioSemana.toISOString().split('T')[0],
        fin: finSemana.toISOString().split('T')[0],
        proyecto_id: selectedProject.id
      });

      fechaActual.setDate(fechaActual.getDate() + 7);
      numeroSemana++;
    }

    return semanasGeneradas;
  };

  // Cargar planificación desde Supabase
  const loadPlanificacionData = async () => {
    if (!selectedProject?.id || !hasBudget) return;

    setLoading(true);
    setError(null);

    try {
      // Primero verificar si las tablas existen
      const tablesReady = await checkTablesExist();
      
      if (!tablesReady) {
        console.log('Usando modo localStorage - tablas no disponibles');
        loadFromLocalStorage();
        return;
      }

      // Generar semanas
      const semanasGeneradas = generarSemanasProyecto();
      setSemanas(semanasGeneradas);

      // Cargar actividades planificadas
      const { data: actividades, error: actividadesError } = await supabase
        .from('planificacion_actividades')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('semana_numero', { ascending: true })
        .order('dia', { ascending: true });

      if (actividadesError) throw actividadesError;

      // Cargar requerimientos de planificación (NUEVA TABLA)
      const { data: requerimientos, error: reqError } = await supabase
        .from('planificacion_requerimientos')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('semana_numero', { ascending: true })
        .order('prioridad', { ascending: false });

      if (reqError) throw reqError;

      // Transformar datos al formato esperado
      const transformedData = transformPlanificacionData(actividades || [], requerimientos || []);
      setPlanificacionData(transformedData);

    } catch (err) {
      console.error('Error cargando planificación:', err);
      setError(err.message);
      // Fallback a localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Fallback a localStorage
  const loadFromLocalStorage = () => {
    const semanasGeneradas = generarSemanasProyecto();
    setSemanas(semanasGeneradas);
    
    const savedPlanificacion = localStorage.getItem(`planificacion_${selectedProject?.id}`);
    if (savedPlanificacion) {
      try {
        const parsedData = JSON.parse(savedPlanificacion);
        setPlanificacionData(parsedData);
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
        setPlanificacionData({});
      }
    } else {
      setPlanificacionData({});
    }
  };

  const transformPlanificacionData = (actividades, requerimientos) => {
    const data = {};

    // Agrupar actividades por semana y día
    actividades.forEach(actividad => {
      const semanaId = `semana-${actividad.semana_numero}`;
      
      if (!data[semanaId]) {
        data[semanaId] = {};
      }
      
      if (!data[semanaId][actividad.dia]) {
        data[semanaId][actividad.dia] = [];
      }

      data[semanaId][actividad.dia].push({
        id: actividad.id,
        partidaId: actividad.partida_id,
        equipoTag: actividad.equipo_tag,
        unidad: actividad.unidad,
        cantidad: parseFloat(actividad.cantidad),
        montoUnitario: parseFloat(actividad.monto_unitario),
        montoTotal: parseFloat(actividad.monto_total),
        valuacionEstimada: actividad.valuacion_estimada,
        actividades: actividad.descripciones_actividades || [],
        estado: actividad.estado,
        created_at: actividad.created_at
      });
    });

    // Agregar requerimientos de planificación (NUEVA ESTRUCTURA)
    requerimientos.forEach(req => {
      const semanaId = `semana-${req.semana_numero}`;
      if (!data[semanaId]) {
        data[semanaId] = {};
      }
      
      if (!data[semanaId].requerimientos) {
        data[semanaId].requerimientos = [];
      }
      
      data[semanaId].requerimientos.push({
        id: req.id,
        nombre: req.nombre,
        categoria: req.categoria,
        unidad: req.unidad,
        cantidad: parseFloat(req.cantidad),
        precioUnitario: parseFloat(req.precio_unitario),
        precioTotal: parseFloat(req.precio_total),
        prioridad: req.prioridad,
        estado: req.estado,
        observaciones: req.observaciones,
        created_at: req.created_at
      });
    });

    return data;
  };

  // Guardar actividad
  const saveActividad = async (actividadData) => {
    try {
      if (tablesExist) {
        const { data, error } = await supabase
          .from('planificacion_actividades')
          .upsert({
            project_id: selectedProject.id,
            semana_numero: actividadData.semanaNumero,
            dia: actividadData.dia,
            partida_id: actividadData.partidaId,
            equipo_tag: actividadData.equipoTag,
            unidad: actividadData.unidad,
            cantidad: actividadData.cantidad,
            monto_unitario: actividadData.montoUnitario,
            monto_total: actividadData.montoTotal,
            valuacion_estimada: actividadData.valuacionEstimada,
            descripciones_actividades: actividadData.actividades,
            estado: 'planificado'
          })
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Fallback a localStorage
        return saveActividadToLocalStorage(actividadData);
      }
    } catch (err) {
      console.error('Error guardando actividad:', err);
      return saveActividadToLocalStorage(actividadData);
    }
  };

  // Guardar requerimiento (NUEVA FUNCIÓN)
  const saveRequerimiento = async (requerimientoData) => {
    try {
      if (tablesExist) {
        const { data, error } = await supabase
          .from('planificacion_requerimientos')
          .upsert({
            project_id: selectedProject.id,
            semana_numero: requerimientoData.semanaNumero,
            nombre: requerimientoData.nombre,
            categoria: requerimientoData.categoria,
            unidad: requerimientoData.unidad,
            cantidad: requerimientoData.cantidad,
            precio_unitario: requerimientoData.precioUnitario,
            precio_total: requerimientoData.precioTotal,
            prioridad: requerimientoData.prioridad || 'media',
            estado: requerimientoData.estado || 'pendiente',
            observaciones: requerimientoData.observaciones
          })
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Fallback a localStorage
        return saveRequerimientoToLocalStorage(requerimientoData);
      }
    } catch (err) {
      console.error('Error guardando requerimiento:', err);
      return saveRequerimientoToLocalStorage(requerimientoData);
    }
  };

  // Eliminar actividad
  const deleteActividad = async (actividadId) => {
    try {
      if (tablesExist) {
        const { error } = await supabase
          .from('planificacion_actividades')
          .delete()
          .eq('id', actividadId);

        if (error) throw error;
      }
      
      deleteActividadFromLocalStorage(actividadId);
    } catch (err) {
      console.error('Error eliminando actividad:', err);
      deleteActividadFromLocalStorage(actividadId);
      throw err;
    }
  };

  // Eliminar requerimiento (NUEVA FUNCIÓN)
  const deleteRequerimiento = async (requerimientoId) => {
    try {
      if (tablesExist) {
        const { error } = await supabase
          .from('planificacion_requerimientos')
          .delete()
          .eq('id', requerimientoId);

        if (error) throw error;
      }
      
      deleteRequerimientoFromLocalStorage(requerimientoId);
    } catch (err) {
      console.error('Error eliminando requerimiento:', err);
      deleteRequerimientoFromLocalStorage(requerimientoId);
      throw err;
    }
  };

  // Funciones de localStorage para actividades
  const saveActividadToLocalStorage = (actividadData) => {
    const semanaId = `semana-${actividadData.semanaNumero}`;
    const savedData = localStorage.getItem(`planificacion_${selectedProject?.id}`);
    const existingData = savedData ? JSON.parse(savedData) : {};
    
    if (!existingData[semanaId]) {
      existingData[semanaId] = {};
    }
    if (!existingData[semanaId][actividadData.dia]) {
      existingData[semanaId][actividadData.dia] = [];
    }
    
    const nuevaActividad = {
      id: `local-${Date.now()}`,
      ...actividadData
    };
    
    existingData[semanaId][actividadData.dia].push(nuevaActividad);
    localStorage.setItem(`planificacion_${selectedProject?.id}`, JSON.stringify(existingData));
    
    return nuevaActividad;
  };

  const deleteActividadFromLocalStorage = (actividadId) => {
    const savedData = localStorage.getItem(`planificacion_${selectedProject?.id}`);
    if (savedData) {
      const existingData = JSON.parse(savedData);
      
      Object.keys(existingData).forEach(semanaId => {
        Object.keys(existingData[semanaId]).forEach(dia => {
          if (Array.isArray(existingData[semanaId][dia])) {
            existingData[semanaId][dia] = existingData[semanaId][dia].filter(
              act => act.id !== actividadId
            );
          }
        });
      });
      
      localStorage.setItem(`planificacion_${selectedProject?.id}`, JSON.stringify(existingData));
    }
  };

  // Funciones de localStorage para requerimientos (NUEVAS)
  const saveRequerimientoToLocalStorage = (requerimientoData) => {
    const semanaId = `semana-${requerimientoData.semanaNumero}`;
    const savedData = localStorage.getItem(`planificacion_${selectedProject?.id}`);
    const existingData = savedData ? JSON.parse(savedData) : {};
    
    if (!existingData[semanaId]) {
      existingData[semanaId] = {};
    }
    if (!existingData[semanaId].requerimientos) {
      existingData[semanaId].requerimientos = [];
    }
    
    const nuevoRequerimiento = {
      id: `local-req-${Date.now()}`,
      ...requerimientoData
    };
    
    existingData[semanaId].requerimientos.push(nuevoRequerimiento);
    localStorage.setItem(`planificacion_${selectedProject?.id}`, JSON.stringify(existingData));
    
    return nuevoRequerimiento;
  };

  const deleteRequerimientoFromLocalStorage = (requerimientoId) => {
    const savedData = localStorage.getItem(`planificacion_${selectedProject?.id}`);
    if (savedData) {
      const existingData = JSON.parse(savedData);
      
      Object.keys(existingData).forEach(semanaId => {
        if (existingData[semanaId].requerimientos) {
          existingData[semanaId].requerimientos = existingData[semanaId].requerimientos.filter(
            req => req.id !== requerimientoId
          );
        }
      });
      
      localStorage.setItem(`planificacion_${selectedProject?.id}`, JSON.stringify(existingData));
    }
  };

  // Cargar datos cuando cambie el proyecto
  useEffect(() => {
    if (selectedProject?.id && hasBudget) {
      loadPlanificacionData();
    } else {
      setPlanificacionData({});
      setSemanas([]);
      setLoading(false);
    }
  }, [selectedProject?.id, hasBudget]);

  // Estadísticas en tiempo real
  const { 
    totalTareas, 
    tareasCompletadas, 
    totalMontoPlanificado, 
    semanasPlanificadas,
    totalRequerimientos,
    requerimientosPendientes 
  } = useMemo(() => {
    let totalTareas = 0;
    let tareasCompletadas = 0;
    let totalMonto = 0;
    let semanasConActividades = 0;
    let totalReqs = 0;
    let reqsPendientes = 0;

    Object.values(planificacionData).forEach(semana => {
      if (semana && typeof semana === 'object') {
        let semanaTieneActividades = false;
        
        // Procesar actividades
        Object.values(semana).forEach(dia => {
          if (Array.isArray(dia)) {
            totalTareas += dia.length;
            semanaTieneActividades = semanaTieneActividades || dia.length > 0;
            
            dia.forEach(actividad => {
              totalMonto += actividad.montoTotal || 0;
              if (actividad.estado === 'completada') {
                tareasCompletadas++;
              }
            });
          }
        });
        
        // Procesar requerimientos
        if (semana.requerimientos && Array.isArray(semana.requerimientos)) {
          totalReqs += semana.requerimientos.length;
          reqsPendientes += semana.requerimientos.filter(req => 
            req.estado === 'pendiente'
          ).length;
        }
        
        if (semanaTieneActividades) {
          semanasConActividades++;
        }
      }
    });

    return { 
      totalTareas, 
      tareasCompletadas, 
      totalMontoPlanificado: totalMonto, 
      semanasPlanificadas: semanasConActividades,
      totalRequerimientos: totalReqs,
      requerimientosPendientes: reqsPendientes
    };
  }, [planificacionData]);

  const value = {
    planificacionData,
    semanas,
    loading,
    error,
    tablesExist,
    loadPlanificacionData,
    saveActividad,
    saveRequerimiento,
    deleteActividad,
    deleteRequerimiento,
    totalTareas,
    tareasCompletadas,
    totalMontoPlanificado,
    semanasPlanificadas,
    totalRequerimientos,
    requerimientosPendientes,
    hasBudget
  };

  return (
    <PlanificacionContext.Provider value={value}>
      {children}
    </PlanificacionContext.Provider>
  );
};