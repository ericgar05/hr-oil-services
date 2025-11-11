export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

export const calculateElapsedDays = (startDate) => {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const now = new Date();
  
  // Ignorar la hora y la zona horaria para comparar solo las fechas
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = nowUTC - startUTC;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays < 0 ? 0 : diffDays;
};

export const formatDate = (dateString, options) => {
  if (!dateString) return '';
  // Corrige el problema de la zona horaria al crear la fecha
  const date = new Date(dateString + 'T00:00:00');
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const formatOptions = options || defaultOptions;
  return date.toLocaleDateString('es-ES', formatOptions);
};
