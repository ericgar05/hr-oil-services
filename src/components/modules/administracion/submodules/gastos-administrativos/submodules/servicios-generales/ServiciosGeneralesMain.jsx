// src/components/modules/administracion/submodules/gastos-administrativos/submodules/servicios-generales/ServiciosGeneralesMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleDescription from '../../../../../_core/ModuleDescription/ModuleDescription'
import './ServiciosGeneralesMain.css'

const ServiciosGeneralesMain = () => {
  const navigate = useNavigate()

  const submodules = [
    { 
      id: 'alquileres', 
      title: 'ALQUILERES', 
      description: 'Gestión de alquileres de oficinas y espacios',
      icon: '🏢',
      path: 'alquileres'
    },
    { 
      id: 'mantenimiento-equipos', 
      title: 'MANTENIMIENTO Y REPARACIÓN EQUIPOS DE OFICINA', 
      description: 'Control de mantenimiento de equipos administrativos',
      icon: '💻',
      path: 'mantenimiento-equipos'
    },
    { 
      id: 'equipos-oficina', 
      title: 'EQUIPOS DE OFICINA', 
      description: 'Gestión de equipos y mobiliario de oficina',
      icon: '🪑',
      path: 'equipos-oficina'
    },
    { 
      id: 'organismos-publicos', 
      title: 'ORGANISMOS PÚBLICOS', 
      description: 'Control de trámites y pagos a organismos públicos',
      icon: '🏛️',
      path: 'organismos-publicos'
    },
    { 
      id: 'comidas-bebidas', 
      title: 'COMIDAS, BEBIDAS Y OTROS', 
      description: 'Gestión de gastos de alimentación y refrigerios',
      icon: '🍽️',
      path: 'comidas-bebidas'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path)
  }

  const handleBack = () => {
    navigate('..')
  }

  return (
    <div className="servicios-generales-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Gastos Administrativos
      </button>

      <ModuleDescription 
        title="Servicios Generales & Administrativos"
        description="Gestión de servicios generales, mantenimiento y gastos administrativos"
      />

      <div className="servicios-generales-grid">
        {submodules.map(submodule => (
          <div 
            key={submodule.id}
            className="servicios-generales-card"
            onClick={() => handleCardClick(submodule.path)}
          >
            <div className="servicios-card-icon">{submodule.icon}</div>
            <div className="servicios-card-content">
              <h3>{submodule.title}</h3>
              <p>{submodule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServiciosGeneralesMain