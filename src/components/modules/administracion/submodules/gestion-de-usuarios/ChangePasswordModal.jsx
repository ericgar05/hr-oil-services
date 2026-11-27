import { useState, useEffect } from "react";
import Modal from "../../../../common/Modal/Modal";

const ChangePasswordModal = ({ isOpen, onClose, user, onConfirm }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(user.id, password);
      onClose();
    } catch (err) {
      setError(err.message || "Error al actualizar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cambiar Contraseña: ${user?.username || ""}`}
    >
      <form onSubmit={handleSubmit} className="um-form">
        {error && <div className="um-form-error">{error}</div>}

        <div className="um-form-group">
          <label htmlFor="cp-password">Nueva Contraseña</label>
          <div className="um-password-wrapper">
            <input
              id="cp-password"
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
          <label htmlFor="cp-confirm">Confirmar Nueva Contraseña</label>
          <input
            id="cp-confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Repetir contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div className="um-form-actions">
          <button
            type="button"
            className="um-btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="um-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
