/**
 * Shopping View Component
 * Dedicated view for shopping list and purchase planning
 */

import React from 'react';
import ShoppingListPanel from './ShoppingListPanel';
import ShoppingCardList from './ShoppingCardList';
import { generatePureShoppingRecommendations } from '../services/temporalShoppingService';

const ShoppingView = ({ shoppingActions }) => {
  const allRecommendations = generatePureShoppingRecommendations() || [];
  
  const urgentShopping = allRecommendations.filter(item => 
    item.urgency === 'urgent' || item.daysUntilPlanting <= 30
  );
  
  const plannedShopping = allRecommendations.filter(item => 
    item.urgency !== 'urgent' && item.daysUntilPlanting > 30
  );

  return (
    <div className="shopping-view">
      <div className="view-header">
        <h2>🛒 Shopping & Purchases</h2>
        <p className="view-subtitle">Purchase planning connected to planting schedules</p>
      </div>

      {/* Current Shopping List */}
      <ShoppingListPanel 
        shoppingList={shoppingActions.shoppingList}
        totalCost={shoppingActions.getTotalCost()}
        onRemoveItem={shoppingActions.removeFromShoppingList}
        onClearList={shoppingActions.clearShoppingList}
      />

      {urgentShopping.length > 0 && (
        <div className="urgent-shopping-section">
          <h3>⚡ Time-Sensitive Purchases</h3>
          <p className="section-description">Buy these items soon to be ready for upcoming planting deadlines</p>
          <ShoppingCardList 
            recommendations={urgentShopping}
            onAddToShoppingList={shoppingActions.addToShoppingList}
            onMarkAsOwned={shoppingActions.markAsOwned}
            onRejectItem={shoppingActions.rejectItem}
            getItemStatus={shoppingActions.getItemStatus}
          />
        </div>
      )}

      {plannedShopping.length > 0 && (
        <div className="planned-shopping-section">
          <h3>📅 Future Planning</h3>
          <p className="section-description">Items to consider for upcoming seasons</p>
          <ShoppingCardList 
            recommendations={plannedShopping}
            onAddToShoppingList={shoppingActions.addToShoppingList}
            onMarkAsOwned={shoppingActions.markAsOwned}
            onRejectItem={shoppingActions.rejectItem}
            getItemStatus={shoppingActions.getItemStatus}
          />
        </div>
      )}

      {allRecommendations.length === 0 && (
        <div className="no-shopping">
          <p>✅ No shopping recommendations right now.</p>
          <p>Check your shopping list for previously added items.</p>
        </div>
      )}

      <div className="shopping-help">
        <h4>💡 About Shopping Recommendations</h4>
        <ul>
          <li><strong>Add to List</strong> - Add item to your shopping list</li>
          <li><strong>Have It</strong> - Mark that you already own this item</li>
          <li><strong>Not Now</strong> - Reject this recommendation</li>
          <li><strong>Timeline</strong> - See when you'll need each item for planting</li>
        </ul>
      </div>
    </div>
  );
};

export default ShoppingView;