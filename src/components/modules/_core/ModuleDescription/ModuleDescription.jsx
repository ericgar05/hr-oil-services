import React from 'react'
import './ModuleDescription.css'

const ModuleDescription = ({ title, description }) => {
  return (
    <div className="module-description">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}

export default ModuleDescription