import React, { useState, useEffect } from "react";

import { formatDate } from "../../../../../../../../../../../../utils/formatters";
import { useNotification } from "../../../../../../../../../../../../contexts/NotificationContext";
import "./AsistenciaForm.css";
import {
  CheckIcon,
  RepeatIcon,
  XIcon,
  InfoIcon,
} from "../../../../../../../../../../../../assets/icons/Icons";

const AsistenciaForm = ({
  employees,
  selectedDate,
  getExistingAsistencia,
  onSave,
  readOnly = false, // Default to false
}) => {
  const [asistencias, setAsistencias] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadExistingAsistencia();
  }, [employees, selectedDate]);

  const loadExistingAsistencia = async () => {
    setLoading(true);
    try {
      const existingAsistencia = await getExistingAsistencia();

      if (existingAsistencia) {
        setAsistencias(existingAsistencia.registros);
        setIsEditing(true);
      } else {
        // Inicializar con todos los empleados ACTIVOS como presentes por defecto
        const activeEmployees = employees.filter(
          (emp) => emp.estado !== "Inactivo",
        );
        const inicialAsistencias = activeEmployees.map((emp) => ({
          empleadoId: emp.id,
          nombre: `${emp.nombre} ${emp.apellido}`,
          cedula: emp.cedula,
          cargo: emp.cargo,
          asistio: true,
          horasTrabajadas: 8, // Horas por defecto (1 día)
          observaciones: "",
        }));
        setAsistencias(inicialAsistencias);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error cargando asistencia existente:", error);

      const inicialAsistencias = employees.map((emp) => ({
        empleadoId: emp.id,
        nombre: `${emp.nombre} ${emp.apellido}`,
        cedula: emp.cedula,
        cargo: emp.cargo,
        asistio: true,
        horasTrabajadas: 8,
        observaciones: "",
      }));
      setAsistencias(inicialAsistencias);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAsistencia = (empleadoId) => {
    if (readOnly) return;
    setAsistencias((prev) =>
      prev.map((registro) =>
        registro.empleadoId === empleadoId
          ? {
              ...registro,
              asistio: !registro.asistio,
              horasTrabajadas: !registro.asistio ? 8 : 0,
            }
          : registro,
      ),
    );
  };

  const handleToggleAll = (asistio) => {
    if (readOnly) return;
    setAsistencias((prev) =>
      prev.map((registro) => ({
        ...registro,
        asistio,
        horasTrabajadas: asistio ? 8 : 0,
      })),
    );
  };

  // Modified to handle simplified Day/Half-Day logic
  // We keep 'horasTrabajadas' in state for compatibility with backend (8 hrs = 1 day)
  const handleWorkAmountChange = (empleadoId, amountType) => {
    if (readOnly) return;

    let newHours = 0;
    if (amountType === "FULL") newHours = 8;
    if (amountType === "HALF") newHours = 4;

    setAsistencias((prev) =>
      prev.map((registro) =>
        registro.empleadoId === empleadoId
          ? {
              ...registro,
              horasTrabajadas: newHours,
              asistio: newHours > 0,
            }
          : registro,
      ),
    );
  };

  const handleObservacionesChange = (empleadoId, observaciones) => {
    if (readOnly) return;
    setAsistencias((prev) =>
      prev.map((registro) =>
        registro.empleadoId === empleadoId
          ? { ...registro, observaciones }
          : registro,
      ),
    );
  };

  const handleSave = async () => {
    if (readOnly) return;
    if (asistencias.length === 0) {
      showToast("No hay empleados para registrar asistencia", "warning");
      return;
    }

    // Validar que al menos haya algún empleado presente
    const presentes = asistencias.filter((r) => r.asistio).length;
    if (presentes === 0) {
      const confirmar = window.confirm(
        "No hay empleados marcados como presentes. ¿Estás seguro de que deseas guardar esta asistencia?",
      );
      if (!confirmar) return;
    }

    try {
      await onSave(asistencias);
      setIsEditing(true);
    } catch (error) {
      console.error("Error guardando asistencia:", error);
    }
  };

  const handleReset = () => {
    if (readOnly) return;
    // Resetear a todos presentes (Día Completo)
    const resetAsistencias = employees.map((emp) => ({
      empleadoId: emp.id,
      nombre: `${emp.nombre} ${emp.apellido}`,
      cedula: emp.cedula,
      cargo: emp.cargo,
      asistio: true,
      horasTrabajadas: 8,
      observaciones: "",
    }));
    setAsistencias(resetAsistencias);
  };

  const estadisticas = {
    total: asistencias.length,
    presentes: asistencias.filter((r) => r.asistio).length,
    ausentes: asistencias.filter((r) => !r.asistio).length,
    // Calculate total days (hours / 8)
    diasTotales: asistencias.reduce(
      (total, registro) => total + (registro.horasTrabajadas || 0) / 8,
      0,
    ),
  };

  // Verificar si es una fecha futura
  const isFutureDate = new Date(selectedDate) > new Date();

  if (loading) {
    return (
      <div className="asistencia-form loading">
        <p>Cargando asistencia...</p>
      </div>
    );
  }

  return (
    <div className="asistencia-form">
      <div className="form-header">
        <div className="header-title">
          <div className="header-title-container">
            <h3>Registro de Asistencia</h3>
            <button
              className="btn-info-asistencia"
              onClick={() => setShowInstructions(true)}
              title="Ver instrucciones"
            >
              <InfoIcon />
            </button>
          </div>
          <h3>{formatDate(selectedDate)}</h3>
        </div>
        {!readOnly && (
          <div className="quick-actions">
            <button
              className="btn-asistencia-form-check"
              onClick={() => handleToggleAll(true)}
              disabled={isFutureDate}
            >
              <CheckIcon />
              Marcar Todos Presentes
            </button>
            <button
              className="btn-asistencia-form-x"
              onClick={() => handleToggleAll(false)}
              disabled={isFutureDate}
            >
              <XIcon />
              Marcar Todos Ausentes
            </button>
            <button
              className="btn-asistencia-form-repeat"
              onClick={handleReset}
              disabled={isFutureDate}
            >
              <RepeatIcon /> Reiniciar
            </button>
          </div>
        )}
      </div>

      {isFutureDate && (
        <div className="future-date-warning">
          ⚠️ No puedes modificar la asistencia de una fecha futura
        </div>
      )}

      <div className="stats-summary">
        <div className="stat-card present-form-asistencia">
          <div className="stat-number-form-asistencia">
            {estadisticas.presentes}
          </div>
          <div className="stat-label-form-asistencia">Presentes</div>
        </div>
        <div className="stat-card absent-form-asistencia">
          <div className="stat-number-form-asistencia">
            {estadisticas.ausentes}
          </div>
          <div className="stat-label-form-asistencia">Ausentes</div>
        </div>
        <div className="stat-card total-form-asistencia">
          <div className="stat-number-form-asistencia">
            {estadisticas.total}
          </div>
          <div className="stat-label-form-asistencia">Total</div>
        </div>
        <div className="stat-card hours-form-asistencia">
          <div className="stat-number-form-asistencia">
            {estadisticas.diasTotales.toFixed(1)}
          </div>
          <div className="stat-label-form-asistencia">Días Totales</div>
        </div>
      </div>

      <div className="employees-list-asistencia-form">
        {asistencias.length === 0 ? (
          <div className="no-employees-warning">
            <div className="warning-icon">👥</div>
            <h4>No hay empleados registrados</h4>
            <p>
              Para registrar asistencias, primero debes agregar empleados en el
              módulo de Registro de Personal.
            </p>
          </div>
        ) : (
          <>
            <div className="list-header-asistencia-form">
              <span className="col-employee">Empleado</span>
              <span className="col-status">Estado</span>
              <span className="col-hours">Jornada</span>
              <span className="col-observations">Observaciones</span>
            </div>

            <div className="employees-scroll-container-asistencia-form">
              {asistencias.map((registro) => (
                <section
                  key={registro.empleadoId}
                  className={`employee-row ${registro.asistio ? "present" : "absent"}`}
                >
                  <section className="employee-info">
                    <h2>{registro.nombre}</h2>

                    <div className="employeeDetails">
                      <span className="cedula-badge">
                        C.I. {registro.cedula}
                      </span>

                      <span className="cargo-badge">{registro.cargo}</span>
                    </div>
                  </section>

                  <section className="card-section">
                    <div className="card-section-title">ASISTENCIA</div>
                    <div className="attendance-toggle-segmented">
                      <button
                        className={`segment-option ${registro.asistio ? "active present" : ""}`}
                        onClick={() =>
                          !readOnly &&
                          !isFutureDate &&
                          registro.asistio !== true &&
                          handleToggleAsistencia(registro.empleadoId)
                        }
                        disabled={readOnly || isFutureDate}
                      >
                        <div className="segment-icon">
                          {registro.asistio && (
                            <CheckIcon width="16" height="16" />
                          )}
                        </div>
                        Presente
                      </button>
                      <button
                        className={`segment-option ${!registro.asistio ? "active absent" : ""}`}
                        onClick={() =>
                          !readOnly &&
                          !isFutureDate &&
                          registro.asistio !== false &&
                          handleToggleAsistencia(registro.empleadoId)
                        }
                        disabled={readOnly || isFutureDate}
                      >
                        Ausente
                        <div className="segment-icon">
                          {!registro.asistio && (
                            <XIcon width="16" height="16" />
                          )}
                        </div>
                      </button>
                    </div>
                  </section>

                  <section className="card-section">
                    <div className="card-section-title">JORNADA LABORAL</div>
                    <div
                      className="day-selector-group"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color:
                            registro.horasTrabajadas === 4
                              ? "#2563eb"
                              : "#64748b",
                          fontWeight:
                            registro.horasTrabajadas === 4 ? "600" : "400",
                        }}
                      >
                        Medio Día
                      </span>

                      <div
                        className="toggle-container"
                        style={{
                          position: "relative",
                          width: "50px",
                          height: "26px",
                          backgroundColor:
                            registro.horasTrabajadas === 8
                              ? "#2563eb"
                              : "#cbd5e1",
                          borderRadius: "13px",
                          cursor:
                            !registro.asistio || isFutureDate || readOnly
                              ? "not-allowed"
                              : "pointer",
                          opacity:
                            !registro.asistio || isFutureDate || readOnly
                              ? 0.6
                              : 1,
                          transition: "background-color 0.2s",
                        }}
                        onClick={() => {
                          if (!registro.asistio || isFutureDate || readOnly)
                            return;
                          const newType =
                            registro.horasTrabajadas === 8 ? "HALF" : "FULL";
                          handleWorkAmountChange(registro.empleadoId, newType);
                        }}
                      >
                        <div
                          className="toggle-slider"
                          style={{
                            position: "absolute",
                            top: "4px",
                            left:
                              registro.horasTrabajadas === 8 ? "28px" : "4px",
                            width: "18px",
                            height: "18px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: "0.85rem",
                          color:
                            registro.horasTrabajadas === 8
                              ? "#2563eb"
                              : "#64748b",
                          fontWeight:
                            registro.horasTrabajadas === 8 ? "600" : "400",
                        }}
                      >
                        Completo
                      </span>
                    </div>
                  </section>

                  <section className="card-section">
                    <div className="card-section-title">OBSERVACIONES</div>
                    <div className="observations-input-wrapper">
                      <div
                        className="input-icon"
                        style={{ marginRight: "8px" }}
                      >
                        <InfoIcon width="16" height="16" />
                      </div>
                      <input
                        type="text"
                        value={registro.observaciones || ""}
                        onChange={(e) =>
                          handleObservacionesChange(
                            registro.empleadoId,
                            e.target.value,
                          )
                        }
                        placeholder="Nota..."
                        disabled={isFutureDate || readOnly}
                        className="custom-input"
                      />
                    </div>
                  </section>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      {!readOnly && (
        <div className="form-actions-save-btn">
          <button
            className="btn-save-asistencia"
            onClick={handleSave}
            disabled={asistencias.length === 0 || isFutureDate}
          >
            {isEditing
              ? "💾 Actualizar Asistencia"
              : "💾 Guardar Asistencia del Día"}
          </button>
        </div>
      )}

      {/* Modal de Instrucciones */}
      {showInstructions && (
        <div
          className="modal-overlay"
          onClick={() => setShowInstructions(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowInstructions(false)}
            >
              <XIcon />
            </button>
            <div
              className="form-help"
              style={{
                marginTop: 0,
                border: "none",
                background: "transparent",
                padding: 0,
              }}
            >
              <h4>📋 Instrucciones:</h4>
              <ul>
                <li>
                  Usa los interruptores para marcar <strong>Presente</strong> o{" "}
                  <strong>Ausente</strong>
                </li>
                <li>
                  Selecciona <strong>Día Completo</strong> o{" "}
                  <strong>Medio Día</strong> para indicar la jornada trabajada.
                </li>
                <li>
                  Agrega <strong>observaciones</strong> para casos especiales
                  (licencias, permisos, etc.)
                </li>
                <li>
                  Los botones de acción rápida te permiten marcar todos los
                  empleados de una vez
                </li>
                <li>
                  Puedes <strong>editar</strong> asistencias ya guardadas en
                  cualquier momento
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciaForm;
