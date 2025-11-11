// // src/components/modules/administracion/submodules/gastos-administrativos/submodules/nomina-personal/submodules/nomina/submodules/registro-personal/components/PersonalList.jsx
// import React, { useState } from 'react'
// import './PersonalList.css'

// const PersonalList = ({ employees, onEdit, onDelete }) => {
//   const [deleteConfirm, setDeleteConfirm] = useState(null)

//   const handleDeleteClick = (employee) => {
//     setDeleteConfirm(employee)
//   }

//   const confirmDelete = () => {
//     onDelete(deleteConfirm.id)
//     setDeleteConfirm(null)
//   }

//   const cancelDelete = () => {
//     setDeleteConfirm(null)
//   }

//   const formatCurrency = (amount) => {
//     return `USD$ ${parseFloat(amount || 0).toLocaleString('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     })}`
//   }

//   // CORRECCIÓN: Incluir Administrativa en nóminas con monto ley
//   const getSalarioDisplay = (employee) => {
//     if (employee.tipoNomina === 'Ejecucion' || employee.tipoNomina === 'Administrativa') {
//       const total = parseFloat(employee.montoLey || 0) + parseFloat(employee.bonificacionEmpresa || 0)
//       return `USD$ ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
//     }
//     return formatCurrency(employee.montoSalario)
//   }

//   // Función para mostrar detalles del salario según tipo de nómina
//   const getDetallesSalario = (employee) => {
//     if (employee.tipoNomina === 'Ejecucion' || employee.tipoNomina === 'Administrativa') {
//       const montoLey = parseFloat(employee.montoLey || 0)
//       const bonificacion = parseFloat(employee.bonificacionEmpresa || 0)
//       let detalles = `(Ley: $${montoLey.toFixed(2)} + Bonif.: $${bonificacion.toFixed(2)})`

//       //NUEVO
//       if (employee.porcentajeIslr){
//         detalles+=` - ISLR: ${employee.porcentajeIslr}%`
//       }
//       return detalles
//     }
//     return ''
//   }

//   if (employees.length === 0) {
//     return (
//       <div className="empty-state">
//         <div className="empty-icon">👥</div>
//         <h4>No hay personal registrado</h4>
//         <p>Comienza agregando el primer empleado al sistema</p>
//       </div>
//     )
//   }

//   return (
//     <div className="personal-list">
//       <div className="list-header">
//         <span>Empleados Registrados: {employees.length}</span>
//       </div>

//       <div className="employees-grid">
//         {employees.map(employee => (
//           <div key={employee.id} className="employee-card">
//             <div className="employee-header">
//               <h4>{employee.nombre} {employee.apellido}</h4>
//               <span className="employee-id">C.I. {employee.cedula}</span>
//             </div>

//             <div className="employee-details">
//               <div className="detail-item">
//                 <span className="label">Cargo:</span>
//                 <span className="value">{employee.cargo}</span>
//               </div>
//               <div className="detail-item">
//                 <span className="label">Tipo Nómina:</span>
//                 <span className="value">{employee.tipoNomina}</span>
//               </div>
//               <div className="detail-item">
//                 <span className="label">Salario:</span>
//                 <span className="value">
//                   {getSalarioDisplay(employee)}
//                   <br />
//                   <small style={{color: 'var(--text-secondary)', fontSize: '0.7rem'}}>
//                     {getDetallesSalario(employee)}
//                   </small>
//                 </span>
//               </div>
//               <div className="detail-item">
//                 <span className="label">Frecuencia:</span>
//                 <span className="value">{employee.frecuenciaPago}</span>
//               </div>
//               <div className="detail-item">
//                 <span className="label">Ingreso:</span>
//                 <span className="value">
//                   {new Date(employee.fechaIngreso).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>

//             <div className="employee-actions">
//               <button
//                 className="btn-edit"
//                 onClick={() => onEdit(employee)}
//               >
//                 Editar
//               </button>
//               <button
//                 className="btn-delete"
//                 onClick={() => handleDeleteClick(employee)}
//               >
//                 Eliminar
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {deleteConfirm && (
//         <div className="delete-modal-overlay">
//           <div className="delete-modal">
//             <h4>Confirmar Eliminación</h4>
//             <p>
//               ¿Estás seguro de que deseas eliminar a {deleteConfirm.nombre} {deleteConfirm.apellido}?
//               Esta acción no se puede deshacer.
//             </p>
//             <div className="modal-actions">
//               <button className="btn-cancel" onClick={cancelDelete}>
//                 Cancelar
//               </button>
//               <button className="btn-confirm-delete" onClick={confirmDelete}>
//                 Eliminar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default PersonalList
// src/components/modules/administracion/submodules/gastos-administrativos/submodules/nomina-personal/submodules/nomina/submodules/registro-personal/components/PersonalList.jsx
import React, { useState } from "react";
import "./PersonalList.css";

const PersonalList = ({ employees, onEdit, onDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
          <div key={employee.id} className="employee-card">
            <div className="employee-header">
              <h4>
                {employee.nombre} {employee.apellido}
              </h4>
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
              <div className="detail-item">
                <span className="label">Salario:</span>
                <span className="value">
                  {getSalarioDisplay(employee)}
                  <br />
                  <small
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.7rem",
                    }}
                  >
                    {getDetallesSalario(employee)}
                  </small>
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Frecuencia:</span>
                <span className="value">{employee.frecuenciaPago}</span>
              </div>
              <div className="detail-item">
                <span className="label">Ingreso:</span>
                <span className="value">
                  {new Date(employee.fechaIngreso).toLocaleDateString()}
                </span>
              </div>
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
    </div>
  );
};

export default PersonalList;
