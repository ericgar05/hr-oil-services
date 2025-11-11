import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../../contexts/ProjectContext'
import ModuleDescription from '../_core/ModuleDescription/ModuleDescription'
import './ContratoMain.css'

const ContratoMain = ({ projectId }) => {
  const navigate = useNavigate()
  const { selectedProject } = useProjects()
  
  const mainCards = [
    { 
      id: 'valuaciones', 
      title: 'VALUACIONES', 
      description: 'Administración y control de valuaciones del proyecto',
      icon: '📑',
      path: 'valuaciones'
    },
    { 
      id: 'presupuesto', 
      title: 'PRESUPUESTO', 
      description: 'Administración de presupuesto y partidas del contrato',
      icon: '💰',
      path: 'presupuesto'
    }
  ]

  const handleCardClick = (path) => {
    console.log('Navegando desde proyecto:', projectId, 'a:', path)
    navigate(path)
  }

  return (
    <div className="contrato-main">
      <ModuleDescription 
        title="Módulo de Contrato"
        description={`Gestión integral de la documentación contractual del proyecto ${selectedProject?.name || ''}`}
      />

      <div className="contrato-main-grid">
        {mainCards.map(card => (
          <div 
            key={card.id}
            className="contrato-main-card"
            onClick={() => handleCardClick(card.path)}
          >
            <div className="contrato-card-icon">{card.icon}</div>
            <div className="contrato-card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <small>Proyecto: {selectedProject?.name || ''}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContratoMain