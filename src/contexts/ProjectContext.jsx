import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../api/supaBase"; // Ajusta la ruta según tu estructura
import { useAuth } from "./AuthContext";

const ProjectContext = createContext();

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects debe ser usado dentro de un ProjectProvider");
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { userData } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading projects:", error);
        return;
      }

      // Transformar los datos de Supabase a nuestro formato
      const formattedProjects = data.map((project) => ({
        id: project.id,
        name: project.name,
        startDate: project.start_date,
        endDate: project.end_date,
        client: project.client,
        budget: parseFloat(project.budget),
        currency: project.currency,
        status: project.status,
        progress: project.progress || 0,
        createdAt: project.created_at,
      }));

      setProjects(formattedProjects);

      // Restaurar proyecto seleccionado
      const savedProjectId = localStorage.getItem("hr_oil_selected_project_id");
      if (savedProjectId && formattedProjects.length > 0) {
        const project = formattedProjects.find((p) => p.id === savedProjectId);
        if (project) {
          setSelectedProject(project);
        }
      }

    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData) => {
    try {
      const newProject = {
        name: projectData.name,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        client: projectData.client,
        budget: projectData.budget,
        currency: projectData.currency,
        status: "active",
        progress: 0,
        created_by: userData?.id, // Si tienes el ID del usuario
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([newProject])
        .select()
        .single();

      if (error) {
        console.error("Error adding project:", error);
        throw error;
      }

      // Transformar la respuesta
      const formattedProject = {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        client: data.client,
        budget: parseFloat(data.budget),
        currency: data.currency,
        status: data.status,
        progress: data.progress,
        createdAt: data.created_at,
      };

      const updatedProjects = [...projects, formattedProject];
      setProjects(updatedProjects);

      return formattedProject;
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const updateData = {
        name: projectData.name,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        client: projectData.client,
        budget: projectData.budget,
        currency: projectData.currency,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        console.error("Error updating project:", error);
        throw error;
      }

      // Transformar la respuesta
      const formattedProject = {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        endDate: data.end_date,
        client: data.client,
        budget: parseFloat(data.budget),
        currency: data.currency,
        status: data.status,
        progress: data.progress,
        createdAt: data.created_at,
      };

      const updatedProjects = projects.map((project) =>
        project.id === projectId ? formattedProject : project
      );
      setProjects(updatedProjects);

      if (selectedProject?.id === projectId) {
        setSelectedProject(formattedProject);
      }

      return formattedProject;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        console.error("Error deleting project:", error);
        throw error;
      }

      const updatedProjects = projects.filter(
        (project) => project.id !== projectId
      );
      setProjects(updatedProjects);

      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    // Puedes guardar el ID en localStorage si quieres persistencia entre sesiones
    localStorage.setItem("hr_oil_selected_project_id", project.id);
  };

  const clearSelectedProject = () => {
    setSelectedProject(null);
    localStorage.removeItem("hr_oil_selected_project_id");
  };



  const value = {
    projects,
    selectedProject,
    loading,
    addProject,
    updateProject,
    deleteProject,
    selectProject,
    clearSelectedProject,
    loadProjects,
    refreshProjects: loadProjects, // Alias para recargar
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};
