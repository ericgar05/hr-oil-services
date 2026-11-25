import "./PlanningDayItem.css";

// Modern Lucide-style vector SVG icons (Homogenized with SemanasList and Valuaciones)
const IconClipboardCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <polyline points="9 14 11 16 15 11"></polyline>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const PlanningDayItem = ({ dia, onClick, payrollEstimated = 0 }) => {
  const dateObj = new Date(dia.fecha + "T00:00:00");
  const today = new Date();
  const isToday =
    today.getFullYear() === dateObj.getFullYear() &&
    today.getMonth() === dateObj.getMonth() &&
    today.getDate() === dateObj.getDate();

  const hasActivities = (dia.cantidad_actividades || 0) > 0;
  const montoPlanificado = parseFloat(dia.monto_planificado) || 0;
  const nominaVal = hasActivities ? (parseFloat(payrollEstimated) || 0) : 0;

  const weekdayStr = dateObj
    .toLocaleDateString("es-ES", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
  const dayNumber = dateObj.getDate();
  const monthStr = dateObj
    .toLocaleDateString("es-ES", { month: "short" })
    .replace(".", "")
    .toUpperCase();

  return (
    <div
      className={`planning-dia-item ${isToday ? "is-today" : ""} ${hasActivities ? "has-activities" : "no-activities"}`}
      onClick={() => onClick(dia)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick(dia);
        }
      }}
    >
      {/* Encabezado del Día */}
      <div className="dia-card-header">
        {isToday && <span className="dia-today-badge">HOY</span>}
        <span className="dia-card-weekday">{weekdayStr}</span>
        <span className="dia-card-num">{dayNumber}</span>
        <span className="dia-card-month">{monthStr}</span>
      </div>

      {/* Cuerpo de Indicadores Homogéneos */}
      <div className="dia-card-body">
        {/* Badge de Actividades */}
        <div className={`dia-activity-badge ${hasActivities ? "active" : "empty"}`}>
          <IconClipboardCheck />
          <span>
            {hasActivities
              ? `${dia.cantidad_actividades} ${dia.cantidad_actividades === 1 ? "actividad" : "actividades"}`
              : "0 actividades"}
          </span>
        </div>

        {/* Bloque Financiero Idéntico a Valuaciones y Semanas */}
        <div className="dia-financial-block">
          <div className="dia-cell">
            <span className="dia-cell-label">
              <IconTrendingUp />
              <span>Planificado</span>
            </span>
            <span
              className={`dia-cell-val ${hasActivities && montoPlanificado > 0 ? "highlight-green" : "muted"}`}
              title={`$${montoPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            >
              ${montoPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="dia-cell-divider" />

          <div className="dia-cell">
            <span className="dia-cell-label">
              <IconUsers />
              <span>Nómina Est.</span>
            </span>
            <span
              className={`dia-cell-val ${hasActivities && nominaVal > 0 ? "highlight-blue" : "muted"}`}
              title={`$${nominaVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            >
              ${nominaVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer de Acción */}
      <div className="dia-footer-action">
        <span>Ver Día</span>
        <IconArrowRight />
      </div>
    </div>
  );
};

export default PlanningDayItem;
