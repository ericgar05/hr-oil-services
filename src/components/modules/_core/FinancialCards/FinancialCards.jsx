import React from 'react'
import './FinancialCards.css'

const FinancialCards = ({ data }) => {
  return (
    <div className="financial-cards">
      {data.map((item, index) => (
        <div key={index} className="financial-card">
          <div className="financial-value">{item.value}</div>
          <div className="financial-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default FinancialCards