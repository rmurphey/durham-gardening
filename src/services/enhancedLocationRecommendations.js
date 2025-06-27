/**
 * Enhanced Location Recommendations with Database Integration
 * Combines static crop data with comprehensive database information
 */

import databaseService from './databaseService.js';

/**
 * Get enhanced crop recommendations with database growing tips and companion planting
 * @param {Object} locationConfig - User's location configuration
 * @returns {Object} Enhanced recommendations with database information
 */
export const getEnhancedLocationRecommendations = async (locationConfig) => {
  if (!locationConfig) {
    console.warn('Location configuration required for enhanced recommendations');
    return { crops: [], tips: [], companions: {} };
  }

  try {
    // Get zone-appropriate plants from database
    const databasePlants = await databaseService.getPlantsByZone(locationConfig.hardiness);
    
    // Get enhanced data for each plant
    const enhancedCrops = await Promise.all(
      databasePlants.slice(0, 10) // Limit to first 10 for performance
        .map(async (plant) => {
          const [enhancedData, growingTips, companions] = await Promise.all([
            databaseService.getEnhancedPlantData(plant.plantKey, locationConfig),
            databaseService.getGrowingTips(plant.plantKey, locationConfig),
            databaseService.getCompanionPlants(plant.plantKey)
          ]);

          return {
            ...plant,
            enhancedData,
            growingTips,
            companions,
            locationSuitability: calculateLocationSuitability(enhancedData, locationConfig)
          };
        })
    );

    // Filter and sort by location suitability
    const suitableCrops = enhancedCrops
      .filter(crop => crop.locationSuitability > 0.6)
      .sort((a, b) => b.locationSuitability - a.locationSuitability);

    return {
      crops: suitableCrops,
      summary: generateLocationSummary(suitableCrops, locationConfig),
      recommendations: generateSeasonalRecommendations(suitableCrops, locationConfig)
    };

  } catch (error) {
    console.warn('Enhanced recommendations failed, using fallback:', error);
    return { crops: [], tips: [], companions: {}, error: error.message };
  }
};

/**
 * Calculate how suitable a plant is for the specific location
 * @param {Object} plantData - Enhanced plant data
 * @param {Object} locationConfig - Location configuration
 * @returns {number} Suitability score (0-1)
 */
