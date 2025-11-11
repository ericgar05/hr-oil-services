import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const SidebarItem = ({ item, onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive =
    location.pathname === item.path ||
    location.pathname.startsWith(`${item.path}/`);

  const handleClick = () => {
    navigate(item.path);
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <li className="sidebar-item">
      <button
        className={`sidebar-button ${isActive ? "active" : ""}`}
        onClick={handleClick}
        aria-current={isActive ? "page" : undefined}
        aria-label={`Ir a ${item.label}`}
      >
        {item.icon && (
          <span className="sidebar-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="sidebar-label">{item.label}</span>
      </button>
    </li>
  );
};

export default SidebarItem;
