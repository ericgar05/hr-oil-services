// src/components/modules/administracion/submodules/ingresos-comisiones/submodules/ingresos-pagos/components/InvoicesList.jsx
import React, { useState, useMemo } from 'react'
import './InvoicesList.css'

const InvoicesList = ({ invoices, companyDeductions, selectedDate, onDateChange }) => {
  const [filterDate, setFilterDate] = useState(selectedDate)

  const filteredInvoices = useMemo(() => {
    if (!filterDate) return invoices
    return invoices.filter(invoice => invoice.invoice_date === filterDate)
  }, [invoices, filterDate])

  const handleDateChange = (date) => {
    setFilterDate(date)
    onDateChange(date)
  }

  const calculateInvoiceTotals = (invoice) => {
    const clientDeductionsTotal = invoice.income_client_deductions?.reduce(
      (sum, deduction) => sum + parseFloat(deduction.amount), 0
    ) || 0

    const bankAmount = parseFloat(invoice.taxable_base) - clientDeductionsTotal
    const bankAmountUSD = bankAmount / parseFloat(invoice.exchange_rate)

    return {
      clientDeductionsTotal,
      bankAmount,
      bankAmountUSD
    }
  }

  return (
    <div className="invoices-list">
      <h2>📋 Lista de Facturas</h2>

      <div className="filters">
        <div className="date-filter">
          <label>Filtrar por Fecha:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => handleDateChange(e.target.value)}
          />
          <button 
            onClick={() => handleDateChange('')}
            className="clear-filter"
          >
            Mostrar Todas
          </button>
        </div>
        <div className="stats">
          <span>{filteredInvoices.length} factura(s)</span>
        </div>
      </div>

      <div className="invoices-container">
        {filteredInvoices.length === 0 ? (
          <div className="no-invoices">
            <p>No hay facturas {filterDate ? `para la fecha ${filterDate}` : 'registradas'}</p>
          </div>
        ) : (
          <div className="invoices-grid">
            {filteredInvoices.map((invoice) => {
              const totals = calculateInvoiceTotals(invoice)
              
              return (
                <div key={invoice.id} className="invoice-card">
                  <div className="invoice-header">
                    <h3>{invoice.client_name}</h3>
                    <span className="invoice-date">{invoice.invoice_date}</span>
                  </div>
                  
                  <div className="invoice-details">
                    <div className="detail-row">
                      <span>RIF:</span>
                      <span>{invoice.client_rif}</span>
                    </div>
                    <div className="detail-row">
                      <span>Base Imponible:</span>
                      <span>Bs {parseFloat(invoice.taxable_base).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Exento:</span>
                      <span>Bs {parseFloat(invoice.exempt_amount).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span>IVA 16%:</span>
                      <span>Bs {parseFloat(invoice.iva_amount).toFixed(2)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Tasa Cambio:</span>
                      <span>Bs {parseFloat(invoice.exchange_rate).toFixed(4)}/USD</span>
                    </div>
                    <div className="detail-row total">
                      <span>Total Factura:</span>
                      <span>Bs {parseFloat(invoice.total_amount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Deducciones del Cliente */}
                  {invoice.income_client_deductions && invoice.income_client_deductions.length > 0 && (
                    <div className="client-deductions">
                      <h4>Deducciones del Cliente</h4>
                      {invoice.income_client_deductions.map((deduction, index) => (
                        <div key={deduction.id || index} className="deduction-item">
                          <span>{deduction.description}</span>
                          <span>{parseFloat(deduction.percentage).toFixed(2)}%</span>
                          <span>Bs {parseFloat(deduction.amount).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="deduction-total">
                        <span>Total Deducciones:</span>
                        <span>Bs {totals.clientDeductionsTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Deducciones de la Empresa */}
                  <div className="company-deductions">
                    <h4>Deducciones de la Empresa</h4>
                    {companyDeductions
                      .filter(deduction => deduction.deduction_date === invoice.invoice_date)
                      .map((deduction, index) => (
                        <div key={deduction.id || index} className="deduction-item">
                          <span>{deduction.description}</span>
                          <span>{parseFloat(deduction.percentage).toFixed(2)}%</span>
                          <span>Bs {parseFloat(deduction.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    <div className="deduction-total">
                      <span>Total Deducciones Empresa:</span>
                      <span>Bs {companyDeductions
                        .filter(deduction => deduction.deduction_date === invoice.invoice_date)
                        .reduce((sum, d) => sum + parseFloat(d.amount), 0)
                        .toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Montos Finales */}
                  <div className="final-amounts">
                    <div className="final-amount">
                      <span>Monto al Banco:</span>
                      <span>Bs {totals.bankAmount.toFixed(2)}</span>
                    </div>
                    <div className="final-amount">
                      <span>Monto al Banco USD:</span>
                      <span>USD {totals.bankAmountUSD.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default InvoicesList