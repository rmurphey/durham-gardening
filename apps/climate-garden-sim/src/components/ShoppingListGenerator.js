/**
 * ShoppingListGenerator Component
 * Generates specific shopping lists based on portfolio and garden size
 */

import React, { useState } from 'react';
import { getClimateAdaptedCrops } from '../config.js';

const ShoppingListGenerator = ({ portfolio, locationConfig, gardenSize = 100 }) => {
  const [selectedSeason, setSelectedSeason] = useState('spring');
  const [showVarieties, setShowVarieties] = useState(true);

  if (!portfolio || !locationConfig) {
    return (
      <section className="shopping-list-section">
        <h2>Shopping List Generator</h2>
        <p>Select a portfolio strategy to generate your shopping list.</p>
      </section>
    );
  }

  const adaptedCrops = getClimateAdaptedCrops(locationConfig, 'extreme');
  const shoppingList = [];

  // Calculate shopping needs based on portfolio allocation
  Object.entries(portfolio).forEach(([cropType, percentage]) => {
    if (percentage < 5) return; // Skip crops with minimal allocation

    const categoryName = cropType === 'heatSpecialists' ? 'heatTolerant' : cropType;
    const crops = adaptedCrops[categoryName] || {};

    Object.entries(crops).forEach(([cropKey, crop]) => {
      if (!crop || !crop.shoppingList) return;

      const cropAllocation = (gardenSize * percentage) / 100;
      const cropInfo = {
        name: crop.displayName || crop.name?.en || cropKey,
        category: categoryName,
        allocation: cropAllocation,
        ...crop.shoppingList,
        varieties: crop.varieties || {},
        durhamPlanting: crop.durhamPlanting || {},
        durhamSchedule: crop.durhamSchedule || {}
      };

      // Calculate quantity needed based on space allocation
      if (crop.shoppingList.quantityPer100sqft) {
        const baseQuantity = crop.shoppingList.quantityPer100sqft;
        const multiplier = cropAllocation / 100;
        cropInfo.quantityNeeded = Math.ceil(parseFloat(baseQuantity.split('-')[0]) * multiplier);
      }

      shoppingList.push(cropInfo);
    });
  });

  // Filter by season for planting timing
  const seasonalCrops = shoppingList.filter(crop => {
    if (selectedSeason === 'spring') {
      return crop.category === 'coolSeason' || 
             (crop.category === 'heatTolerant' && crop.durhamSchedule?.spring);
    } else if (selectedSeason === 'summer') {
      return crop.category === 'heatTolerant';
    } else if (selectedSeason === 'fall') {
      return crop.category === 'coolSeason' || crop.durhamSchedule?.fall;
    }
    return true;
  });

  const totalEstimatedCost = seasonalCrops.reduce((total, crop) => {
    const costRange = crop.cost || '$3-4 per packet';
    const baseCost = parseFloat(costRange.split('$')[1]?.split('-')[0] || '3');
    return total + (baseCost * (crop.quantityNeeded || 1));
  }, 0);

  return (
    <section className="shopping-list-section">
      <h2>🛒 Durham Garden Shopping List</h2>
      
      <div className="shopping-controls">
        <div className="season-selector">
          <label>Planting Season:</label>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="season-select"
          >
            <option value="spring">Spring Planting (Feb-Apr)</option>
            <option value="summer">Summer Planting (May-Jul)</option>
            <option value="fall">Fall Planting (Aug-Oct)</option>
            <option value="all">Year-Round</option>
          </select>
        </div>
        
        <label className="varieties-toggle">
          <input 
            type="checkbox" 
            checked={showVarieties} 
            onChange={(e) => setShowVarieties(e.target.checked)}
          />
          Show recommended varieties
        </label>
      </div>

      <div className="shopping-summary">
        <div className="summary-stat">
          <strong>Garden Size:</strong> {gardenSize} sq ft
        </div>
        <div className="summary-stat">
          <strong>Crops to Plant:</strong> {seasonalCrops.length} varieties
        </div>
        <div className="summary-stat">
          <strong>Estimated Cost:</strong> ${totalEstimatedCost.toFixed(0)}
        </div>
      </div>

      <div className="shopping-list">
        {seasonalCrops.map((crop, index) => (
          <div key={index} className={`shopping-item category-${crop.category}`}>
            <div className="item-header">
              <h4 className="crop-name">{crop.name}</h4>
              <span className="space-allocation">{crop.allocation.toFixed(0)} sq ft</span>
            </div>
            
            <div className="shopping-details">
              <div className="quantity-needed">
                <strong>Buy:</strong> {crop.quantityNeeded || 1} packets
              </div>
              <div className="seeds-info">
                <strong>Coverage:</strong> {crop.seeds}
              </div>
              <div className="cost-estimate">
                <strong>Cost:</strong> {crop.cost}
              </div>
            </div>

            {showVarieties && Object.keys(crop.varieties).length > 0 && (
              <div className="varieties-section">
                <h5>Recommended Varieties for Durham:</h5>
                <ul className="varieties-list">
                  {Object.entries(crop.varieties).map(([variety, description]) => (
                    <li key={variety} className="variety-item">
                      <strong>{variety}:</strong> {description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {crop.durhamPlanting && (
              <div className="planting-details">
                <h5>Durham Planting Guide:</h5>
                <div className="planting-specs">
                  <div><strong>Spacing:</strong> {crop.durhamPlanting.spacing}</div>
                  <div><strong>Seed Depth:</strong> {crop.durhamPlanting.seedDepth}</div>
                  <div><strong>Days to Harvest:</strong> {crop.durhamPlanting.daysToHarvest}</div>
                </div>
              </div>
            )}

            {crop.durhamSchedule && (
              <div className="schedule-info">
                <h5>Durham Timing:</h5>
                {Object.entries(crop.durhamSchedule).map(([season, timing]) => (
                  <div key={season} className="schedule-item">
                    <strong>{season.charAt(0).toUpperCase() + season.slice(1)}:</strong> {timing}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {seasonalCrops.length === 0 && (
        <div className="no-crops">
          <p>No crops recommended for {selectedSeason} planting with current portfolio.</p>
        </div>
      )}
    </section>
  );
};

export default ShoppingListGenerator;