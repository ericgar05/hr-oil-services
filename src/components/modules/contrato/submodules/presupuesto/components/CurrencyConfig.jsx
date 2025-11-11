// src/components/modules/contrato/submodules/presupuesto/components/CurrencyConfig.jsx
import React, { useState, useEffect } from "react";
import { useCurrency } from "../../../../../../contexts/CurrencyContext";
import "./CurrencyConfig.css";

const CurrencyConfig = () => {
  const {
    customRates,
    updateExchangeRate,
    resetToDefaultRates,
    getExchangeRate,
  } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates] = useState({
    EUR: 0.85844,
    BS: 36.5,
  });

  // Cargar tasas actuales cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setRates(customRates);
    }
  }, [isOpen, customRates]);

  const handleSave = () => {
    // Validar tasas
    if (rates.EUR <= 0 || rates.BS <= 0) {
      alert("Las tasas de cambio deben ser mayores a 0");
      return;
    }

    Object.entries(rates).forEach(([currency, rate]) => {
      updateExchangeRate(currency, rate);
    });
    setIsOpen(false);
    alert("✅ Tasas de cambio actualizadas correctamente");
  };

  const handleChange = (currency, value) => {
    const numericValue = parseFloat(value) || 0;
    setRates((prev) => ({
      ...prev,
      [currency]: numericValue,
    }));
  };

  const handleReset = () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas restablecer las tasas de cambio a los valores por defecto?"
      )
    ) {
      resetToDefaultRates();
      setIsOpen(false);
      alert("✅ Tasas restablecidas a valores por defecto");
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Restaurar valores originales
    setRates(customRates);
  };

  // Calcular tasas inversas para mostrar
  const inverseRates = {
    EUR: rates.EUR > 0 ? (1 / rates.EUR).toFixed(5) : 0,
    BS: rates.BS > 0 ? (1 / rates.BS).toFixed(4) : 0,
  };

  return (
    <div className="currency-config">
      <button
        className="config-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Configurar tasas de cambio"
      >
        💱 Tasas de Cambio
      </button>

      {isOpen && (
        <>
          <div className="currency-config-overlay" onClick={handleCancel} />
          <div className="currency-config-modal">
            <div className="config-header">
              <h4>Configurar Tasas de Cambio</h4>
              <button className="close-btn" onClick={handleCancel}>
                ×
              </button>
            </div>

            <div className="config-description">
              <p>Establece las tasas de cambio actuales:</p>
              <small>
                <strong>1 USD</strong> = ¿Cuánto en otras monedas?
              </small>
            </div>

            <div className="rate-inputs">
              {/* Euro */}
              <div className="rate-input-group">
                <div className="currency-header">
                  <span className="currency-flag">🇪🇺</span>
                  <strong>Euro (EUR)</strong>
                </div>
                <div className="input-row">
                  <label>1 USD =</label>
                  <input
                    type="number"
                    step="0.00001"
                    min="0.00001"
                    value={rates.EUR}
                    onChange={(e) => handleChange("EUR", e.target.value)}
                    placeholder="0.85844"
                  />
                  <span className="currency-symbol">EUR</span>
                </div>
                <div className="rate-info">
                  <small>Equivalente: 1 EUR = {inverseRates.EUR} USD</small>
                </div>
              </div>

              {/* Bolívar */}
              <div className="rate-input-group">
                <div className="currency-header">
                  <span className="currency-flag">🇻🇪</span>
                  <strong>Bolívar (BS)</strong>
                </div>
                <div className="input-row">
                  <label>1 USD =</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={rates.BS}
                    onChange={(e) => handleChange("BS", e.target.value)}
                    placeholder="36.5"
                  />
                  <span className="currency-symbol">BS</span>
                </div>
                <div className="rate-info">
                  <small>Equivalente: 1 BS = {inverseRates.BS} USD</small>
                </div>
              </div>
            </div>

            {/* Tasas actuales aplicadas */}
            <div className="current-rates">
              <h5>Tasas Actualmente Aplicadas:</h5>
              <div className="rates-grid">
                <div className="rate-display">
                  <span>USD → EUR:</span>
                  <span>1 USD = {customRates.EUR} EUR</span>
                </div>
                <div className="rate-display">
                  <span>USD → BS:</span>
                  <span>1 USD = {customRates.BS} BS</span>
                </div>
              </div>
            </div>

            <div className="config-actions">
              <button className="btn-primary" onClick={handleSave}>
                💾 Guardar Cambios
              </button>
              <button className="btn-reset" onClick={handleReset}>
                🔄 Valores por Defecto
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                ❌ Cancelar
              </button>
            </div>

            <div className="config-footer">
              <small>
                💡 <strong>Nota:</strong> Estas tasas se aplicarán a todos los
                cálculos de conversión en el sistema.
              </small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencyConfig;
