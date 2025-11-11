import React from 'react'
import './Button.css'

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClass = 'btn'
  const variantClass = `btn-${variant}`
  const classes = `${baseClass} ${variantClass} ${className} ${disabled ? 'btn-disabled' : ''}`.trim()

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>


  )
}

export default Button