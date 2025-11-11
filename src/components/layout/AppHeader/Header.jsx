import { useProjects } from "../../../contexts/ProjectContext";
import { Notification } from "./Notification";
import { UserRegister } from "./UserRegister";
import { useAuth } from "../../../contexts/AuthContext";

import "./Header.css";

export const Header = ({ isSidebarOpen, onToggleSidebar, isMobile }) => {
  const { selectedProject } = useProjects();
  const { userData } = useAuth();

  return (
    <header className="app-header">
      <article className="info-users">
        <h2 className="info-welcome">Bienvenido, {userData.username}</h2>
        <h2 className="project-title">
          Proyecto: {selectedProject?.name || "No seleccionado"}
        </h2>
      </article>
      <div className="header-actions">
        <Notification />
        <UserRegister />
      </div>
    </header>
  );
};
