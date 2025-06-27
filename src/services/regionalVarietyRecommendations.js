/**
 * Regional Plant Variety Recommendations
 * Provides zone-specific cultivar recommendations based on climate compatibility
 */

import databaseService from './databaseService.js';

/**
 * Get zone-specific variety recommendations for a plant
 * @param {string} plantKey - Plant identifier (e.g., 'kale', 'tomato')
 * @param {Object} locationConfig - User's location configuration
 * @returns {Array} Variety recommendations with zone-specific guidance
 */
export const getZoneSpecificVarieties = async (plantKey, locationConfig) => {
  if (!plantKey || !locationConfig) {
    console.warn('Plant key and location config required for variety recommendations');
    return [];
  }

  try {
    await databaseService.waitForInitialization();
    
    // Get all varieties for this plant from database
    const plantVarieties = await databaseService.getPlantVarieties(plantKey);
    
    if (!plantVarieties || plantVarieties.length === 0) {
      // Fallback to static variety data if available
      return getStaticVarietyRecommendations(plantKey, locationConfig);
    }

    // Score and rank varieties by zone compatibility
    const scoredVarieties = plantVarieties.map(variety => ({
      ...variety,
      zoneScore: calculateZoneCompatibility(variety, locationConfig),
      climateScore: calculateClimateScore(variety, locationConfig),
      overallScore: 0 // Will be calculated below
    }));

    // Calculate overall scores and add recommendations
    scoredVarieties.forEach(variety => {
      variety.overallScore = (variety.zoneScore * 0.6) + (variety.climateScore * 0.4);
      variety.recommendation = generateVarietyRecommendation(variety, locationConfig);
      variety.zoneSuitability = getZoneSuitabilityText(variety.zoneScore);
    });

    // Sort by overall score and return top varieties
    return scoredVarieties
      .filter(variety => variety.overallScore > 0.4) // Only recommend suitable varieties
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5); // Top 5 varieties

  } catch (error) {
    console.warn(`Failed to get variety recommendations for ${plantKey}:`, error);
    return getStaticVarietyRecommendations(plantKey, locationConfig);
  }
};

/**
 * Get regional variety recommendations for multiple plants
 * @param {Array} plantKeys - Array of plant identifiers
 * @param {Object} locationConfig - User's location configuration
 * @returns {Object} Variety recommendations organized by plant
 */
export const getRegionalVarietyRecommendations = async (plantKeys, locationConfig) => {
  if (!plantKeys || plantKeys.length === 0) return {};

  const recommendations = {};
  
  // Get variety recommendations for each plant
  await Promise.all(
    plantKeys.map(async (plantKey) => {
      const varieties = await getZoneSpecificVarieties(plantKey, locationConfig);
      if (varieties.length > 0) {
        recommendations[plantKey] = varieties;
      }
    })
  );

  return recommendations;
};

/**
 * Get the best variety recommendation for a specific plant and location
 * @param {string} plantKey - Plant identifier
 * @param {Object} locationConfig - User's location configuration
 * @returns {Object|null} Best variety recommendation or null
 */
export const getBestVarietyForZone = async (plantKey, locationConfig) => {
  const varieties = await getZoneSpecificVarieties(plantKey, locationConfig);
  return varieties.length > 0 ? varieties[0] : null;
};

/**
 * Calculate zone compatibility score for a variety
 * @param {Object} variety - Variety data from database
 * @param {Object} locationConfig - Location configuration
 * @returns {number} Compatibility score (0-1)
 */
const calculateZoneCompatibility = (variety, locationConfig) => {
  if (!variety.minZone || !variety.maxZone || !locationConfig.hardiness) {
    return 0.5; // Default neutral score
  }

  const userZone = parseFloat(locationConfig.hardiness.replace(/[ab]/, ''));
  const minZone = parseFloat(variety.minZone.replace(/[ab]/, ''));
  const maxZone = parseFloat(variety.maxZone.replace(/[ab]/, ''));

  if (userZone >= minZone && userZone <= maxZone) {
    // Perfect zone match - higher score for center of range
    const rangeCenter = (minZone + maxZone) / 2;
    const distanceFromCenter = Math.abs(userZone - rangeCenter);
    const rangeSize = maxZone - minZone;
    
    if (rangeSize === 0) return 1.0; // Single zone variety
    
    // Score decreases as distance from center increases
    return Math.max(0.7, 1.0 - (distanceFromCenter / rangeSize) * 0.3);
  }

  // Outside zone range - check how close
  const distanceOutside = Math.min(
    Math.abs(userZone - minZone),
    Math.abs(userZone - maxZone)
  );

  if (distanceOutside <= 1) {
    return 0.4; // Close to zone range
  } else if (distanceOutside <= 2) {
    return 0.2; // Moderately outside range
  }

  return 0; // Too far outside recommended zones
};

/**
 * Calculate climate-specific score for a variety
 * @param {Object} variety - Variety data from database
 * @param {Object} locationConfig - Location configuration
 * @returns {number} Climate score (0-1)
 */
