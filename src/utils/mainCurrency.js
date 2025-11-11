export const getMainCurrency = (budget) => {
  if (!budget?.items || budget.items.length === 0) return "USD";
  const currencies = budget.items.map((i) => i.moneda).filter(Boolean);
  if (currencies.length === 0) return "USD";
  const currencyCount = currencies.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(currencyCount).reduce((a, b) =>
    currencyCount[a] > currencyCount[b] ? a : b
  );
};
