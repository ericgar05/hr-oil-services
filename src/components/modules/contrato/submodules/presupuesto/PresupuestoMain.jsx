// // Versión completa de PresupuestoMain.jsx con todos los componentes
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useProjects } from '../../../../../contexts/ProjectContext'
// import ModuleDescription from '../../../_core/ModuleDescription/ModuleDescription'
// import PresupuestoForm from './components/PresupuestoForm'
// import ItemsTable from './components/ItemsTable'
// import ResumenPresupuesto from './components/ResumenPresupuesto'
// import AvancePresupuesto from './components/AvancePresupuesto'
// import './PresupuestoMain.css'

// const PresupuestoMain = () => {
//   const navigate = useNavigate()
//   const { selectedProject } = useProjects()

//   const [presupuesto, setPresupuesto] = useState({
//     contratoNumero: '',
//     nombreContrato: '',
//     items: [],
//     estado: 'borrador'
//   })

//   const [currentStep, setCurrentStep] = useState('formulario')

//   useEffect(() => {
//     const savedPresupuesto = localStorage.getItem(`presupuesto_${selectedProject?.id}`)
//     if (savedPresupuesto) {
//       const parsed = JSON.parse(savedPresupuesto)
//       setPresupuesto(parsed)
//       if (parsed.contratoNumero && parsed.items.length > 0) {
//         setCurrentStep('items')
//       }
//     }
//   }, [selectedProject])

//   const handleBack = () => {
//     navigate('../../../contrato')
//   }

//   const handleContratoSubmit = (contratoData) => {
//     const updatedPresupuesto = {
//       ...presupuesto,
//       ...contratoData
//     }
//     setPresupuesto(updatedPresupuesto)
//     setCurrentStep('items')
//     savePresupuesto(updatedPresupuesto)
//   }

//   const handleAddItem = (itemData) => {
//     const newItem = {
//       id: Date.now().toString(),
//       ...itemData,
//       montoContrato: itemData.cantidad * itemData.precioUnitario
//     }

//     const updatedPresupuesto = {
//       ...presupuesto,
//       items: [...presupuesto.items, newItem]
//     }

//     setPresupuesto(updatedPresupuesto)
//     savePresupuesto(updatedPresupuesto)
//   }

//   const handleEditItem = (itemId, itemData) => {
//     const updatedItems = presupuesto.items.map(item =>
//       item.id === itemId
//         ? {
//             ...item,
//             ...itemData,
//             montoContrato: itemData.cantidad * itemData.precioUnitario
//           }
//         : item
//     )

//     const updatedPresupuesto = {
//       ...presupuesto,
//       items: updatedItems
//     }

//     setPresupuesto(updatedPresupuesto)
//     savePresupuesto(updatedPresupuesto)
//   }

//   const handleDeleteItem = (itemId) => {
//     const updatedItems = presupuesto.items.filter(item => item.id !== itemId)
//     const updatedPresupuesto = {
//       ...presupuesto,
//       items: updatedItems
//     }

//     setPresupuesto(updatedPresupuesto)
//     savePresupuesto(updatedPresupuesto)
//   }

//   const handleFinalizarPresupuesto = () => {
//     const updatedPresupuesto = {
//       ...presupuesto,
//       estado: 'finalizado',
//       fechaFinalizacion: new Date().toISOString()
//     }

//     setPresupuesto(updatedPresupuesto)
//     savePresupuesto(updatedPresupuesto)
//     alert('✅ Presupuesto finalizado exitosamente')
//   }

//   const handleReiniciar = () => {
//     const nuevoPresupuesto = {
//       contratoNumero: '',
//       nombreContrato: '',
//       items: [],
//       estado: 'borrador'
//     }
//     setPresupuesto(nuevoPresupuesto)
//     setCurrentStep('formulario')
//     localStorage.removeItem(`presupuesto_${selectedProject?.id}`)
//   }

//   const savePresupuesto = (presupuestoData) => {
//     localStorage.setItem(`presupuesto_${selectedProject?.id}`, JSON.stringify(presupuestoData))
//   }

//   const calcularTotales = () => {
//     const subtotal = presupuesto.items.reduce((sum, item) => sum + item.montoContrato, 0)
//     const itemsConIva = presupuesto.items.filter(item => item.aplicaIVA)
//     const itemsSinIva = presupuesto.items.filter(item => !item.aplicaIVA)

