import React, { useState } from 'react'
import CategoriasManager from './CategoriasManager'
import SubcategoriasManager from './SubcategoriasManager'
import ProveedoresManager from './ProveedoresManager'
import './Configuraciones.css'

const Configuraciones = ({ projectId }) => {
    const [activeSection, setActiveSection] = useState(null)

    const renderSection = () => {
        switch (activeSection) {
            case 'categorias':
                return <CategoriasManager />
            case 'subcategorias':
                return <SubcategoriasManager />
            case 'proveedores':
                return <ProveedoresManager projectId={projectId} />
            default:
                return null
        }
    }

    return (
        <div className="configuraciones-container">
            <h2>Configuraciones</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Gestione las categorías, subcategorías y proveedores del sistema.
            </p>

            <div className="config-grid">
                <div
                    className={`config-card ${activeSection === 'categorias' ? 'active' : ''}`}
                    onClick={() => setActiveSection('categorias')}
                >
                    <h3>Categorías</h3>
                    <p>Administrar categorías de compras</p>
                </div>

                <div
                    className={`config-card ${activeSection === 'subcategorias' ? 'active' : ''}`}
                    onClick={() => setActiveSection('subcategorias')}
                >
                    <h3>Subcategorías</h3>
                    <p>Administrar destinos y subcategorías</p>
                </div>

                <div
                    className={`config-card ${activeSection === 'proveedores' ? 'active' : ''}`}
                    onClick={() => setActiveSection('proveedores')}
                >
                    <h3>Proveedores</h3>
                    <p>Administrar base de datos de proveedores</p>
                </div>
            </div>

            {activeSection && (
                <div className="active-section-container" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    {renderSection()}
                </div>
            )}
        </div>
    )
}

export default Configuraciones
