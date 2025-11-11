// src/components/modules/administracion/submodules/gastos-administrativos/submodules/suministros-materiales/SuministrosMaterialesMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleDescription from '../../../../../_core/ModuleDescription/ModuleDescription'
import './SuministrosMaterialesMain.css'

const SuministrosMaterialesMain = () => {
  const navigate = useNavigate()

  const submodules = [
    { 
      id: 'articulos-limpieza', 
      title: 'ARTÍCULOS LIMPIEZA', 
      description: 'Control de productos de limpieza y aseo',
      icon: '🧹',
      path: 'articulos-limpieza'
    },
    { 
      id: 'consumibles', 
      title: 'CONSUMIBLES', 
      description: 'Gestión de materiales consumibles de oficina',
      icon: '📎',
      path: 'consumibles'
    },
    { 
      id: 'materiales', 
      title: 'MATERIALES', 
      description: 'Control de materiales generales y suministros',
      icon: '📋',
      path: 'materiales'
    },
    { 
      id: 'insumos', 
      title: 'INSUMOS', 
      description: 'Gestión de insumos para operaciones',
      icon: '⚗️',
      path: 'insumos'
    },
    { 
      id: 'herramientas', 
      title: 'HERRAMIENTAS', 
      description: 'Control de herramientas y equipos menores',
      icon: '🛠️',
      path: 'herramientas'
    }
  ]

  const handleCardClick = (path) => {
    navigate(path)
  }

  const handleBack = () => {
    navigate('..')
  }

  return (
    <div className="suministros-materiales-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Gastos Administrativos
      </button>

      <ModuleDescription 
        title="Suministros & Materiales"
        description="Gestión de materiales, insumos, herramientas y consumibles del proyecto"
      />

      <div className="suministros-materiales-grid">
        {submodules.map(submodule => (
          <div 
            key={submodule.id}
            className="suministros-materiales-card"
            onClick={() => handleCardClick(submodule.path)}
          >
            <div className="suministros-card-icon">{submodule.icon}</div>
            <div className="suministros-card-content">
              <h3>{submodule.title}</h3>
              <p>{submodule.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuministrosMaterialesMain