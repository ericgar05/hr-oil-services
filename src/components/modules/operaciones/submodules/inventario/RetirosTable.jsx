// src/components/modules/operaciones/submodules/inventario/RetirosTable.jsx
import React from 'react';
import './RetirosTable.css';

const RetirosTable = ({ retiros }) => {
  return (
    <div className="retiros-table-container">
      <h3>Historial de Retiros</h3>
      <table className="retiros-table">
        <thead>
          <tr>
            <th>Fecha Retiro</th>
            <th>Producto</th>
            <th>Unidad</th>
            <th>Cantidad</th>
            <th>Retirado Por</th>
            <th>Observaciones</th>
            <th>Registrado</th>
          </tr>
        </thead>
        <tbody>
          {retiros.map(retiro => (
            <tr key={retiro.id}>
              <td>{new Date(retiro.fecha_retiro.replace(/-/g, '/')).toLocaleDateString()}</td>
              <td>{retiro.inventario.nombre_producto}</td>
              <td>{retiro.inventario.unidad}</td>
              <td>{retiro.cantidad_retirada}</td>
              <td>{retiro.retirado_por}</td>
              <td>{retiro.observaciones}</td>
              <td>{new Date(retiro.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RetirosTable;
