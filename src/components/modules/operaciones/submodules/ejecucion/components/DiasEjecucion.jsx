// components/ejecucion/DiasEjecucion.jsx
import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../../../api/supaBase';

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
    <div className="ejecucion-dias-wrapper">
      {/* Column Headers */}
      <div className="ejecucion-days-header-row">
        {weekDays.map(day => (
          <div key={day} className="day-column-header">{day}</div>
        ))}
      </div>

      <div className="ejecucion-dias-container">
        {daysGrid.map((dia, index) => {
          if (!dia) {
            return <div key={`placeholder-${index}`} className="ejecucion-dia-placeholder"></div>;
          }

          const isToday = new Date().toDateString() === new Date(dia.fecha + 'T00:00:00').toDateString();

          return (
            <div
              key={dia.id}
              className={`ejecucion-dia-item ${isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDia && onSelectDia(dia)}
              style={{
                borderColor: isToday ? 'var(--primary-color)' : '',
                backgroundColor: isToday ? '#f0f9ff' : ''
              }}
            >
              <div className="ejecucion-dia-header">
                <h4>
                  {new Date(dia.fecha + 'T00:00:00').getDate()}
                </h4>
                <span>
                  {new Date(dia.fecha + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                </span>
              </div>

              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>🔨 Actividades:</span>
                  <strong>{dia.cantidad_actividades || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>💰 Plan:</span>
                  <strong>${(dia.monto_planificado || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>✅ Ejec:</span>
                  <strong style={{ color: '#22c55e' }}>${(dia.monto_ejecutado || 0).toLocaleString()}</strong>
                </div>
                {(() => {
                  const diff = (dia.monto_planificado || 0) - (dia.monto_ejecutado || 0);
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '2px', paddingTop: '2px', borderTop: '1px dashed #e2e8f0' }}>
                      <span>📉 Pend:</span>
                      <strong style={{ color: diff > 0 ? '#f59e0b' : '#94a3b8' }}>${diff.toLocaleString()}</strong>
                    </div>
                  );
                })()}
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600', marginTop: 'auto' }}>
                Ver Ejecución →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiasEjecucion;
