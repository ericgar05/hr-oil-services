import { useState, useEffect } from "react";
import {
  ROLES,
  getAssignableRoles,
  getDelegableModules,
  getUserAllowedModules,
} from "../../../../../config/permissions";

const UserFormView = ({
  onSave,
  onCancel,
  currentUser,
  editingUser = null,
}) => {
  const isEditMode = Boolean(editingUser);
  const assignableRoles = getAssignableRoles(currentUser?.role);
  const delegableModules = getDelegableModules(currentUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormError("");
    setShowPassword(false);
    setShowConfirm(false);

    if (editingUser) {
      setUsername(editingUser.username || "");
      setPassword("");
      setConfirmPassword("");
      setRole(editingUser.role || "");
      const existingAllowed = getUserAllowedModules(editingUser);
      const delegableIds = delegableModules.map((m) => m.id);
      setSelectedModules(
        existingAllowed.filter((id) => delegableIds.includes(id))
      );
    } else {
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      const defaultRole = assignableRoles.length === 1 ? assignableRoles[0].key : "";
      setRole(defaultRole);
      const hasResumen = delegableModules.some((m) => m.id === "resumen");
      setSelectedModules(hasResumen ? ["resumen"] : []);
    }
  }, [editingUser]);

  const handleToggleModule = (moduleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const availableModulesForRole = delegableModules.filter(
    (m) => !(role === "administrativo" && m.id === "permissions")
  );

  const handleSelectAllModules = () => {
    const allIds = availableModulesForRole.map((m) => m.id);
    if (selectedModules.length === allIds.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(allIds);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === "administrativo") {
      setSelectedModules((prev) => prev.filter((id) => id !== "permissions"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setFormError("El nombre de usuario es obligatorio.");
      return;
    }

    if (!role) {
      setFormError("Debes seleccionar un rol jerárquico para el usuario.");
      return;
    }

    if (!isEditMode) {
      if (!password || password.length < 4) {
        setFormError("La contraseña debe tener al menos 4 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setFormError("Las contraseñas no coinciden.");
        return;
      }
    }

    if (selectedModules.length === 0) {
      setFormError("Debes asignar al menos un módulo o ruta de acceso.");
      return;
    }

    const finalModules =
      role === "administrativo"
        ? selectedModules.filter((id) => id !== "permissions")
        : selectedModules;

    setSubmitting(true);
    try {
      await onSave({
        id: editingUser?.id,
        username: trimmedUsername,
        password: password || null,
        role,
        allowed_modules: finalModules,
      });
    } catch (err) {
      setFormError(err.message || "Ocurrió un error al guardar el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="um-subview-wrap">
      <div className="um-subview-header">
        <div>
          <h3>
            {isEditMode
              ? `Editar Usuario: ${editingUser.username}`
              : "Registrar Nuevo Usuario"}
          </h3>
          <p>
            {isEditMode
              ? "Actualiza el cargo jerárquico y las rutas habilitadas para este colaborador."
              : "Configura las credenciales, nivel jerárquico y rutas permitidas dentro de tu alcance."}
          </p>
        </div>
        <button type="button" className="um-btn-secondary" onClick={onCancel}>
          ← Volver al Directorio
        </button>
      </div>

      <form onSubmit={handleSubmit} className="um-form-panel">
        {formError && <div className="um-form-error">{formError}</div>}

        <div className="um-form-grid-2">
          <div className="um-form-group">
            <label htmlFor="um-username">Nombre de Usuario</label>
            <input
              id="um-username"
              type="text"
              placeholder="Ej. jperez"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="um-form-group">
            <label htmlFor="um-role">Rol / Nivel Jerárquico</label>
            {assignableRoles.length > 0 ? (
              <select
                id="um-role"
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                required
              >
                <option value="">Seleccionar rol...</option>
                {assignableRoles.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
                {isEditMode &&
                  editingUser?.role &&
                  !assignableRoles.some((r) => r.key === editingUser.role) && (
                    <option value={editingUser.role}>
                      {ROLES[editingUser.role]?.label || editingUser.role}
                    </option>
                  )}
              </select>
            ) : (
              <div className="um-role-readonly">
                {ROLES[role]?.label || role}
              </div>
            )}
            <span className="um-helper-text">
              {role === "directivo" &&
                "Podrá crear Coordinadores y delegarles los módulos que aquí le asignes."}
              {role === "coordinador" &&
                "Podrá crear Administrativos y delegarles módulos dentro de su propio alcance."}
              {role === "administrativo" &&
                "Solo tendrá acceso a los módulos marcados. No puede crear usuarios."}
            </span>
          </div>
        </div>

        {!isEditMode && (
          <div className="um-form-grid-2">
            <div className="um-form-group">
              <label htmlFor="um-password">Contraseña</label>
              <div className="um-password-wrapper">
                <input
                  id="um-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 4 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="um-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div className="um-form-group">
              <label htmlFor="um-confirm">Confirmar Contraseña</label>
              <div className="um-password-wrapper">
                <input
                  id="um-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repetir contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="um-eye-btn"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showConfirm ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="um-form-group">
          <div className="um-modules-header">
            <div>
              <label>Rutas y Módulos Permitidos</label>
              <p className="um-helper-text" style={{ margin: "2px 0 0 0" }}>
                Solo puedes delegar las rutas a las que tu cuenta tiene acceso.
              </p>
            </div>
            <button
              type="button"
              className="um-select-all-btn"
              onClick={handleSelectAllModules}
            >
              {selectedModules.length === availableModulesForRole.length
                ? "Desmarcar todos"
                : "Seleccionar todos"}
            </button>
          </div>

          <div className="um-modules-grid-wide">
            {availableModulesForRole.map((mod) => {
              const checked = selectedModules.includes(mod.id);
              return (
                <label
                  key={mod.id}
                  className={`um-module-card ${checked ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleModule(mod.id)}
                  />
                  <div className="um-module-card-body">
                    <span className="um-module-title">{mod.label}</span>
                    <span className="um-module-desc">{mod.description}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="um-form-actions">
          <button
            type="button"
            className="um-btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="um-btn-primary"
            disabled={submitting}
          >
            {submitting
              ? "Guardando..."
              : isEditMode
              ? "Guardar Cambios"
              : "Crear Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormView;