const calculateLocationSuitability = (plantData, locationConfig) => {
  if (!plantData || !locationConfig) return 0;

  let score = 0.5; // Base score

  // Zone compatibility (most important factor)
  const zoneNumber = parseFloat(locationConfig.hardiness.replace(/[ab]/, ''));
  if (plantData.zones) {
    const [minZone, maxZone] = plantData.zones.split('-').map(z => parseFloat(z));
    if (zoneNumber >= minZone && zoneNumber <= maxZone) {
      score += 0.3; // Strong zone match
    } else if (Math.abs(zoneNumber - minZone) <= 1 || Math.abs(zoneNumber - maxZone) <= 1) {
      score += 0.1; // Close zone match
    }
  }

  // Heat tolerance for warm climates
  if (locationConfig.heatDays > 90) {
    if (plantData.heat === 'excellent') score += 0.2;
    else if (plantData.heat === 'good') score += 0.1;
    else if (plantData.heat === 'poor') score -= 0.2;
  }

  // Drought tolerance for low rainfall areas
  if (locationConfig.avgRainfall < 40) {
    if (plantData.drought === 'excellent') score += 0.2;
    else if (plantData.drought === 'good') score += 0.1;
    else if (plantData.drought === 'poor') score -= 0.2;
  }

  // Winter hardiness for cold climates
  if (locationConfig.winterSeverity > 3) {
    if (plantData.minTemp && plantData.minTemp < -10) score += 0.1;
    if (plantData.category === 'coolSeason') score += 0.1;
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Generate a summary of location-specific recommendations
 * @param {Array} crops - Enhanced crop data
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Summary with key insights
 */
const generateLocationSummary = (crops, locationConfig) => {
  const heatTolerantCount = crops.filter(c => c.enhancedData?.heat === 'excellent').length;
  const droughtTolerantCount = crops.filter(c => c.enhancedData?.drought === 'excellent').length;
  const coolSeasonCount = crops.filter(c => c.category === 'coolSeason').length;

  return {
    totalSuitableCrops: crops.length,
    heatTolerantOptions: heatTolerantCount,
    droughtTolerantOptions: droughtTolerantCount,
    coolSeasonOptions: coolSeasonCount,
    topRecommendation: crops[0]?.name || 'No suitable crops found',
    locationChallenge: identifyLocationChallenge(locationConfig),
    bestStrategies: generateLocationStrategies(crops, locationConfig)
  };
};

/**
 * Identify the main gardening challenge for this location
 * @param {Object} locationConfig - Location configuration
 * @returns {string} Primary challenge
 */
const identifyLocationChallenge = (locationConfig) => {
  if (locationConfig.heatDays > 120) return 'Extreme heat management';
  if (locationConfig.avgRainfall < 30) return 'Water conservation';
  if (locationConfig.winterSeverity > 4) return 'Cold protection';
  if (locationConfig.heatDays > 90 && locationConfig.avgRainfall < 40) return 'Heat and drought stress';
  return 'Balanced growing conditions';
};

/**
 * Generate seasonal recommendations based on database and location
 * @param {Array} crops - Enhanced crop data
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Seasonal planting recommendations
 */
const generateSeasonalRecommendations = (crops, locationConfig) => {
  const currentMonth = new Date().getMonth() + 1;
  
  // Get crops suitable for current season
  const springCrops = crops.filter(c => isPlantingSeason(c, [3, 4, 5]));
  const summerCrops = crops.filter(c => isPlantingSeason(c, [6, 7, 8]));
  const fallCrops = crops.filter(c => isPlantingSeason(c, [9, 10, 11]));
  const winterCrops = crops.filter(c => isPlantingSeason(c, [12, 1, 2]));

  return {
    current: getCurrentSeasonRecommendations(currentMonth, crops),
    spring: springCrops.slice(0, 3),
    summer: summerCrops.slice(0, 3), 
    fall: fallCrops.slice(0, 3),
    winter: winterCrops.slice(0, 3),
    yearRound: crops.filter(c => c.enhancedData?.category === 'perennials').slice(0, 2)
  };
};

/**
 * Check if crop can be planted in given months
 * @param {Object} crop - Crop data
 * @param {Array} months - Array of month numbers
 * @returns {boolean} Whether crop can be planted in any of these months
 */
const isPlantingSeason = (crop, months) => {
  if (!crop.enhancedData?.plantingMonths) return false;
  
  const plantingMonths = crop.enhancedData.plantingMonths.temperate || [];
  return months.some(month => plantingMonths.includes(month));
};

/**
 * Get recommendations for current season
 * @param {number} currentMonth - Current month (1-12)
 * @param {Array} crops - Available crops
 * @returns {Object} Current season recommendations
 */
const getCurrentSeasonRecommendations = (currentMonth, crops) => {
  const currentSeasonCrops = crops.filter(c => isPlantingSeason(c, [currentMonth]));
  
  return {
    plantNow: currentSeasonCrops.slice(0, 3),
    prepareNext: getNextMonthPrep(currentMonth, crops),
    harvest: getHarvestReady(currentMonth, crops)
  };
};

/**
 * Get crops to prepare for next month
 * @param {number} currentMonth - Current month
 * @param {Array} crops - Available crops
 * @returns {Array} Crops to prepare for next month
 */
const getNextMonthPrep = (currentMonth, crops) => {
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  return crops.filter(c => isPlantingSeason(c, [nextMonth])).slice(0, 2);
};

/**
 * Get crops ready for harvest
 * @param {number} currentMonth - Current month
 * @param {Array} crops - Available crops
 * @returns {Array} Crops likely ready for harvest
 */
const getHarvestReady = (currentMonth, crops) => {
  // Simplified harvest calculation - could be enhanced with planting date tracking
  return crops.filter(c => {
    const harvestStart = c.enhancedData?.harvestStart || 2;
    const harvestDuration = c.enhancedData?.harvestDuration || 2;
    const potentialHarvestMonths = [];
    
    for (let i = 0; i < harvestDuration; i++) {
      const harvestMonth = ((harvestStart + i - 1) % 12) + 1;
      potentialHarvestMonths.push(harvestMonth);
    }
    
    return potentialHarvestMonths.includes(currentMonth);
  }).slice(0, 2);
};

/**
 * Generate location-specific gardening strategies
 * @param {Array} crops - Available crops
 * @param {Object} locationConfig - Location configuration
 * @returns {Array} Strategy recommendations
 */
const generateLocationStrategies = (crops, locationConfig) => {
  const strategies = [];
  
  if (locationConfig.heatDays > 100) {
    strategies.push('Focus on heat-tolerant varieties and afternoon shade');
  }
  
  if (locationConfig.avgRainfall < 35) {
    strategies.push('Implement water-wise gardening with drought-tolerant plants');
  }
  
  if (locationConfig.winterSeverity > 3) {
    strategies.push('Plan for season extension with cold protection');
  }
  
  const heatTolerantCrops = crops.filter(c => c.enhancedData?.heat === 'excellent');
  if (heatTolerantCrops.length > 5) {
    strategies.push('Consider heat-specialist crops for summer production');
  }
  
  return strategies.length > 0 ? strategies : ['Balanced approach with seasonal diversity'];
};

const enhancedLocationRecommendationsService = {
  getEnhancedLocationRecommendations,
  calculateLocationSuitability,
  generateLocationSummary
};

export default enhancedLocationRecommendationsService;