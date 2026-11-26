// src/contexts/CoordinacionesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import supabase from '../api/supaBase';
import { useProjects } from './ProjectContext';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';

const CoordinacionesContext = createContext();

export const useCoordinaciones = () => {
  const context = useContext(CoordinacionesContext);
  if (!context) {
    throw new Error('useCoordinaciones debe ser usado dentro de un CoordinacionesProvider');
  }
  return context;
};

export const CoordinacionesProvider = ({ children }) => {
  const { selectedProject } = useProjects();
  const { showToast } = useNotification();
  const { userData } = useAuth();

  const [coordinaciones, setCoordinaciones] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Coordinación actualmente activa en el Espacio de Trabajo
  const [selectedCoordinacion, setSelectedCoordinacion] = useState(null);

  // Claves para el fallback en LocalStorage
  const getStorageKey = useCallback((entity) => {
    return `coordinaciones_${entity}_${selectedProject?.id || 'default'}`;
  }, [selectedProject?.id]);

  // Fallback a LocalStorage para lectura
  const loadLocalData = useCallback((entity) => {
    try {
      const saved = localStorage.getItem(getStorageKey(entity));
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn(`Error leyendo localStorage para ${entity}:`, e);
      return [];
    }
  }, [getStorageKey]);

  // Guardar en LocalStorage
  const saveLocalData = useCallback((entity, data) => {
    try {
      localStorage.setItem(getStorageKey(entity), JSON.stringify(data));
    } catch (e) {
      console.warn(`Error guardando en localStorage para ${entity}:`, e);
    }
  }, [getStorageKey]);

  // ========================================================
  // CARGA INICIAL DE DATOS
  // ========================================================
  const fetchAllData = useCallback(async () => {
    if (!selectedProject?.id) return;
    setLoading(true);

    try {
      // 1. Coordinaciones
      let coordsData = [];
      const { data: cData, error: cErr } = await supabase
        .from('coordinaciones')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: true });

      if (cErr || !cData) {
        coordsData = loadLocalData('coordinaciones');
      } else {
        coordsData = cData;
        saveLocalData('coordinaciones', cData);
      }
      setCoordinaciones(coordsData);

      // 2. Pendientes / Actividades
      let pendsData = [];
      const { data: pData, error: pErr } = await supabase
        .from('coordinacion_pendientes')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });

      if (pErr || !pData) {
        pendsData = loadLocalData('pendientes');
      } else {
        const normalized = pData.map((p) => ({
          ...p,
          departamento_id: p.departamento_id || p.coordinacion_id,
        }));
        pendsData = normalized;
        saveLocalData('pendientes', normalized);
      }
      setPendientes(pendsData);

      // 3. Archivos / Documentos
      let archsData = [];
      const { data: aData, error: aErr } = await supabase
        .from('coordinacion_archivos')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('created_at', { ascending: false });

      if (aErr || !aData) {
        archsData = loadLocalData('archivos');
      } else {
        const normalized = aData.map((a) => ({
          ...a,
          departamento_id: a.departamento_id || a.coordinacion_id,
        }));
        archsData = normalized;
        saveLocalData('archivos', normalized);
      }
      setArchivos(archsData);

      // 4. Cuestiones Generales / Notas
      let ntsData = [];
      const { data: nData, error: nErr } = await supabase
        .from('coordinacion_notas')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('fijado', { ascending: false })
        .order('created_at', { ascending: false });

      if (nErr || !nData) {
        ntsData = loadLocalData('notas');
      } else {
        const normalized = nData.map((n) => ({
          ...n,
          departamento_id: n.departamento_id || n.coordinacion_id,
        }));
        ntsData = normalized;
        saveLocalData('notas', normalized);
      }
      setNotas(ntsData);
    } catch (err) {
      console.error('Error cargando módulo de coordinaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProject?.id, loadLocalData, saveLocalData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Actualizar la coordinación seleccionada si sus datos cambian
  useEffect(() => {
    if (selectedCoordinacion) {
      const refreshed = coordinaciones.find((c) => c.id === selectedCoordinacion.id);
      if (refreshed) {
        if (
          refreshed.nombre !== selectedCoordinacion.nombre ||
          refreshed.color !== selectedCoordinacion.color ||
          refreshed.codigo !== selectedCoordinacion.codigo ||
          refreshed.responsable !== selectedCoordinacion.responsable ||
          refreshed.descripcion !== selectedCoordinacion.descripcion ||
          refreshed.estado !== selectedCoordinacion.estado
        ) {
          setSelectedCoordinacion(refreshed);
        }
      } else {
        setSelectedCoordinacion(null);
      }
    }
  }, [coordinaciones, selectedCoordinacion]);

  // ========================================================
  // CRUD: COORDINACIONES
  // ========================================================
  const createCoordinacion = async (payload) => {
    if (!selectedProject?.id) return;
    const newRecord = {
      id: crypto.randomUUID(),
      project_id: selectedProject.id,
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion?.trim() || '',
      codigo: payload.codigo?.trim() || '',
      responsable: payload.responsable?.trim() || '',
      color: payload.color || '#1e40af',
      icono: payload.icono || 'folder',
      estado: payload.estado || 'activo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('coordinaciones')
        .insert([newRecord])
        .select()
        .single();

      const created = (!error && data) ? data : newRecord;
      setCoordinaciones((prev) => {
        const next = [...prev, created];
        saveLocalData('coordinaciones', next);
        return next;
      });
      showToast('Coordinación creada exitosamente', 'success');
      return created;
    } catch (e) {
      setCoordinaciones((prev) => {
        const next = [...prev, newRecord];
        saveLocalData('coordinaciones', next);
        return next;
      });
      showToast('Coordinación guardada localmente', 'info');
      return newRecord;
    }
  };

  const updateCoordinacion = async (id, payload) => {
    const updateData = {
      ...payload,
      updated_at: new Date().toISOString(),
    };

    try {
      await supabase.from('coordinaciones').update(updateData).eq('id', id);
    } catch (e) {
      console.warn('Fallback a guardado local en updateCoordinacion:', e);
    }

    setCoordinaciones((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updateData } : c));
      saveLocalData('coordinaciones', next);
      return next;
    });

    if (selectedCoordinacion?.id === id) {
      setSelectedCoordinacion((prev) => ({ ...prev, ...updateData }));
    }

    showToast('Coordinación actualizada', 'success');
  };

  const deleteCoordinacion = async (id) => {
    try {
      await supabase.from('coordinaciones').delete().eq('id', id);
    } catch (e) {
      console.warn('Fallback a eliminación local en deleteCoordinacion:', e);
    }

    // Cascada local: eliminar también sus pendientes, archivos y notas
    setCoordinaciones((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveLocalData('coordinaciones', next);
      return next;
    });

    setPendientes((prev) => {
      const next = prev.filter((p) => p.coordinacion_id !== id && p.departamento_id !== id);
      saveLocalData('pendientes', next);
      return next;
    });

    setArchivos((prev) => {
      const next = prev.filter((a) => a.coordinacion_id !== id && a.departamento_id !== id);
      saveLocalData('archivos', next);
      return next;
    });

    setNotas((prev) => {
      const next = prev.filter((n) => n.coordinacion_id !== id && n.departamento_id !== id);
      saveLocalData('notas', next);
      return next;
    });

    if (selectedCoordinacion?.id === id) {
      setSelectedCoordinacion(null);
    }

    showToast('Coordinación eliminada', 'info');
  };

  // ========================================================
  // CRUD: PENDIENTES / ACTIVIDADES
  // ========================================================
  const createPendiente = async (payload) => {
    const targetCoordId = payload.coordinacion_id || payload.departamento_id;
    if (!selectedProject?.id || !targetCoordId) return;

    // Objeto limpio con solo las columnas existentes en la tabla PostgreSQL
    const dbRecord = {
      id: crypto.randomUUID(),
      coordinacion_id: targetCoordId,
      project_id: selectedProject.id,
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion?.trim() || '',
      estado: payload.estado || 'Pendiente',
      prioridad: payload.prioridad || 'Media',
      fecha_limite: payload.fecha_limite ? payload.fecha_limite : null,
      responsable: payload.responsable?.trim() || '',
      subtareas: payload.subtareas || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const localRecord = {
      ...dbRecord,
      departamento_id: targetCoordId,
    };

    try {
      const { data, error } = await supabase
        .from('coordinacion_pendientes')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('Error insertando en coordinacion_pendientes en Supabase:', error);
        throw error;
      }

      const created = data ? { ...data, departamento_id: targetCoordId } : localRecord;
      setPendientes((prev) => {
        const next = [created, ...prev];
        saveLocalData('pendientes', next);
        return next;
      });
      showToast('Actividad registrada correctamente', 'success');
      return created;
    } catch (e) {
      console.warn('Fallback a guardado local en createPendiente:', e);
      setPendientes((prev) => {
        const next = [localRecord, ...prev];
        saveLocalData('pendientes', next);
        return next;
      });
      showToast('Actividad guardada localmente', 'info');
      return localRecord;
    }
  };

  const updatePendiente = async (id, payload) => {
    const { departamento_id, ...cleanPayload } = payload;
    const updateData = {
      ...cleanPayload,
      ...(cleanPayload.fecha_limite !== undefined && {
        fecha_limite: cleanPayload.fecha_limite ? cleanPayload.fecha_limite : null,
      }),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('coordinacion_pendientes').update(updateData).eq('id', id);
      if (error) {
        console.error('Error actualizando coordinacion_pendientes en Supabase:', error);
      }
    } catch (e) {
      console.warn('Fallback a guardado local en updatePendiente:', e);
    }

    setPendientes((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updateData, departamento_id: p.departamento_id || p.coordinacion_id } : p));
      saveLocalData('pendientes', next);
      return next;
    });
    showToast('Actividad actualizada', 'success');
  };

  const toggleSubtarea = async (pendienteId, subtareaId) => {
    const target = pendientes.find((p) => p.id === pendienteId);
    if (!target) return;

    const updatedSubtareas = (target.subtareas || []).map((sub) =>
      sub.id === subtareaId ? { ...sub, completada: !sub.completada } : sub
    );

    await updatePendiente(pendienteId, { subtareas: updatedSubtareas });
  };

  const deletePendiente = async (id) => {
    try {
      await supabase.from('coordinacion_pendientes').delete().eq('id', id);
    } catch (e) {
      console.warn('Fallback a eliminación local en deletePendiente:', e);
    }

    setPendientes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveLocalData('pendientes', next);
      return next;
    });

    // Desvincular archivos asociados (pasan a ser documentos generales de la coordinación)
    setArchivos((prev) => {
      const next = prev.map((a) => (a.actividad_id === id ? { ...a, actividad_id: null } : a));
      saveLocalData('archivos', next);
      return next;
    });

    showToast('Actividad eliminada', 'info');
  };

  // ========================================================
  // GESTIÓN Y SUBIDA DE ARCHIVOS (HÍBRIDO RESILIENTE)
  // ========================================================
  const uploadArchivo = async (file, { coordinacionId, departamentoId, actividadId = null, categoria = 'Otro' }) => {
    const targetCoordId = coordinacionId || departamentoId;
    if (!selectedProject?.id || !targetCoordId || !file) {
      throw new Error('Faltan datos obligatorios para subir el archivo');
    }

    const fileId = crypto.randomUUID();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${selectedProject.id}/${targetCoordId}/${fileId}_${sanitizedName}`;

    let fileUrl = '';
    let uploadedToStorage = false;

    // 1. Intentar subir a Supabase Storage
    try {
      const { data: storageData, error: storageErr } = await supabase.storage
        .from('coordinacion-archivos')
        .upload(storagePath, file, { cacheControl: '3600', upsert: true });

      if (!storageErr && storageData) {
        const { data: pubData } = supabase.storage
          .from('coordinacion-archivos')
          .getPublicUrl(storagePath);
        fileUrl = pubData?.publicUrl || '';
        uploadedToStorage = true;
      }
    } catch (sErr) {
      console.warn('Storage nativo no disponible, usando DataURL fallback:', sErr);
    }

    // 2. Si no se subió a Storage, convertir a DataURL para almacenamiento seguro
    if (!uploadedToStorage) {
      fileUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    }

    const dbRecord = {
      id: fileId,
      coordinacion_id: targetCoordId,
      actividad_id: actividadId || null,
      project_id: selectedProject.id,
      nombre_archivo: file.name,
      archivo_url: fileUrl,
      storage_path: uploadedToStorage ? storagePath : null,
      tipo_mime: file.type || 'application/octet-stream',
      tamanio: file.size || 0,
      categoria: categoria || 'Otro',
      usuario_subida: userData?.username || userData?.name || 'Usuario',
      created_at: new Date().toISOString(),
    };

    const localRecord = {
      ...dbRecord,
      departamento_id: targetCoordId,
    };

    // 3. Registrar en base de datos
    try {
      const { data, error } = await supabase
        .from('coordinacion_archivos')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('Error insertando en coordinacion_archivos en Supabase:', error);
        throw error;
      }

      const created = data ? { ...data, departamento_id: targetCoordId } : localRecord;
      setArchivos((prev) => {
        const next = [created, ...prev];
        saveLocalData('archivos', next);
        return next;
      });
      showToast('Archivo subido exitosamente', 'success');
      return created;
    } catch (e) {
      console.warn('Fallback a guardado local en uploadArchivo:', e);
      setArchivos((prev) => {
        const next = [localRecord, ...prev];
        saveLocalData('archivos', next);
        return next;
      });
      showToast('Archivo guardado localmente', 'info');
      return localRecord;
    }
  };

  const deleteArchivo = async (id) => {
    const target = archivos.find((a) => a.id === id);
    if (target?.storage_path) {
      try {
        await supabase.storage.from('coordinacion-archivos').remove([target.storage_path]);
      } catch (e) {
        console.warn('Error eliminando del storage:', e);
      }
    }

    try {
      await supabase.from('coordinacion_archivos').delete().eq('id', id);
    } catch (e) {
      console.warn('Fallback a eliminación local en deleteArchivo:', e);
    }

    setArchivos((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveLocalData('archivos', next);
      return next;
    });
    showToast('Archivo eliminado', 'info');
  };

  // ========================================================
  // CRUD: CUESTIONES GENERALES / NOTAS (BITÁCORA)
  // ========================================================
  const createNota = async (payload) => {
    const targetCoordId = payload.coordinacion_id || payload.departamento_id;
    if (!selectedProject?.id || !targetCoordId) return;

    const dbRecord = {
      id: crypto.randomUUID(),
      coordinacion_id: targetCoordId,
      project_id: selectedProject.id,
      titulo: payload.titulo.trim(),
      contenido: payload.contenido.trim(),
      fijado: Boolean(payload.fijado),
      categoria_nota: payload.categoria_nota || 'General',
      usuario_creador: userData?.username || userData?.name || 'Usuario',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const localRecord = {
      ...dbRecord,
      departamento_id: targetCoordId,
    };

    try {
      const { data, error } = await supabase
        .from('coordinacion_notas')
        .insert([dbRecord])
        .select()
        .single();

      if (error) {
        console.error('Error insertando en coordinacion_notas en Supabase:', error);
        throw error;
      }

      const created = data ? { ...data, departamento_id: targetCoordId } : localRecord;
      setNotas((prev) => {
        const next = [created, ...prev].sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0));
        saveLocalData('notas', next);
        return next;
      });
      showToast('Nota registrada correctamente', 'success');
      return created;
    } catch (e) {
      console.warn('Fallback a guardado local en createNota:', e);
      setNotas((prev) => {
        const next = [localRecord, ...prev].sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0));
        saveLocalData('notas', next);
        return next;
      });
      showToast('Nota guardada localmente', 'info');
      return localRecord;
    }
  };

  const updateNota = async (id, payload) => {
    const { departamento_id, ...cleanPayload } = payload;
    const updateData = {
      ...cleanPayload,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('coordinacion_notas').update(updateData).eq('id', id);
      if (error) {
        console.error('Error actualizando coordinacion_notas en Supabase:', error);
      }
    } catch (e) {
      console.warn('Fallback a guardado local en updateNota:', e);
    }

    setNotas((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updateData, departamento_id: n.departamento_id || n.coordinacion_id } : n))
        .sort((a, b) => (b.fijado ? 1 : 0) - (a.fijado ? 1 : 0));
      saveLocalData('notas', next);
      return next;
    });
    showToast('Nota actualizada', 'success');
  };

  const toggleFijarNota = async (id) => {
    const target = notas.find((n) => n.id === id);
    if (!target) return;
    await updateNota(id, { fijado: !target.fijado });
  };

  const deleteNota = async (id) => {
    try {
      await supabase.from('coordinacion_notas').delete().eq('id', id);
    } catch (e) {
      console.warn('Fallback a eliminación local en deleteNota:', e);
    }

    setNotas((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveLocalData('notas', next);
      return next;
    });
    showToast('Nota eliminada', 'info');
  };

  // ========================================================
  // MÉTRICAS Y CÁLCULOS POR COORDINACIÓN
  // ========================================================
  const getCoordinacionStats = useCallback((coordId) => {
    const coordPendientes = pendientes.filter(
      (p) => p.coordinacion_id === coordId || p.departamento_id === coordId
    );
    const coordArchivos = archivos.filter(
      (a) => a.coordinacion_id === coordId || a.departamento_id === coordId
    );
    const coordNotas = notas.filter(
      (n) => n.coordinacion_id === coordId || n.departamento_id === coordId
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const in48Hours = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activos = coordPendientes.filter((p) => p.estado !== 'Completado');
    const completados = coordPendientes.filter((p) => p.estado === 'Completado');

    // Vencidas: fecha_limite < hoy y no completada
    const vencidas = activos.filter((p) => p.fecha_limite && p.fecha_limite < todayStr);

    // Por vencer: fecha_limite >= hoy && fecha_limite <= in48Hours y no completada
    const porVencer = activos.filter(
      (p) => p.fecha_limite && p.fecha_limite >= todayStr && p.fecha_limite <= in48Hours
    );

    return {
      totalPendientes: coordPendientes.length,
      pendientesActivos: activos.length,
      completados: completados.length,
      vencidas: vencidas.length,
      porVencer: porVencer.length,
      tieneAlertas: vencidas.length > 0 || porVencer.length > 0,
      totalArchivos: coordArchivos.length,
      totalNotas: coordNotas.length,
    };
  }, [pendientes, archivos, notas]);

  const value = useMemo(() => ({
    loading,
    coordinaciones,
    departamentos: coordinaciones, // Alias para compatibilidad
    pendientes,
    archivos,
    notas,
    selectedCoordinacion,
    setSelectedCoordinacion,
    selectedDepartamento: selectedCoordinacion, // Alias para compatibilidad
    setSelectedDepartamento: setSelectedCoordinacion,
    fetchAllData,
    createCoordinacion,
    updateCoordinacion,
    deleteCoordinacion,
    createPendiente,
    updatePendiente,
    toggleSubtarea,
    deletePendiente,
    uploadArchivo,
    deleteArchivo,
    createNota,
    updateNota,
    toggleFijarNota,
    deleteNota,
    getCoordinacionStats,
    getDepartamentoStats: getCoordinacionStats, // Alias para compatibilidad
  }), [
    loading,
    coordinaciones,
    pendientes,
    archivos,
    notas,
    selectedCoordinacion,
    fetchAllData,
    createCoordinacion,
    updateCoordinacion,
    deleteCoordinacion,
    createPendiente,
    updatePendiente,
    toggleSubtarea,
    deletePendiente,
    uploadArchivo,
    deleteArchivo,
    createNota,
    updateNota,
    toggleFijarNota,
    deleteNota,
    getCoordinacionStats,
  ]);

  return (
    <CoordinacionesContext.Provider value={value}>
      {children}
    </CoordinacionesContext.Provider>
  );
};
