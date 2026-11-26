// src/components/modules/coordinaciones/components/workspace/DepartamentoWorkspace.jsx
import { ActividadesTab } from './tabs/ActividadesTab';
import { ArchivosTab } from './tabs/ArchivosTab';
import { AgendaTab } from './tabs/AgendaTab';
import { BitacoraTab } from './tabs/BitacoraTab';

export const DepartamentoWorkspace = ({
  coordinacion,
  departamento,
  activeTab = 'actividades',
  actionTrigger = null,
}) => {
  const currentCoord = coordinacion || departamento;

  if (!currentCoord) return null;

  return (
    <div className="workspace-container">
      {/* Encabezado Contextual de la Coordinación */}
      <div className="workspace-header-card">
        <div className="workspace-header-top" style={{ justifyContent: 'flex-end' }}>
          <div className="workspace-header-meta">
            {currentCoord.codigo && (
              <span className="coordinacion-badge">
                {currentCoord.codigo}
              </span>
            )}
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.65rem',
                borderRadius: '6px',
                fontWeight: 600,
                backgroundColor: currentCoord.estado === 'activo' ? '#dcfce7' : '#f1f5f9',
                color: currentCoord.estado === 'activo' ? '#15803d' : '#475569',
              }}
            >
              {currentCoord.estado === 'activo' ? 'En Operación' : 'Inactivo'}
            </span>
          </div>
        </div>

        <h2 className="workspace-title">{currentCoord.nombre}</h2>
        {currentCoord.responsable && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            👤 Coordinador / Responsable: <strong style={{ color: '#1e293b' }}>{currentCoord.responsable}</strong>
          </p>
        )}
        {currentCoord.descripcion && (
          <p className="workspace-subtitle">{currentCoord.descripcion}</p>
        )}
      </div>

      {/* Contenido de la Pestaña Activa (Controlada desde la barra de navegación inferior) */}
      <div className="workspace-tab-content">
        {activeTab === 'actividades' && (
          <ActividadesTab
            coordinacion={currentCoord}
            departamento={currentCoord}
            actionTrigger={actionTrigger}
          />
        )}

        {activeTab === 'archivos' && (
          <ArchivosTab
            coordinacion={currentCoord}
            departamento={currentCoord}
            actionTrigger={actionTrigger}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab
            coordinacion={currentCoord}
            departamento={currentCoord}
            actionTrigger={actionTrigger}
          />
        )}

        {activeTab === 'bitacora' && (
          <BitacoraTab
            coordinacion={currentCoord}
            departamento={currentCoord}
            actionTrigger={actionTrigger}
          />
        )}
      </div>
    </div>
  );
};
