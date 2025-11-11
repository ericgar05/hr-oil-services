// src/components/modules/administracion/submodules/gastos-administrativos/GastosAdminMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import ModuleDescription from '../../../_core/ModuleDescription/ModuleDescription'
import './GastosAdminMain.css'
import { useProjects } from '../../../../../contexts/ProjectContext'

const GastosAdminMain = ({ projectId }) => {
  const navigate = useNavigate()
  const { selectedProject } = useProjects()

  const submodules = [
    { 
      id: 'nomina-personal', 
      title: 'Nómina & Personal', 
      description: 'Gestión de nómina, servicios médicos y dotaciones del personal',
      icon: '👥',
      path: 'nomina-personal'
    },
    { 
      id: 'compra-facturacion', 
      title: 'Compra & Facturación', 
      description: 'Gestión de compras con y sin factura, control de proveedores y retenciones',
      icon: '🧾',
      path: 'compra-facturacion'
    }
  ]

  const handleCardClick = (path) => {
    console.log('Navegando desde Gastos Admin, proyecto:', projectId, 'a:', path)
    navigate(path, { state: { projectId } })
  }

  const handleBack = () => {
    navigate('../../../administracion') // Navega al root de administración
  }

  return (
    <div className="gastos-admin-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Administración
      </button>

      <ModuleDescription 
        title="GASTOS ADMINISTRATIVOS"
        description={`Gestión integral de todos los gastos administrativos del proyecto ${selectedProject?.name || ''}`}
      />

      <div className="gastos-admin-grid">
        {submodules.map(submodule => (
          <div 
            key={submodule.id}
            className="gastos-admin-card"
            onClick={() => handleCardClick(submodule.path)}
          >
            <div className="gastos-card-icon">{submodule.icon}</div>
            <div className="gastos-card-content">
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

export default GastosAdminMain