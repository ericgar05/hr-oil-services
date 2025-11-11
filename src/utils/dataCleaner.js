// src/utils/dataCleaner.js
export const cleanPlanificacionData = (data) => {
  if (!data) return {}
  
  const cleaned = {}
  
  Object.keys(data).forEach(key => {
    if (key === 'requerimientos') {
      // Asegurar que requerimientos sea un array
      cleaned[key] = Array.isArray(data[key]) ? data[key] : []
    } else {
      // Asegurar que las actividades por día sean arrays
      cleaned[key] = Array.isArray(data[key]) ? data[key] : []
    }
  })
  
  return cleaned
}

export const migrateOldDataStructure = (data) => {
  if (!data) return {}
  
  const migrated = {}
  
  Object.keys(data).forEach(semanaId => {
    const semanaData = data[semanaId]
    migrated[semanaId] = {}
    
    Object.keys(semanaData).forEach(dia => {
      if (dia === 'requerimientos') {
        migrated[semanaId][dia] = Array.isArray(semanaData[dia]) ? semanaData[dia] : []
      } else {
        const actividades = semanaData[dia]
        // Si no es un array, convertirlo a array vacío
        migrated[semanaId][dia] = Array.isArray(actividades) ? actividades : []
      }
    })
  })
  
  return migrated
}