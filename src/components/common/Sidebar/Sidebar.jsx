import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { ArrowIcon } from "/src/assets/icons/Icons.jsx";
import { OutIcon } from "/src/assets/icons/Icons.jsx";
import SidebarItem from "./SidebarItem";
import "./Sidebar.css";

const Sidebar = ({ items, isOpen, onToggle, isMobile }) => {
  const { hasPermissionSync, logout, userData: currentUser } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Usar la versión síncrona para el filtrado
  const filteredItems = items
    .filter((item) => {
      return hasPermissionSync(item.id, "read");
    })
    .map((item) => ({
      ...item,
      path: `/project/${projectId}${item.path}`,
    }));

  const handleOverlayClick = () => {
    onToggle(false);
  };

  const handleItemClick = () => {
    if (isMobile) {
      onToggle(false);
    }
  };

  const handleBackToProjects = () => {
    navigate("/");
    if (isMobile) {
      onToggle(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (isMobile) {
      onToggle(false);
    }
  };

  return (
    <>
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={handleOverlayClick} />
      )}

      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <div className="sidebar-header-content">
              <img
                src="/src/assets/logo-hyr.png"
                alt="H&R Oil Services"
                className="sidebar-logo"
              />
              <div className="sidebar-title-container">
                <h3 className="sidebar-title">H&R Oil</h3>
                <p className="sidebar-subtitle">Sistema de Gestión</p>
              </div>
            </div>

            {isMobile && (
              <button
                className="sidebar-toggle"
                onClick={() => onToggle(false)}
                aria-label="Cerrar menú"
              >
                <div className="hamburger-icon">
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                </div>
              </button>
            )}
          </div>

          {/* <div className="sidebar-user-info">
            <div className="user-avatar">
              {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <div className="user-name">
                {currentUser?.username || "Usuario"}
              </div>
              <div className="user-role">{currentUser?.role || "Sin rol"}</div>
            </div>
          </div> */}

          <nav className="sidebar-nav" aria-label="Navegación principal">
            <ul className="sidebar-menu">
              {filteredItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <button
              className="sidebar-action-btn back-to-projects"
              onClick={handleBackToProjects}
            >
              <span className="sidebar-action-icon">
                <ArrowIcon className="sidebar-action-icon" />
              </span>
              <span className="sidebar-action-label">Volver a Proyectos</span>
            </button>

            <button
              className="sidebar-action-btn logout-btn"
              onClick={handleLogout}
            >
              <span className="sidebar-action-icon">
                <OutIcon className="sidebar-action-icon" />
              </span>
              <span className="sidebar-action-label">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
      {/* Aqui es la vista de telefono */}
      {/* {isMobile && !isOpen && (
        <button
          className="sidebar-floating-toggle"
          onClick={() => onToggle(true)}
          aria-label="Abrir menú"
        >
          <div className="hamburger-icon">
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </div>
        </button>
      )} */}
    </>
  );
};

export default Sidebar;
