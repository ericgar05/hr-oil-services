import React from 'react'
import './SearchFilter.css'
import { SearchIcons } from '../../../assets/icons/Icons'


const SearchFilter = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="search-filter">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        />
      <button className="search-button" type = "submit">
        <SearchIcons className="search-icon"/>
        
      </button>
    </div>
  )
}

export default SearchFilter