//     const subtotalConIVA = itemsConIva.reduce((sum, item) => sum + item.montoContrato, 0)
//     const subtotalSinIVA = itemsSinIva.reduce((sum, item) => sum + item.montoContrato, 0)

//     const iva = itemsConIva.reduce((sum, item) => sum + (item.montoContrato * 0.16), 0)
//     const total = subtotal + iva

//     return {
//       subtotal,
//       subtotalConIVA,
//       subtotalSinIVA,
//       items: presupuesto.items,
//       iva,
//       total,
//       cantidadItems: presupuesto.items.length,
//       itemsConIva: itemsConIva.length,
//       itemsSinIva: itemsSinIva.length
//     }
//   }

//   const totales = calcularTotales()

//   return (
//     <div className="presupuesto-main">
//       <button className="back-button" onClick={handleBack}>
//         ← Volver a Contrato
//       </button>

//       <ModuleDescription
//         title="Presupuesto de Contrato"
//         description={`Creación y gestión del presupuesto del contrato - ${selectedProject?.name || ''}`}
//       />

//       <div className="steps-indicator">
//         <div className={`step ${currentStep === 'formulario' ? 'active' : ''} ${presupuesto.contratoNumero ? 'completed' : ''}`}>
//           <div className="step-number">1</div>
//           <div className="step-label">Datos del Contrato</div>
//         </div>
//         <div className={`step ${currentStep === 'items' ? 'active' : ''} ${presupuesto.items.length > 0 ? 'completed' : ''}`}>
//           <div className="step-number">2</div>
//           <div className="step-label">Agregar Ítems</div>
//         </div>
//       </div>

//       <div className="presupuesto-content">
//         {currentStep === 'formulario' && (
//           <PresupuestoForm
//             presupuesto={presupuesto}
//             onSubmit={handleContratoSubmit}
//             onCancel={handleBack}
//           />
//         )}

//         {currentStep === 'items' && (
//           <div className="items-section">
//             <div className="section-header">
//               <h3>Presupuesto del Contrato</h3>
//               <div className="contrato-info">
//                 <strong>Contrato:</strong> {presupuesto.contratoNumero}
//                 {presupuesto.nombreContrato && ` - ${presupuesto.nombreContrato}`}
//               </div>
//             </div>

//             <PresupuestoForm
//               presupuesto={presupuesto}
//               onSubmit={handleContratoSubmit}
//               onCancel={() => setCurrentStep('formulario')}
//               showItemsForm={true}
//               onAddItem={handleAddItem}
//             />

//             {presupuesto.items.length > 0 && (
//               <>
//                 <ItemsTable
//                   items={presupuesto.items}
//                   onEditItem={handleEditItem}
//                   onDeleteItem={handleDeleteItem}
//                 />

//                 <ResumenPresupuesto totales={totales} />
//                 <AvancePresupuesto
//                   presupuestoData={presupuesto}
//                   projectId={selectedProject?.id}
//                 />

//                 <div className="actions-section">
//                   <button
//                     className="btn-primary large"
//                     onClick={handleFinalizarPresupuesto}
//                   >
//                     ✅ Finalizar Presupuesto
//                   </button>
//                   <button
//                     className="btn-outline"
//                     onClick={handleReiniciar}
//                   >
//                     🔄 Reiniciar Todo
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default PresupuestoMain

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../../../contexts/ProjectContext";
import { useBudget } from "../../../../../contexts/BudgetContext"; // NUEVO
import ModuleDescription from "../../../_core/ModuleDescription/ModuleDescription";
import PresupuestoForm from "./components/PresupuestoForm";
import ItemsTable from "./components/ItemsTable";
import ResumenPresupuesto from "./components/ResumenPresupuesto";
import AvancePresupuesto from "./components/AvancePresupuesto";
import "./PresupuestoMain.css";

