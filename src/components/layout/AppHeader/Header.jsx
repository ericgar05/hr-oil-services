import { useProjects } from "../../../contexts/ProjectContext";
import "./Header.css";
import { Notification } from "./Notification";
import { UserRegister } from "./UserRegister";
import { useAuth } from "../../../contexts/AuthContext";

export const Header = () => {
  const { selectedProject } = useProjects();
  const { userData } = useAuth();

  return (
    <header className="app-header">
      <article className="info-users">
        <h2 className="info-welcome">Bienvenido, {userData.username}</h2>
        <h2>Resumen del Proyecto: {selectedProject?.name}</h2>
      </article>
      <div className="header-actions">
        <Notification />
        <UserRegister />
      </div>
    </header>
  );
};
