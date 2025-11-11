import { createContext, useContext, useState, useEffect } from "react";
import { useProjects } from "./ProjectContext";
import supabase from "../api/supaBase";

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget debe ser usado dentro de un BudgetProvider");
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const { selectedProject } = useProjects();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar presupuesto del proyecto
  const loadBudget = async () => {
    if (!selectedProject?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          budget_items (*)
        `
        )
        .eq("project_id", selectedProject.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        // Transformar datos de Supabase a nuestro formato
        const transformedBudget = {
          id: data.id,
          contratoNumero: data.contract_number,
          nombreContrato: data.contract_name,
          estado: data.status,
          items: data.budget_items.map((item) => ({
            id: item.id,
            item: item.item_number,
            descripcion: item.description,
            unidad: item.unit,
            cantidad: parseFloat(item.quantity),
            precioUnitario: parseFloat(item.unit_price),
            moneda: item.currency,
            aplicaIVA: item.applies_vat,
            montoContrato: parseFloat(item.contract_amount),
          })),
          fechaCreacion: data.created_at,
          fechaActualizacion: data.updated_at,
        };
        setBudget(transformedBudget);
      } else {
        setBudget(null);
      }
    } catch (err) {
      console.error("Error loading budget:", err);
      setError(err.message);
      // Fallback a localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Fallback a localStorage
  const loadFromLocalStorage = () => {
    const savedBudget = localStorage.getItem(
      `presupuesto_${selectedProject?.id}`
    );
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
  };

  // Crear o actualizar presupuesto
  const saveBudget = async (budgetData) => {
    setLoading(true);
    setError(null);

    try {
      let budgetId = budgetData.id;

      if (budgetId) {
        // Actualizar presupuesto existente
        const { error: updateError } = await supabase
          .from("budgets")
          .update({
            contract_number: budgetData.contratoNumero,
            contract_name: budgetData.nombreContrato,
            status: budgetData.estado,
            updated_at: new Date().toISOString(),
          })
          .eq("id", budgetId);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo presupuesto
        const { data: newBudget, error: insertError } = await supabase
          .from("budgets")
          .insert({
            project_id: selectedProject.id,
            contract_number: budgetData.contratoNumero,
            contract_name: budgetData.nombreContrato,
            status: budgetData.estado,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        budgetId = newBudget.id;
      }

      // Guardar items
      await saveBudgetItems(budgetId, budgetData.items);

      // Recargar el presupuesto completo
      await loadBudget();

      return { success: true, id: budgetId };
    } catch (err) {
      console.error("Error saving budget:", err);
      setError(err.message);
      // Fallback a localStorage
      saveToLocalStorage(budgetData);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Guardar items del presupuesto
  const saveBudgetItems = async (budgetId, items) => {
    if (!items || items.length === 0) return;

    // Eliminar items existentes
    await supabase.from("budget_items").delete().eq("budget_id", budgetId);

    // Insertar nuevos items
    const itemsToInsert = items.map((item, index) => ({
      budget_id: budgetId,
      item_number: item.item,
      description: item.descripcion,
      unit: item.unidad,
      quantity: item.cantidad,
      unit_price: item.precioUnitario,
      currency: item.moneda,
      applies_vat: item.aplicaIVA,
      item_order: index,
    }));

    const { error } = await supabase.from("budget_items").insert(itemsToInsert);

    if (error) throw error;
  };

  // Agregar item al presupuesto
  const addBudgetItem = async (itemData) => {
    if (!budget) return { success: false, error: "No hay presupuesto cargado" };

    const newItem = {
      id: Date.now().toString(), // Temporal, se reemplazará con UUID de la BD
      ...itemData,
      montoContrato: itemData.cantidad * itemData.precioUnitario,
    };

    const updatedBudget = {
      ...budget,
      items: [...budget.items, newItem],
    };

    const result = await saveBudget(updatedBudget);
    return result;
  };

  // Actualizar item
  const updateBudgetItem = async (itemId, itemData) => {
    if (!budget) return { success: false, error: "No hay presupuesto cargado" };

    const updatedItems = budget.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            ...itemData,
            montoContrato: itemData.cantidad * itemData.precioUnitario,
          }
        : item
    );

    const updatedBudget = {
      ...budget,
      items: updatedItems,
    };

    const result = await saveBudget(updatedBudget);
    return result;
  };

  // Eliminar item
  const deleteBudgetItem = async (itemId) => {
    if (!budget) return { success: false, error: "No hay presupuesto cargado" };

    const updatedItems = budget.items.filter((item) => item.id !== itemId);
    const updatedBudget = {
      ...budget,
      items: updatedItems,
    };

    const result = await saveBudget(updatedBudget);
    return result;
  };

  // Finalizar presupuesto
  const finalizeBudget = async () => {
    if (!budget) return { success: false, error: "No hay presupuesto cargado" };

    const updatedBudget = {
      ...budget,
      estado: "finalizado",
      fechaFinalizacion: new Date().toISOString(),
    };

    const result = await saveBudget(updatedBudget);
    return result;
  };

  // Reiniciar presupuesto
  const resetBudget = async () => {
    if (budget?.id) {
      // Eliminar de la base de datos
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budget.id);

      if (error) {
        console.error("Error deleting budget:", error);
      }
    }

    // Eliminar de localStorage
    localStorage.removeItem(`presupuesto_${selectedProject?.id}`);

    setBudget(null);
    setError(null);
  };

  // Fallback a localStorage
  const saveToLocalStorage = (budgetData) => {
    localStorage.setItem(
      `presupuesto_${selectedProject?.id}`,
      JSON.stringify(budgetData)
    );
    setBudget(budgetData);
  };

  // Cargar presupuesto cuando cambie el proyecto
  useEffect(() => {
    if (selectedProject?.id) {
      loadBudget();
    } else {
      setBudget(null);
    }
  }, [selectedProject?.id]);

  const value = {
    budget,
    loading,
    error,
    loadBudget,
    saveBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    finalizeBudget,
    resetBudget,
    refreshBudget: loadBudget,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
};
