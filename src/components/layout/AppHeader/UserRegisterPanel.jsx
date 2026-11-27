import { ConfigIcon, OutIcon } from "../../../assets/icons/Icons";
import { ROLES } from "../../../config/permissions";
import "./UserRegisterPanel.css";

export const UserRegisterPanel = ({
  user,
  onLogout,
  onGoToUserManagement,
  canAccessUserManagement,
}) => {
  const userRoleConfig = ROLES[user?.role];

  return (
    <div className="user-profile-panel">
      <div className="panel-header">
        <strong>{user?.username}</strong>
        <small>{userRoleConfig?.label || user?.role}</small>
      </div>

      {canAccessUserManagement && (
        <button
          className="panel-action-button"
          onClick={onGoToUserManagement}
        >
          <span>
            <ConfigIcon />
          </span>
          Gestión de Usuarios
        </button>
      )}

      <button className="logout-button" onClick={onLogout}>
        <OutIcon width={16} height={16} />
        Cerrar Sesión
      </button>
    </div>
  );
};
