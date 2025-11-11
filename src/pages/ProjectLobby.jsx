import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { useProjects } from "../contexts/ProjectContext";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import ResumenPage from "./ResumenPage";
import AdministracionPage from "./AdministracionPage";
import OperacionesPage from "./OperacionesPage";
import ContratoPage from "./ContratoPage";
import CoordinacionesPage from "./CoordinacionesPage";
// import ProjectDashboard from '../components/projects/ProjectDashboard/ProjectDashboard'
import "./ProjectLobby.css";

const ProjectLobby = () => {
  const { projectId } = useParams();
  const { selectedProject } = useProjects();

  // Si no hay proyecto seleccionado, redirigir a selección
  if (!selectedProject || selectedProject.id !== projectId) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <Routes>
        {/* Ruta por defecto para el dashboard del proyecto, ahora redirige a resumen */}
        <Route path="/" element={<Navigate to="resumen" replace />} />
        <Route path="/resumen/*" element={<ResumenPage />} />
        <Route path="/administracion/*" element={<AdministracionPage />} />
        <Route path="/operaciones/*" element={<OperacionesPage />} />
        <Route path="/contrato/*" element={<ContratoPage />} />
        <Route path="/coordinaciones/*" element={<CoordinacionesPage />} />
        <Route path="*" element={<Navigate to="resumen" replace />} />
      </Routes>
    </MainLayout>
  );
};
export default ProjectLobby;
