/**
 * Durham Shopping List Component
 * Generates specific shopping lists for Durham, NC gardening
 */

import React, { useState } from 'react';
import { DURHAM_CROPS, DURHAM_CALENDAR } from '../config/durhamConfig.js';

const DurhamShoppingList = ({ portfolio, gardenSize = 100 }) => {
  const [selectedSeason, setSelectedSeason] = useState('spring');
  const [showDetails, setShowDetails] = useState(true);

  if (!portfolio) {
    return (
      <section className="shopping-list-section">
        <h2>🛒 Durham Shopping List</h2>
        <p>Select a portfolio strategy to generate your Durham-specific shopping list.</p>
      </section>
    );
  }

  // Get current date info for seasonal recommendations
  const currentMonth = new Date().getMonth() + 1;
  const isSpringPlanting = currentMonth >= 2 && currentMonth <= 4;
  const isSummerPlanting = currentMonth >= 5 && currentMonth <= 7;
  const isFallPlanting = currentMonth >= 8 && currentMonth <= 10;

  // Generate shopping list based on portfolio and season
  const generateShoppingList = () => {
    const shoppingList = [];
    const allCrops = { ...DURHAM_CROPS.heatLovers, ...DURHAM_CROPS.coolSeason, ...DURHAM_CROPS.perennials };

    Object.entries(portfolio).forEach(([cropType, percentage]) => {
      if (percentage < 5) return;

      // Map crop types to our Durham database
      let relevantCrops = {};
      if (cropType === 'heatSpecialists') {
        relevantCrops = DURHAM_CROPS.heatLovers;
      } else if (cropType === 'coolSeason') {
        relevantCrops = DURHAM_CROPS.coolSeason;
      } else if (cropType === 'perennials') {
        relevantCrops = DURHAM_CROPS.perennials;
      }

      Object.entries(relevantCrops).forEach(([cropKey, crop]) => {
        const cropAllocation = (gardenSize * percentage) / 100;
        
        // Check if crop is appropriate for selected season
        let inSeason = false;
        if (selectedSeason === 'spring' && (cropType === 'coolSeason' || cropKey === 'asparagus')) {
          inSeason = true;
        } else if (selectedSeason === 'summer' && cropType === 'heatSpecialists') {
          inSeason = true;
        } else if (selectedSeason === 'fall' && cropType === 'coolSeason') {
          inSeason = true;
        } else if (selectedSeason === 'all') {
          inSeason = true;
        }

        if (inSeason) {
          shoppingList.push({
            ...crop,
            cropKey,
            cropType,
            allocation: cropAllocation
          });
        }
      });
    });

    return shoppingList;
  };

  const shoppingList = generateShoppingList();
  
  // Calculate total estimated cost
  const totalCost = shoppingList.reduce((total, crop) => {
    const costStr = crop.shopping?.cost || '$3-4';
    const baseCost = parseFloat(costStr.split('$')[1]?.split('-')[0] || '3');
    return total + baseCost;
  }, 0);

  const getCurrentSeasonTips = () => {
    if (isSpringPlanting) return "🌱 Spring Planting Season - Time for cool crops and starting heat lovers indoors!";
    if (isSummerPlanting) return "☀️ Summer Planting - Heat lovers thrive, cool crops struggle in Durham heat.";
    if (isFallPlanting) return "🍂 Fall Planting - Perfect time for cool crops that will overwinter.";
    return "❄️ Winter Planning - Time to plan and order seeds for next season.";
  };

  return (
    <section className="shopping-list-section">
      <h2>🛒 Durham Garden Shopping List</h2>
      
      <div className="current-season-tip">
        {getCurrentSeasonTips()}
      </div>

      <div className="shopping-controls">
        <div className="season-selector">
          <label>Shopping for:</label>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="season-select"
          >
            <option value="spring">Spring Planting (Feb-Apr)</option>
            <option value="summer">Summer Planting (May-Jul)</option>
            <option value="fall">Fall Planting (Aug-Oct)</option>
            <option value="all">Complete Year</option>
          </select>
        </div>
        
        <label className="details-toggle">
          <input 
            type="checkbox" 
            checked={showDetails} 
            onChange={(e) => setShowDetails(e.target.checked)}
          />
          Show Durham-specific details
        </label>
      </div>

      <div className="shopping-summary">
        <div className="summary-stat">
          <strong>Garden Size:</strong> {gardenSize} sq ft
        </div>
        <div className="summary-stat">
          <strong>Crops for {selectedSeason}:</strong> {shoppingList.length}
        </div>
        <div className="summary-stat">
          <strong>Estimated Cost:</strong> ${totalCost.toFixed(0)}
        </div>
      </div>

      <div className="shopping-list">
        {shoppingList.map((crop, index) => (
          <div key={index} className={`shopping-item category-${crop.cropType}`}>
            <div className="item-header">
              <h4 className="crop-name">{crop.name}</h4>
              <span className="space-allocation">{crop.allocation.toFixed(0)} sq ft</span>
            </div>

            <div className="shopping-essentials">
              <div className="what-to-buy">
                <strong>What to buy:</strong> {crop.shopping?.seeds || crop.shopping?.transplants || crop.shopping?.slips || 'Seeds or transplants'}
              </div>
              <div className="cost">
                <strong>Cost:</strong> {crop.shopping?.cost || '$3-4'}
              </div>
              <div className="where">
                <strong>Where:</strong> {crop.shopping?.where || 'Local garden centers'}
              </div>
            </div>

            {showDetails && (
              <>
                <div className="durham-varieties">
                  <h5>Best Varieties for Durham:</h5>
                  <div className="varieties-grid">
                    {Object.entries(crop.varieties || {}).map(([variety, description]) => (
                      <div key={variety} className="variety-card">
                        <strong>{variety}</strong>
                        <p>{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="durham-timing">
                  <h5>Durham Planting Guide:</h5>
                  <div className="timing-details">
                    {crop.planting?.timing && (
                      <div><strong>When:</strong> {crop.planting.timing}</div>
                    )}
                    {crop.planting?.method && (
                      <div><strong>How:</strong> {crop.planting.method}</div>
                    )}
                    {crop.planting?.spacing && (
                      <div><strong>Spacing:</strong> {crop.planting.spacing}</div>
                    )}
                    {crop.harvest?.firstHarvest && (
                      <div><strong>First Harvest:</strong> {crop.harvest.firstHarvest}</div>
                    )}
                  </div>
                </div>

                {crop.harvest?.peakSeason && (
                  <div className="harvest-info">
                    <h5>Durham Harvest:</h5>
                    <div><strong>Peak Season:</strong> {crop.harvest.peakSeason}</div>
                    <div><strong>How Often:</strong> {crop.harvest.frequency}</div>
                    <div><strong>Expected Yield:</strong> {crop.harvest.yield}</div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {shoppingList.length === 0 && (
        <div className="no-crops">
          <p>No crops recommended for {selectedSeason} planting with your current portfolio.</p>
          <p>Try selecting a different season or adjusting your portfolio strategy.</p>
        </div>
      )}

      <div className="durham-tips">
        <h3>Durham Gardening Reminders:</h3>
        <ul>
          <li><strong>Clay Soil:</strong> Only work beds when soil crumbles, not when sticky</li>
          <li><strong>Summer Heat:</strong> Shade cloth and heavy mulching essential for success</li>
          <li><strong>Humidity:</strong> Good air circulation prevents disease problems</li>
          <li><strong>Timing:</strong> Last frost ~April 15, first frost ~November 15</li>
        </ul>
      </div>
    </section>
  );
};

export default DurhamShoppingList;