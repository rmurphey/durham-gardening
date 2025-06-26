/**
 * Shopping Card List Component
 * Renders a list of shopping recommendations using PurchaseCard components
 */

import React from 'react';
import PurchaseCard from './PurchaseCard';

const ShoppingCardList = ({
  recommendations = [],
  onAddToShoppingList,
  onMarkAsOwned,
  onRejectItem,
  getItemStatus,
  title = "Shopping Recommendations",
  showTitle = false
}) => {
  const handleStateChange = (cardId, newState, data) => {
    // Find the recommendation this card represents
    const recommendation = recommendations.find(rec => rec.id === cardId);
    if (!recommendation) return;

    switch (newState) {
      case 'committed':
        if (data.action === 'add_to_cart') {
          onAddToShoppingList?.(recommendation);
        }
        break;
      case 'completed':
        if (data.action === 'mark_owned') {
          onMarkAsOwned?.(cardId);
        }
        break;
      case 'dismissed':
        onRejectItem?.(cardId);
        break;
      default:
        break;
    }
  };

  const getCardState = (recommendation) => {
    const status = getItemStatus?.(recommendation.id);
    switch (status) {
      case 'shopping': return 'committed';
      case 'owned': return 'completed';
      case 'rejected': return 'dismissed';
      default: return 'pending';
    }
  };

  const convertToCardProps = (recommendation) => {
    return {
      id: recommendation.id,
      item: recommendation.item,
      price: recommendation.price,
      vendor: recommendation.vendor,
      why: recommendation.why || recommendation.reason,
      plantingDate: recommendation.plantingDate || recommendation.plantingWindow,
      consequences: recommendation.consequences,
      urgency: recommendation.urgency || 'medium',
      state: getCardState(recommendation),
      onStateChange: handleStateChange,
      onAddToShoppingList,
      onMarkAsOwned
    };
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="shopping-card-list">
      {showTitle && (
        <h3 className="shopping-card-list__title">{title}</h3>
      )}
      <div className="shopping-card-list__cards">
        {recommendations.map((recommendation) => (
          <PurchaseCard
            key={recommendation.id}
            {...convertToCardProps(recommendation)}
          />
        ))}
      </div>
    </div>
  );
};

export default ShoppingCardList;