const PresupuestoMain = () => {
  const navigate = useNavigate();
  const { selectedProject } = useProjects();
  const {
    budget,
    loading,
    error,
    saveBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    finalizeBudget,
    resetBudget,
  } = useBudget(); // NUEVO

  const [currentStep, setCurrentStep] = useState("formulario");

  useEffect(() => {
    // Determinar el paso actual basado en el presupuesto cargado
    if (budget) {
      if (budget.contratoNumero && budget.items.length > 0) {
        setCurrentStep("items");
      } else if (budget.contratoNumero) {
        setCurrentStep("items");
      }
    }
  }, [budget]);

  const handleBack = () => {
    navigate("../../../contrato");
  };

  const handleContratoSubmit = async (contratoData) => {
    const budgetData = {
      ...contratoData,
      items: budget?.items || [],
      estado: "borrador",
    };

    const result = await saveBudget(budgetData);
    if (result.success) {
      setCurrentStep("items");
    } else {
      alert("Error al guardar el contrato: " + result.error);
    }
  };

  const handleAddItem = async (itemData) => {
    const result = await addBudgetItem(itemData);
    if (!result.success) {
      alert("Error al agregar el ítem: " + result.error);
    }
  };

  const handleEditItem = async (itemId, itemData) => {
    const result = await updateBudgetItem(itemId, itemData);
    if (!result.success) {
      alert("Error al actualizar el ítem: " + result.error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const result = await deleteBudgetItem(itemId);
    if (!result.success) {
      alert("Error al eliminar el ítem: " + result.error);
    }
  };

  const handleFinalizarPresupuesto = async () => {
    const result = await finalizeBudget();
    if (result.success) {
      alert("✅ Presupuesto finalizado exitosamente");
    } else {
      alert("Error al finalizar el presupuesto: " + result.error);
    }
  };

  const handleReiniciar = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas reiniciar todo el presupuesto?"
      )
    ) {
      await resetBudget();
      setCurrentStep("formulario");
    }
  };



  if (loading) {
    return (
      <div className="presupuesto-main">
        <div className="loading-state">
          <p>Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="presupuesto-main">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="presupuesto-main">
      <button className="back-button" onClick={handleBack}>
        ← Volver a Contrato
      </button>

      <ModuleDescription
        title="Presupuesto de Contrato"
        description={`Creación y gestión del presupuesto del contrato - ${
          selectedProject?.name || ""
        }`}
      />

      <div className="steps-indicator">
        <div
          className={`step ${currentStep === "formulario" ? "active" : ""} ${
            budget?.contratoNumero ? "completed" : ""
          }`}
        >
          <div className="step-number">1</div>
          <div className="step-label">Datos del Contrato</div>
        </div>
        <div
          className={`step ${currentStep === "items" ? "active" : ""} ${
            budget?.items?.length > 0 ? "completed" : ""
          }`}
        >
          <div className="step-number">2</div>
          <div className="step-label">Agregar Ítems</div>
        </div>
      </div>

      <div className="presupuesto-content">
        {currentStep === "formulario" && (
          <PresupuestoForm
            presupuesto={budget || {}}
            onSubmit={handleContratoSubmit}
            onCancel={handleBack}
          />
        )}

        {currentStep === "items" && (
          <div className="items-section">
            <div className="section-header">
              <h3>Presupuesto del Contrato</h3>
              <div className="contrato-info">
                <strong>Contrato:</strong> {budget?.contratoNumero}
                {budget?.nombreContrato && ` - ${budget.nombreContrato}`}
              </div>
            </div>

            <PresupuestoForm
              presupuesto={budget || {}}
              onSubmit={handleContratoSubmit}
              onCancel={() => setCurrentStep("formulario")}
              showItemsForm={true}
              onAddItem={handleAddItem}
            />

            {budget?.items && budget.items.length > 0 && (
              <>
                <ItemsTable
                  items={budget.items}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                />

                <ResumenPresupuesto totales={budget} />
                <AvancePresupuesto
                  presupuestoData={budget}
                  projectId={selectedProject?.id}
                />

                <div className="actions-section">
                  <button
                    className="btn-primary large"
                    onClick={handleFinalizarPresupuesto}
                    disabled={budget.estado === "finalizado"}
                  >
                    {budget.estado === "finalizado"
                      ? "✅ Finalizado"
                      : "✅ Finalizar Presupuesto"}
                  </button>
                  <button className="btn-outline" onClick={handleReiniciar}>
                    🔄 Reiniciar Todo
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresupuestoMain;