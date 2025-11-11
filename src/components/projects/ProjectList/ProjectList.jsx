import React from 'react'
import ProjectCard from '../ProjectCard/ProjectCard'
import './ProjectList.css'

const ProjectList = ({ projects, onEdit, onDelete, onSelect }) => {
  if (projects.length === 0) {
    return (
      <div className="project-list-empty">
        <h3>No se encontraron proyectos</h3>
        <p>Comienza agregando tu primer proyecto</p>
      </div>
    )
  }

  return (
    <div className="project-list">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default ProjectList