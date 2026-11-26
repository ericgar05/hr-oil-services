// components/ejecucion/DiasEjecucion.jsx
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../../../api/supaBase';
import '../../planificacion/components/PlanningDayItem.css';

// Modern Lucide-style vector SVG icons (Homogenized with Planificación and Valuaciones)
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

const IconCheckCircle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const DiasEjecucion = ({ semanaId, onSelectDia, dias: externalDias, setDias: setExternalDias }) => {
  const [diasDeLaSemana, setDiasDeLaSemana] = useState(externalDias || []);
  const [loading, setLoading] = useState(false);

  const getDiasPorSemana = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('plan_dias')
      .select('*')
      .eq('semana_id', id)
      .order('fecha');

    if (error) {
      console.error('Error fetching días de ejecución:', error);
    } else {
      const list = data || [];
      setDiasDeLaSemana(list);
      if (setExternalDias) setExternalDias(list);
    }
    setLoading(false);
  }, [setExternalDias]);

  useEffect(() => {
    if (externalDias && externalDias.length > 0) {
      setDiasDeLaSemana(externalDias);
    } else {
      getDiasPorSemana(semanaId);
    }
  }, [semanaId, externalDias, getDiasPorSemana]);

  // Logic to align days to Monday
  const getDaysWithPlaceholders = () => {
    if (!diasDeLaSemana.length) return [];

    const firstDayDate = new Date(diasDeLaSemana[0].fecha + 'T00:00:00');
    let startDay = firstDayDate.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Convert to 0 = Monday, 6 = Sunday
    let normalizedStartDay = startDay === 0 ? 6 : startDay - 1;

    const placeholders = Array(normalizedStartDay).fill(null);
    return [...placeholders, ...diasDeLaSemana];
  };

  const daysGrid = getDaysWithPlaceholders();
  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  if (loading && diasDeLaSemana.length === 0) {
    return <div className="planning-no-content">Cargando días...</div>;
  }

  return (
    <div className="planning-dias-wrapper ejecucion-dias-wrapper">
      {/* Column Headers for Desktop Grid */}
      <div className="ejecucion-days-header-row">
        {weekDays.map(day => (
          <div key={day} className="day-column-header">{day}</div>
        ))}
      </div>

      <div className="planning-dias-container ejecucion-dias-container">
        {daysGrid.map((dia, index) => {
          if (!dia) {
            return <div key={`placeholder-${index}`} className="planning-dia-placeholder ejecucion-dia-placeholder"></div>;
          }

          const dateObj = new Date(dia.fecha + 'T00:00:00');
          const today = new Date();
          const isToday =
            today.getFullYear() === dateObj.getFullYear() &&
            today.getMonth() === dateObj.getMonth() &&
            today.getDate() === dateObj.getDate();

          const hasActivities = (dia.cantidad_actividades || 0) > 0;
          const montoPlanificado = parseFloat(dia.monto_planificado) || 0;
          const montoEjecutado = parseFloat(dia.monto_ejecutado) || 0;
          const diff = Math.max(0, montoPlanificado - montoEjecutado);

          const weekdayStr = dateObj
            .toLocaleDateString('es-ES', { weekday: 'short' })
            .replace('.', '')
            .toUpperCase();
          const dayNumber = dateObj.getDate();
          const monthStr = dateObj
            .toLocaleDateString('es-ES', { month: 'short' })
            .replace('.', '')
            .toUpperCase();

          return (
            <div
              key={dia.id}
              className={`planning-dia-item ejecucion-dia-item ${isToday ? 'is-today' : ''} ${hasActivities ? 'has-activities' : 'no-activities'}`}
              onClick={() => onSelectDia && onSelectDia(dia)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectDia && onSelectDia(dia);
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

              {/* Cuerpo de Indicadores */}
              <div className="dia-card-body">
                {/* Badge de Actividades */}
                <div className={`dia-activity-badge ${hasActivities ? 'active' : 'empty'}`}>
                  <IconClipboardCheck />
                  <span>
                    {hasActivities
                      ? `${dia.cantidad_actividades} ${dia.cantidad_actividades === 1 ? 'actividad' : 'actividades'}`
                      : '0 actividades'}
                  </span>
                </div>

                {/* Bloque Financiero Tri-Métrica para Ejecución */}
                <div className="dia-financial-block">
                  {/* Planificado */}
                  <div className="dia-cell">
                    <span className="dia-cell-label">
                      <IconTrendingUp />
                      <span>Planificado</span>
                    </span>
                    <span
                      className={`dia-cell-val ${hasActivities && montoPlanificado > 0 ? 'highlight-blue' : 'muted'}`}
                      title={`$${montoPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    >
                      ${montoPlanificado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="dia-cell-divider" />

                  {/* Ejecutado */}
                  <div className="dia-cell">
                    <span className="dia-cell-label">
                      <IconCheckCircle />
                      <span>Ejecutado</span>
                    </span>
                    <span
                      className={`dia-cell-val ${montoEjecutado > 0 ? 'highlight-green' : 'muted'}`}
                      title={`$${montoEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    >
                      ${montoEjecutado.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Pendiente si hay diferencia */}
                  {diff > 0 && (
                    <>
                      <div className="dia-cell-divider" />
                      <div className="dia-cell">
                        <span className="dia-cell-label">
                          <IconClock />
                          <span>Pendiente</span>
                        </span>
                        <span
                          className="dia-cell-val highlight-amber"
                          style={{ color: '#d97706' }}
                          title={`$${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        >
                          ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer de Acción */}
              <div className="dia-footer-action">
                <span>Ver Ejecución</span>
                <IconArrowRight />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiasEjecucion;
