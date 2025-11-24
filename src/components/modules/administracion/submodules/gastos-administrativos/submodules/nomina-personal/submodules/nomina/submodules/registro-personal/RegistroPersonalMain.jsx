// src/components/modules/administracion/submodules/gastos-administrativos/submodules/nomina-personal/submodules/nomina/submodules/registro-personal/RegistroPersonalMain.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../../../../../../../../../contexts/ProjectContext";
import { usePersonal } from "../../../../../../../../../../../contexts/PersonalContext";
import { useNotification } from "../../../../../../../../../../../contexts/NotificationContext";
import ModuleDescription from "../../../../../../../../../_core/ModuleDescription/ModuleDescription";
import PersonalForm from "./components/PersonalForm";
import PersonalList from "./components/PersonalList";

import "./RegistroPersonalMain.css";

const RegistroPersonalMain = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  const { getEmployeesByProject, addEmployee, updateEmployee, deleteEmployee } =
    usePersonal();
  const { showToast } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar empleados del proyecto actual
  useEffect(() => {
    loadEmployees();
  }, [selectedProject?.id]);

  const loadEmployees = async () => {
    if (!selectedProject?.id) return;

    setLoading(true);
    try {
      const employeesData = await getEmployeesByProject(selectedProject.id);
      setEmployees(employeesData);
      setFilteredEmployees(employeesData);
    } catch (error) {
      console.error("Error cargando empleados:", error);
      showToast("Error al cargar empleados: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.nombre.toLowerCase().includes(lowerTerm) ||
          emp.apellido.toLowerCase().includes(lowerTerm) ||
          emp.cedula.includes(lowerTerm)
      );
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      await addEmployee({
        ...employeeData,
        projectId: selectedProject?.id,
      });
      await loadEmployees(); // Recargar la lista
      setShowForm(false);
      showToast("Empleado agregado exitosamente", "success");
    } catch (error) {
      showToast("Error al agregar empleado: " + error.message, "error");
    }
  };

  const handleEditEmployee = async (employeeData) => {
    try {
      await updateEmployee(editingEmployee.id, employeeData);
      await loadEmployees(); // Recargar la lista
      setEditingEmployee(null);
      setShowForm(false);
      showToast("Empleado actualizado exitosamente", "success");
    } catch (error) {
      showToast("Error al actualizar empleado: " + error.message, "error");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      try {
        await deleteEmployee(employeeId);
        await loadEmployees(); // Recargar la lista
        showToast("Empleado eliminado exitosamente", "success");
      } catch (error) {
        console.error("Error deleting employee:", error);
        showToast("Error al eliminar empleado: " + error.message, "error");
      }
    }
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleStatusChange = async (employee, newStatus) => {
    try {
      const updateData = {
        ...employee,
        estado: newStatus,
        fechaInactivo: newStatus === "Inactivo" ? new Date().toISOString().split('T')[0] : employee.fechaInactivo,
        fechaReactivacion: newStatus === "Activo" ? new Date().toISOString().split('T')[0] : employee.fechaReactivacion,
      };

      await updateEmployee(employee.id, updateData);
      await loadEmployees();
      showToast(`Estado actualizado a ${newStatus}`, "success");
    } catch (error) {
      showToast("Error al actualizar estado: " + error.message, "error");
    }
  };

  return (
    <div className="registro-personal-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Nómina
      </button>

      <ModuleDescription
        title="Registro de Personal"
        description={`Gestión completa del registro y datos del personal - ${selectedProject?.name || ""
          }`}
      />

      <div className="module-content">
        {showForm ? (
          <PersonalForm
            employee={editingEmployee}
            onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
            onCancel={handleCancelForm}
          />
        ) : (
          <>
            <div className="content-header">
              <div className="header-actions">
                <h3>Lista de Personal Registrado</h3>
                <button
                  className="btn-personal"
                  onClick={() => setShowForm(true)}
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "+ Nuevo Empleado"}
                </button>
              </div>
              <p>Gestión integral de la información del personal</p>

              <div className="search-container" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <p>Cargando empleados...</p>
              </div>
            ) : (
              <PersonalList
                employees={filteredEmployees}
                onEdit={handleEditClick}
                onDelete={handleDeleteEmployee}
                onStatusChange={handleStatusChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegistroPersonalMain;
