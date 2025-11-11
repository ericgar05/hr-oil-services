// src/components/modules/operaciones/submodules/planificacion/components/PlanificacionStats.jsx
import React from 'react';
import { useCurrency } from '../../../../../../contexts/CurrencyContext';
import './PlanificacionStats.css';

const PlanificacionStats = ({ 
  totalTareas, 
  tareasCompletadas, 
  totalMontoPlanificado, 
  semanasPlanificadas,
  totalSemanas 
}) => {
  const { formatCurrency } = useCurrency();
  
  const porcentajeCompletado = totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0;
  const porcentajeSemanas = totalSemanas > 0 ? (semanasPlanificadas / totalSemanas) * 100 : 0;

  return (
    <div className="planificacion-stats">
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-content">
          <div className="stat-number">{totalTareas}</div>
          <div className="stat-label">Total Tareas</div>
          <div className="stat-subtext">{tareasCompletadas} completadas</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-number">{porcentajeCompletado.toFixed(1)}%</div>
          <div className="stat-label">Progreso</div>
          <div className="stat-subtext">{tareasCompletadas}/{totalTareas}</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-number">{formatCurrency(totalMontoPlanificado, 'USD')}</div>
          <div className="stat-label">Monto Planificado</div>
          <div className="stat-subtext">Total presupuestado</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🗓️</div>
        <div className="stat-content">
          <div className="stat-number">{semanasPlanificadas}</div>
          <div className="stat-label">Semanas Planificadas</div>
          <div className="stat-subtext">{porcentajeSemanas.toFixed(1)}% del total</div>
        </div>
      </div>
    </div>
  );
};

export default PlanificacionStats;