// src/components/modules/administracion/submodules/ingresos-comisiones/IngresosComisionesMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleDescription from '../.../../../../_core/ModuleDescription/ModuleDescription'
import { useProjects } from '../../../../../contexts/ProjectContext'
import './IngresosComisionesMain.css'

const IngresosComisionesMain = ({ projectId }) => {
  const navigate = useNavigate()
  const { selectedProject } = useProjects()

  const submodules = [
    { 
      id: 'ingresos-pagos', 
      title: 'Ingresos y Pagos Recibidos', 
      description: 'Gestión de facturas, deducciones y control de ingresos',
      icon: '💰',
      path: 'ingresos-pagos'
    },
    { 
      id: 'comisiones', 
      title: 'Comisiones', 
      description: 'Gestión y distribución de comisiones',
      icon: '📊',
      path: 'comisiones'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path, { state: { projectId } })
  }

  const handleBack = () => {
    navigate('../../../administracion')
  }

  return (
    <div className="ingresos-comisiones-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Administración
      </button>

      <ModuleDescription 
        title="INGRESOS & COMISIONES"
        description={`Gestión integral de ingresos, pagos recibidos y comisiones del proyecto ${selectedProject?.name || ''}`}
      />

      <div className="ingresos-comisiones-grid">
        {submodules.map(submodule => (
          <div 
            key={submodule.id}
            className="ingresos-comisiones-card"
            onClick={() => handleCardClick(submodule.path)}
          >
            <div className="ingresos-card-icon">{submodule.icon}</div>
            <div className="ingresos-card-content">
              <h3>{submodule.title}</h3>
              <p>{submodule.description}</p>
              <small>Proyecto: {selectedProject?.name || ''}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IngresosComisionesMain