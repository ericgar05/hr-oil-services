import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProjects } from "../contexts/ProjectContext";
import ProjectList from "../components/projects/ProjectList/ProjectList";
import ProjectForm from "../components/projects/ProjectForm/ProjectForm";
import Button from "../components/common/Button/Button";
import Modal from "../components/common/Modal/Modal";
import SearchFilter from "../components/common/SearchFilter/SearchFilter";
import { AddIcon, OutIcon, ConstructionIcon } from "../assets/icons/Icons";
import "./ProjectSelection.css";

const ProjectSelection = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const { logout } = useAuth();
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    selectProject,
    loading,
  } = useProjects();
  const navigate = useNavigate();

  const handleAddProject = () => {
    setEditingProject(null);
    setShowForm(true);
    setError("");
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
    setError("");
  };

  const handleFormSubmit = async (projectData) => {
    setActionLoading(true);
    setError("");

    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectData);
      } else {
        await addProject(projectData);
      }
      setShowForm(false);
      setEditingProject(null);
    } catch (err) {
      setError("Error al guardar el proyecto. Intente nuevamente.");
      console.error("Error saving project:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setError("");
  };

  const handleSelectProject = (project) => {
    selectProject(project);
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = async (projectId) => {


    try {
      await deleteProject(projectId);
    } catch (err) {
      setError("Error al eliminar el proyecto");
      console.error("Error deleting project:", err);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="project-selection">
      <header className="project-selection-header">
        <div className="header-left">
            <div className="header-icon-box">
                <ConstructionIcon />
            </div>
            <div className="header-breadcrumbs">
                <span className="breadcrumb-item">Inicio</span>
                <span className="breadcrumb-separator">{'>'}</span>
                <span className="breadcrumb-current">Proyectos</span>
            </div>
        </div>
        
        <div className="header-right">
            <div className="user-profile">
                <div className="user-info">
                    <span className="user-name">Admin</span>
                    <span className="user-role">ADMINISTRADOR</span>
                </div>
                <div className="user-avatar">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" />
                    <span className="user-status-dot"></span>
                </div>
            </div>
            <div className="header-divider"></div>
            <button onClick={logout} className="btn-logout-icon" title="Cerrar Sesión">
                <OutIcon />
            </button>
        </div>
      </header>

      <main className="project-selection-main">
        <p>¿En qué proyecto <span className="highlight">trabajaremos hoy?</span></p>

        <section className="project-selection-controls" aria-label="Controles de búsqueda y creación">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar proyectos..."
          />


        </section>

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError("")} className="error-close">
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state" role="status">
            <p>Cargando proyectos...</p>
          </div>
        ) : (
          <ProjectList
            projects={filteredProjects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onSelect={handleSelectProject}
            onAdd={handleAddProject}
          />
        )}
      </main>

      <Modal
        isOpen={showForm}
        onClose={handleFormCancel}
        title={editingProject ? "Editar Proyecto" : "Agregar Proyecto"}
      >
        <ProjectForm
          project={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={actionLoading}
        />
      </Modal>
    </section>
  );
};

export default ProjectSelection;
