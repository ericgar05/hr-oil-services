import './SearchFilter.css'
import { SearchIcons } from '../../../assets/icons/Icons'


const SearchFilter = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="search-filter-project">
      <SearchIcons className="search-icon-project"/>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input-project"
        />
    </div>
  )
}

export default SearchFilter;