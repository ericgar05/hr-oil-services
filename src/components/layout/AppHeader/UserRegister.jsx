// src/components/layout/AppHeader/UserRegister.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { UserIcon } from "../../../assets/icons/Icons";
import { UserRegisterPanel } from "./UserRegisterPanel";
import "./UserRegister.css";

export const UserRegister = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { userData: currentUser, logout, hasPermission } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const canAccessUserManagement = Boolean(projectId && hasPermission("permissions"));

  const handleGoToUserManagement = () => {
    setIsPanelOpen(false);
    if (projectId) {
      navigate(`/project/${projectId}/permissions`);
    }
  };

  return (
    <div className="user-profile-container" ref={panelRef}>
      <button
        className="info-user-container"
        onClick={() => setIsPanelOpen((prev) => !prev)}
        aria-label="Menú de usuario"
      >
        <div className="user-icon">
          <UserIcon className="user-icon-svg" />
        </div>
      </button>

      {isPanelOpen && (
        <UserRegisterPanel
          user={currentUser}
          onLogout={logout}
          canAccessUserManagement={canAccessUserManagement}
          onGoToUserManagement={handleGoToUserManagement}
        />
      )}
    </div>
  );
};
