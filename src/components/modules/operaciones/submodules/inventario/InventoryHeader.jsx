import './InventoryHeader.css';



function InventoryHeader({icon, tabs, activeTab, onTabChange}) {
    return (
        <div className="inventory-header-container">
            {/* Mobile View */}
            <div className="inventory-mobile-view">
                <label>Ver:</label>
                <select
                    value={activeTab}
                    onChange={(e) => onTabChange(e.target.value)}
                >
                    {tabs.map((tab) => (
                        <option key={tab.value} value={tab.value}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Desktop View */}
            <div className="inventory-desktop-view">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onTabChange(tab.value)}
                        className={activeTab === tab.value ? 'active' : ''}
                    >   
                        <div>{tab.icon}</div>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default InventoryHeader;