/**
 * Garden Calendar Generation Service
 * Creates month-by-month planting and care schedules
 */

import { 
  getClimateAdaptedCrops,
  isPlantingSeasonValid,
  isDirectSowingViable,
  getAlternativePlantingMethod
} from '../config.js';
import { getPortfolioStrategies } from '../data/portfolioStrategies.js';

/**
 * Get climate zone classification from location
 * @param {Object} locationConfig - Location configuration
 * @returns {string} Climate zone
 */
const getClimateZoneFromLocation = (locationConfig) => {
  if (!locationConfig) return 'temperate';
  
  const hardiness = parseInt(locationConfig.hardiness?.[0] || '7');
  if (hardiness <= 5) return 'cold';
  if (hardiness >= 9) return 'subtropical';
  return 'temperate';
};

/**
 * Generate comprehensive garden calendar
 * @param {string} summerScenario - Selected summer scenario
 * @param {string} winterScenario - Selected winter scenario  
 * @param {string} portfolioKey - Selected portfolio strategy
 * @param {Object} locationConfig - Location configuration
 * @param {Object} customPortfolio - Custom portfolio if applicable
 * @returns {Array} Array of monthly calendar entries
 */
export const generateGardenCalendar = (summerScenario, winterScenario, portfolioKey, locationConfig, customPortfolio = null) => {
  if (!locationConfig || !summerScenario || !winterScenario || !portfolioKey) {
    return [];
  }

  const portfolio = getPortfolioStrategies(locationConfig, customPortfolio)[portfolioKey];
  if (!portfolio) return [];

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const calendar = [];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get climate-adapted crops for this location and scenario
  const adaptedCrops = getClimateAdaptedCrops(locationConfig, summerScenario);
  const climateZone = getClimateZoneFromLocation(locationConfig);
  
  // Track existing plants (simulate some plants already growing)
  const existingPlants = {
    perennials: Object.keys(adaptedCrops.perennials || {}).slice(0, 3), // First 3 available perennials
    activeHarvests: currentMonth >= 10 || currentMonth <= 4 ? 
      Object.keys(adaptedCrops.coolSeason || {}).slice(0, 3) : 
      Object.keys(adaptedCrops.heatTolerant || {}).slice(0, 2)
  };
  
  // Generate dynamic calendar for next 12 months
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12;
    const monthNumber = monthIndex + 1;
    const month = months[monthIndex];
    const activities = [];
    
    // Generate planting activities based on adapted crops and portfolio
    Object.entries(portfolio).forEach(([cropType, percentage]) => {
      if (percentage < 10 || !adaptedCrops[cropType === 'heatSpecialists' ? 'heatTolerant' : cropType]) return;
      
      const categoryName = cropType === 'heatSpecialists' ? 'heatTolerant' : cropType;
      const crops = adaptedCrops[categoryName] || {};
      
      Object.entries(crops).forEach(([cropKey, crop]) => {
        if (!crop || !crop.plantingMonths) return;
        
        const plantingMonths = crop.plantingMonths[climateZone] || crop.plantingMonths.temperate || [];
        
        if (plantingMonths.includes(monthNumber)) {
          // Check if planting is still viable for this month
          const isPlantingValid = isPlantingSeasonValid(crop, monthNumber, locationConfig);
          const currentDate = new Date();
          currentDate.setMonth(monthIndex); // Set to the month we're checking
          const isDirectViable = isDirectSowingViable(crop, currentDate, locationConfig);
          
          if (isPlantingValid) {
            if (crop.transplantWeeks > 0) {
              activities.push({
                type: 'planting',
                crop: crop.displayName || cropKey,
                action: `Start ${crop.displayName || cropKey} transplants indoors`
              });
            } else if (isDirectViable) {
              activities.push({
                type: 'planting',
                crop: crop.displayName || cropKey,
                action: `Direct sow ${crop.displayName || cropKey}`
              });
            } else {
              const alternative = getAlternativePlantingMethod(crop, currentDate, locationConfig);
              if (alternative) {
                activities.push({
                  type: 'planting',
                  crop: crop.displayName || cropKey,
                  action: alternative
                });
              }
            }
          }
        }
        
        // Generate harvest activities
        const harvestStart = crop.harvestStart || [];
        const harvestDuration = crop.harvestDuration || 2;
        
        if (Array.isArray(harvestStart) && harvestStart.includes(monthNumber)) {
          activities.push({
            type: 'harvest',
            crop: crop.displayName || cropKey,
            action: `Begin harvesting ${crop.displayName || cropKey}`
          });
        }
      });
    });
    
    // Add care activities for existing plants
    existingPlants.perennials.forEach(perennial => {
      if (monthNumber === 3) {
        activities.push({
          type: 'care',
          crop: perennial,
          action: `Prune and fertilize ${perennial}`
        });
      }
      if (monthNumber === 11) {
        activities.push({
          type: 'care',
          crop: perennial,
          action: `Prepare ${perennial} for winter`
        });
      }
    });
    
    // Add seasonal care activities
    if (monthNumber === 4) {
      activities.push({
        type: 'care',
        crop: 'Garden',
        action: 'Prepare beds and add compost'
      });
    }
    if (monthNumber === 10) {
      activities.push({
        type: 'care',
        crop: 'Garden',
        action: 'Clean up and prepare for winter'
      });
    }
    
    // Sort activities by type (planting, care, harvest)
    activities.sort((a, b) => {
      const order = { planting: 1, care: 2, harvest: 3 };
      return order[a.type] - order[b.type];
    });
    
    calendar.push({
      month,
      monthNumber,
      activities: activities.slice(0, 8) // Limit to 8 activities per month
    });
  }
  
  return calendar;
};

/**
 * Get month emphasis for calendar display
 * @param {number} monthNumber - Month number (1-12)
 * @param {Object} locationConfig - Location configuration
 * @returns {string} Month emphasis description
 */
export const getMonthEmphasis = (monthNumber, locationConfig) => {
  const climateZone = getClimateZoneFromLocation(locationConfig);
  
  // Spring emphasis
  if (monthNumber >= 3 && monthNumber <= 5) {
    return climateZone === 'cold' ? 'Cold protection and indoor starts' : 'Active planting season';
  }
  
  // Summer emphasis  
  if (monthNumber >= 6 && monthNumber <= 8) {
    return climateZone === 'subtropical' ? 'Heat management and succession planting' : 'Peak growing season';
  }
  
  // Fall emphasis
  if (monthNumber >= 9 && monthNumber <= 11) {
    return 'Fall planting and harvest preservation';
  }
  
  // Winter emphasis
  return climateZone === 'cold' ? 'Planning and indoor growing' : 'Cool season crops';
};