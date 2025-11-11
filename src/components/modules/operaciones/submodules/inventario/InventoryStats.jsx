import React from 'react';
import './InventoryStats.css';

const InventoryStats = ({ inventory, lowStockItems }) => {
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => {
    const itemValue = (item.precio_unitario_usd_aprox || 0) * item.cantidad_disponible;
    return sum + itemValue;
  }, 0);
  const outOfStock = inventory.filter(item => item.cantidad_disponible <= 0).length;
  const categories = [...new Set(inventory.map(item => item.categoria_producto))].length;

  return (
    <div className="inventory-stats">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <h4>Total de Productos</h4>
        <span className="stat-number">{totalItems}</span>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <h4>Valor Total Estimado</h4>
        <span className="stat-number">${totalValue.toFixed(2)}</span>
      </div>
      <div className="stat-card">
        <div className="stat-icon">🏷️</div>
        <h4>Categorías</h4>
        <span className="stat-number">{categories}</span>
      </div>
      <div className="stat-card warning">
        <div className="stat-icon">⚠️</div>
        <h4>Bajo Stock</h4>
        <span className="stat-number">{lowStockItems.length}</span>
      </div>
      <div className="stat-card danger">
        <div className="stat-icon">❌</div>
        <h4>Sin Stock</h4>
        <span className="stat-number">{outOfStock}</span>
      </div>
    </div>
  );
};

export default InventoryStats;