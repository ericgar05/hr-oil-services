// src/components/modules/administracion/submodules/gastos-administrativos/submodules/logistica-operaciones/LogisticaOperacionesMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleDescription from '../../../../../_core/ModuleDescription/ModuleDescription'
import './LogisticaOperacionesMain.css'

const LogisticaOperacionesMain = () => {
  const navigate = useNavigate()

  const submodules = [
    { 
      id: 'traslados', 
      title: 'TRASLADOS', 
      description: 'Gestión de transporte y movilización del personal',
      icon: '🚗',
      path: 'traslados'
    },
    { 
      id: 'vehiculos', 
      title: 'VEHÍCULOS', 
      description: 'Control de flota vehicular y gastos asociados',
      icon: '🚙',
      path: 'vehiculos'
    },
    { 
      id: 'encomiendas', 
      title: 'ENCOMIENDAS', 
      description: 'Gestión de paquetería y envíos',
      icon: '📦',
      path: 'encomiendas'
    },
    { 
      id: 'mantenimiento-maquinaria', 
      title: 'MANTENIMIENTO Y REPARACIÓN DE MAQUINARIA OPERATIVA', 
      description: 'Control de mantenimiento y reparación de equipos',
      icon: '🔧',
      path: 'mantenimiento-maquinaria'
    },
    { 
      id: 'viaticos', 
      title: 'VIÁTICOS', 
      description: 'Gestión de gastos de viaje y alimentación',
      icon: '🍽️',
      path: 'viaticos'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path)
  }

  const handleBack = () => {
    navigate('..')
  }

  return (
    <div className="logistica-operaciones-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Gastos Administrativos
      </button>

      <ModuleDescription 
        title="Logística & Operaciones"
        description="Gestión de transporte, vehículos, mantenimiento y operaciones logísticas"
      />

      <div className="logistica-operaciones-grid">
        {submodules.map(submodule => (
          <div 
            key={submodule.id}
            className="logistica-operaciones-card"
            onClick={() => handleCardClick(submodule.path)}
          >
            <div className="logistica-card-icon">{submodule.icon}</div>
            <div className="logistica-card-content">
              <h3>{submodule.title}</h3>
              <p>{submodule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogisticaOperacionesMain