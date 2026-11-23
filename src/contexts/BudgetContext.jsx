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
          currency: data.currency || data.budget_items?.[0]?.currency || "USD",
          monedaPrincipal: data.currency || data.budget_items?.[0]?.currency || "USD",
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

  // Actualizar solo los datos principales del contrato (cabecera)
  const updateBudgetHeader = async (headerData) => {
    if (!budget?.id) return { success: false, error: "No hay presupuesto cargado" };
    setLoading(true);
    try {
      const updatePayload = {
        contract_number: headerData.contratoNumero,
        contract_name: headerData.nombreContrato,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("budgets")
        .update(updatePayload)
        .eq("id", budget.id);

      if (updateError) throw updateError;

      // Si se especificó propagar la moneda a todas las partidas existentes
      if (headerData.monedaPrincipal && headerData.propagateToItems && budget.items?.length > 0) {
        const { error: itemsError } = await supabase
          .from("budget_items")
          .update({ currency: headerData.monedaPrincipal })
          .eq("budget_id", budget.id);

        if (itemsError) throw itemsError;
      }

      await loadBudget();
      return { success: true };
    } catch (err) {
      console.error("Error actualizando cabecera del presupuesto:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
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

  // Guardar items del presupuesto (Upsert no destructivo que preserva UUIDs)
  const saveBudgetItems = async (budgetId, items) => {
    if (!items || items.length === 0) return;

    // 1. Obtener items existentes en la base de datos
    const { data: existingItems, error: fetchError } = await supabase
      .from("budget_items")
      .select("id")
      .eq("budget_id", budgetId);

    if (fetchError) throw fetchError;

    const existingIds = new Set((existingItems || []).map((i) => i.id));
    const incomingIds = new Set(
      items.filter((i) => i.id && existingIds.has(i.id)).map((i) => i.id)
    );

    // 2. Determinar items a eliminar (eliminados explícitamente por el usuario)
    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("budget_items")
        .delete()
        .in("id", idsToDelete);
      if (deleteError) throw deleteError;
    }

    // 3. Separar en items a actualizar e items a insertar
    const itemsToUpdate = [];
    const itemsToInsert = [];

    items.forEach((item, index) => {
      const payload = {
        budget_id: budgetId,
        item_number: item.item,
        description: item.descripcion,
        unit: item.unidad,
        quantity: item.cantidad,
        unit_price: item.precioUnitario,
        currency: item.moneda,
        applies_vat: item.aplicaIVA,
        item_order: index,
      };

      if (item.id && existingIds.has(item.id)) {
        itemsToUpdate.push({ id: item.id, ...payload });
      } else {
        itemsToInsert.push(payload);
      }
    });

    // 4. Actualizar existentes preservando su ID para no romper FK en valuaciones/operaciones
    for (const item of itemsToUpdate) {
      const { id, ...dataToUpdate } = item;
      const { error: updateError } = await supabase
        .from("budget_items")
        .update(dataToUpdate)
        .eq("id", id);
      if (updateError) throw updateError;
    }

    // 5. Insertar nuevos items
    if (itemsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("budget_items")
        .insert(itemsToInsert);
      if (insertError) throw insertError;
    }
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
    updateBudgetHeader,
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
