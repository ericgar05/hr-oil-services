
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../../../../../../../../contexts/ProjectContext'
import ModuleDescription from '../../../../../../../_core/ModuleDescription/ModuleDescription'
import FacturaForm from './components/FacturaForm'
import FacturasList from './components/FacturasList'
import ProveedoresList from './components/ProveedoresList'
import './ComprasConFacturaMain.css'

import Configuraciones from '../../components/Configuraciones'

const ComprasConFacturaMain = ({ projectId }) => {
  const { selectedProject } = useProjects()
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lista-facturas')
  const [facturaEdit, setFacturaEdit] = useState(null)
  const [refreshData, setRefreshData] = useState(0)

  const handleFacturaSaved = () => {
    setFacturaEdit(null)
    setRefreshData(prev => prev + 1)
    setActiveTab('lista-facturas')
  }

  const handleEditFactura = (factura) => {
    setFacturaEdit(factura)
    setActiveTab('nueva-factura')
  }

  const handleCancelEdit = () => {
    setFacturaEdit(null)
  }

  const handleBack = () => {
    navigate('../../gastos-administrativos/compra-facturacion'); // Ya es una ruta absoluta
  };

  console.log('🔄 ProjectId en ComprasFacturaMain:', projectId)
  return (
    <div className="compras-con-factura-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Compra & Facturación
      </button>
      <ModuleDescription
        title="COMPRAS CON FACTURA"
        description={`Gestión de compras formales con factura para el proyecto ${selectedProject?.name || ''}`}
      />

      <div className="factura-tabs">
        <button
          className={`tab-button ${activeTab === 'lista-facturas' ? 'active' : ''}`}
          onClick={() => setActiveTab('lista-facturas')}
        >
          Lista de Facturas
        </button>
        <button
          className={`tab-button ${activeTab === 'nueva-factura' ? 'active' : ''}`}
          onClick={() => setActiveTab('nueva-factura')}
        >
          {facturaEdit ? 'Editar Factura' : 'Nueva Factura'}
        </button>
        <button
          className={`tab-button ${activeTab === 'proveedores' ? 'active' : ''}`}
          onClick={() => setActiveTab('proveedores')}
        >
          Proveedores y Retenciones
        </button>
        <button
          className={`tab-button ${activeTab === 'configuraciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuraciones')}
        >
          Configuraciones
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'lista-facturas' && (
          <FacturasList
            projectId={projectId}
            onEditFactura={handleEditFactura}
            refreshTrigger={refreshData}
          />
        )}
        {activeTab === 'nueva-factura' && (
          <FacturaForm
            projectId={projectId}
            onFacturaSaved={handleFacturaSaved}
            facturaEdit={facturaEdit}
            onCancelEdit={handleCancelEdit}
          />
        )}
        {activeTab === 'proveedores' && (
          <ProveedoresList
            projectId={projectId}
            refreshTrigger={refreshData}
          />
        )}
        {activeTab === 'configuraciones' && (
          <Configuraciones projectId={projectId} />
        )}
      </div>
    </div>
  )
}

export default ComprasConFacturaMain