import React from 'react'
import './StatusCards.css'

const StatusCards = ({ items }) => {
  return (
    <div className="status-cards">
      {items.map((item, index) => (
        <div key={index} className="status-card">
          <div className={`status-value ${item.status || ''}`}>{item.value}</div>
          <div className="status-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default StatusCards