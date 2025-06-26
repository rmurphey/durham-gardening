/**
 * Climate scenario definitions for garden planning simulation
 * Contains summer and winter climate scenarios with probabilities and impacts
 */

// Base climate scenarios (location-independent)
export const BASE_CLIMATE_SCENARIOS = {
  summer: [
    { 
      id: 'mild', 
      name: 'Mild Summer', 
      temp: '85-95°F', 
      duration: 'Jun-Aug', 
      probability: 20, 
      impact: 'Traditional crops survive' 
    },
    { 
      id: 'normal', 
      name: 'Normal Heat', 
      temp: '95-100°F', 
      duration: 'Jun-Sep', 
      probability: 30, 
      impact: 'Heat-adapted strategy works' 
    },
    { 
      id: 'extreme', 
      name: 'Extreme Heat', 
      temp: '100-107°F', 
      duration: 'May-Sep', 
      probability: 40, 
      impact: 'Current planning scenario' 
    },
    { 
      id: 'catastrophic', 
      name: 'Catastrophic', 
      temp: '107°F+', 
      duration: 'Apr-Oct', 
      probability: 10, 
      impact: 'Only specialists survive' 
    }
  ],
  winter: [
    { 
      id: 'traditional', 
      name: 'Traditional Winter', 
      temp: '20-30°F lows', 
      duration: 'Dec-Feb', 
      probability: 15, 
      impact: 'Need cold protection' 
    },
    { 
      id: 'mild', 
      name: 'Mild Winter', 
      temp: '30-40°F lows', 
      duration: 'Dec-Jan', 
      probability: 35, 
      impact: 'Extended cool season' 
    },
    { 
      id: 'warm', 
      name: 'Warm Winter', 
      temp: '40-50°F lows', 
      duration: 'Dec-Jan', 
      probability: 40, 
      impact: 'Current planning' 
    },
    { 
      id: 'none', 
      name: 'No Winter', 
      temp: '50°F+ minimum', 
      duration: 'Year-round', 
      probability: 10, 
      impact: 'Continuous growing' 
    }
  ]
};

/**
 * Generate location-specific climate scenarios based on hardiness zone and config
 * @param {Object} config - Location configuration object
 * @returns {Object} Climate scenarios adapted to location
 */
export const generateLocationSpecificScenarios = (config) => {
  if (!config) return BASE_CLIMATE_SCENARIOS;

  // Ensure required properties have safe defaults
  const safeConfig = {
    heatIntensity: 3,
    hardiness: '7b',
    ...config
  };

  // Validate heatIntensity is a number
  const heatIntensity = isFinite(safeConfig.heatIntensity) ? safeConfig.heatIntensity : 3;

  // Import HARDINESS_ZONES from config.js to avoid circular dependency
  const HARDINESS_ZONES = {
    '3a': { min: -40, max: -35 }, '3b': { min: -35, max: -30 },
    '4a': { min: -30, max: -25 }, '4b': { min: -25, max: -20 },
    '5a': { min: -20, max: -15 }, '5b': { min: -15, max: -10 },
    '6a': { min: -10, max: -5 }, '6b': { min: -5, max: 0 },
    '7a': { min: 0, max: 5 }, '7b': { min: 5, max: 10 },
    '8a': { min: 10, max: 15 }, '8b': { min: 15, max: 20 },
    '9a': { min: 20, max: 25 }, '9b': { min: 25, max: 30 },
    '10a': { min: 30, max: 35 }, '10b': { min: 35, max: 40 },
    '11a': { min: 40, max: 45 }, '11b': { min: 45, max: 50 }
  };

  return {
    summer: [
      { 
        id: 'mild', 
        name: 'Adapted Mild Summer', 
        temp: `${85 + heatIntensity * 2}-${95 + heatIntensity * 2}°F`, 
        duration: 'Jun-Aug', 
        probability: Math.max(5, 30 - heatIntensity * 5), 
        impact: 'Traditional varieties perform well' 
      },
      { 
        id: 'normal', 
        name: 'Expected Heat Wave', 
        temp: `${95 + heatIntensity * 2}-${105 + heatIntensity * 2}°F`, 
        duration: heatIntensity > 3 ? 'May-Sep' : 'Jun-Aug', 
        probability: 40, 
        impact: 'Heat-adapted varieties needed' 
      },
      { 
        id: 'extreme', 
        name: 'Climate-Shifted Heat', 
        temp: `${105 + heatIntensity * 2}-${115 + heatIntensity * 2}°F`, 
        duration: heatIntensity > 4 ? 'Apr-Oct' : 'May-Sep', 
        probability: Math.min(45, 25 + heatIntensity * 5), 
        impact: 'Only heat specialists survive' 
      },
      { 
        id: 'catastrophic', 
        name: 'Extreme Event', 
        temp: `${115 + heatIntensity * 2}°F+`, 
        duration: heatIntensity > 4 ? 'Mar-Nov' : 'Apr-Oct', 
        probability: Math.min(25, heatIntensity * 3), 
        impact: 'Crop failure likely' 
      }
    ],
    winter: [
      { 
        id: 'traditional', 
        name: 'Legacy Winter Pattern', 
        temp: `${HARDINESS_ZONES[safeConfig.hardiness].min}-${HARDINESS_ZONES[safeConfig.hardiness].max}°F lows`, 
        duration: 'Dec-Feb', 
        probability: Math.max(5, parseInt(safeConfig.hardiness[0]) < 8 ? 20 : 10), 
        impact: 'Traditional cold requirements met' 
      },
      { 
        id: 'mild', 
        name: 'Climate-Shifted Winter', 
        temp: `${HARDINESS_ZONES[safeConfig.hardiness].max + 3}-${HARDINESS_ZONES[safeConfig.hardiness].max + 13}°F lows`, 
        duration: 'Dec-Jan', 
        probability: parseInt(safeConfig.hardiness[0]) < 8 ? 40 : 30, 
        impact: 'Reduced chill hours, season extension' 
      },
      { 
        id: 'warm', 
        name: 'Disrupted Winter', 
        temp: `${HARDINESS_ZONES[safeConfig.hardiness].max + 13}-${HARDINESS_ZONES[safeConfig.hardiness].max + 23}°F lows`, 
        duration: 'Dec-Jan', 
        probability: parseInt(safeConfig.hardiness[0]) > 7 ? 45 : 35, 
        impact: 'Insufficient chill hours, pest survival' 
      },
      { 
        id: 'none', 
        name: 'No-Chill Winter', 
        temp: `${HARDINESS_ZONES[safeConfig.hardiness].max + 23}°F+ minimum`, 
        duration: 'Year-round', 
        probability: parseInt(safeConfig.hardiness[0]) > 9 ? 35 : parseInt(safeConfig.hardiness[0]) > 7 ? 15 : 5, 
        impact: 'Continuous growing, new pest pressure' 
      }
    ]
  };
};

// Legacy export for backward compatibility
export const climateScenarios = BASE_CLIMATE_SCENARIOS;