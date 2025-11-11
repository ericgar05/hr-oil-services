// src/services/planificacionService.js
import supabase from '../api/supaBase';

/**
 * =================================================================================
 * Planificación Semanal
 * =================================================================================
 */

export const getPlanificacionSemanalByProyecto = async (proyecto_id) => {
  const { data, error } = await supabase
    .from('planificacion_semanal')
    .select('*')
    .eq('proyecto_id', proyecto_id)
    .order('semana_numero', { ascending: true });
  return { data, error };
};

export const createPlanificacionSemanal = async (planData) => {
  const { data, error } = await supabase
    .from('planificacion_semanal')
    .insert([planData])
    .select();
  return { data, error };
};

export const updatePlanificacionSemanal = async (planId, updates) => {
  const { data, error } = await supabase
    .from('planificacion_semanal')
    .update(updates)
    .eq('id', planId)
    .select();
  return { data, error };
};

export const deletePlanificacionSemanal = async (planId) => {
  const { data, error } = await supabase
    .from('planificacion_semanal')
    .delete()
    .eq('id', planId);
  return { data, error };
};

/**
 * =================================================================================
 * Planificación Diaria
 * =================================================================================
 */

export const getPlanificacionDiariaBySemana = async (planificacion_semanal_id) => {
  const { data, error } = await supabase
    .from('planificacion_diaria')
    .select('*')
    .eq('planificacion_semanal_id', planificacion_semanal_id)
    .order('fecha', { ascending: true });
  return { data, error };
};

export const createPlanificacionDiaria = async (planData) => {
  const { data, error } = await supabase
    .from('planificacion_diaria')
    .insert([planData])
    .select();
  return { data, error };
};

/**
 * =================================================================================
 * Actividades de Planificación
 * =================================================================================
 */

export const getActividadesByDia = async (planificacion_diaria_id) => {
  const { data, error } = await supabase
    .from('planificacion_actividades')
    .select('*, actividad:actividades(*), equipo:equipos(*)')
    .eq('planificacion_diaria_id', planificacion_diaria_id);
  return { data, error };
};

export const saveActividadesDia = async (planificacion_diaria_id, actividades) => {
    // 1. Eliminar actividades existentes para ese día
    const { error: deleteError } = await supabase
        .from('planificacion_actividades')
        .delete()
        .eq('planificacion_diaria_id', planificacion_diaria_id);

    if (deleteError) {
        console.error('Error deleting existing activities:', deleteError);
        return { data: null, error: deleteError };
    }

    // 2. Insertar las nuevas actividades
    if (actividades.length === 0) {
        return { data: [], error: null }; // No hay nada que insertar
    }

    const actividadesToInsert = actividades.map(act => ({
        planificacion_diaria_id,
        actividad_id: act.actividad_id,
        equipo_id: act.equipo_id,
        completada: act.completada || false,
    }));

    const { data, error } = await supabase
        .from('planificacion_actividades')
        .insert(actividadesToInsert)
        .select();

    return { data, error };
};

export const deletePlanificacionActividad = async (planificacionActividadId) => {
  const { data, error } = await supabase
    .from('planificacion_actividades')
    .delete()
    .eq('id', planificacionActividadId);
  return { data, error };
};

/**
 * =================================================================================
 * Requerimientos de Planificación
 * =================================================================================
 */

export const getRequerimientosBySemana = async (planificacion_semanal_id) => {
  const { data, error } = await supabase
    .from('planificacion_requerimientos')
    .select('*, requerimiento:requerimientos(*)')
    .eq('planificacion_semanal_id', planificacion_semanal_id);
  return { data, error };
};

export const saveRequerimientosSemana = async (planificacion_semanal_id, requerimientos) => {
    // 1. Eliminar requerimientos existentes para esa semana
    const { error: deleteError } = await supabase
        .from('planificacion_requerimientos')
        .delete()
        .eq('planificacion_semanal_id', planificacion_semanal_id);

    if (deleteError) {
        console.error('Error deleting existing requirements:', deleteError);
        return { data: null, error: deleteError };
    }

    // 2. Insertar los nuevos requerimientos
    if (requerimientos.length === 0) {
        return { data: [], error: null };
    }

    const requerimientosToInsert = requerimientos.map(req => ({
        planificacion_semanal_id,
        requerimiento_id: req.requerimiento_id,
        cantidad_planificada: req.cantidad_planificada,
        costo_estimado: req.costo_estimado,
    }));

    const { data, error } = await supabase
        .from('planificacion_requerimientos')
        .insert(requerimientosToInsert)
        .select();

    return { data, error };
};

/**
 * =================================================================================
 * Equipos y Actividades (Maestros)
 * =================================================================================
 */

export const getEquiposByProyecto = async (proyecto_id) => {
  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .eq('proyecto_id', proyecto_id);
  return { data, error };
};

export const getActividadesByPartida = async (partida_id) => {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('partida_id', partida_id);
  return { data, error };
};