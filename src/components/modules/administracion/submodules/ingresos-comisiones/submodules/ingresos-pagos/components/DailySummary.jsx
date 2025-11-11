// src/components/modules/administracion/submodules/ingresos-comisiones/submodules/ingresos-pagos/components/DailySummary.jsx
import React from 'react'
import './DailySummary.css'

const DailySummary = ({ dailyTotals, companyDeductions, selectedDate, onDateChange, exchangeRate }) => {
  
  const dailyCompanyDeductions = companyDeductions.filter(
    deduction => deduction.deduction_date === selectedDate
  )

  const totalCompanyDeductionsBs = dailyCompanyDeductions.reduce(
    (sum, deduction) => sum + parseFloat(deduction.amount), 0
  )

  // El ingreso final se calcula sobre el monto recibido al banco
  const finalIncomeBs = dailyTotals.totalReceivedBs - totalCompanyDeductionsBs

  // Nuevos cálculos en USD basados en la tasa de cambio
  const safeExchangeRate = exchangeRate > 0 ? exchangeRate : 1; // Evitar división por cero

  const totalReceivedUsd = dailyTotals.totalReceivedBs / safeExchangeRate;
  const totalCompanyDeductionsUsd = totalCompanyDeductionsBs / safeExchangeRate;
  const finalIncomeUsd = finalIncomeBs / safeExchangeRate;


  // DEBUG: Verificar los valores
  console.log('DEBUG - Montos calculados:');
  console.log('Deducciones Empresa Bs:', totalCompanyDeductionsBs);
  console.log('Deducciones Empresa USD:', totalCompanyDeductionsUsd);
  console.log('Ingreso Final Bs:', finalIncomeBs);
  console.log('Ingreso Final USD:', finalIncomeUsd);

  return (
    <div className="daily-summary">
      <h2>📊 Resumen Diario</h2>

      <div className="date-selector">
        <label>Seleccionar Fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div className="summary-cards">
        {/* Sumatoria Bases Imponibles */}
        <div className="summary-card bases">
          <h3>SUMATORIA BASES IMPONIBLES</h3>
          <div className="amounts">
            <div className="amount">
              <span className="currency">Bs</span>
              <span className="value">{dailyTotals.totalTaxableBase.toFixed(2)}</span>
            </div>
          </div>
          <div className="card-description">
            Total de todas las bases imponibles de las facturas
          </div>
        </div>

        <div className="summary-card primary">
          <h3>MONTO RECIBIDO EN BANCO</h3>
          <div className="amounts">
            <div className="amount">
              <span className="currency">Bs</span>
              <span className="value">{dailyTotals.totalReceivedBs.toFixed(2)}</span>
            </div>
            <div className="amount">
              <span className="currency">USD</span>
              <span className="value">{totalReceivedUsd.toFixed(2)}</span>
            </div>
          </div>
          <div className="card-description">
            Después de deducciones del cliente
          </div>
          <div className="date-indicator">Fecha: {selectedDate}</div>
        </div>

        <div className="summary-card deductions">
          <h3>DEDUCCIONES DE LA EMPRESA</h3>
          <div className="amounts">
            <div className="amount">
              <span className="currency">Bs</span>
              {/* CORREGIDO: Mostrar deducciones empresa en Bs */}
              <span className="value">{totalCompanyDeductionsBs.toFixed(2)}</span>
            </div>
            <div className="amount">
              <span className="currency">USD</span>
                                <span className="value">{totalCompanyDeductionsUsd.toFixed(2)}</span>            </div>
          </div>
          {dailyCompanyDeductions.length > 0 && (
            <div className="deductions-list">
              <small>{dailyCompanyDeductions.length} deducción(es)</small>
            </div>
          )}
          <div className="card-description">
            Calculadas sobre sumatoria bases imponibles
          </div>
        </div>

        <div className="summary-card final">
          <h3>TOTAL INGRESO FINAL</h3>
          <div className="amounts">
            <div className="amount">
              <span className="currency">Bs</span>
              {/* CORREGIDO: Mostrar ingreso final en Bs */}
              <span className="value">{finalIncomeBs.toFixed(2)}</span>
            </div>
            <div className="amount">
              <span className="currency">USD</span>
              {/* CORREGIDO: Mostrar ingreso final en USD */}
              <span className="value">{finalIncomeUsd.toFixed(2)}</span>
            </div>
          </div>
          <div className="profit-indicator">
            {finalIncomeBs >= 0 ? '✅ Ganancia' : '❌ Pérdida'}
          </div>
          <div className="card-description">
            Monto recibido al banco - Deducciones empresa
          </div>
        </div>
      </div>

      {/* Detalle de Deducciones */}
      {dailyCompanyDeductions.length > 0 && (
        <div className="deductions-detail">
          <h4>Detalle de Deducciones de Empresa</h4>
          <div className="deductions-table">
            <div className="table-header">
              <span>Descripción</span>
              <span>Porcentaje</span>
              <span>Monto Bs</span>
              <span>Monto USD</span>
            </div>
            {dailyCompanyDeductions.map((deduction, index) => (
              <div key={deduction.id || index} className="table-row">
                <span>{deduction.description}</span>
                <span>{parseFloat(deduction.percentage).toFixed(2)}%</span>
                <span>Bs {parseFloat(deduction.amount).toFixed(2)}</span>
                <span>USD {parseFloat(deduction.amount_usd).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DailySummary