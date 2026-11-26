// components/planificacion/SemanaDetail.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import supabase from "../../../../../../api/supaBase";
import { usePlanning } from "../../../../../../contexts/PlanningContext";
import { useAuth } from "../../../../../../contexts/AuthContext";
import { useBudget } from "../../../../../../contexts/BudgetContext";
import { DiasList } from "./DiasList";
import { RequerimientosForm } from "../../requerimientos/RequerimientosForm";
import RequerimientosGroupList from "../../requerimientos/RequerimientosGroupList";
import Modal from "../../../../../common/Modal/Modal";

// Iconos Vectoriales SVG Profesionales
const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export const SemanaDetail = ({ semana, onBack }) => {
  const { getSemanaById, recalcularMontoRequerimientosSemana, semanas, selectedDia } = usePlanning();
  const { user } = useAuth();
  const { budget: presupuestoData } = useBudget();
  const [activeTab, setActiveTab] = useState("dias"); // 'dias' | 'requerimientos'
  const [requerimientos, setRequerimientos] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [showReqForm, setShowReqForm] = useState(false);

  // Mantener datos de la semana sincronizados
  const currentSemana = useMemo(() => {
    return semanas?.find((s) => s.id === semana.id) || semana;
  }, [semanas, semana]);

  const planificado = currentSemana.monto_planificado || 0;
  const ejecutado = currentSemana.monto_ejecutado || 0;
  const montoReq = currentSemana.monto_requerimientos || 0;
  const disponible = planificado - montoReq;
  const porcentajeEjecucion = planificado > 0 ? (ejecutado / planificado) * 100 : 0;

  const getRequerimientosPorSemana = useCallback(async () => {
    if (!currentSemana.id) return;
    setLoadingReq(true);
    const { data, error } = await supabase
      .from("requerimientos")
      .select(
        `
        *,
        requerimiento_items (*)
      `,
      )
      .eq("semana_id", currentSemana.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requerimientos:", error);
    } else {
      setRequerimientos(data || []);
    }
    setLoadingReq(false);
  }, [currentSemana.id]);

  useEffect(() => {
    getRequerimientosPorSemana();
  }, [getRequerimientosPorSemana]);

  const handleCloseRequerimientosForm = async (refrescar) => {
    setShowReqForm(false);
    if (refrescar) {
      await getRequerimientosPorSemana();
      await recalcularMontoRequerimientosSemana(currentSemana.id);
      await getSemanaById(currentSemana.id);
    }
  };

  const handleDataChange = async () => {
    await getRequerimientosPorSemana();
    await recalcularMontoRequerimientosSemana(currentSemana.id);
    await getSemanaById(currentSemana.id);
  };

  const fechaInicioStr = currentSemana.fecha_inicio
    ? new Date(currentSemana.fecha_inicio + "T00:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const fechaFinStr = currentSemana.fecha_fin
    ? new Date(currentSemana.fecha_fin + "T00:00:00").toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="planning-detail-container">
      {/* Ficha Resumen de la Semana (Visible solo cuando se está en la vista general de la semana, no en el detalle del día) */}
      {!selectedDia && (
        <>
          <div className="header-top" style={{ marginBottom: "1rem", justifyContent: "flex-end" }}>
            <div className="header-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {activeTab === "requerimientos" && (
                <button
                  type="button"
                  onClick={() => setShowReqForm(true)}
                  className="btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem" }}
                >
                  <IconPlus /> Agregar Requerimiento
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "dias" ? "requerimientos" : "dias")}
                className={`btn-toggle-view ${activeTab === "requerimientos" ? "active" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                {activeTab === "dias" ? (
                  <>
                    <IconFileText /> Ver Requerimientos
                  </>
                ) : (
                  <>
                    <IconCalendar /> Ver Días de Trabajo
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="detail-info-card">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span className="tag-badge primary">SEMANA {currentSemana.numero_semana}</span>
              {presupuestoData?.contratoNumero && (
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Contrato Nº: <strong>{presupuestoData.contratoNumero}</strong>
                </span>
              )}
              <span
                className="tag-badge status status-success"
                style={{ marginLeft: "auto", fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
              >
                Avance: {Math.round(porcentajeEjecucion)}%
              </span>
            </div>

            <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "1.35rem", fontWeight: "800", color: "#0f172a" }}>
              CRONOGRAMA SEMANAL DE OPERACIONES
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1.25rem",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "0.85rem",
                marginBottom: "1rem"
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>
                  PERIODO DE TRABAJO
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <IconCalendar /> {fechaInicioStr} — {fechaFinStr}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>
                  ESTADO DEL CICLO
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>
                  {currentSemana.estado ? currentSemana.estado.toUpperCase() : "PLANIFICADA"}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "#64748b", fontWeight: "600", display: "block", marginBottom: "2px" }}>
                  REQUERIMIENTOS REGISTRADOS
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#d97706" }}>
                  {requerimientos.length} solicitudes
                </span>
              </div>
            </div>

            {/* Métricas Financieras de la Semana (4 Celdas) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "10px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "12px",
              }}
            >
              <div className="financial-mini-card">
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                  Planificado
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
                  ${planificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="financial-mini-card">
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                  Ejecutado
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: ejecutado > planificado ? "#dc2626" : "#16a34a", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
                  ${ejecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="financial-mini-card">
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                  Requerimientos
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#d97706", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
                  ${montoReq.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="financial-mini-card">
                <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>
                  Disponible
                </span>
                <div style={{ fontSize: "1.1rem", fontWeight: "700", color: disponible < 0 ? "#dc2626" : "#059669", marginTop: "2px", fontFamily: "ui-monospace, monospace" }}>
                  ${disponible.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contenido Dinámico */}
      <div className="planning-detail-content">
        {activeTab === "requerimientos" ? (
          <RequerimientosGroupList
            requerimientos={requerimientos}
            loading={loadingReq}
            onDataChange={handleDataChange}
            user={user}
          />
        ) : (
          <DiasList semanaId={currentSemana.id} />
        )}
      </div>

      {/* Modal Requerimientos */}
      <Modal
        isOpen={showReqForm}
        onClose={() => setShowReqForm(false)}
        title="Nuevo Requerimiento Semanal"
      >
        <RequerimientosForm
          semanaId={currentSemana.id}
          onSuccess={() => handleCloseRequerimientosForm(true)}
          onCancel={() => handleCloseRequerimientosForm(false)}
        />
      </Modal>
    </div>
  );
};

export default SemanaDetail;
