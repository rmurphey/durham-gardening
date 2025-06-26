/**
 * Portfolio strategy calculations and allocations for garden planning
 * Contains logic for generating climate-adapted portfolio strategies
 */

import { 
  getClimateType, 
  getHardinessZoneNumber,
  PORTFOLIO_NAMES,
  PORTFOLIO_DESCRIPTORS 
} from '../config.js';

// Default portfolio strategies (location-independent)
const DEFAULT_STRATEGIES = {
  conservative: { 
    name: 'Conservative Portfolio', 
    description: '60% success rate', 
    heatSpecialists: 40, 
    coolSeason: 35, 
    perennials: 15, 
    experimental: 10 
  },
  aggressive: { 
    name: 'Aggressive Portfolio', 
    description: '80% upside, 40% downside', 
    heatSpecialists: 25, 
    coolSeason: 50, 
    perennials: 15, 
    experimental: 10 
  },
  hedge: { 
    name: 'Hedge Portfolio', 
    description: '70% success rate', 
    heatSpecialists: 30, 
    coolSeason: 40, 
    perennials: 20, 
    experimental: 10 
  }
};

// Climate-specific allocation matrices
const CLIMATE_ALLOCATIONS = {
  conservative: {
    hot: { heatSpecialists: 60, coolSeason: 20, perennials: 15, experimental: 5 },
    cold: { heatSpecialists: 20, coolSeason: 35, perennials: 15, experimental: 5 }, // Will be adjusted for short seasons
    normal: { heatSpecialists: 40, coolSeason: 35, perennials: 15, experimental: 10 }
  },
  aggressive: {
    hot: { heatSpecialists: 50, coolSeason: 30, perennials: 10, experimental: 10 },
    cold: { heatSpecialists: 15, coolSeason: 50, perennials: 10, experimental: 15 }, // Will be adjusted for short seasons
    normal: { heatSpecialists: 25, coolSeason: 50, perennials: 15, experimental: 10 }
  },
  hedge: {
    hot: { heatSpecialists: 45, coolSeason: 30, perennials: 20, experimental: 5 },
    cold: { heatSpecialists: 25, coolSeason: 40, perennials: 20, experimental: 5 }, // Will be adjusted for short seasons
    normal: { heatSpecialists: 30, coolSeason: 40, perennials: 20, experimental: 10 }
  }
};

/**
 * Generate portfolio strategies adapted to location and climate
 * @param {Object} locationConfig - Location configuration object
 * @param {Object} customPortfolio - Optional custom portfolio configuration
 * @returns {Object} Portfolio strategies with climate-adapted allocations
 */
export const getPortfolioStrategies = (locationConfig, customPortfolio = null) => {
  // Return default strategies if no location config
  if (!locationConfig) {
    const strategies = { ...DEFAULT_STRATEGIES };
    if (customPortfolio) {
      strategies.custom = customPortfolio;
    }
    return strategies;
  }

  const climateType = getClimateType(locationConfig.heatDays, locationConfig.hardiness);
  const isShortSeason = getHardinessZoneNumber(locationConfig.hardiness) < 5;

  // Generate climate-adapted strategies
  const strategies = Object.entries(CLIMATE_ALLOCATIONS).reduce((acc, [portfolioType, climateAllocations]) => {
    let allocation = { ...climateAllocations[climateType] };
    
    // Adjust for short growing seasons
    if (climateType === 'cold' && isShortSeason) {
      allocation.coolSeason = portfolioType === 'aggressive' ? 70 : 
                             portfolioType === 'hedge' ? 50 : 60;
    }

    // Get appropriate description
    let description;
    if (typeof PORTFOLIO_DESCRIPTORS[portfolioType] === 'object') {
      description = PORTFOLIO_DESCRIPTORS[portfolioType][climateType] || 
                   PORTFOLIO_DESCRIPTORS[portfolioType].normal;
    } else {
      description = PORTFOLIO_DESCRIPTORS[portfolioType];
    }

    acc[portfolioType] = {
      name: PORTFOLIO_NAMES[portfolioType][climateType],
      description,
      ...allocation
    };
    
    return acc;
  }, {});

  // Add custom portfolio if provided
  if (customPortfolio) {
    strategies.custom = customPortfolio;
  }

  return strategies;
};

/**
 * Create a custom portfolio configuration
 * @param {Object} basePortfolio - Base portfolio to extend (optional)
 * @param {Object} allocations - Allocation percentages for each category
 * @returns {Object} Custom portfolio configuration
 */
export const createCustomPortfolio = (basePortfolio, allocations) => {
  return {
    name: 'Custom Portfolio',
    description: 'User-defined allocation',
    heatSpecialists: allocations.heatSpecialists,
    coolSeason: allocations.coolSeason,
    perennials: allocations.perennials,
    experimental: allocations.experimental
  };
};

/**
 * Validate that portfolio allocations sum to 100%
 * @param {Object} allocations - Portfolio allocation object
 * @returns {boolean} True if allocations are valid
 */
export const validatePortfolioAllocations = (allocations) => {
  const total = allocations.heatSpecialists + 
                allocations.coolSeason + 
                allocations.perennials + 
                allocations.experimental;
  return Math.abs(total - 100) < 1; // Allow small rounding errors
};

/**
 * Get default portfolio allocation for a given strategy type
 * @param {string} strategyType - Strategy type ('conservative', 'aggressive', 'hedge')
 * @returns {Object} Default allocation for the strategy
 */
export const getDefaultAllocation = (strategyType) => {
  return DEFAULT_STRATEGIES[strategyType] || DEFAULT_STRATEGIES.conservative;
};

/**
 * Calculate portfolio risk score based on allocations and climate
 * @param {Object} allocation - Portfolio allocation percentages
 * @param {string} climateType - Climate type ('hot', 'cold', 'normal')
 * @returns {number} Risk score from 0-100 (lower is less risky)
 */
export const calculatePortfolioRisk = (allocation, climateType) => {
  const riskWeights = {
    heatSpecialists: climateType === 'hot' ? 0.1 : climateType === 'cold' ? 0.8 : 0.4,
    coolSeason: climateType === 'cold' ? 0.1 : climateType === 'hot' ? 0.9 : 0.3,
    perennials: 0.2, // Generally lower risk
    experimental: 0.7 // Higher risk regardless of climate
  };

  const weightedRisk = Object.entries(allocation)
    .reduce((risk, [category, percentage]) => {
      const weight = riskWeights[category] || 0.5;
      return risk + (percentage * weight / 100);
    }, 0);

  return Math.round(weightedRisk * 100);
};