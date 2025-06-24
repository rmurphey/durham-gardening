/**
 * Simple Investment Panel Component
 * Clean, focused investment recommendations with temporal planting awareness
 */

import React, { useState } from 'react';
import { getTemporalContext } from '../services/temporalShoppingService';

const SimpleInvestmentPanel = ({ 
  recommendations = [], 
  onAddToShoppingList, 
  onMarkAsOwned, 
  onRejectItem, 
  getItemStatus 
}) => {
  const [showTiming, setShowTiming] = useState(true);
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'urgent': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '⏰';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const getStatusButton = (item) => {
    const status = getItemStatus(item.id);
    
    switch (status) {
      case 'shopping':
        return <span className="status-indicator shopping">✓ Added</span>;
      case 'owned':
        return <span className="status-indicator owned">✓ Have It</span>;
      case 'rejected':
        return <span className="status-indicator rejected">✗ Rejected</span>;
      default:
        return (
          <div className="action-buttons">
            <button 
              className="add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddToShoppingList(item);
              }}
            >
              Add to List
            </button>
            <button 
              className="owned-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsOwned(item.id);
              }}
            >
              Have It
            </button>
            <button 
              className="reject-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRejectItem(item.id);
              }}
            >
              Not Now
            </button>
          </div>
        );
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="simple-investment-panel">
        <h3>💰 Smart Investments</h3>
        <p>No urgent investments needed right now.</p>
      </div>
    );
  }

  return (
    <div className="simple-investment-panel">
      <div className="panel-header">
        <h3>💰 Smart Investments</h3>
        <div className="header-controls">
          <span className="item-count">{recommendations.length} items</span>
          <button 
            className={`timing-toggle ${showTiming ? 'active' : ''}`}
            onClick={() => setShowTiming(!showTiming)}
            title="Toggle planting timeline"
          >
            📅 Timeline
          </button>
        </div>
      </div>

      <div className="investment-list">
        {recommendations.map((item) => {
          const status = getItemStatus(item.id);
          
          return (
            <div 
              key={item.id} 
              className={`investment-item ${status} ${item.daysUntilPlanting <= 30 ? 'urgent-timing' : ''}`}
              data-category={item.category}
            >
              <div className="item-main">
                <div className="item-icon">
                  {getUrgencyIcon(item.urgency)}
                </div>
                <div className="item-content">
                  <div className="item-name">{item.item}</div>
                  <div className="item-reason">{item.why}</div>
                  
                  {showTiming && item.plantingDate && (
                    <div className="timing-info">
                      <div className="planting-timeline">
                        <span className="timeline-label">For:</span>
                        <span className="planting-date">{item.plantingDate}</span>
                        <span className="time-until">
                          ({getTemporalContext(item)} away)
                        </span>
                      </div>
                      {item.consequences && (
                        <div className="consequences">
                          <span className="warning-icon">⚠️</span>
                          {item.consequences}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="item-price">${item.price}</div>
              </div>
              
              <div className="item-actions">
                {getStatusButton(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleInvestmentPanel;