/**
 * Purchase Card Component
 * Specialized card for purchase recommendations (seeds, tools, amendments)
 */

import React from 'react';
import Card from './Card';

const PurchaseCard = ({
  id,
  item,
  price,
  vendor,
  why,
  plantingDate,
  consequences,
  urgency = 'medium',
  state = 'pending',
  onStateChange,
  onAddToShoppingList,
  onMarkAsOwned,
  ...props
}) => {
  const getPurchaseActions = () => {
    const primaryAction = {
      id: 'add_to_cart',
      label: 'Add to Shopping List'
    };
    
    const secondaryActions = [
      {
        id: 'mark_owned',
        label: 'Have It',
        type: 'owned',
        targetState: 'completed'
      }
    ];
    
    return { primaryAction, secondaryActions };
  };
  
  const handleStateChange = (cardId, newState, data) => {
    // Handle purchase-specific state changes
    if (newState === 'committed' && data.action === 'add_to_cart') {
      onAddToShoppingList?.({
        id,
        item,
        price,
        vendor,
        plantingDate,
        category: 'Purchase'
      });
    } else if (newState === 'completed' && data.action === 'mark_owned') {
      onMarkAsOwned?.(id);
    }
    
    // Call parent state change handler
    onStateChange?.(cardId, newState, data);
  };
  
  const getTimeline = () => {
    if (plantingDate) {
      return `Needed for ${plantingDate}`;
    }
    return null;
  };
  
  const getExpandedContent = () => {
    return (
      <div>
        {vendor && (
          <div className="purchase-details">
            <strong>Recommended Vendor:</strong> {vendor}
          </div>
        )}
        {plantingDate && (
          <div className="purchase-details">
            <strong>Planting Window:</strong> {plantingDate}
          </div>
        )}
        <div className="purchase-details">
          <strong>Why we recommend this:</strong> {why || 'Essential for successful growing.'}
        </div>
      </div>
    );
  };
  
  const { primaryAction, secondaryActions } = getPurchaseActions();
  
  return (
    <Card
      id={id}
      type="purchase"
      state={state}
      priority={urgency}
      title={item}
      description={why}
      expandedContent={getExpandedContent()}
      icon="🛒"
      category="Purchase"
      timeline={getTimeline()}
      cost={price}
      consequences={consequences}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      onStateChange={handleStateChange}
      {...props}
    />
  );
};

export default PurchaseCard;