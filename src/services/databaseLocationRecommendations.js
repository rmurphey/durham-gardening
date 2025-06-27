/**
 * Database-Integrated Location Recommendations
 * Enhances location-aware recommendations with database growing tips and companion planting
 */

import databaseService from './databaseService.js';
import regionalVarietyRecommendations from './regionalVarietyRecommendations.js';
import { GLOBAL_CROP_DATABASE } from '../config.js';

/**
 * Get location-appropriate plants from database with fallback to static data
 * @param {Object} locationConfig - User's location configuration
 * @returns {Array} Enhanced plant recommendations with database information
 */
export const getDatabaseLocationRecommendations = async (locationConfig) => {
  if (!locationConfig) {
    console.warn('Location configuration required for database recommendations');
    return getStaticFallbackRecommendations();
  }

  try {
    await databaseService.waitForInitialization();
    
    // Get zone-appropriate plants from database
    const databasePlants = await databaseService.getPlantsByZone(locationConfig.hardiness);
    
    if (!databasePlants || databasePlants.length === 0) {
      console.log('No database plants found, using static fallback');
      return getStaticFallbackRecommendations();
    }

    // Enhance each plant with database information
    const enhancedPlants = await Promise.all(
      databasePlants.map(async (plant) => {
        try {
          const [enhancedData, growingTips, companions, varieties] = await Promise.all([
            databaseService.getEnhancedPlantData(plant.plantKey, locationConfig),
            databaseService.getGrowingTips(plant.plantKey, locationConfig),
            databaseService.getCompanionPlants(plant.plantKey),
            regionalVarietyRecommendations.getZoneSpecificVarieties(plant.plantKey, locationConfig)
          ]);

          return {
            ...plant,
            enhancedData,
            growingTips: growingTips || [],
            companions: companions || { beneficial: [], antagonistic: [] },
            varieties: varieties || [],
            bestVariety: varieties && varieties.length > 0 ? varieties[0] : null,
            locationSuitability: calculateLocationSuitability(enhancedData || plant, locationConfig),
            databaseEnhanced: true
          };
        } catch (error) {
          console.warn(`Failed to enhance plant ${plant.plantKey}:`, error);
          // Return basic plant data if enhancement fails
          return {
            ...plant,
            growingTips: [],
            companions: { beneficial: [], antagonistic: [] },
            locationSuitability: 0.5,
            databaseEnhanced: false
          };
        }
      })
    );

    // Filter and sort by location suitability
    const suitablePlants = enhancedPlants
      .filter(plant => plant.locationSuitability > 0.4)
      .sort((a, b) => b.locationSuitability - a.locationSuitability);

    console.log(`Database integration: found ${suitablePlants.length} suitable plants for zone ${locationConfig.hardiness}`);
    
    return suitablePlants;

  } catch (error) {
    console.warn('Database integration failed, using static fallback:', error);
    return getStaticFallbackRecommendations();
  }
};

/**
 * Get crop recommendations organized by category with database enhancement
 * @param {Object} locationConfig - Location configuration 
 * @returns {Object} Organized crop recommendations by category
 */
export const getDatabaseCropRecommendations = async (locationConfig) => {
  const allPlants = await getDatabaseLocationRecommendations(locationConfig);
  
  // Organize by category similar to static data structure
  const organized = {
    heatSpecialists: [],
    coolSeason: [],
    perennials: [],
    database: true // Flag to indicate database enhancement
  };

  allPlants.forEach(plant => {
    const category = plant.category || 'heatSpecialists';
    
    if (category === 'heat_tolerant' || category === 'heatTolerant') {
      organized.heatSpecialists.push(plant);
    } else if (category === 'cool_season' || category === 'coolSeason') {
      organized.coolSeason.push(plant);
    } else if (category === 'perennials' || category === 'herbs') {
      organized.perennials.push(plant);
    } else {
      // Default to heat specialists for unknown categories
      organized.heatSpecialists.push(plant);
    }
  });

  return organized;
};

/**
 * Get growing tips for specific plants based on location
 * @param {Array} plantKeys - Array of plant keys to get tips for
 * @param {Object} locationConfig - Location configuration
 * @returns {Object} Growing tips organized by plant key
 */
export const getLocationGrowingTips = async (plantKeys, locationConfig) => {
  if (!plantKeys || plantKeys.length === 0) return {};

  try {
    await databaseService.waitForInitialization();
    
    const tipsPromises = plantKeys.map(async (plantKey) => {
      const tips = await databaseService.getGrowingTips(plantKey, locationConfig);
      return { [plantKey]: tips || [] };
    });

    const tipsResults = await Promise.all(tipsPromises);
    
    // Merge all tips into single object
    return tipsResults.reduce((acc, tipObj) => ({ ...acc, ...tipObj }), {});

  } catch (error) {
    console.warn('Failed to get growing tips from database:', error);
    return {};
  }
};

