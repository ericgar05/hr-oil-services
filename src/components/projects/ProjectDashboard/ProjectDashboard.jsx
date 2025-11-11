import React from 'react'
import { useProjects } from '../../../contexts/ProjectContext'
import './ProjectDashboard.css'

// Componente para el dashboard principal del proyecto
const ProjectDashboard = () => {
  const { selectedProject } = useProjects()

  // Manejo básico si selectedProject es nulo
  if (!selectedProject) {
    return <div>Cargando información del proyecto...</div>;
  }

  // Mapeo de estados para una visualización amigable
  const statusMap = {
    'active': 'Activo',
    'on-hold': 'En Pausa',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
  };

  const projectStatusDisplay = statusMap[selectedProject.status] || 'Desconocido';
  const projectStatusClass = `stat-value ${selectedProject.status}`;

  // Cálculo de días restantes
  const daysRemaining = Math.ceil((new Date(selectedProject.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  // Formato de fechas y moneda (puedes usar useCurrency si lo prefieres)
  const formattedStartDate = new Date(selectedProject.startDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedEndDate = new Date(selectedProject.endDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedBudget = new Intl.NumberFormat('es-ES', { style: 'currency', currency: selectedProject.currency }).format(selectedProject.budget);

  return (
    <section className="project-dashboard">
      <header className="project-header">
        <h1>{selectedProject.name}</h1>
        <section className="project-info">
          <span className="client">Cliente: <strong>{selectedProject.client}</strong></span>
          <span className="budget">Presupuesto: <strong>{formattedBudget}</strong></span>
          <span className="dates">Fechas: <strong>{formattedStartDate} - {formattedEndDate}</strong></span>
        </section>
      </header>
      
      <div className="welcome-message">
        <h2>Bienvenido al sistema de gestión</h2>
        <p>Selecciona un módulo del menú lateral para comenzar</p>
        
        <div className="quick-stats">
          <div className="stat-card">
            <h3>Estado del Proyecto</h3>
            <div className={projectStatusClass}>{projectStatusDisplay}</div>
          </div>
          <div className="stat-card">
            <h3>Días Restantes</h3>
            <div className="stat-value">{daysRemaining >= 0 ? `${daysRemaining} días` : 'Finalizado'}</div>
          </div>
          <div className="stat-card">
            <h3>Progreso General</h3>
            <div className="stat-value">{selectedProject.progress || 0}%</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectDashboard;