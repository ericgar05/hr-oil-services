import ProjectCard from '../ProjectCard/ProjectCard'
import { AddIcon } from '../../../assets/icons/Icons'
import './ProjectList.css'

const ProjectList = ({ projects, onEdit, onDelete, onSelect, onAdd }) => {
  const AddCard = () => (
    <div className="project-card-add" onClick={onAdd}>
        <div className="add-card-icon">
          <AddIcon />
        </div>
        <h3>Crear nuevo proyecto</h3>
    </div>
  );

  if (projects.length === 0) {
    return (
      <div className="project-list">
         <AddCard />
      </div>
    )
  }

  return (
    <div className="project-list">
      <AddCard />
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