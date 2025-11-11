// import React, { useState, useEffect } from 'react'
// import Button from '../../common/Button/Button'
// import CurrencySelect from '../../common/CurrencySelect/CurrencySelect'
// import './ProjectForm.css'

// const ProjectForm = ({ project, onSubmit, onCancel }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     startDate: '',
//     endDate: '',
//     client: '',
//     budget: '',
//     currency: 'USD'
//   })

//   const [errors, setErrors] = useState({})

//   useEffect(() => {
//     if (project) {
//       setFormData({
//         name: project.name || '',
//         startDate: project.startDate || '',
//         endDate: project.endDate || '',
//         client: project.client || '',
//         budget: project.budget?.toString() || '',
//         currency: project.currency || 'USD'
//       })
//     }
//   }, [project])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }))
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }))
//     }
//   }

//   const handleCurrencyChange = (currency) => {
//     setFormData(prev => ({
//       ...prev,
//       currency
//     }))
//   }

//   const validateForm = () => {
//     const newErrors = {}

//     if (!formData.name.trim()) {
//       newErrors.name = 'El nombre del proyecto es requerido'
//     }

//     if (!formData.startDate) {
//       newErrors.startDate = 'La fecha de inicio es requerida'
//     }

//     if (!formData.endDate) {
//       newErrors.endDate = 'La fecha de fin es requerida'
//     } else if (formData.startDate && formData.endDate < formData.startDate) {
//       newErrors.endDate = 'La fecha de fin no puede ser anterior a la fecha de inicio'
//     }

//     if (!formData.client.trim()) {
//       newErrors.client = 'El cliente es requerido'
//     }

//     if (!formData.budget || parseFloat(formData.budget) <= 0) {
//       newErrors.budget = 'El presupuesto debe ser mayor a 0'
//     }

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
    
//     if (validateForm()) {
//       onSubmit({
//         ...formData,
//         budget: parseFloat(formData.budget)
//       })
//     }
//   }

//   return (
//     <form className="project-form" onSubmit={handleSubmit}>
//       <div className="form-group">
//         <label htmlFor="name" className="form-label">
//           Nombre del Proyecto *
//         </label>
//         <input
//           type="text"
//           id="name"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           className={`form-input ${errors.name ? 'error' : ''}`}
//           placeholder="Ingresa el nombre del proyecto"
//         />
//         {errors.name && <span className="error-message">{errors.name}</span>}
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label htmlFor="startDate" className="form-label">
//             Fecha de Inicio *
//           </label>
//           <input
//             type="date"
//             id="startDate"
//             name="startDate"
//             value={formData.startDate}
//             onChange={handleChange}
//             className={`form-input ${errors.startDate ? 'error' : ''}`}
//           />
//           {errors.startDate && <span className="error-message">{errors.startDate}</span>}
//         </div>

//         <div className="form-group">
//           <label htmlFor="endDate" className="form-label">
//             Fecha Estimada de Fin *
//           </label>
//           <input
//             type="date"
//             id="endDate"
//             name="endDate"
//             value={formData.endDate}
//             onChange={handleChange}
//             className={`form-input ${errors.endDate ? 'error' : ''}`}
//           />
//           {errors.endDate && <span className="error-message">{errors.endDate}</span>}
//         </div>
//       </div>

//       <div className="form-group">
//         <label htmlFor="client" className="form-label">
//           Cliente *
//         </label>
//         <input
//           type="text"
//           id="client"
//           name="client"
//           value={formData.client}
//           onChange={handleChange}
//           className={`form-input ${errors.client ? 'error' : ''}`}
//           placeholder="Nombre del cliente"
//         />
//         {errors.client && <span className="error-message">{errors.client}</span>}
//       </div>

//       <div className="form-row">
//         <div className="form-group">
//           <label htmlFor="budget" className="form-label">
//             Presupuesto *
//           </label>
//           <input
//             type="number"
//             id="budget"
//             name="budget"
//             value={formData.budget}
//             onChange={handleChange}
//             className={`form-input ${errors.budget ? 'error' : ''}`}
//             placeholder="0.00"
//             min="0"
//             step="0.01"
//           />
//           {errors.budget && <span className="error-message">{errors.budget}</span>}
//         </div>

//         <div className="form-group">
//           <label className="form-label">
//             Moneda *
//           </label>
//           <CurrencySelect
//             value={formData.currency}
//             onChange={handleCurrencyChange}
//           />
//         </div>
//       </div>

//       <div className="form-actions">
//         <Button type="button" onClick={onCancel} className="btn-outline">
//           Cancelar
//         </Button>
//         <Button type="submit" className="btn-primary">
//           {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
//         </Button>
//       </div>
//     </form>
//   )
// }

// export default ProjectForm

import React, { useState, useEffect } from 'react'
import Button from '../../common/Button/Button'
import CurrencySelect from '../../common/CurrencySelect/CurrencySelect'
import './ProjectForm.css'

const ProjectForm = ({ project, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    client: '',
    budget: '',
    currency: 'USD'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        client: project.client || '',
        budget: project.budget?.toString() || '',
        currency: project.currency || 'USD'
      })
    }
  }, [project])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCurrencyChange = (currency) => {
    setFormData(prev => ({
      ...prev,
      currency
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida'
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'La fecha de fin no puede ser anterior a la fecha de inicio'
    }

    if (!formData.client.trim()) {
      newErrors.client = 'El cliente es requerido'
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'El presupuesto debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      try {
        await onSubmit({
          ...formData,
          budget: parseFloat(formData.budget)
        })
      } catch (error) {
        // Manejar error de base de datos
        setErrors({ submit: 'Error al guardar el proyecto. Intente nuevamente.' })
      }
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nombre del Proyecto *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Ingresa el nombre del proyecto"
          disabled={loading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`form-input ${errors.startDate ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            Fecha Estimada de Fin *
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`form-input ${errors.endDate ? 'error' : ''}`}
            disabled={loading}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="client" className="form-label">
          Cliente *
        </label>
        <input
          type="text"
          id="client"
          name="client"
          value={formData.client}
          onChange={handleChange}
          className={`form-input ${errors.client ? 'error' : ''}`}
          placeholder="Nombre del cliente"
          disabled={loading}
        />
        {errors.client && <span className="error-message">{errors.client}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="budget" className="form-label">
            Presupuesto *
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className={`form-input ${errors.budget ? 'error' : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={loading}
          />
          {errors.budget && <span className="error-message">{errors.budget}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Moneda *
          </label>
          <CurrencySelect
            value={formData.currency}
            onChange={handleCurrencyChange}
            disabled={loading}
          />
        </div>
      </div>

      {errors.submit && (
        <div className="form-group">
          <span className="error-message submit-error">{errors.submit}</span>
        </div>
      )}

      <div className="form-actions">
        <Button 
          type="button" 
          onClick={onCancel} 
          className="btn-outline"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="btn-primary"
          loading={loading}
          disabled={loading}
        >
          {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  )
}

export default ProjectForm