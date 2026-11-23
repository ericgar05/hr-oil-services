// src/services/unidadesService.js
import supabase from '../api/supaBase';

// Catálogo base de resguardo (fallback inmediato y offline)
export const UNIDADES_BASE_CATALOG = [
  // Tiempo y Labor
  { codigo: 'H-H', nombre: 'Horas-Hombre', categoria: 'tiempo_labor' },
  { codigo: 'SG', nombre: 'Servicio Global', categoria: 'tiempo_labor' },
  { codigo: 'DIA', nombre: 'Día / Jornada', categoria: 'tiempo_labor' },
  { codigo: 'TURNO', nombre: 'Turno Operacional', categoria: 'tiempo_labor' },
  { codigo: 'MES', nombre: 'Mes Calendario', categoria: 'tiempo_labor' },
  { codigo: 'SEM', nombre: 'Semana', categoria: 'tiempo_labor' },
  { codigo: 'VIAJE', nombre: 'Viaje / Flete', categoria: 'tiempo_labor' },

  // Volumen y Capacidad
  { codigo: 'BBL', nombre: 'Barril (42 Galones)', categoria: 'volumen' },
  { codigo: 'M3', nombre: 'Metro Cúbico', categoria: 'volumen' },
  { codigo: 'LTS', nombre: 'Litros', categoria: 'volumen' },
  { codigo: 'GLN', nombre: 'Galón', categoria: 'volumen' },
  { codigo: 'CUÑETE', nombre: 'Cuñete (5 Galones)', categoria: 'volumen' },
  { codigo: 'TAMBOR', nombre: 'Tambor (55 Galones)', categoria: 'volumen' },

  // Conteo y Fabricación
  { codigo: 'PZA', nombre: 'Pieza', categoria: 'conteo' },
  { codigo: 'UNIDAD', nombre: 'Unidad Estándar', categoria: 'conteo' },
  { codigo: 'JGO', nombre: 'Juego / Set', categoria: 'conteo' },
  { codigo: 'TRAMO', nombre: 'Tramo de Tubería', categoria: 'conteo' },
  { codigo: 'ROLLO', nombre: 'Rollo', categoria: 'conteo' },
  { codigo: 'KIT', nombre: 'Kit', categoria: 'conteo' },
  { codigo: 'PAR', nombre: 'Par', categoria: 'conteo' },

  // Masa y Peso
  { codigo: 'KG', nombre: 'Kilogramo', categoria: 'masa_peso' },
  { codigo: 'TON', nombre: 'Tonelada Métrica', categoria: 'masa_peso' },
  { codigo: 'LBS', nombre: 'Libras', categoria: 'masa_peso' },
  { codigo: 'SACO', nombre: 'Saco / Bulto', categoria: 'masa_peso' },

  // Longitud y Superficie
  { codigo: 'ML', nombre: 'Metro Lineal', categoria: 'longitud_area' },
  { codigo: 'M2', nombre: 'Metro Cuadrado', categoria: 'longitud_area' },
  { codigo: 'KM', nombre: 'Kilómetro', categoria: 'longitud_area' },
  { codigo: 'PULG', nombre: 'Pulgada', categoria: 'longitud_area' },
  { codigo: 'PIE', nombre: 'Pie', categoria: 'longitud_area' },
  { codigo: 'FT2', nombre: 'Pie Cuadrado', categoria: 'longitud_area' },
];

const LOCAL_STORAGE_KEY = 'hr_unidades_medida_cache';

/**
 * Obtiene todas las unidades activas desde Supabase, con resguardo en caché y catálogo estándar.
 */
export async function getUnidadesMedida() {
  try {
    const { data, error } = await supabase
      .from('unidades_medida')
      .select('*')
      .eq('activo', true)
      .order('codigo', { ascending: true });

    if (error) {
      console.warn('Tabla unidades_medida no encontrada en Supabase o sin permisos. Usando catálogo local:', error.message);
      return getCachedUnidades();
    }

    if (data && data.length > 0) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('No se pudo guardar la caché de unidades en localStorage', e);
      }
      return data;
    }

    return getCachedUnidades();
  } catch (err) {
    console.warn('Error conectando a Supabase para unidades_medida:', err);
    return getCachedUnidades();
  }
}

/**
 * Guarda una nueva unidad en la base de datos Supabase y actualiza la caché local.
 */
export async function crearUnidadMedida({ codigo, nombre, categoria = 'personalizada', descripcion = '' }) {
  const cleanCode = (codigo || '').trim().toUpperCase();
  if (!cleanCode) {
    throw new Error('El código o sigla de la unidad es requerido');
  }

  const newUnitRecord = {
    codigo: cleanCode,
    nombre: (nombre || cleanCode).trim(),
    categoria: categoria || 'personalizada',
    descripcion: (descripcion || '').trim(),
    es_sistema: false,
    activo: true,
  };

  try {
    const { data, error } = await supabase
      .from('unidades_medida')
      .insert([newUnitRecord])
      .select()
      .single();

    if (error) {
      console.warn('No se pudo insertar en Supabase (posiblemente falta ejecutar el SQL de migración):', error.message);
      // Guardar en la caché local para no bloquear la operación del usuario
      saveToLocalCache(newUnitRecord);
      return newUnitRecord;
    }

    // Actualizar caché con el nuevo registro de Supabase
    saveToLocalCache(data || newUnitRecord);
    return data || newUnitRecord;
  } catch (err) {
    console.warn('Excepción al crear unidad en Supabase:', err);
    saveToLocalCache(newUnitRecord);
    return newUnitRecord;
  }
}

// Helpers internos para resguardo local
function getCachedUnidades() {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error leyendo caché local de unidades:', e);
  }
  return UNIDADES_BASE_CATALOG;
}

function saveToLocalCache(unit) {
  try {
    const current = getCachedUnidades();
    const exists = current.some((u) => u.codigo === unit.codigo);
    if (!exists) {
      const updated = [...current, unit];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error actualizando caché local:', e);
  }
}