/**
 * Get companion planting information for specific plants
 * @param {Array} plantKeys - Array of plant keys to get companions for
 * @returns {Object} Companion information organized by plant key
 */
export const getCompanionPlantingInfo = async (plantKeys) => {
  if (!plantKeys || plantKeys.length === 0) return {};

  try {
    await databaseService.waitForInitialization();
    
    const companionPromises = plantKeys.map(async (plantKey) => {
      const companions = await databaseService.getCompanionPlants(plantKey);
      return { [plantKey]: companions || { beneficial: [], antagonistic: [] } };
    });

    const companionResults = await Promise.all(companionPromises);
    
    // Merge all companion info into single object
    return companionResults.reduce((acc, companionObj) => ({ ...acc, ...companionObj }), {});

  } catch (error) {
    console.warn('Failed to get companion planting info from database:', error);
    return {};
  }
};

/**
 * Calculate how suitable a plant is for the specific location
 * @param {Object} plantData - Plant data (from database or static)
 * @param {Object} locationConfig - Location configuration
 * @returns {number} Suitability score (0-1)
 */
const calculateLocationSuitability = (plantData, locationConfig) => {
  if (!plantData || !locationConfig) return 0.5;

  let score = 0.5; // Base score

  // Zone compatibility (most important factor)
  const zoneNumber = parseFloat(locationConfig.hardiness.replace(/[ab]/, ''));
  
  if (plantData.zones) {
    try {
      const zoneRange = plantData.zones.toString();
      const [minZone, maxZone] = zoneRange.split('-').map(z => parseFloat(z.replace(/[ab]/, '')));
      
      if (!isNaN(minZone) && !isNaN(maxZone)) {
        if (zoneNumber >= minZone && zoneNumber <= maxZone) {
          score += 0.3; // Strong zone match
        } else if (Math.abs(zoneNumber - minZone) <= 1 || Math.abs(zoneNumber - maxZone) <= 1) {
          score += 0.1; // Close zone match
        }
      }
    } catch (error) {
      console.warn('Error parsing zone data for', plantData.name, error);
    }
  }

  // Heat tolerance for warm climates
  if (locationConfig.heatDays > 90) {
    const heatTolerance = plantData.heat || plantData.heat_tolerance;
    if (heatTolerance === 'excellent') score += 0.2;
    else if (heatTolerance === 'good') score += 0.1;
    else if (heatTolerance === 'poor') score -= 0.2;
  }

  // Drought tolerance for low rainfall areas
  if (locationConfig.avgRainfall < 40) {
    const droughtTolerance = plantData.drought || plantData.drought_tolerance;
    if (droughtTolerance === 'excellent') score += 0.2;
    else if (droughtTolerance === 'good') score += 0.1;
    else if (droughtTolerance === 'poor') score -= 0.2;
  }

  // Winter hardiness for cold climates
  if (locationConfig.winterSeverity > 3) {
    const minTemp = plantData.minTemp || plantData.min_temp_f;
    if (minTemp && minTemp < -10) score += 0.1;
    
    const category = plantData.category;
    if (category === 'coolSeason' || category === 'cool_season') score += 0.1;
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Fallback to static data when database is unavailable
 * @returns {Array} Static plant recommendations
 */
const getStaticFallbackRecommendations = () => {
  console.log('Using static fallback data for plant recommendations');
  
  const staticPlants = [];
  
  // Convert static data to database-like format
  Object.entries(GLOBAL_CROP_DATABASE).forEach(([category, crops]) => {
    Object.entries(crops).forEach(([key, crop]) => {
      staticPlants.push({
        plantKey: key,
        name: crop.name?.en || crop.name || key,
        category: category,
        zones: crop.zones,
        minTemp: crop.minTemp,
        maxTemp: crop.maxTemp,
        heat: crop.heat,
        drought: crop.drought,
        plantingMonths: crop.plantingMonths,
        harvestStart: crop.harvestStart,
        harvestDuration: crop.harvestDuration,
        growingTips: [],
        companions: { beneficial: [], antagonistic: [] },
        locationSuitability: 0.7, // Default good suitability for static data
        databaseEnhanced: false
      });
    });
  });

  return staticPlants;
};

const databaseLocationRecommendations = {
  getDatabaseLocationRecommendations,
  getDatabaseCropRecommendations,
  getLocationGrowingTips,
  getCompanionPlantingInfo,
  calculateLocationSuitability
};

export default databaseLocationRecommendations;