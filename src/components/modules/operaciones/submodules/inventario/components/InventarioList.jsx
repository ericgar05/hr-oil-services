import React from 'react';
import { useOperaciones } from '../../../../../../contexts/OperacionesContext';
import './InventarioList.css';

const InventarioList = () => {
  const { inventory, loading } = useOperaciones();

  const groupedInventory = inventory.reduce((acc, item) => {
    const category = item.categoria_producto;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return <div>Cargando inventario...</div>;
  }

  return (
    <div className="inventario-list">
      <h3>Listado de Inventario</h3>
      {Object.entries(groupedInventory).map(([category, items]) => (
        <div key={category} className="category-section">
          <h4>{category}</h4>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad Disponible</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nombre_producto}</td>
                  <td>{item.cantidad_disponible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default InventarioList;
