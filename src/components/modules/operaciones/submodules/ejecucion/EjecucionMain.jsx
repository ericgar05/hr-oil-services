// src/components/modules/operaciones/submodules/ejecucion/EjecucionMain.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../../../../contexts/ProjectContext'
import ModuleDescription from '../../../_core/ModuleDescription/ModuleDescription'
import SemanaSelectorEjecucion from './components/SemanaSelectorEjecucion'
import DiaEjecucion from './components/DiaEjecucion'
import ActividadEjecucion from './components/ActividadEjecucion'
import ReporteEjecucion from './components/ReporteEjecucion'
import ResumenEjecucion from './components/ResumenEjecucion'
import './EjecucionMain.css'

const EjecucionMain = () => {
  const navigate = useNavigate()
  const { selectedProject } = useProjects()
  
  const [currentView, setCurrentView] = useState('semana')
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [actividadSeleccionada, setActividadSeleccionada] = useState(null)
  const [planificacionData, setPlanificacionData] = useState({})
  const [ejecucionData, setEjecucionData] = useState({})
  const [nominaData, setNominaData] = useState([])
  const [inventarioData, setInventarioData] = useState([])

  // Cargar datos al iniciar
  useEffect(() => {
    if (selectedProject?.id) {
      loadPlanificacionData()
      loadEjecucionData()
      loadNominaData()
      loadInventarioData()
    }
  }, [selectedProject])

  const loadPlanificacionData = () => {
    const savedPlanificacion = localStorage.getItem(`planificacion_${selectedProject?.id}`)
    if (savedPlanificacion) {
      try {
        const parsedData = JSON.parse(savedPlanificacion)
        setPlanificacionData(parsedData)
      } catch (error) {
        console.error('Error al cargar datos de planificación:', error)
        setPlanificacionData({})
      }
    }
  }

  const loadEjecucionData = () => {
    const savedEjecucion = localStorage.getItem(`ejecucion_${selectedProject?.id}`)
    if (savedEjecucion) {
      try {
        const parsedData = JSON.parse(savedEjecucion)
        setEjecucionData(parsedData)
      } catch (error) {
        console.error('Error al cargar datos de ejecución:', error)
        setEjecucionData({})
      }
    }
  }

  const loadNominaData = () => {
    const savedNomina = localStorage.getItem(`nomina_${selectedProject?.id}`)
    if (savedNomina) {
      try {
        const parsedData = JSON.parse(savedNomina)
        setNominaData(parsedData.trabajadores || [])
      } catch (error) {
        console.error('Error al cargar datos de nómina:', error)
        setNominaData([])
      }
    }
  }

  const loadInventarioData = () => {
    const savedInventario = localStorage.getItem(`inventario_${selectedProject?.id}`)
    if (savedInventario) {
      try {
        const parsedData = JSON.parse(savedInventario)
        setInventarioData(parsedData.materiales || [])
      } catch (error) {
        console.error('Error al cargar datos de inventario:', error)
        setInventarioData([])
      }
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleSeleccionarSemana = (semana) => {
    setSemanaSeleccionada(semana)
    setCurrentView('dia')
  }

  const handleSeleccionarDia = (dia) => {
    setDiaSeleccionado(dia)
    setCurrentView('actividades')
  }

  const handleSeleccionarActividad = (actividad) => {
    setActividadSeleccionada(actividad)
    setCurrentView('ejecucion')
  }

  const handleGuardarEjecucion = (actividadId, datosEjecucion) => {
    const semanaKey = semanaSeleccionada.id
    const diaKey = diaSeleccionado
    
    const updatedEjecucion = {
      ...ejecucionData,
      [semanaKey]: {
        ...ejecucionData[semanaKey],
        [diaKey]: {
          ...(ejecucionData[semanaKey]?.[diaKey] || {}),
          [actividadId]: {
            ...datosEjecucion,
            fechaEjecucion: new Date().toISOString(),
            projectId: selectedProject.id,
            semanaId: semanaSeleccionada.id,
            dia: diaSeleccionado
          }
        }
      }
    }
    
    setEjecucionData(updatedEjecucion)
    localStorage.setItem(`ejecucion_${selectedProject?.id}`, JSON.stringify(updatedEjecucion))
    alert('✅ Ejecución guardada exitosamente')
    setCurrentView('actividades')
  }

  const handleVerReporte = () => {
    setCurrentView('reporte')
  }

  const handleVerResumen = () => {
    setCurrentView('resumen')
  }

  // Verificar si hay planificación disponible
  const tienePlanificacion = Object.keys(planificacionData).length > 0

  if (!tienePlanificacion) {
    return (
      <div className="ejecucion-main">
        <button className="back-button" onClick={handleBack}>
          ← Volver a Operaciones
        </button>

        <ModuleDescription 
          title="Ejecución de Actividades"
          description={`Seguimiento y control de actividades ejecutadas - ${selectedProject?.name || ''}`}
        />

        <div className="no-planificacion-warning">
          <div className="warning-icon">⚠️</div>
          <h4>Planificación Requerida</h4>
          <p>No se puede realizar seguimiento de ejecución sin actividades planificadas.</p>
          <p>Debes crear una planificación en el módulo de Planificación antes de poder registrar ejecuciones.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('../planificacion')}
          >
            Ir a Planificación
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ejecucion-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Operaciones
      </button>

      <ModuleDescription 
        title="Ejecución de Actividades"
        description={`Seguimiento y control de actividades ejecutadas - ${selectedProject?.name || ''}`}
      />

      {/* Información del proyecto */}
      <div className="project-info-card">
        <div className="project-header">
          <h4>Información del Proyecto</h4>
          <div className="project-id">ID: {selectedProject?.id}</div>
        </div>
        <div className="project-details">
          <div className="project-field">
            <label>Nombre:</label>
            <span>{selectedProject?.name}</span>
          </div>
          <div className="project-field">
            <label>Estado:</label>
            <span className="status-badge active">En Ejecución</span>
          </div>
        </div>
      </div>

      {/* Navegación entre vistas */}
      <div className="ejecucion-navigation">
        <button 
          className={`nav-btn ${currentView === 'semana' ? 'active' : ''}`}
          onClick={() => setCurrentView('semana')}
        >
          🗓️ Seleccionar Semana
        </button>
        {semanaSeleccionada && (
          <button 
            className={`nav-btn ${currentView === 'dia' ? 'active' : ''}`}
            onClick={() => setCurrentView('dia')}
          >
            📅 Días de la Semana
          </button>
        )}
        {semanaSeleccionada && diaSeleccionado && (
          <button 
            className={`nav-btn ${currentView === 'actividades' ? 'active' : ''}`}
            onClick={() => setCurrentView('actividades')}
          >
            🔧 Actividades del Día
          </button>
        )}
        {semanaSeleccionada && (
          <button 
            className={`nav-btn ${currentView === 'resumen' ? 'active' : ''}`}
            onClick={handleVerResumen}
          >
            📊 Resumen de Ejecución
          </button>
        )}
      </div>

      {/* Contenido según la vista */}
      <div className="ejecucion-content">
        {currentView === 'semana' && (
          <SemanaSelectorEjecucion
            onSeleccionarSemana={handleSeleccionarSemana}
            planificacionData={planificacionData}
            ejecucionData={ejecucionData}
          />
        )}

        {currentView === 'dia' && semanaSeleccionada && (
          <DiaEjecucion
            semana={semanaSeleccionada}
            onSeleccionarDia={handleSeleccionarDia}
            planificacionData={planificacionData[semanaSeleccionada.id] || {}}
            ejecucionData={ejecucionData[semanaSeleccionada.id] || {}}
          />
        )}

        {currentView === 'actividades' && semanaSeleccionada && diaSeleccionado && (
          <ActividadEjecucion
            semana={semanaSeleccionada}
            dia={diaSeleccionado}
            planificacionData={planificacionData[semanaSeleccionada.id]?.[diaSeleccionado] || []}
            ejecucionData={ejecucionData[semanaSeleccionada.id]?.[diaSeleccionado] || {}}
            onSeleccionarActividad={handleSeleccionarActividad}
            onVerReporte={handleVerReporte}
          />
        )}

        {currentView === 'ejecucion' && semanaSeleccionada && diaSeleccionado && actividadSeleccionada && (
          <ReporteEjecucion
            semana={semanaSeleccionada}
            dia={diaSeleccionado}
            actividad={actividadSeleccionada}
            ejecucionExistente={ejecucionData[semanaSeleccionada.id]?.[diaSeleccionado]?.[actividadSeleccionada.id]}
            nominaData={nominaData}
            inventarioData={inventarioData}
            onGuardar={handleGuardarEjecucion}
            onCancelar={() => setCurrentView('actividades')}
          />
        )}

        {currentView === 'resumen' && semanaSeleccionada && (
          <ResumenEjecucion
            semana={semanaSeleccionada}
            planificacionData={planificacionData[semanaSeleccionada.id] || {}}
            ejecucionData={ejecucionData[semanaSeleccionada.id] || {}}
          />
        )}
      </div>
    </div>
  )
}

export default EjecucionMain