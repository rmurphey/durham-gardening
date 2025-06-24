/**
 * Annual Seed Plan Panel Component
 * Displays complete annual seed plan with succession planting calculations
 */

import React, { useState } from 'react';

const AnnualSeedPlanPanel = ({ 
  seedPlan = { seedOrders: [], infrastructure: [], supplies: [] }, 
  onAddToShoppingList = () => {}, 
  onMarkAsOwned = () => {}, 
  getItemStatus = () => 'unknown' 
}) => {
  const [showCategory, setShowCategory] = useState('all');
  const [showOnlyNeeded, setShowOnlyNeeded] = useState(false);

  const categories = ['all', 'Seeds', 'Infrastructure', 'Supplies'];

  const getAllItems = () => {
    return [...seedPlan.seedOrders, ...seedPlan.infrastructure, ...seedPlan.supplies];
  };

  const getFilteredItems = () => {
    let items = getAllItems();
    
    if (showCategory !== 'all') {
      items = items.filter(item => item.category === showCategory);
    }
    
    if (showOnlyNeeded) {
      items = items.filter(item => 
        getItemStatus(item.id) !== 'added' && getItemStatus(item.id) !== 'owned'
      );
    }
    
    return items;
  };

  const handleAddToShoppingList = (item) => {
    onAddToShoppingList({
      id: item.id,
      item: item.item || item.crop,
      price: item.totalCost || item.cost,
      category: item.category,
      quantity: item.packetsNeeded || 1,
      notes: item.notes || item.description,
      vendor: item.vendor
    });
  };

  const handleMarkAsOwned = (item) => {
    onMarkAsOwned(item.id);
  };

  const handleAddAllNeeded = () => {
    const neededItems = getAllItems().filter(item => 
      getItemStatus(item.id) !== 'added' && getItemStatus(item.id) !== 'owned'
    );
    
    neededItems.forEach(item => handleAddToShoppingList(item));
  };

  const getItemStatusCounts = () => {
    const allItems = getAllItems();
    const added = allItems.filter(item => getItemStatus(item.id) === 'added').length;
    const owned = allItems.filter(item => getItemStatus(item.id) === 'owned').length;
    const needed = allItems.filter(item => 
      getItemStatus(item.id) !== 'added' && getItemStatus(item.id) !== 'owned'
    ).length;
    
    return { added, owned, needed, total: allItems.length };
  };

  const filteredItems = getFilteredItems();
  const statusCounts = getItemStatusCounts();

  return (
    <div className="annual-seed-plan-panel">
      <div className="plan-header card">
        <div className="card-header">
          <h3>🌱 Complete Annual Seed & Supply List</h3>
          <div className="plan-progress">
            <div className="progress-stats">
              <span className="stat owned">✓ {statusCounts.owned} Owned</span>
              <span className="stat added">📝 {statusCounts.added} Listed</span>
              <span className="stat needed">🛒 {statusCounts.needed} Needed</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-owned" 
                style={{ width: `${(statusCounts.owned / statusCounts.total) * 100}%` }}
              ></div>
              <div 
                className="progress-added" 
                style={{ 
                  width: `${(statusCounts.added / statusCounts.total) * 100}%`,
                  left: `${(statusCounts.owned / statusCounts.total) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="plan-filters">
          <div className="category-filter">
            <label>Category:</label>
            <select 
              value={showCategory} 
              onChange={(e) => setShowCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Items' : cat}
                </option>
              ))}
            </select>
          </div>
          
          <div className="needed-filter">
            <label>
              <input
                type="checkbox"
                checked={showOnlyNeeded}
                onChange={(e) => setShowOnlyNeeded(e.target.checked)}
              />
              Show only needed items
            </label>
          </div>

          {statusCounts.needed > 0 && (
            <button 
              className="add-all-needed-button"
              onClick={handleAddAllNeeded}
            >
              🛒 Add All Needed ({statusCounts.needed})
            </button>
          )}
        </div>
      </div>

      <div className="plan-items">
        {filteredItems.length === 0 ? (
          <div className="no-items card">
            <p>
              {showOnlyNeeded 
                ? "🎉 All set! You have everything you need." 
                : "No items match the current filters."
              }
            </p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, index) => (
              <div key={index} className={`plan-item card ${getItemStatus(item.id)}`}>
                <div className="item-header">
                  <div className="item-name">
                    {item.crop || item.item}
                    {item.variety && <span className="variety-info"> - {item.variety}</span>}
                  </div>
                  <div className="item-category">{item.category}</div>
                </div>

                <div className="item-details">
                  {item.packetsNeeded && (
                    <div className="detail-row">
                      <span className="detail-label">Packets:</span>
                      <span className="detail-value">{item.packetsNeeded}</span>
                    </div>
                  )}
                  {item.quantity && item.category !== 'Seeds' && (
                    <div className="detail-row">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{item.quantity}</span>
                    </div>
                  )}
                  {item.successionPlantings > 1 && (
                    <div className="detail-row">
                      <span className="detail-label">Successions:</span>
                      <span className="detail-value">{item.successionPlantings}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Cost:</span>
                    <span className="detail-value">${(item.totalCost || item.cost).toFixed(2)}</span>
                  </div>
                  {item.vendor && (
                    <div className="detail-row">
                      <span className="detail-label">Vendor:</span>
                      <span className="detail-value">{item.vendor}</span>
                    </div>
                  )}
                </div>

                {(item.notes || item.description) && (
                  <div className="item-notes">{item.notes || item.description}</div>
                )}

                {item.purchaseWindow && (
                  <div className="item-timing">
                    <span className="timing-label">Best time:</span>
                    <span className="timing-value">{item.purchaseWindow.timing}</span>
                  </div>
                )}

                <div className="item-actions">
                  <button
                    className="action-button add-button"
                    onClick={() => handleAddToShoppingList(item)}
                    disabled={getItemStatus(item.id) === 'added'}
                  >
                    {getItemStatus(item.id) === 'added' ? '✓ Added' : '+ Add to List'}
                  </button>
                  <button
                    className="action-button owned-button"
                    onClick={() => handleMarkAsOwned(item)}
                    disabled={getItemStatus(item.id) === 'owned'}
                  >
                    {getItemStatus(item.id) === 'owned' ? '✓ Own It' : 'Have It'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnualSeedPlanPanel;