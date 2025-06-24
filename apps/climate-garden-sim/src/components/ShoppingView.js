/**
 * Shopping View Component
 * Annual seed planning and strategic bulk purchasing
 */

import React, { useState } from 'react';
import ShoppingListPanel from './ShoppingListPanel';
import AnnualSeedPlanPanel from './AnnualSeedPlanPanel';
import VendorGroupPanel from './VendorGroupPanel';
import PurchaseWindowPanel from './PurchaseWindowPanel';
import ShoppingCardList from './ShoppingCardList';
import { generatePureShoppingRecommendations } from '../services/temporalShoppingService';
import { generateAnnualSeedPlan } from '../services/annualSeedPlanningService';
import { getPortfolioStrategies } from '../data/portfolioStrategies';
import { DURHAM_CONFIG } from '../config/durhamConfig';

const ShoppingView = ({ shoppingActions }) => {
  const [viewMode, setViewMode] = useState('annual'); // 'annual' or 'urgent'
  
  // Generate annual seed plan
  const portfolioStrategies = getPortfolioStrategies(DURHAM_CONFIG);
  const annualPlan = generateAnnualSeedPlan(portfolioStrategies.hedge, DURHAM_CONFIG);
  
  // Legacy urgent recommendations for comparison
  const allRecommendations = generatePureShoppingRecommendations() || [];
  const urgentShopping = allRecommendations.filter(item => 
    item.urgency === 'urgent' || item.daysUntilPlanting <= 30
  );

  return (
    <div className="shopping-view">
      <div className="view-header">
        <h2>🛒 Annual Seed Planning & Shopping</h2>
        <p className="view-subtitle">Strategic bulk purchasing optimized for your garden plan</p>
        
        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button 
            className={`mode-button ${viewMode === 'annual' ? 'active' : ''}`}
            onClick={() => setViewMode('annual')}
          >
            📋 Annual Plan
          </button>
          <button 
            className={`mode-button ${viewMode === 'urgent' ? 'active' : ''}`}
            onClick={() => setViewMode('urgent')}
          >
            ⚡ Urgent Only
          </button>
        </div>
      </div>

      {/* Current Shopping List - Always Visible */}
      <ShoppingListPanel 
        shoppingList={shoppingActions.shoppingList}
        totalCost={shoppingActions.getTotalCost()}
        onRemoveItem={shoppingActions.removeFromShoppingList}
        onClearList={shoppingActions.clearShoppingList}
      />

      {viewMode === 'annual' ? (
        <div className="annual-planning-mode">
          {/* Annual Summary */}
          <div className="annual-summary card">
            <div className="card-header">
              <h3>🎯 Complete Annual Plan</h3>
              <div className="summary-stats">
                <div className="stat">
                  <strong>${annualPlan.totalBudget}</strong>
                  <span>Total Budget</span>
                </div>
                <div className="stat">
                  <strong>{annualPlan.seedOrders.length}</strong>
                  <span>Seed Varieties</span>
                </div>
                <div className="stat">
                  <strong>{Object.keys(annualPlan.vendorGroups).length}</strong>
                  <span>Vendors</span>
                </div>
              </div>
            </div>
            <p className="plan-description">
              This plan covers your entire gardening year with strategic purchase timing, 
              vendor consolidation, and succession planting calculations.
            </p>
          </div>

          {/* Purchase Windows */}
          <div className="purchase-windows-section">
            <h3>📅 Strategic Purchase Timing</h3>
            <p className="section-description">
              Optimal timing windows for bulk purchases - buy seeds when selection is best, 
              not when you're under pressure!
            </p>
            <div className="purchase-windows-grid">
              {annualPlan.purchaseWindows.map((window, index) => (
                <PurchaseWindowPanel 
                  key={index}
                  window={window}
                  onAddToShoppingList={shoppingActions.addToShoppingList}
                  onMarkAsOwned={shoppingActions.markAsOwned}
                  getItemStatus={shoppingActions.getItemStatus}
                />
              ))}
            </div>
          </div>

          {/* Vendor Groups */}
          <div className="vendor-groups-section">
            <h3>🏪 Vendor Consolidation</h3>
            <p className="section-description">
              Group purchases by vendor to minimize shipping costs and take advantage of bulk pricing.
            </p>
            <div className="vendor-groups-grid">
              {Object.values(annualPlan.vendorGroups).map((vendor, index) => (
                <VendorGroupPanel 
                  key={index}
                  vendor={vendor}
                  onAddToShoppingList={shoppingActions.addToShoppingList}
                  onMarkAsOwned={shoppingActions.markAsOwned}
                  getItemStatus={shoppingActions.getItemStatus}
                />
              ))}
            </div>
          </div>

          {/* Complete Seed List */}
          <AnnualSeedPlanPanel 
            seedPlan={annualPlan}
            onAddToShoppingList={shoppingActions.addToShoppingList}
            onMarkAsOwned={shoppingActions.markAsOwned}
            getItemStatus={shoppingActions.getItemStatus}
          />
        </div>
      ) : (
        <div className="urgent-shopping-mode">
          {urgentShopping.length > 0 ? (
            <div className="urgent-shopping-section">
              <h3>⚡ Time-Sensitive Purchases</h3>
              <p className="section-description">Items that need immediate attention for upcoming deadlines</p>
              <ShoppingCardList 
                recommendations={urgentShopping}
                onAddToShoppingList={shoppingActions.addToShoppingList}
                onMarkAsOwned={shoppingActions.markAsOwned}
                onRejectItem={shoppingActions.rejectItem}
                getItemStatus={shoppingActions.getItemStatus}
              />
            </div>
          ) : (
            <div className="no-urgent-shopping card">
              <h3>✅ No Urgent Purchases</h3>
              <p>Great! You're ahead of the game. Consider using the Annual Plan to prepare for upcoming seasons.</p>
            </div>
          )}
        </div>
      )}

      <div className="shopping-help">
        <h4>💡 About Annual Seed Planning</h4>
        <ul>
          <li><strong>Winter Ordering</strong> - Best selection and pricing for most seeds</li>
          <li><strong>Vendor Grouping</strong> - Combine orders to meet shipping thresholds</li>
          <li><strong>Succession Planning</strong> - Calculates quantities for multiple plantings</li>
          <li><strong>Strategic Timing</strong> - Buy infrastructure when shipping conditions are optimal</li>
          <li><strong>Heat-Adapted Focus</strong> - Durham-specific varieties that actually work</li>
        </ul>
      </div>
    </div>
  );
};

export default ShoppingView;