const calculateClimateScore = (variety, locationConfig) => {
  let score = 0.5; // Base score

  // Heat tolerance scoring
  if (locationConfig.heatDays > 90) {
    const heatTolerance = variety.heatTolerance || variety.heat_tolerance;
    if (heatTolerance === 'excellent') score += 0.3;
    else if (heatTolerance === 'good') score += 0.1;
    else if (heatTolerance === 'poor') score -= 0.2;
  }

  // Drought tolerance scoring
  if (locationConfig.avgRainfall < 40) {
    const droughtTolerance = variety.droughtTolerance || variety.drought_tolerance;
    if (droughtTolerance === 'excellent') score += 0.3;
    else if (droughtTolerance === 'good') score += 0.1;
    else if (droughtTolerance === 'poor') score -= 0.2;
  }

  // Cold tolerance for harsh winters
  if (locationConfig.winterSeverity > 3) {
    const minTemp = variety.minTemp || variety.min_temp_f;
    if (minTemp && minTemp < -10) score += 0.2;
  }

  return Math.max(0, Math.min(1, score));
};

/**
 * Generate zone-specific recommendation text for a variety
 * @param {Object} variety - Variety data
 * @param {Object} locationConfig - Location configuration
 * @returns {string} Recommendation text
 */
const generateVarietyRecommendation = (variety, locationConfig) => {
  const zone = locationConfig.hardiness;
  let recommendation = `Excellent choice for Zone ${zone}`;

  // Add specific benefits
  const benefits = [];
  
  if (variety.zoneScore >= 0.8) {
    benefits.push('perfect zone match');
  } else if (variety.zoneScore >= 0.6) {
    benefits.push('good zone compatibility');
  }

  const heatTolerance = variety.heatTolerance || variety.heat_tolerance;
  if (locationConfig.heatDays > 90 && heatTolerance === 'excellent') {
    benefits.push('excellent heat tolerance');
  }

  const droughtTolerance = variety.droughtTolerance || variety.drought_tolerance;
  if (locationConfig.avgRainfall < 40 && droughtTolerance === 'excellent') {
    benefits.push('drought resistant');
  }

  if (variety.daysToMaturity) {
    const maturityText = variety.daysToMaturity <= 60 ? 'quick-maturing' : 
                        variety.daysToMaturity <= 90 ? 'standard season' : 'long season';
    benefits.push(maturityText);
  }

  if (benefits.length > 0) {
    recommendation += ` - ${benefits.join(', ')}`;
  }

  return recommendation;
};

/**
 * Get zone suitability description
 * @param {number} zoneScore - Zone compatibility score
 * @returns {string} Suitability description
 */
const getZoneSuitabilityText = (zoneScore) => {
  if (zoneScore >= 0.8) return 'Excellent';
  if (zoneScore >= 0.6) return 'Good';
  if (zoneScore >= 0.4) return 'Fair';
  return 'Poor';
};

/**
 * Fallback to static variety recommendations when database unavailable
 * @param {string} plantKey - Plant identifier
 * @param {Object} locationConfig - Location configuration
 * @returns {Array} Static variety recommendations
 */
const getStaticVarietyRecommendations = (plantKey, locationConfig) => {
  console.log(`Using static variety fallback for ${plantKey}`);
  
  // Static variety knowledge for common plants
  const staticVarieties = {
    kale: [
      {
        varietyName: 'Red Russian Kale',
        zoneScore: 0.8,
        climateScore: 0.7,
        overallScore: 0.75,
        recommendation: `Heat-tolerant kale variety perfect for Zone ${locationConfig.hardiness}`,
        zoneSuitability: 'Good',
        daysToMaturity: 60,
        source: 'static'
      },
      {
        varietyName: 'Winterbor Kale',
        zoneScore: 0.9,
        climateScore: 0.6,
        overallScore: 0.78,
        recommendation: `Cold-hardy variety excellent for Zone ${locationConfig.hardiness} winters`,
        zoneSuitability: 'Excellent',
        daysToMaturity: 65,
        source: 'static'
      }
    ],
    lettuce: [
      {
        varietyName: 'Jericho Romaine',
        zoneScore: 0.8,
        climateScore: 0.8,
        overallScore: 0.8,
        recommendation: `Heat-tolerant romaine ideal for Zone ${locationConfig.hardiness}`,
        zoneSuitability: 'Good',
        daysToMaturity: 55,
        source: 'static'
      }
    ],
    tomato: [
      {
        varietyName: 'Cherokee Purple',
        zoneScore: 0.7,
        climateScore: 0.8,
        overallScore: 0.74,
        recommendation: `Heirloom variety with good heat tolerance for Zone ${locationConfig.hardiness}`,
        zoneSuitability: 'Good',
        daysToMaturity: 80,
        source: 'static'
      }
    ]
  };

  return staticVarieties[plantKey] || [];
};

const regionalVarietyRecommendations = {
  getZoneSpecificVarieties,
  getRegionalVarietyRecommendations,
  getBestVarietyForZone,
  calculateZoneCompatibility,
  calculateClimateScore
};

export default regionalVarietyRecommendations;