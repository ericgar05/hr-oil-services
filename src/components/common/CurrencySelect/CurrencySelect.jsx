import React from 'react'
import './CurrencySelect.css'

const CurrencySelect = ({ value, onChange }) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
    { code: 'BS', symbol: 'Bs', name: 'Bolívar Soberano' },
    { code: 'EUR', symbol: '€', name: 'Euro' }
  ]

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="currency-select"
    >
      {currencies.map(currency => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} - {currency.name}
        </option>
      ))}
    </select>
  )
}

export default CurrencySelect