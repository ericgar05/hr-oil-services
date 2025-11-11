// src/components/modules/administracion/submodules/ingresos-comisiones/submodules/comisiones/ComisionesMain.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../../../../../../contexts/ProjectContext'
import './ComisionesMain.css'

const ComisionesMain = () => {
  const navigate = useNavigate()
  const { selectedProject } = useProjects()

  const handleBack = () => {
    navigate('../ingresos-comisiones')
  }

  return (
    <div className="comisiones-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Ingresos & Comisiones
      </button>

      <div className="main-header">
        <h1>COMISIONES</h1>
        <p>Proyecto: {selectedProject?.name || 'No seleccionado'}</p>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-content">
          <h2>🚧 Módulo en Desarrollo</h2>
          <p>El módulo de Comisiones estará disponible próximamente.</p>
          <p>Aquí se gestionará la distribución y cálculo de comisiones.</p>
        </div>
      </div>
    </div>
  )
}

export default ComisionesMain