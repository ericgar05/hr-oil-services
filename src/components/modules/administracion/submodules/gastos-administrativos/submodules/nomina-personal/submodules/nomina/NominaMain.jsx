// src/components/modules/administracion/submodules/gastos-administrativos/submodules/nomina-personal/submodules/nomina/NominaMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../../../../../../../../contexts/ProjectContext'
import ModuleDescription from '../../../../../../../_core/ModuleDescription/ModuleDescription'
import './NominaMain.css'

const NominaMain = () => {
  const navigate = useNavigate()
  const { selectedProject } = useProjects()

  const nominaSubmodules = [
    { 
      id: 'registro-personal', 
      title: 'Registro de Personal', 
      description: 'Gestión completa del registro y datos del personal',
      icon: '👤',
      path: 'registro-personal'
    },
    { 
      id: 'asistencia-diaria', 
      title: 'Asistencia Diaria', 
      description: 'Control de asistencia y horarios del personal',
      icon: '📅',
      path: 'asistencia-diaria'
    },
    { 
      id: 'pagos-nomina', 
      title: 'Pagos Nómina', 
      description: 'Gestión de pagos, cálculos y liquidaciones de nómina',
      icon: '💳',
      path: 'pagos-nomina'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path)
  }

  const handleBack = () => {
    navigate(-1) // Volver a Nómina & Personal
  }

  return (
    <div className="nomina-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Nómina & Personal
      </button>

      <ModuleDescription 
        title="Nómina"
        description={`Gestión completa de nómina, asistencia y pagos del personal - ${selectedProject?.name || ''}`}
      />

      <div className="nomina-grid">
        {nominaSubmodules.map(submodule => (
          <div 
            key={submodule.id}
            className="nomina-card"
            onClick={() => handleCardClick(submodule.path)}
          >
            <div className="nomina-sub-card-icon">{submodule.icon}</div>
            <div className="nomina-sub-card-content">
              <h3>{submodule.title}</h3>
              <p>{submodule.description}</p>
              {selectedProject && (
                <div className="project-badge">
                  {selectedProject.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NominaMain