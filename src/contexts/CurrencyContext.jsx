// src/contexts/CurrencyContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency debe ser usado dentro de CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [customRates, setCustomRates] = useState({
    EUR: 0.85844,
    BS: 36.5,
  });

  // Cargar tasas guardadas al inicializar
  useEffect(() => {
    const savedRates = localStorage.getItem("currencyRates");
    if (savedRates) {
      setCustomRates(JSON.parse(savedRates));
    }
  }, []);

  const updateExchangeRate = (currency, rate) => {
    const newRates = {
      ...customRates,
      [currency]: rate,
    };
    setCustomRates(newRates);
    localStorage.setItem("currencyRates", JSON.stringify(newRates));
  };

  const resetToDefaultRates = () => {
    const defaultRates = {
      EUR: 0.85844,
      BS: 36.5,
    };
    setCustomRates(defaultRates);
    localStorage.setItem("currencyRates", JSON.stringify(defaultRates));
  };

  const convertToUSD = (amount, fromCurrency) => {
    if (fromCurrency === "USD") return amount;
    if (fromCurrency === "EUR") return amount / customRates.EUR;
    if (fromCurrency === "BS") return amount / customRates.BS;
    return amount;
  };

  const getExchangeRate = (fromCurrency, toCurrency = "USD") => {
    if (fromCurrency === toCurrency) return 1;
    if (toCurrency === "USD") {
      return fromCurrency === "EUR" ? 1 / customRates.EUR : 1 / customRates.BS;
    }
    // Para conversiones entre otras monedas
    const usdAmount = convertToUSD(1, fromCurrency);
    if (toCurrency === "EUR") return usdAmount * customRates.EUR;
    if (toCurrency === "BS") return usdAmount * customRates.BS;
    return 1;
  };

  const formatCurrency = (amount, currency) => {
    const formatter = new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const symbols = {
      USD: "$",
      EUR: "€",
      BS: "Bs",
    };

    return `${symbols[currency]} ${formatter.format(amount)}`;
  };

  const getTotalMonto = () => {
    return items.reduce((total, item) => total + item.montoContrato, 0);
  };

  // const formatCurrency = (amount, currency = "USD", options = {}) => {
  //   const defaultOptions = {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   };

  //   const currencyConfig = {
  //     USD: {
  //       symbol: "$",
  //       locale: "en-US",
  //       options: { ...defaultOptions, style: "currency", currency: "USD" },
  //     },
  //     EUR: {
  //       symbol: "€",
  //       locale: "de-DE",
  //       options: { ...defaultOptions, style: "currency", currency: "EUR" },
  //     },
  //     BS: {
  //       symbol: "Bs",
  //       locale: "es-VE",
  //       options: { ...defaultOptions, style: "currency", currency: "VES" },
  //     },
  //   };

  //   const config = currencyConfig[currency] || currencyConfig.USD;

  //   try {
  //     // Combinar opciones personalizadas con las predeterminadas
  //     const formatOptions = { ...config.options, ...options };

  //     // Si se pasa un estilo personalizado que no sea 'currency', ajustar la configuración
  //     if (options.style && options.style !== "currency") {
  //       formatOptions.currency = undefined;
  //     }

  //     return new Intl.NumberFormat(config.locale, formatOptions).format(amount);
  //   } catch (error) {
  //     // Fallback en caso de error
  //     console.error("Error formatting currency:", error);
  //     return `${config.symbol} ${amount.toFixed(2)}`;
  //   }
  // };

  const value = {
    customRates,
    updateExchangeRate,
    resetToDefaultRates,
    convertToUSD,
    getExchangeRate,
    formatCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
