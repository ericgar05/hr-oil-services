import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import "./ModulePage.css";

const ModulePage = ({
  children,
  moduleName,
  moduleDescription,
  moduleId,
  showSubRoutes = false,
  customContent = null,
}) => {
  const { hasPermission, hasPermissionSync } = useAuth();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);

        const permission = await hasPermission(moduleId, "read");
        setHasAccess(permission);
      } catch (error) {
        console.error("Error verificando permisos:", error);
        // En caso de error, usar la versión síncrona como fallback
        const fallbackPermission = hasPermissionSync(moduleId, "read");
        setHasAccess(fallbackPermission);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [moduleId, hasPermission, hasPermissionSync]);

  // Mostrar loading mientras se verifican permisos
  if (loading) {
    return (
      <div className="module-container">
        <div className="module-loading">
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasAccess) {
    return (
      <div className="module-container">
        <div className="permission-denied">
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder al módulo de {moduleName}.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (customContent) {
      return customContent;
    }

    if (showSubRoutes) {
      return (
        <Routes>
          <Route path="*" element={children} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      );
    }

    return children;
  };

  return (
    <div className="module-container">
      <div className="module-content">{renderContent()}</div>
    </div>
  );
};

export default ModulePage;
