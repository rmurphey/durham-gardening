/**
 * Shopping List Panel Component
 * Displays and manages the shopping list with temporal planting awareness
 */

import React, { useState } from 'react';
import { getTemporalContext } from '../services/temporalShoppingService';

const ShoppingListPanel = ({ 
  shoppingList, 
  totalCost, 
  onRemoveItem, 
  onClearList 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (shoppingList.length === 0) {
    return (
      <div className="shopping-list-panel empty">
        <div className="panel-header">
          <h3>🛒 Shopping List</h3>
          <span className="item-count">Empty</span>
        </div>
        <p className="empty-message">Add recommendations to start your list</p>
      </div>
    );
  }

  return (
    <div className={`shopping-list-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>🛒 Shopping List</h3>
        <div className="header-info">
          <span className="item-count">{shoppingList.length} items</span>
          <span className="total-cost">${totalCost.toFixed(2)}</span>
          <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="shopping-list-content">
          <div className="shopping-items">
            {shoppingList.map((item) => (
              <div key={item.id} className={`shopping-item ${item.daysUntilPlanting <= 7 ? 'urgent-timing' : ''}`}>
                <div className="item-info">
                  <div className="item-name">{item.item}</div>
                  <div className="item-details">
                    <span className="price">${item.price.toFixed(2)}</span>
                    <span className={`urgency urgency-${item.urgency}`}>
                      {item.urgency}
                    </span>
                    {item.plantingDate && (
                      <span className="planting-info">
                        for {item.plantingDate}
                      </span>
                    )}
                  </div>
                  {item.daysUntilPlanting !== undefined && (
                    <div className="timing-reminder">
                      {item.daysUntilPlanting <= 7 
                        ? `⚡ Needed ${getTemporalContext(item)}`
                        : `📅 For planting in ${getTemporalContext(item)}`
                      }
                    </div>
                  )}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => onRemoveItem(item.id)}
                  title="Remove from list"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="shopping-actions">
            <button 
              className="clear-btn"
              onClick={onClearList}
            >
              Clear All ({shoppingList.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListPanel;