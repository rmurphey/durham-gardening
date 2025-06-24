/**
 * Durham Shopping List Component
 * Generates specific shopping lists for Durham, NC gardening
 */

import React, { useState } from 'react';
import { DURHAM_CROPS, DURHAM_CALENDAR } from '../config/durhamConfig.js';

const DurhamShoppingList = ({ portfolio, gardenSize = 100 }) => {
  // Determine current season based on date
  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'spring'; // Default to spring for winter months (planning ahead)
  };

  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
  const [showDetails, setShowDetails] = useState(true);
  const [gardenType, setGardenType] = useState('mixed'); // 'planters', 'raised-beds', 'mixed'
  const [planningHorizon, setPlanningHorizon] = useState('next-month'); // 'current', 'next-month', 'next-season', 'full-year'

  if (!portfolio) {
    return (
      <section className="card shopping-list-section">
        <div className="card-header">
          <h2 className="card-title">🛒 Durham Shopping List</h2>
          <p className="card-subtitle">Select a portfolio strategy to generate your Durham-specific shopping list.</p>
        </div>
      </section>
    );
  }

  // Get current date info for seasonal recommendations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const isSpringPlanting = currentMonth >= 2 && currentMonth <= 4;
  const isSummerPlanting = currentMonth >= 5 && currentMonth <= 7;
  const isFallPlanting = currentMonth >= 8 && currentMonth <= 10;

  // Helper function to determine raised bed/planter suitability
  const getGrowingInfo = (cropKey, crop) => {
    // Above-ground growing recommendations for Durham crops
    const growingRecommendations = {
      // Heat lovers
      okra: { 
        suitable: true, 
        planterSize: '20+ gallon planter or 2x2 ft raised bed section', 
        raisedBedSpacing: '18-24 inches apart',
        notes: 'Thrives in raised beds with good drainage, heat retention beneficial',
        planterSpacing: '1 plant per large planter'
      },
      hotPeppers: { 
        suitable: true, 
        planterSize: '5-10 gallon planter', 
        raisedBedSpacing: '12-18 inches apart',
        notes: 'Excellent in both planters and raised beds, easy to protect from weather',
        planterSpacing: '1 plant per medium planter'
      },
      sweetPotato: { 
        suitable: true, 
        planterSize: '20+ gallon planter or grow bag', 
        raisedBedSpacing: '12-18 inches apart, rows 3 feet',
        notes: 'Raised beds work well, planters need bush varieties like Centennial',
        planterSpacing: '1 plant per large planter'
      },
      
      // Cool season
      kale: { 
        suitable: true, 
        planterSize: '3-5 gallon planter', 
        raisedBedSpacing: '8-12 inches apart',
        notes: 'Perfect for both methods, easier pest control in raised systems',
        planterSpacing: '1-2 plants per planter'
      },
      lettuce: { 
        suitable: true, 
        planterSize: '1-3 gallon planter', 
        raisedBedSpacing: '4-6 inches apart',
        notes: 'Ideal for succession planting in both planters and raised beds',
        planterSpacing: '4-6 plants per planter'
      },
      
      // Perennials
      asparagus: { 
        suitable: true, 
        planterSize: 'Large raised bed preferred (not small planters)', 
        raisedBedSpacing: '18 inches apart, rows 4 feet',
        notes: 'Best in deep raised beds (12+ inches), needs permanent location',
        planterSpacing: 'Not suitable for small planters'
      }
    };

    return growingRecommendations[cropKey] || {
      suitable: true,
      planterSize: '5-10 gallon planter',
      raisedBedSpacing: 'Follow package spacing guidelines',
      notes: 'Most crops adapt well to raised beds and larger planters',
      planterSpacing: 'Follow spacing guidelines'
    };
  };

  // Helper function to filter crops based on garden type
  const isGrowingMethodSuitable = (cropKey, crop) => {
    if (gardenType === 'raised-beds') return true; // Raised beds support all crops
    if (gardenType === 'mixed') return true; // Mixed garden supports all with notes
    
    // Planters-only garden - check if suitable for small planters
    const growingInfo = getGrowingInfo(cropKey, crop);
    if (gardenType === 'planters') {
      // For planters-only, exclude crops that need large raised beds
      return !growingInfo.planterSpacing.includes('Not suitable');
    }
    
    return growingInfo.suitable;
  };

  // Helper function to determine if crop should be included based on planning horizon
  const isWithinPlanningHorizon = (crop, cropKey, cropType) => {
    const today = new Date();
    const currentMonthNum = today.getMonth() + 1; // 1-12
    const currentDayOfMonth = today.getDate();
    
    // Calculate planning window based on horizon
    let planningEndDate;
    if (planningHorizon === 'current') {
      // Only current planting window
      planningEndDate = new Date(today);
    } else if (planningHorizon === 'next-month') {
      // Next 30 days
      planningEndDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    } else if (planningHorizon === 'next-season') {
      // Next 3 months
      planningEndDate = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
    } else if (planningHorizon === 'full-year') {
      // Next 12 months
      planningEndDate = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000));
    }
    
    // Get all planting windows for this crop
    const plantingWindows = getCropPlantingWindows(crop, cropKey, cropType);
    
    // Check if any planting window falls within our planning horizon
    for (const window of plantingWindows) {
      // Check current year window
      const currentYearStart = new Date(today.getFullYear(), window.startMonth - 1, window.startDay);
      const currentYearEnd = new Date(today.getFullYear(), window.endMonth - 1, window.endDay);
      
      // For "current" planning horizon, only include if we're within or before the planting window
      if (planningHorizon === 'current') {
        // Include if today is before or during the planting window
        if (today <= currentYearEnd) {
          return true;
        }
      } else {
        // For future planning horizons, check if planting window starts within the planning period
        if (currentYearStart >= today && currentYearStart <= planningEndDate) {
          return true;
        }
        
        // Also check next year for longer planning horizons
        const nextYearStart = new Date(today.getFullYear() + 1, window.startMonth - 1, window.startDay);
        if (nextYearStart <= planningEndDate) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Helper function to extract planting windows from crop data
  const getCropPlantingWindows = (crop, cropKey, cropType) => {
    let plantingWindows = [];
    
    if (crop.planting?.timing) {
      const timing = crop.planting.timing.toLowerCase();
      
      // Parse different timing formats more comprehensively
      if (timing.includes('may 1-15')) {
        plantingWindows.push({ startMonth: 5, startDay: 1, endMonth: 5, endDay: 15 });
      } else if (timing.includes('may 15-30')) {
        plantingWindows.push({ startMonth: 5, startDay: 15, endMonth: 5, endDay: 30 });
      } else if (timing.includes('start seeds march 1') && timing.includes('transplant may 15')) {
        // For crops that need indoor starting, include both seed starting and transplant windows
        plantingWindows.push({ startMonth: 3, startDay: 1, endMonth: 5, endDay: 15 });
      }
      // Add more general pattern matching
      else {
        // Try to extract month ranges from the timing string
        const monthPatterns = {
          'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
          'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6,
          'july': 7, 'jul': 7, 'august': 8, 'aug': 8, 'september': 9, 'sep': 9,
          'october': 10, 'oct': 10, 'november': 11, 'nov': 11, 'december': 12, 'dec': 12
        };
        
        Object.entries(monthPatterns).forEach(([monthName, monthNum]) => {
          if (timing.includes(monthName)) {
            // Default window for detected month
            plantingWindows.push({ startMonth: monthNum, startDay: 1, endMonth: monthNum, endDay: 31 });
          }
        });
      }
    }
    
    // Handle cool season crops with spring/fall windows
    if (crop.planting?.spring) {
      const spring = crop.planting.spring;
      if (spring.includes('February 15 - March 15')) {
        plantingWindows.push({ startMonth: 2, startDay: 15, endMonth: 3, endDay: 15 });
      }
    }
    
    if (crop.planting?.fall) {
      const fall = crop.planting.fall;
      if (fall.includes('August 1 - September 1')) {
        plantingWindows.push({ startMonth: 8, startDay: 1, endMonth: 9, endDay: 1 });
      }
    }
    
    // For perennials like asparagus - plantable in spring
    if (cropType === 'perennials' && cropKey === 'asparagus') {
      plantingWindows.push({ startMonth: 3, startDay: 1, endMonth: 4, endDay: 30 });
    }
    
    // If no specific windows found, make reasonable assumptions based on crop type
    if (plantingWindows.length === 0) {
      if (cropType === 'heatSpecialists' || cropType === 'heatLovers') {
        // Heat lovers generally planted May-July
        plantingWindows.push({ startMonth: 5, startDay: 1, endMonth: 7, endDay: 31 });
      } else if (cropType === 'coolSeason') {
        // Cool season: spring (Feb-Apr) and fall (Aug-Oct)
        plantingWindows.push({ startMonth: 2, startDay: 1, endMonth: 4, endDay: 30 });
        plantingWindows.push({ startMonth: 8, startDay: 1, endMonth: 10, endDay: 31 });
      }
    }
    
    return plantingWindows;
  };

  // Generate action-oriented shopping list based on today's date
  const generateActionItems = () => {
    const today = new Date();
    const actionItems = {
      plantNow: [],      // Ready to plant this week
      buyNow: [],        // Need to buy now for upcoming planting
      succession: [],    // Succession planting opportunities
      prepare: []        // Prepare for future seasons
    };

    Object.entries(portfolio).forEach(([cropType, percentage]) => {
      if (percentage < 5) return;

      let relevantCrops = {};
      if (cropType === 'heatSpecialists') {
        relevantCrops = DURHAM_CROPS.heatLovers;
      } else if (cropType === 'coolSeason') {
        relevantCrops = DURHAM_CROPS.coolSeason;
      } else if (cropType === 'perennials') {
        relevantCrops = DURHAM_CROPS.perennials;
      }

      Object.entries(relevantCrops).forEach(([cropKey, crop]) => {
        if (!isGrowingMethodSuitable(cropKey, crop)) return;
        
        const cropAllocation = (gardenSize * percentage) / 100;
        const plantingWindows = getCropPlantingWindows(crop, cropKey, cropType);
        const baseItem = {
          ...crop,
          cropKey,
          cropType,
          allocation: cropAllocation,
          growingInfo: getGrowingInfo(cropKey, crop)
        };

        plantingWindows.forEach(window => {
          const windowStart = new Date(today.getFullYear(), window.startMonth - 1, window.startDay);
          const windowEnd = new Date(today.getFullYear(), window.endMonth - 1, window.endDay);
          const nextYearStart = new Date(today.getFullYear() + 1, window.startMonth - 1, window.startDay);
          
          const daysToStart = Math.ceil((windowStart - today) / (1000 * 60 * 60 * 24));
          const daysToEnd = Math.ceil((windowEnd - today) / (1000 * 60 * 60 * 24));
          const daysToNextYear = Math.ceil((nextYearStart - today) / (1000 * 60 * 60 * 1000));

          // PLANT NOW - Currently in planting window
          if (today >= windowStart && today <= windowEnd) {
            actionItems.plantNow.push({
              ...baseItem,
              action: 'Plant/Sow Now',
              urgency: daysToEnd <= 7 ? 'urgent' : 'normal',
              timeLeft: `${daysToEnd} days left in window`,
              timing: formatPlantingWindows([window])
            });
          }
          
          // BUY NOW - Planting window starts within 2-4 weeks
          else if (daysToStart > 0 && daysToStart <= 28) {
            actionItems.buyNow.push({
              ...baseItem,
              action: 'Buy Seeds/Plants Now',
              urgency: daysToStart <= 14 ? 'urgent' : 'normal', 
              timeLeft: `Plant in ${Math.ceil(daysToStart / 7)} weeks`,
              timing: formatPlantingWindows([window]),
              reason: crop.planting?.method?.includes('Start') ? 'Need time to start seeds indoors' : 'Prepare for planting window'
            });
          }
          
          // PREPARE - Next year's crops (buy seeds during sales)
          else if (daysToNextYear <= 180 && daysToNextYear > 28) {
            actionItems.prepare.push({
              ...baseItem,
              action: 'Order for Next Year',
              urgency: 'low',
              timeLeft: `${Math.ceil(daysToNextYear / 30)} months until planting`,
              timing: formatPlantingWindows([window]),
              reason: 'Buy seeds during winter sales'
            });
          }
        });

        // SUCCESSION PLANTING - Check if crop supports succession
        const successionCrops = {
          lettuce: { interval: 14, season: 'spring-fall', note: 'Continuous harvest' },
          kale: { interval: 21, season: 'spring-fall', note: 'Fresh leaves all season' },
          // Add more as needed
        };

        if (successionCrops[cropKey]) {
          const succession = successionCrops[cropKey];
          // Check if we're in the succession season
          const month = today.getMonth() + 1;
          let inSuccessionSeason = false;
          
          if (succession.season === 'spring-fall' && (month >= 3 && month <= 10)) {
            inSuccessionSeason = true;
          }
          
          if (inSuccessionSeason) {
            actionItems.succession.push({
              ...baseItem,
              action: 'Succession Plant',
              urgency: 'normal',
              timeLeft: `Every ${succession.interval} days`,
              note: succession.note,
              reason: `Plant every ${Math.ceil(succession.interval / 7)} weeks for continuous harvest`
            });
          }
        }
      });
    });

    // Sort each category by urgency and time
    const sortByUrgency = (a, b) => {
      if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
      if (b.urgency === 'urgent' && a.urgency !== 'urgent') return 1;
      return 0;
    };

    actionItems.plantNow.sort(sortByUrgency);
    actionItems.buyNow.sort(sortByUrgency);
    
    return actionItems;
  };

  const actionItems = generateActionItems();
  
  // Calculate total estimated cost from all action items
  const getAllActionItems = () => [
    ...actionItems.plantNow,
    ...actionItems.buyNow,
    ...actionItems.succession,
    ...actionItems.prepare
  ];
  
  const allItems = getAllActionItems();
  const totalCost = allItems.reduce((total, crop) => {
    const costStr = crop.shopping?.cost || '$3-4';
    const baseCost = parseFloat(costStr.split('$')[1]?.split('-')[0] || '3');
    const validCost = isFinite(baseCost) ? baseCost : 3;
    return total + validCost;
  }, 0);

  const getCurrentSeasonTips = () => {
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[currentMonth];
    
    if (currentMonth === 1) {
      return "❄️ January - Planning season! Order seeds and prepare for spring planting.";
    } else if (currentMonth === 2) {
      return "🌱 February - Start cool season crops like kale and lettuce mid-month.";
    } else if (currentMonth === 3) {
      return "🌱 March - Plant cool crops and start pepper/tomato seeds indoors.";
    } else if (currentMonth === 4) {
      return "🌿 April - Last chance for spring cool crops, prepare for summer planting.";
    } else if (currentMonth === 5) {
      return "☀️ May - Prime time for heat lovers! Plant okra, peppers, and sweet potatoes.";
    } else if (currentMonth === 6) {
      return "☀️ June - Continue summer planting, harvest spring crops before they bolt.";
    } else if (currentMonth === 7) {
      return "🔥 July - Focus on care and harvest, too hot for most new plantings.";
    } else if (currentMonth === 8) {
      return "🍂 August - Fall planting season begins! Time for cool crops again.";
    } else if (currentMonth === 9) {
      return "🍂 September - Last chance for fall plantings that will overwinter.";
    } else if (currentMonth === 10) {
      return "🍁 October - Harvest season, plant garlic and prepare winter garden.";
    } else if (currentMonth === 11) {
      return "🥬 November - Harvest hardy greens, clean up summer crops.";
    } else {
      return "❄️ December - Winter harvest and planning for next year.";
    }
  };

  // Helper function to format planting windows for display
  const formatPlantingWindows = (windows) => {
    if (!windows || windows.length === 0) return 'No specific timing available';
    
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return windows.map(window => {
      const startMonth = monthNames[window.startMonth];
      const endMonth = monthNames[window.endMonth];
      
      if (window.startMonth === window.endMonth) {
        return `${startMonth} ${window.startDay}-${window.endDay}`;
      } else {
        return `${startMonth} ${window.startDay} - ${endMonth} ${window.endDay}`;
      }
    }).join(', ');
  };

  // Helper function to render crop details
  const renderCropDetails = (crop) => {
    if (!showDetails) return null;
    
    return (
      <>
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

        {crop.growingInfo && (
          <div className="growing-info">
            <h5>Above-Ground Growing:</h5>
            <div className="growing-details">
              {(gardenType === 'planters' || gardenType === 'mixed') && (
                <>
                  <div><strong>Planter Size:</strong> {crop.growingInfo.planterSize}</div>
                  <div><strong>Planter Spacing:</strong> {crop.growingInfo.planterSpacing}</div>
                </>
              )}
              {(gardenType === 'raised-beds' || gardenType === 'mixed') && (
                <div><strong>Raised Bed Spacing:</strong> {crop.growingInfo.raisedBedSpacing}</div>
              )}
              <div className="growing-notes">
                <strong>Above-Ground Tips:</strong> {crop.growingInfo.notes}
              </div>
              {crop.growingInfo.planterSpacing.includes('Not suitable') && gardenType === 'planters' && (
                <div className="container-warning bg-warning">
                  <strong>⚠️ Better in raised beds:</strong> {crop.growingInfo.notes}
                </div>
              )}
            </div>
          </div>
        )}

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
            {crop.timing && (
              <div><strong>Plant/Start:</strong> {crop.timing}</div>
            )}
            {crop.planting?.timing && (
              <div><strong>Original Timing:</strong> {crop.planting.timing}</div>
            )}
            {crop.planting?.method && (
              <div><strong>How:</strong> {crop.planting.method}</div>
            )}
            {crop.planting?.spacing && (
              <div><strong>Traditional Spacing:</strong> {crop.planting.spacing}</div>
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
    );
  };

  return (
    <section className="card shopping-list-section">
      <div className="card-header">
        <h2 className="card-title">🛒 Durham Garden Shopping List</h2>
      </div>
      
      <div className="current-season-tip bg-primary-light">
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

        <div className="garden-type-selector">
          <label>Garden type:</label>
          <select 
            value={gardenType} 
            onChange={(e) => setGardenType(e.target.value)}
            className="garden-type-select"
          >
            <option value="mixed">Mixed (Raised Beds + Planters)</option>
            <option value="planters">Individual Planters Only</option>
            <option value="raised-beds">Above-Ground Beds Only</option>
          </select>
        </div>

        <div className="planning-horizon-selector">
          <label>Planning ahead:</label>
          <select 
            value={planningHorizon} 
            onChange={(e) => setPlanningHorizon(e.target.value)}
            className="planning-horizon-select"
          >
            <option value="current">Plant Now Only</option>
            <option value="next-month">Next 30 Days</option>
            <option value="next-season">Next 3 Months</option>
            <option value="full-year">Full Year Ahead</option>
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
          <strong>Action Items:</strong> {allItems.length}
        </div>
        <div className="summary-stat">
          <strong>Estimated Cost:</strong> ${isFinite(totalCost) ? totalCost.toFixed(0) : '0'}
        </div>
      </div>

      {/* PLANT NOW - Urgent actions */}
      {actionItems.plantNow.length > 0 && (
        <div className="action-section plant-now">
          <h3>🌱 Plant/Sow Now</h3>
          <div className="action-list">
            {actionItems.plantNow.map((item, index) => (
              <div key={index} className={`action-item category-${item.cropType} urgency-${item.urgency}`}>
                <div className="item-header">
                  <h4 className="crop-name">{item.name}</h4>
                  <span className="urgency-badge">{item.urgency === 'urgent' ? '⚠️ URGENT' : '📅 Normal'}</span>
                </div>
                <div className="action-info">
                  <div className="action-type">
                    <strong>{item.action}</strong>
                  </div>
                  <div className="time-left">
                    <strong>Time:</strong> {item.timeLeft}
                  </div>
                  <div className="timing">
                    <strong>Window:</strong> {item.timing}
                  </div>
                </div>
                {renderCropDetails(item)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* BUY NOW - Important purchases */}
      {actionItems.buyNow.length > 0 && (
        <div className="action-section buy-now">
          <h3>💰 Buy Seeds/Plants Now</h3>
          <div className="action-list">
            {actionItems.buyNow.map((item, index) => (
              <div key={index} className={`action-item category-${item.cropType} urgency-${item.urgency}`}>
                <div className="item-header">
                  <h4 className="crop-name">{item.name}</h4>
                  <span className="urgency-badge">{item.urgency === 'urgent' ? '⚠️ URGENT' : '📅 Normal'}</span>
                </div>
                <div className="action-info">
                  <div className="action-type">
                    <strong>{item.action}</strong>
                  </div>
                  <div className="time-left">
                    <strong>Timeline:</strong> {item.timeLeft}
                  </div>
                  <div className="reason">
                    <strong>Why:</strong> {item.reason}
                  </div>
                </div>
                {renderCropDetails(item)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* SUCCESSION PLANTING */}
      {actionItems.succession.length > 0 && (
        <div className="action-section succession">
          <h3>🔄 Succession Planting</h3>
          <div className="action-list">
            {actionItems.succession.map((item, index) => (
              <div key={index} className={`action-item category-${item.cropType}`}>
                <div className="item-header">
                  <h4 className="crop-name">{item.name}</h4>
                  <span className="succession-note">{item.note}</span>
                </div>
                <div className="action-info">
                  <div className="action-type">
                    <strong>{item.action}</strong>
                  </div>
                  <div className="frequency">
                    <strong>Frequency:</strong> {item.timeLeft}
                  </div>
                  <div className="reason">
                    <strong>Goal:</strong> {item.reason}
                  </div>
                </div>
                {renderCropDetails(item)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* PREPARE FOR FUTURE */}
      {actionItems.prepare.length > 0 && (
        <div className="action-section prepare">
          <h3>📋 Prepare for Future Seasons</h3>
          <div className="action-list">
            {actionItems.prepare.map((item, index) => (
              <div key={index} className={`action-item category-${item.cropType}`}>
                <div className="item-header">
                  <h4 className="crop-name">{item.name}</h4>
                  <span className="prepare-timing">{item.timeLeft}</span>
                </div>
                <div className="action-info">
                  <div className="action-type">
                    <strong>{item.action}</strong>
                  </div>
                  <div className="reason">
                    <strong>Why:</strong> {item.reason}
                  </div>
                </div>
                {renderCropDetails(item)}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* NO ACTIONS AVAILABLE */}
      {allItems.length === 0 && (
        <div className="no-actions">
          <p><strong>No immediate garden actions needed right now</strong> with your current portfolio and planning horizon.</p>
          <p>Try adjusting your portfolio strategy or extending your planning horizon to see upcoming opportunities.</p>
        </div>
      )}

      <div className="durham-tips">
        <h3>Durham Above-Ground Gardening Tips:</h3>
        <ul>
          <li><strong>Summer Heat:</strong> Shade cloth and heavy mulching essential for success</li>
          <li><strong>Humidity:</strong> Good air circulation prevents disease problems</li>
          <li><strong>Timing:</strong> Last frost ~April 15, first frost ~November 15</li>
          <li><strong>Drainage:</strong> Above-ground systems drain better than Durham clay soil</li>
          <li><strong>Soil Mix:</strong> Use quality potting mix or raised bed soil blend</li>
          <li><strong>Watering:</strong> Above-ground beds dry out faster, especially in Durham heat</li>
          {(gardenType === 'planters' || gardenType === 'mixed') && (
            <>
              <li><strong>Planter Drainage:</strong> Ensure all planters have drainage holes</li>
              <li><strong>Planter Mobility:</strong> Move planters to optimize sun/shade seasonally</li>
              <li><strong>Winter Protection:</strong> Move tender planters to sheltered locations</li>
            </>
          )}
          {(gardenType === 'raised-beds' || gardenType === 'mixed') && (
            <>
              <li><strong>Bed Depth:</strong> 12+ inches deep for most crops, 18+ for root vegetables</li>
              <li><strong>Bed Materials:</strong> Cedar or composite last longer in Durham humidity</li>
              <li><strong>Seasonal Cover:</strong> Row covers easier to install on raised beds</li>
            </>
          )}
        </ul>
      </div>
    </section>
  );
};

export default DurhamShoppingList;