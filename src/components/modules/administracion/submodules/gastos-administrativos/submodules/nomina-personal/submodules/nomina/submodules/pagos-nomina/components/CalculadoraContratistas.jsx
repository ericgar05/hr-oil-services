import React, { useState, useEffect } from "react";
import supabase from "../../../../../../../../../../../../api/supaBase";
import { usePersonal } from "../../../../../../../../../../../../contexts/PersonalContext";
import { useNotification } from "../../../../../../../../../../../../contexts/NotificationContext";
import "./CalculadoraContratistas.css";

const CalculadoraContratistas = ({ projectId, fechaPago, tasaCambio, onGuardar, initialData }) => {
    const { showToast } = useNotification();
    const { getBancos, addBanco } = usePersonal();

    const [contratistas, setContratistas] = useState([]);
    const [loading, setLoading] = useState(false);

    // State to track personnel count per day per contractor.
    // Format: { [contractorId]: { sab: 5, dom: 5, lun: 5, ... } }
    const [diasTrabajados, setDiasTrabajados] = useState({});

    // Banks and Observations State
    const [listaBancos, setListaBancos] = useState([]);
    const [bancosPago, setBancosPago] = useState({});
    const [observaciones, setObservaciones] = useState({});

    // Modal state for adding new bank
    const [showBancoModal, setShowBancoModal] = useState(false);
    const [nuevoBanco, setNuevoBanco] = useState("");
    const [empleadoBancoPending, setEmpleadoBancoPending] = useState(null);

    // Days in order: S D L M M J V
    const daysOrder = ['sab', 'dom', 'lun', 'mar', 'mie', 'jue', 'vie'];
    const dayLabels = {
        sab: 'S', dom: 'D', lun: 'L', mar: 'M', mie: 'M', jue: 'J', vie: 'V'
    };

    // Load banks and contractors
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const bancos = await getBancos();
                setListaBancos(bancos || []);

                if (projectId) {
                    await fetchContratistas();
                }
            } catch (err) {
                console.error(err);
                showToast("Error iniciando datos", "error");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [projectId, getBancos]);

    // Populate form if editing
    useEffect(() => {
        if (initialData && initialData.pagos && contratistas.length > 0) {
            const newDias = { ...diasTrabajados };
            const newBancos = {};
            const newObs = {};

            initialData.pagos.forEach(p => {
                // Check if contractor still exists/is active implicitly by checking if key exists or just set it
                // We'll set it regardless, assuming historical data is valid
                if (p.contratista_id) {
                    newDias[p.contratista_id] = p.dias_trabajados_detalle || {};
                    newBancos[p.contratista_id] = p.banco_pago || "";
                    newObs[p.contratista_id] = p.observaciones || "";
                }
            });

            setDiasTrabajados(prev => ({ ...prev, ...newDias }));
            setBancosPago(newBancos);
            setObservaciones(newObs);

            // Note: date and rate are handled by parent state passed in as props
        }
    }, [initialData, contratistas]);

    const fetchContratistas = async () => {
        try {
            const { data, error } = await supabase
                .from("contratistas")
                .select("*")
                .eq("project_id", projectId)
                .eq("activo", true)
                .order("nombre_contratista");

            if (error) throw error;
            setContratistas(data || []);

            // Initialize count state
            const initialDias = {};
            (data || []).forEach(c => {
                initialDias[c.id] = {};
                daysOrder.forEach(day => {
                    initialDias[c.id][day] = 0;
                });
            });
            setDiasTrabajados(initialDias);

        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const handleBancoChange = (id, valor) => {
        if (valor === "Otro") {
            setEmpleadoBancoPending(id);
            setNuevoBanco("");
            setShowBancoModal(true);
        } else {
            setBancosPago(prev => ({ ...prev, [id]: valor }));
        }
    };

    const handleAddBanco = async () => {
        if (!nuevoBanco.trim()) return;
        try {
            const added = await addBanco(nuevoBanco.trim());
            setListaBancos(prev => [...prev, added].sort());
            if (empleadoBancoPending) {
                setBancosPago(prev => ({ ...prev, [empleadoBancoPending]: added }));
            }
            setShowBancoModal(false);
            setEmpleadoBancoPending(null);
            setNuevoBanco("");
        } catch (error) {
            showToast("Error agregando banco", "error");
        }
    };

    const handleObservacionChange = (id, valor) => {
        setObservaciones(prev => ({ ...prev, [id]: valor }));
    };

    const handleDayCheck = (id, day, isChecked, maxVal) => {
        setDiasTrabajados(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [day]: isChecked ? (maxVal || 1) : 0
            }
        }));
    };

    const handleDayChange = (id, day, value) => {
        const numValue = parseInt(value) || 0;
        setDiasTrabajados(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [day]: numValue
            }
        }));
    };

    const calculateTotalPersonnelDays = (id) => {
        const days = diasTrabajados[id];
        if (!days) return 0;
        return daysOrder.reduce((acc, day) => acc + (days[day] || 0), 0);
    };

    const calculateTotalUSD = (contratista) => {
        const totalPersonnelDays = calculateTotalPersonnelDays(contratista.id);
        return totalPersonnelDays * (parseFloat(contratista.monto_diario) || 0);
    };

    const calculateTotalBs = (totalUSD) => {
        return totalUSD * (parseFloat(tasaCambio) || 0);
    };

    const handleGuardar = async () => {
        if (!fechaPago || !tasaCambio) {
            showToast("Complete la fecha de pago y tasa de cambio", "warning");
            return;
        }

        const pagosDetalle = contratistas.map(c => {
            const diasC = diasTrabajados[c.id];
            const totalPersonnel = calculateTotalPersonnelDays(c.id);

            // Skip if 0 total personnel days?
            if (totalPersonnel === 0) return null;

            const totalUSD = calculateTotalUSD(c);
            const totalBs = calculateTotalBs(totalUSD);

            return {
                contratista_id: c.id,
                nombre_contratista: c.nombre_contratista,
                dias_trabajados_detalle: diasC, // Stores { sab: 5, dom: 3, ... }
                total_personal_dias: totalPersonnel,
                monto_diario: c.monto_diario,
                monto_total_usd: totalUSD,
                monto_total_bs: totalBs,
                banco_pago: bancosPago[c.id] || "",
                observaciones: observaciones[c.id] || ""
            };
        }).filter(p => p !== null);

        if (pagosDetalle.length === 0) {
            showToast("No hay datos para procesar", "warning");
            return;
        }

        const payload = {
            project_id: projectId,
            fecha_pago: fechaPago,
            tasa_cambio: parseFloat(tasaCambio),
            pagos: pagosDetalle
        };

        try {
            let error;
            if (initialData && initialData.id) {
                // Update existing record
                const { error: errorUpdate } = await supabase
                    .from("pagos_contratistas")
                    .update(payload)
                    .eq("id", initialData.id);
                error = errorUpdate;
            } else {
                // Insert new record
                const { error: errorInsert } = await supabase
                    .from("pagos_contratistas")
                    .insert([payload]);
                error = errorInsert;
            }

            if (error) throw error;

            showToast(initialData ? "Pago actualizado exitosamente" : "Pagos guardados exitosamente", "success");

            if (onGuardar) onGuardar();

            // Only reset if NOT editing (onGuardar usually handles navigating away or refreshing, but clean state is good)
            if (!initialData) {
                const initialDias = {};
                contratistas.forEach(c => {
                    initialDias[c.id] = {};
                    daysOrder.forEach(day => initialDias[c.id][day] = 0);
                });
                setDiasTrabajados(initialDias);
                setBancosPago({});
                setObservaciones({});
            }
        } catch (err) {
            console.error(err);
            showToast("Error al guardar pagos", "error");
        }
    };

    // Helper to render total row
    const totalGeneralUSD = contratistas.reduce((acc, c) => acc + calculateTotalUSD(c), 0);
    const totalGeneralBs = calculateTotalBs(totalGeneralUSD);

    if (loading) return <div className="loading-text">Cargando...</div>;

    return (
        <div className="calculadora-contratistas">
            <h3>Nómina de Contratistas</h3>

            <div className="table-responsive">
                <table className="contratistas-pay-table">
                    <thead>
                        <tr>
                            <th className="text-left">Contratista</th>
                            <th className="text-center">Personal por Día</th>
                            <th className="text-right">Monto Diario ($)</th>
                            <th className="text-right">Total ($)</th>
                            <th className="text-right">Total (Bs)</th>
                            <th className="text-left">Banco</th>
                            <th className="text-left">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contratistas.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div className="c-name">{c.nombre_contratista}</div>
                                    <div className="c-desc">{c.descripcion_trabajo}</div>
                                    <div className="c-meta">Max Personal: {c.cantidad_personal}</div>
                                </td>
                                <td>
                                    <div className="days-inputs">
                                        {daysOrder.map(day => {
                                            const currentVal = diasTrabajados[c.id]?.[day] || 0;
                                            const isChecked = currentVal > 0;
                                            return (
                                                <div key={day} className="day-input-group">
                                                    <span className="day-label">{dayLabels[day]}</span>
                                                    <div className="check-input-stack">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => handleDayCheck(c.id, day, e.target.checked, c.cantidad_personal)}
                                                            className="day-checkbox-small"
                                                        />
                                                        <input
                                                            type="number"
                                                            className={`day-number-input ${!isChecked ? 'dimmed' : ''}`}
                                                            value={isChecked ? currentVal : ''}
                                                            placeholder="0"
                                                            onChange={(e) => handleDayChange(c.id, day, e.target.value)}
                                                            min="0"
                                                            max={c.cantidad_personal || 999}
                                                            disabled={!isChecked}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td className="text-right">$ {parseFloat(c.monto_diario).toFixed(2)}</td>
                                <td className="text-right font-bold">$ {calculateTotalUSD(c).toFixed(2)}</td>
                                <td className="text-right font-bold">Bs {calculateTotalBs(calculateTotalUSD(c)).toFixed(2)}</td>
                                <td>
                                    <select
                                        className="banco-select"
                                        value={bancosPago[c.id] || ""}
                                        onChange={(e) => handleBancoChange(c.id, e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {listaBancos.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                        <option value="Otro">+ Nuevo Banco</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="observacion-input"
                                        placeholder="Observaciones..."
                                        value={observaciones[c.id] || ""}
                                        onChange={(e) => handleObservacionChange(c.id, e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="3" className="text-right label-total">TOTALES:</td>
                            <td className="text-right val-total">$ {totalGeneralUSD.toFixed(2)}</td>
                            <td className="text-right val-total">Bs {totalGeneralBs.toFixed(2)}</td>
                            <td colSpan="2"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="actions-footer">
                <button className="btn-save-pay" onClick={handleGuardar}>
                    {initialData ? "Actualizar Pagos" : "Guardar Pagos de Contratistas"}
                </button>
            </div>

            {/* Modal para agregar banco */}
            {showBancoModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Agregar Nuevo Banco</h4>
                        <input
                            type="text"
                            value={nuevoBanco}
                            onChange={(e) => setNuevoBanco(e.target.value)}
                            placeholder="Nombre del banco"
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button onClick={() => setShowBancoModal(false)}>Cancelar</button>
                            <button className="confirm-btn" onClick={handleAddBanco}>Agregar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalculadoraContratistas;
