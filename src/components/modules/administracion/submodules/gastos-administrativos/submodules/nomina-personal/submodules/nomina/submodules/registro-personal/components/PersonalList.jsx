
// src/components/modules/administracion/submodules/gastos-administrativos/submodules/nomina-personal/submodules/nomina/submodules/registro-personal/components/PersonalList.jsx
import { useState } from "react";
import "./PersonalList.css";

const PersonalList = ({ employees, onEdit, onDelete, onStatusChange }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);

  const handleDeleteClick = (employee) => {
    setDeleteConfirm(employee);
  };

  const confirmDelete = () => {
    onDelete(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleStatusClick = (employee) => {
    setStatusConfirm({
      employee,
      newStatus: employee.estado === "Inactivo" ? "Activo" : "Inactivo",
    });
  };

  const confirmStatusChange = () => {
    if (statusConfirm) {
      onStatusChange(statusConfirm.employee, statusConfirm.newStatus);
      setStatusConfirm(null);
    }
  };

  const cancelStatusChange = () => {
    setStatusConfirm(null);
  };

  const formatCurrency = (amount) => {
    return `USD$ ${parseFloat(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getSalarioDisplay = (employee) => {
    if (
      employee.tipoNomina === "Ejecucion" ||
      employee.tipoNomina === "Administrativa"
    ) {
      const total =
        parseFloat(employee.montoLey || 0) +
        parseFloat(employee.bonificacionEmpresa || 0);
      return `USD$ ${total.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`;
    }
    return formatCurrency(employee.montoSalario);
  };

  const getDetallesSalario = (employee) => {
    if (
      employee.tipoNomina === "Ejecucion" ||
      employee.tipoNomina === "Administrativa"
    ) {
      const montoLey = parseFloat(employee.montoLey || 0);
      const bonificacion = parseFloat(employee.bonificacionEmpresa || 0);
      let detalles = `(Ley: $${montoLey.toFixed(
        2
      )} + Bonif.: $${bonificacion.toFixed(2)})`;

      if (employee.porcentajeIslr) {
        detalles += ` - ISLR: ${employee.porcentajeIslr}%`;
      }
      return detalles;
    }
    return "";
  };

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h4>No hay personal registrado</h4>
        <p>Comienza agregando el primer empleado al sistema</p>
      </div>
    );
  }

  return (
    <div className="personal-list">
      <div className="list-header">
        <span>Empleados Registrados: {employees.length}</span>
      </div>

      <div className="employees-grid">
        {employees.map((employee) => (
          <div key={employee.id} className={`employee-card ${employee.estado === "Inactivo" ? "inactive-card" : ""}`}>
            <div className="employee-header">
              <div className="header-top">
                <h4>
                  {employee.nombre} {employee.apellido}
                </h4>
                <button
                  className={`status-badge ${employee.estado === "Inactivo" ? "status-inactive" : "status-active"}`}
                  onClick={() => handleStatusClick(employee)}
                  title="Cambiar estado"
                >
                  {employee.estado || "Activo"}
                </button>
              </div>
              <span className="employee-id">C.I. {employee.cedula}</span>
            </div>

            <div className="employee-details">
              <div className="detail-item">
                <span className="label">Cargo:</span>
                <span className="value">{employee.cargo}</span>
              </div>
              <div className="detail-item">
                <span className="label">Tipo Nómina:</span>
                <span className="value">{employee.tipoNomina}</span>
              </div>

              <div className="detail-row-split">
                <div className="detail-item">
                  <span className="label">Tipo Salario:</span>
                  <span className="value">{employee.tipoSalario}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Monto:</span>
                  <span className="value">
                    {getSalarioDisplay(employee)}
                  </span>
                </div>
              </div>

              {getDetallesSalario(employee) && (
                <div className="detail-item full-width">
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.7rem" }}>
                    {getDetallesSalario(employee)}
                  </small>
                </div>
              )}

              <div className="detail-item">
                <span className="label">Frecuencia de Pago:</span>
                <span className="value">{employee.frecuenciaPago}</span>
              </div>
              <div className="detail-item">
                <span className="label">Ingreso:</span>
                <span className="value">
                  {new Date(employee.fechaIngreso + 'T00:00:00').toLocaleDateString()}
                </span>
              </div>

              {employee.estado === "Inactivo" && employee.fechaInactivo && (
                <div className="detail-item full-width inactive-date">
                  <span className="label">Inactivo desde:</span>
                  <span className="value">
                    {new Date(employee.fechaInactivo + 'T00:00:00').toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="employee-actions">
              <button className="btn-edit" onClick={() => onEdit(employee)}>
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteClick(employee)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h4>Confirmar Eliminación</h4>
            <p>
              ¿Estás seguro de que deseas eliminar a {deleteConfirm.nombre}{" "}
              {deleteConfirm.apellido}? Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {statusConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal status-modal">
            <h4>Confirmar Cambio de Estado</h4>
            <p>
              ¿Estás seguro de que deseas cambiar el estado de <strong>{statusConfirm.employee.nombre} {statusConfirm.employee.apellido}</strong> a <strong>{statusConfirm.newStatus}</strong>?
            </p>
            {statusConfirm.newStatus === "Inactivo" && (
              <p className="warning-text">
                ⚠️ El empleado no aparecerá en los reportes de asistencia ni en los cálculos de nómina mientras esté inactivo.
              </p>
            )}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelStatusChange}>
                Cancelar
              </button>
              <button
                className={`btn-confirm-status ${statusConfirm.newStatus === "Activo" ? "btn-activate" : "btn-deactivate"}`}
                onClick={confirmStatusChange}
              >
                Confirmar {statusConfirm.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalList;
