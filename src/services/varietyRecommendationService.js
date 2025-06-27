/**
 * Variety Recommendation Service
 * Provides simplified access to zone-specific variety recommendations
 */

import regionalVarietyRecommendations from './regionalVarietyRecommendations.js';

/**
 * Get the best variety recommendation for a plant with simplified output
 * @param {string} plantKey - Plant identifier
 * @param {Object} locationConfig - User's location configuration
 * @returns {Object|null} Simplified variety recommendation
 */
export const getBestVarietyRecommendation = async (plantKey, locationConfig) => {
  try {
    const bestVariety = await regionalVarietyRecommendations.getBestVarietyForZone(plantKey, locationConfig);
    
    if (!bestVariety) return null;

    return {
      plantKey,
      varietyName: bestVariety.varietyName,
      recommendation: bestVariety.recommendation,
      zoneSuitability: bestVariety.zoneSuitability,
      daysToMaturity: bestVariety.daysToMaturity,
      price: bestVariety.price,
      vendor: bestVariety.vendorName,
      isOrganic: bestVariety.isOrganic,
      isHeirloom: bestVariety.isHeirloom,
      zoneScore: bestVariety.zoneScore
    };
  } catch (error) {
    console.warn(`Failed to get variety recommendation for ${plantKey}:`, error);
    return null;
  }
};

/**
 * Get variety recommendations for multiple plants as a summary
 * @param {Array} plantKeys - Array of plant identifiers
 * @param {Object} locationConfig - User's location configuration
 * @returns {Object} Variety recommendations organized by plant
 */
export const getVarietyRecommendationSummary = async (plantKeys, locationConfig) => {
  if (!plantKeys || plantKeys.length === 0) return {};

  const recommendations = {};
  
  await Promise.all(
    plantKeys.map(async (plantKey) => {
      const variety = await getBestVarietyRecommendation(plantKey, locationConfig);
      if (variety) {
        recommendations[plantKey] = variety;
      }
    })
  );

  return recommendations;
};

/**
 * Get variety-enhanced crop recommendation text
 * @param {string} plantKey - Plant identifier
 * @param {Object} locationConfig - User's location configuration
 * @returns {string} Enhanced recommendation text with variety information
 */
export const getVarietyEnhancedRecommendation = async (plantKey, locationConfig) => {
  const variety = await getBestVarietyRecommendation(plantKey, locationConfig);
  
  if (!variety) {
    return `Plant ${plantKey} - variety recommendations unavailable`;
  }

  let text = `Plant ${variety.varietyName}`;
  
  if (variety.zoneSuitability === 'Excellent') {
    text += ` (perfect for Zone ${locationConfig.hardiness})`;
  } else if (variety.zoneSuitability === 'Good') {
    text += ` (good Zone ${locationConfig.hardiness} match)`;
  }

  if (variety.daysToMaturity) {
    text += ` - harvest in ${variety.daysToMaturity} days`;
  }

  if (variety.vendor && variety.price) {
    text += ` - available from ${variety.vendor} ($${variety.price})`;
  }

  return text;
};

/**
 * Check if a plant has good variety options for a zone
 * @param {string} plantKey - Plant identifier
 * @param {Object} locationConfig - User's location configuration
 * @returns {boolean} Whether plant has good variety options
 */
export const hasGoodVarietyOptions = async (plantKey, locationConfig) => {
  try {
    const varieties = await regionalVarietyRecommendations.getZoneSpecificVarieties(plantKey, locationConfig);
    return varieties.some(variety => variety.zoneScore >= 0.6);
  } catch (error) {
    console.warn(`Failed to check variety options for ${plantKey}:`, error);
    return false;
  }
};

/**
 * Get zone compatibility summary for all available varieties of a plant
 * @param {string} plantKey - Plant identifier
 * @param {Object} locationConfig - User's location configuration
 * @returns {Object} Zone compatibility summary
 */
export const getZoneCompatibilitySummary = async (plantKey, locationConfig) => {
  try {
    const varieties = await regionalVarietyRecommendations.getZoneSpecificVarieties(plantKey, locationConfig);
    
    if (varieties.length === 0) {
      return {
        plantKey,
        hasVarieties: false,
        averageCompatibility: 0,
        bestVariety: null,
        totalVarieties: 0
      };
    }

    const averageScore = varieties.reduce((sum, v) => sum + v.zoneScore, 0) / varieties.length;
    
    return {
      plantKey,
      hasVarieties: true,
      averageCompatibility: averageScore,
      bestVariety: varieties[0].varietyName,
      totalVarieties: varieties.length,
      excellentCount: varieties.filter(v => v.zoneSuitability === 'Excellent').length,
      goodCount: varieties.filter(v => v.zoneSuitability === 'Good').length
    };
  } catch (error) {
    console.warn(`Failed to get zone compatibility summary for ${plantKey}:`, error);
    return { plantKey, hasVarieties: false, averageCompatibility: 0 };
  }
};

const varietyRecommendationService = {
  getBestVarietyRecommendation,
  getVarietyRecommendationSummary,
  getVarietyEnhancedRecommendation,
  hasGoodVarietyOptions,
  getZoneCompatibilitySummary
};

export default varietyRecommendationService;