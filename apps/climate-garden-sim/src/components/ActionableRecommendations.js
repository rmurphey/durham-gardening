/**
 * ActionableRecommendations Component
 * Displays specific, actionable recommendations with accept/reject functionality
 */

import React, { useState } from 'react';

const ActionableRecommendations = ({ recommendations = [], onAddToShoppingList }) => {
  const [acceptedItems, setAcceptedItems] = useState(new Set());
  const [rejectedItems, setRejectedItems] = useState(new Set());

  const handleAccept = (item) => {
    const newAccepted = new Set(acceptedItems);
    newAccepted.add(item.id);
    setAcceptedItems(newAccepted);
    
    const newRejected = new Set(rejectedItems);
    newRejected.delete(item.id);
    setRejectedItems(newRejected);

    // Add to shopping list
    if (onAddToShoppingList) {
      onAddToShoppingList({
        id: item.id,
        item: item.item,
        price: item.price,
        quantity: item.quantity,
        where: item.where,
        urgency: item.urgency,
        category: item.category,
        specifications: item.specifications
      });
    }
  };

  const handleReject = (item) => {
    const newRejected = new Set(rejectedItems);
    newRejected.add(item.id);
    setRejectedItems(newRejected);
    
    const newAccepted = new Set(acceptedItems);
    newAccepted.delete(item.id);
    setAcceptedItems(newAccepted);
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-medium';
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="actionable-recommendations">
        <p>No specific recommendations available at this time.</p>
      </div>
    );
  }

  return (
    <div className="actionable-recommendations">
      {recommendations.map((item) => {
        const isAccepted = acceptedItems.has(item.id);
        const isRejected = rejectedItems.has(item.id);
        
        return (
          <div 
            key={item.id} 
            className={`recommendation-item ${isAccepted ? 'accepted' : ''} ${isRejected ? 'rejected' : ''}`}
          >
            <div className="recommendation-header">
              <div className="item-info">
                <h4 className="item-name">{item.item}</h4>
                <div className="item-meta">
                  <span className="price">${item.price.toFixed(2)}</span>
                  <span className={`urgency ${getUrgencyClass(item.urgency)}`}>{item.urgency}</span>
                  <span className="category">{item.category}</span>
                </div>
              </div>
              <div className="action-buttons">
                <button 
                  className={`accept-btn ${isAccepted ? 'active' : ''}`}
                  onClick={() => handleAccept(item)}
                  disabled={isAccepted}
                >
                  {isAccepted ? '✓ Added' : 'Add to List'}
                </button>
                <button 
                  className={`reject-btn ${isRejected ? 'active' : ''}`}
                  onClick={() => handleReject(item)}
                  disabled={isRejected}
                >
                  {isRejected ? '✗ Rejected' : 'Not Now'}
                </button>
              </div>
            </div>
            
            <div className="recommendation-details">
              <div className="why-section">
                <strong>Why:</strong> {item.why}
              </div>
              
              <div className="timing-section">
                <strong>When:</strong> {item.timing}
              </div>
              
              <div className="where-section">
                <strong>Where:</strong> {item.where}
              </div>
              
              {item.specifications && (
                <div className="specs-section">
                  <strong>Details:</strong> {item.specifications}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {acceptedItems.size > 0 && (
        <div className="accepted-summary">
          <h4>Added to Shopping List ({acceptedItems.size} items)</h4>
          <div className="total-cost">
            Total: ${recommendations
              .filter(item => acceptedItems.has(item.id))
              .reduce((sum, item) => sum + item.price, 0)
              .toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionableRecommendations;