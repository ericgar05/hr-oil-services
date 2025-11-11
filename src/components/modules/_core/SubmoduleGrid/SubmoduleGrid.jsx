import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import './SubmoduleGrid.css'

const SubmoduleGrid = ({ submodules, moduleId }) => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()

  const handleCardClick = (submodule) => {
    if (submodule.path) {
      navigate(submodule.path)
    }
  }

  const enhancedSubmodules = submodules.map(submodule => ({
    ...submodule,
    enabled: hasPermission(moduleId, 'write') && submodule.enabled !== false
  }))

  return (
    <div className="submodules-grid">
      {enhancedSubmodules.map(submodule => (
        <div 
          key={submodule.id} 
          className={`submodule-card ${!submodule.enabled ? 'disabled' : ''}`}
          onClick={() => submodule.enabled && handleCardClick(submodule)}
        >
          <div className="submodule-icon">{submodule.icon}</div>
          <div className="submodule-content">
            <h3>{submodule.title}</h3>
            <p>{submodule.description}</p>
            {!submodule.enabled && (
              <div className="access-label">Solo lectura</div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubmoduleGrid