/**
 * Purchase Window Panel Component
 * Displays strategic purchase timing windows with items grouped by optimal buying time
 */

import React, { useState } from 'react';

const PurchaseWindowPanel = ({ 
  window = { name: '', timing: '', description: '', items: [], totalCost: 0 }, 
  onAddToShoppingList = () => {}, 
  onMarkAsOwned = () => {}, 
  getItemStatus = () => 'unknown' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCurrentStatus = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    
    if (window.name.includes('Winter') && (currentMonth >= 12 || currentMonth <= 2)) {
      return 'active';
    } else if (window.name.includes('Spring') && currentMonth >= 3 && currentMonth <= 4) {
      return 'active';
    } else if (window.name.includes('Summer') && currentMonth >= 5 && currentMonth <= 6) {
      return 'active';
    }
    return 'upcoming';
  };

  const status = getCurrentStatus();

  const handleAddToShoppingList = (item) => {
    onAddToShoppingList({
      id: item.id,
      item: item.item || item.crop,
      price: item.totalCost || item.cost,
      category: item.category,
      quantity: item.packetsNeeded || 1,
      notes: item.notes || item.description
    });
  };

  const handleMarkAsOwned = (item) => {
    onMarkAsOwned(item.id);
  };

  return (
    <div className={`purchase-window-panel card status-${status}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="window-info">
          <h4 className="window-name">{window.name}</h4>
          <div className="window-timing">{window.timing}</div>
        </div>
        <div className="window-stats">
          <div className="window-cost">${window.totalCost}</div>
          <div className="window-count">{window.items.length} items</div>
          <div className={`status-indicator status-${status}`}>
            {status === 'active' ? '🟢 Now' : '🔵 Soon'}
          </div>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="window-description">
        {window.description}
      </div>

      {isExpanded && (
        <div className="window-items">
          {window.items.map((item, index) => (
            <div key={index} className="window-item">
              <div className="item-main">
                <div className="item-name">
                  {item.crop || item.item}
                  {item.variety && <span className="variety-info"> - {item.variety}</span>}
                </div>
                <div className="item-details">
                  {item.packetsNeeded && (
                    <span className="packet-info">{item.packetsNeeded} packets</span>
                  )}
                  {item.quantity && (
                    <span className="quantity-info">Qty: {item.quantity}</span>
                  )}
                  <span className="cost-info">${item.totalCost || item.cost}</span>
                </div>
                {item.notes && (
                  <div className="item-notes">{item.notes}</div>
                )}
              </div>
              <div className="item-actions">
                <button
                  className="action-button add-button"
                  onClick={() => handleAddToShoppingList(item)}
                  disabled={getItemStatus(item.id) === 'shopping'}
                >
                  {getItemStatus(item.id) === 'shopping' ? '✓ Added' : '+ Add'}
                </button>
                <button
                  className="action-button owned-button"
                  onClick={() => handleMarkAsOwned(item)}
                  disabled={getItemStatus(item.id) === 'owned'}
                >
                  {getItemStatus(item.id) === 'owned' ? '✓ Own' : 'Have It'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseWindowPanel;