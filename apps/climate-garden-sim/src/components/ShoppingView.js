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
  const [annualPlan, setAnnualPlan] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  
  // Generate annual seed plan (now async)
  React.useEffect(() => {
    const loadAnnualPlan = async () => {
      try {
        setIsLoadingPlan(true);
        const portfolioStrategies = getPortfolioStrategies(DURHAM_CONFIG);
        const plan = await generateAnnualSeedPlan(portfolioStrategies.hedge, DURHAM_CONFIG);
        setAnnualPlan(plan);
      } catch (error) {
        console.error('Error loading annual seed plan:', error);
        // Fallback to empty plan
        setAnnualPlan({
          seedOrders: [],
          infrastructure: [],
          supplies: [],
          totalBudget: 0,
          purchaseWindows: [],
          vendorGroups: {}
        });
      } finally {
        setIsLoadingPlan(false);
      }
    };
    
    loadAnnualPlan();
  }, []);
  
  // Legacy urgent recommendations for comparison
  const allRecommendations = generatePureShoppingRecommendations() || [];
  const urgentShopping = allRecommendations.filter(item => 
    item.urgency === 'urgent' || item.daysUntilPlanting <= 30
  );

  // Show loading state while plan is being generated
  if (isLoadingPlan || !annualPlan) {
    return (
      <div className="shopping-view">
        <div className="loading-state">
          <h2>🛒 Loading Annual Seed Plan...</h2>
          <p>Querying database for specific seed ordering recommendations...</p>
        </div>
      </div>
    );
  }

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

      {/* Ordering Timeline Guide */}
      <div className="ordering-timeline-guide card">
        <h4>📅 Durham Garden Ordering Timeline</h4>
        <div className="timeline-months">
          <div className="timeline-month">
            <h5>🗓️ December - January</h5>
            <ul>
              <li><strong>Primary Seed Orders</strong> - Best selection, early bird pricing</li>
              <li><strong>Hot Weather Varieties</strong> - Jericho lettuce, Space spinach, heat-tolerant crops</li>
              <li><strong>Johnny's Seeds & True Leaf Market</strong> - Main orders for reliability</li>
            </ul>
          </div>
          <div className="timeline-month">
            <h5>🗓️ February</h5>
            <ul>
              <li><strong>Seed Starting Supplies</strong> - Trays, heat mats, grow lights</li>
              <li><strong>Start Peppers & Slow Crops</strong> - 8-10 weeks before last frost</li>
              <li><strong>Final Seed Orders</strong> - Last chance for specialty varieties</li>
            </ul>
          </div>
          <div className="timeline-month">
            <h5>🗓️ March</h5>
            <ul>
              <li><strong>Bulk Soil Amendments</strong> - Compost (10 bags), organic fertilizer</li>
              <li><strong>Spring Infrastructure</strong> - Irrigation setup, row covers</li>
              <li><strong>Direct Sow Cool Crops</strong> - Lettuce, spinach, kale succession starts</li>
            </ul>
          </div>
          <div className="timeline-month">
            <h5>🗓️ April - May</h5>
            <ul>
              <li><strong>Mulch & Protection</strong> - Straw/leaf mulch, shade cloth setup</li>
              <li><strong>Last-Minute Needs</strong> - Replace failed seeds, summer varieties</li>
              <li><strong>Plant Out Warm Crops</strong> - After soil temps hit 65°F</li>
            </ul>
          </div>
        </div>
        <div className="timeline-key-tips">
          <h5>🎯 Key Durham-Specific Tips</h5>
          <ul>
            <li><strong>Clay Soil Focus</strong> - Round carrots (Paris Market), raised beds for drainage</li>
            <li><strong>Heat Adaptation</strong> - Only buy bolt-resistant lettuce/spinach varieties</li>
            <li><strong>Vendor Strategy</strong> - True Leaf Market for reliability, Johnny's for specialty</li>
            <li><strong>Succession Timing</strong> - Plant lettuce every 2 weeks March-April, resume August</li>
          </ul>
        </div>
      </div>

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