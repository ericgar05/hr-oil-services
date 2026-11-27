import { useParams, Routes, Route, Navigate } from "react-router-dom";
import { useProjects } from "../contexts/ProjectContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserAllowedModules, SYSTEM_MODULES } from "../config/permissions";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import ResumenPage from "./ResumenPage";
import AdministracionPage from "./AdministracionPage";
import OperacionesPage from "./OperacionesPage";
import ContratoPage from "./ContratoPage";
import CoordinacionesPage from "./CoordinacionesPage";
import GestionRutasPermisos from "../components/modules/administracion/submodules/gestion-de-usuarios/GestionRutasPermisos";
import SolicitudesMain from "../components/modules/operaciones/submodules/solicitudes/SolicitudesMain";
import "./ProjectLobby.css";

const ModuleRouteGuard = ({ moduleId, children }) => {
  const { hasPermission, userData } = useAuth();
  const { projectId } = useParams();

  if (hasPermission(moduleId)) {
    return children;
  }

  const allowed = getUserAllowedModules(userData);
  const firstAllowedModule = SYSTEM_MODULES.find((m) => allowed.includes(m.id));

  if (firstAllowedModule && firstAllowedModule.id !== moduleId) {
    return <Navigate to={`/project/${projectId}${firstAllowedModule.path}`} replace />;
  }

  return (
    <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "520px", margin: "40px auto", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)" }}>
      <h2 style={{ color: "#0f172a", marginBottom: "8px", fontSize: "1.25rem" }}>Acceso Restringido</h2>
      <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
        No tienes permisos asignados para acceder a este módulo. Contacta a tu supervisor o administrador.
      </p>
    </div>
  );
};

const ProjectLobby = () => {
  const { projectId } = useParams();
  const { selectedProject, loading } = useProjects();
  const { userData } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  // Si no hay proyecto seleccionado, redirigir a selección
  if (!selectedProject || selectedProject.id !== projectId) {
    return <Navigate to="/" replace />;
  }

  const allowed = getUserAllowedModules(userData);
  const defaultModule = SYSTEM_MODULES.find((m) => allowed.includes(m.id))?.id || "resumen";

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to={defaultModule} replace />} />
        <Route
          path="/resumen/*"
          element={
            <ModuleRouteGuard moduleId="resumen">
              <ResumenPage />
            </ModuleRouteGuard>
          }
        />
        <Route
          path="/administracion/*"
          element={
            <ModuleRouteGuard moduleId="administracion">
              <AdministracionPage />
            </ModuleRouteGuard>
          }
        />
        <Route
          path="/operaciones/*"
          element={
            <ModuleRouteGuard moduleId="operaciones">
              <OperacionesPage />
            </ModuleRouteGuard>
          }
        />
        <Route
          path="/contrato/*"
          element={
            <ModuleRouteGuard moduleId="contrato">
              <ContratoPage />
            </ModuleRouteGuard>
          }
        />
        <Route
          path="/coordinaciones/*"
          element={
            <ModuleRouteGuard moduleId="coordinaciones">
              <CoordinacionesPage />
            </ModuleRouteGuard>
          }
        />
        <Route
          path="/solicitudes"
          element={
            <ModuleRouteGuard moduleId="solicitudes">
              <SolicitudesMain />
            </ModuleRouteGuard>
          }
        />
        <Route
          path="/permissions"
          element={
            <ModuleRouteGuard moduleId="permissions">
              <GestionRutasPermisos />
            </ModuleRouteGuard>
          }
        />
        <Route path="*" element={<Navigate to={defaultModule} replace />} />
      </Routes>
    </MainLayout>
  );
};

export default ProjectLobby;
