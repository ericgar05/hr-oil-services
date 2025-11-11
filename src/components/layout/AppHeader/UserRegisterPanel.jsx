// src/components/layout/AppHeader/UserRegisterPanel.jsx
import { AddIcon, OutIcon } from "../../../assets/icons/Icons";
import "./UserRegisterPanel.css";

export const UserRegisterPanel = ({ user, onLogout, onCreateUser }) => {
  return (
    <div className="user-profile-panel">
      <div className="panel-header">
        <strong>{user?.username}</strong>
        <small>{user?.role}</small>
      </div>
      {user?.role === "admin" && (
        <button className="panel-action-button" onClick={onCreateUser}>
          {/* Podríamos usar un ícono de "agregar usuario" aquí si lo tuviéramos */}
          <span>
            <AddIcon />
          </span>
          Crear Nuevo Usuario
        </button>
      )}
      <button className="logout-button" onClick={onLogout}>
        <OutIcon width={16} height={16} />
        Cerrar Sesión
      </button>
    </div>
  );
};
