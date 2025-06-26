// Consolidated configuration for Climate Garden Simulation
// Combines defaults, mappings, and constants into a single file

// Default configuration values
export const DEFAULT_LOCATION_CONFIG = {
  name: 'Durham, NC',
  hardiness: '7b',
  lat: 35.994,
  lon: -78.8986,
  avgRainfall: 46,
  heatDays: 95,
  heatIntensity: 3,
  winterSeverity: 3,
  gardenSize: 2,
  investmentLevel: 3,
  marketMultiplier: 1.0,
  gardenSizeActual: 100,
  budget: 400,
  // Microclimate factors
  microclimate: {
    slope: 'flat',           // flat, gentle, moderate, steep
    aspect: 'south',         // north, northeast, east, southeast, south, southwest, west, northwest
    windExposure: 'moderate', // protected, moderate, exposed, very-exposed
    soilDrainage: 'moderate', // poor, moderate, good, excellent
    buildingHeat: 'minimal',  // minimal, moderate, significant, urban-heat-island
    canopyShade: 'partial',   // full-sun, partial, filtered, heavy-shade
    elevation: 'average',     // low-lying, average, elevated, hilltop
    waterAccess: 'municipal', // rain-dependent, municipal, well, pond
    frostPocket: false,       // boolean - low area that collects cold air
    reflectiveHeat: 'minimal' // minimal, moderate, significant (from pavement, walls)
  }
};

export const DEFAULT_CLIMATE_SELECTION = {
  selectedSummer: 'extreme',
  selectedWinter: 'warm',
  selectedPortfolio: 'hedge'
};

export const DEFAULT_INVESTMENT_CONFIG = {
  seeds: 75,
  infrastructure: 110,
  tools: 45,
  soil: 35,
  containers: 60,
  irrigation: 85,
  protection: 25,
  fertilizer: 30
};

export const DEFAULT_UI_PREFERENCES = {
  showInvestmentDetails: false,
  recommendationDismissed: false,
  showSetup: true
};

export const DEFAULT_SIMULATION_CONFIG = {
  iterations: 1000,
  simulationDebounceDelay: 100
};

// Region presets for quick location setup
export const REGION_PRESETS = {
  'durham-nc': {
    name: 'Durham, NC',
    hardiness: '7b',
    lat: 35.994,
    lon: -78.8986,
    avgRainfall: 46,
    heatDays: 95,
    marketMultiplier: 1.0
  },
  'phoenix-az': {
    name: 'Phoenix, AZ', 
    hardiness: '9b',
    lat: 33.4484,
    lon: -112.0740,
    avgRainfall: 8,
    heatDays: 145,
    marketMultiplier: 1.2
  },
  'minneapolis-mn': {
    name: 'Minneapolis, MN',
    hardiness: '4b',
    lat: 44.9778,
    lon: -93.2650,
    avgRainfall: 32,
    heatDays: 15,
    marketMultiplier: 1.1
  },
  'seattle-wa': {
    name: 'Seattle, WA',
    hardiness: '9a',
    lat: 47.6062,
    lon: -122.3321,
    avgRainfall: 38,
    heatDays: 5,
    marketMultiplier: 1.3
  },
  'miami-fl': {
    name: 'Miami, FL',
    hardiness: '10b',
    lat: 25.7617,
    lon: -80.1918,
    avgRainfall: 62,
    heatDays: 200,
    marketMultiplier: 1.1
  }
};

// Hardiness zone definitions
export const HARDINESS_ZONES = {
  '3a': { min: -40, max: -35, name: 'Zone 3a (-40 to -35°F)' },
  '3b': { min: -35, max: -30, name: 'Zone 3b (-35 to -30°F)' },
  '4a': { min: -30, max: -25, name: 'Zone 4a (-30 to -25°F)' },
  '4b': { min: -25, max: -20, name: 'Zone 4b (-25 to -20°F)' },
  '5a': { min: -20, max: -15, name: 'Zone 5a (-20 to -15°F)' },
  '5b': { min: -15, max: -10, name: 'Zone 5b (-15 to -10°F)' },
  '6a': { min: -10, max: -5, name: 'Zone 6a (-10 to -5°F)' },
  '6b': { min: -5, max: 0, name: 'Zone 6b (-5 to 0°F)' },
  '7a': { min: 0, max: 5, name: 'Zone 7a (0 to 5°F)' },
  '7b': { min: 5, max: 10, name: 'Zone 7b (5 to 10°F)' },
  '8a': { min: 10, max: 15, name: 'Zone 8a (10 to 15°F)' },
  '8b': { min: 15, max: 20, name: 'Zone 8b (15 to 20°F)' },
  '9a': { min: 20, max: 25, name: 'Zone 9a (20 to 25°F)' },
  '9b': { min: 25, max: 30, name: 'Zone 9b (25 to 30°F)' },
  '10a': { min: 30, max: 35, name: 'Zone 10a (30 to 35°F)' },
  '10b': { min: 35, max: 40, name: 'Zone 10b (35 to 40°F)' },
  '11': { min: 40, max: 50, name: 'Zone 11 (40 to 50°F)' }
};

// Investment preset configurations
export const INVESTMENT_PRESETS = {
  budget: {
    name: 'Budget',
    totalCost: 270,
    config: {
      seeds: 45,
      infrastructure: 65,
      tools: 25,
      soil: 20,
      containers: 35,
      irrigation: 45,
      protection: 15,
      fertilizer: 20
    }
  },
  standard: {
    name: 'Standard',
    totalCost: 465,
    config: {
      seeds: 75,
      infrastructure: 110,
      tools: 45,
      soil: 35,
      containers: 60,
      irrigation: 85,
      protection: 25,
      fertilizer: 30
    }
  },
  premium: {
    name: 'Premium',
    totalCost: 780,
    config: {
      seeds: 120,
      infrastructure: 180,
      tools: 75,
      soil: 60,
      containers: 100,
      irrigation: 150,
      protection: 45,
      fertilizer: 50
    }
  }
};

// Portfolio multipliers for different strategies
export const PORTFOLIO_MULTIPLIERS = {
  conservative: 0.85,
  aggressive: 1.15,
  hedge: 1.0
};

// Climate severity multipliers for harvest calculations
export const CLIMATE_SEVERITY_MULTIPLIERS = {
  summer: {
    mild: 1.2,
    normal: 1.0,
    extreme: 0.7,
    catastrophic: 0.4
  },
  winter: {
    traditional: 0.9,
    mild: 1.0,
    warm: 1.1,
    none: 1.2
  }
};

// Heat stress probability by scenario
export const HEAT_STRESS_PROBABILITIES = {
  mild: 0.3,
  normal: 0.5,
  extreme: 0.8,
  catastrophic: 1.2
};

// Freeze event probability by winter scenario
export const FREEZE_PROBABILITIES = {
  none: 0,
  warm: 0.3,
  mild: 0.7,
  traditional: 1.0
};

// Hardiness zone multipliers for freeze events
export const HARDINESS_FREEZE_MULTIPLIERS = {
  3: 3, 4: 3, 5: 2, 6: 2, 7: 1, 8: 1, 9: 0.5, 10: 0.5, 11: 0.3
};

// Garden size scale mappings
export const GARDEN_SIZE_SCALE = [0, 50, 100, 200, 500, 1000];

// Investment level scale mappings  
export const INVESTMENT_LEVEL_SCALE = [0, 100, 200, 400, 800, 1500];

// Heat intensity scale mappings
export const HEAT_INTENSITY_SCALE = [0, 20, 60, 100, 150, 220];

// Intensity descriptors
export const INTENSITY_DESCRIPTORS = {
  heat: ['', 'Mild', 'Moderate', 'High', 'Extreme', 'Desert'],
  winter: ['', 'Subtropical', 'Mild', 'Moderate', 'Cold', 'Arctic'],
  garden: ['', 'Container', 'Small Yard', 'Medium Yard', 'Large Yard', 'Farm Scale'],
  investment: ['', 'Minimal', 'Basic', 'Standard', 'Premium', 'Luxury']
};

// Climate change probability multipliers by scenario
export const CLIMATE_CHANGE_MULTIPLIERS = {
  mild: 0.4,
  normal: 1.0,
  extreme: 2.5,
  catastrophic: 3.0
};

// Regional climate multipliers by latitude
export const REGIONAL_CLIMATE_MULTIPLIERS = [
  { threshold: 35, multiplier: 1.3 }, // South
  { threshold: 40, multiplier: 1.1 }, // Mid-South
  { threshold: 45, multiplier: 1.0 }, // Middle
  { threshold: Infinity, multiplier: 0.8 } // North
];

// Market price base values
export const MARKET_PRICES = {
  heat: 1.2,
  cool: 0.8,
  herbs: 2.5
};

// Base yield multipliers per crop type
export const BASE_YIELD_MULTIPLIERS = {
  heatSpecialists: 4,
  coolSeason: 3,
  perennials: 6
};

// Portfolio strategy descriptors
export const PORTFOLIO_DESCRIPTORS = {
  conservative: '60% success rate - adapted to local conditions',
  aggressive: { 
    hot: 'High heat tolerance focus',
    cold: 'Maximum season length',
    normal: '80% upside, 40% downside'
  },
  hedge: '70% success rate - climate-balanced approach'
};

// Portfolio names by climate
export const PORTFOLIO_NAMES = {
  conservative: {
    hot: 'Heat-Adapted Conservative',
    cold: 'Cold-Hardy Conservative', 
    normal: 'Conservative Portfolio'
  },
  aggressive: {
    hot: 'Desert Specialist',
    cold: 'Season Extension',
    normal: 'Aggressive Portfolio'
  },
  hedge: {
    hot: 'Heat-Balanced',
    cold: 'Climate-Hedged',
    normal: 'Hedge Portfolio'
  }
};

// Helper functions using mappings instead of if/else
export const getPortfolioMultiplier = (portfolio) => 
  PORTFOLIO_MULTIPLIERS[portfolio] || PORTFOLIO_MULTIPLIERS.hedge;

export const getClimateSeverity = (summer, winter) => ({
  heat: CLIMATE_SEVERITY_MULTIPLIERS.summer[summer] || 1.0,
  cool: (CLIMATE_SEVERITY_MULTIPLIERS.summer[summer] || 1.0) * 
        (CLIMATE_SEVERITY_MULTIPLIERS.winter[winter] || 1.0),
  perennial: Math.min(
    CLIMATE_SEVERITY_MULTIPLIERS.summer[summer] || 1.0,
    CLIMATE_SEVERITY_MULTIPLIERS.winter[winter] || 1.0
  )
});

export const getRegionalMultiplier = (lat) => {
  const region = REGIONAL_CLIMATE_MULTIPLIERS.find(r => lat < r.threshold);
  return region ? region.multiplier : 1.0;
};

export const getHardinessZoneNumber = (hardiness) => 
  parseInt(hardiness?.[0] || '7');

export const getIntensityDescriptor = (type, value) => 
  INTENSITY_DESCRIPTORS[type]?.[value] || '';

export const getScaleValue = (scale, index) => 
  scale[index] || scale[scale.length - 1];

export const getClimateType = (heatDays, hardinessZone) => {
  const isHot = heatDays > 120;
  const isCold = getHardinessZoneNumber(hardinessZone) < 6;
  return isHot ? 'hot' : isCold ? 'cold' : 'normal';
};

// Configuration storage keys for localStorage
export const STORAGE_KEYS = {
  LOCATION_CONFIG: 'gardenSim_locationConfig',
  CLIMATE_SELECTION: 'gardenSim_climateSelection',
  INVESTMENT_CONFIG: 'gardenSim_investmentConfig',
  UI_PREFERENCES: 'gardenSim_uiPreferences',
  SIMULATION_CONFIG: 'gardenSim_simulationConfig',
  LAST_SAVED: 'gardenSim_lastSaved'
};

// Configuration version for migration support
export const CONFIG_VERSION = '1.0.0';

// Global crop database with climate adaptations
export const GLOBAL_CROP_DATABASE = {
  heatTolerant: {
    okra: {
      name: { en: 'Okra', es: 'Quimbombó', fr: 'Gombo' },
      zones: '6-11', minTemp: -10, maxTemp: 45, optimalTemp: [25, 35],
      plantingMonths: { temperate: [4, 5, 6], tropical: [1, 2, 3, 10, 11, 12], subtropical: [3, 4, 5, 9] },
      harvestStart: 2, harvestDuration: 4, transplantWeeks: 0,
      drought: 'excellent', heat: 'excellent', humidity: 'excellent',
      // Durham-specific details
      varieties: {
        'Clemson Spineless': 'Classic variety, very reliable in Durham heat',
        'Red Burgundy': 'Beautiful red pods, excellent for Durham gardens',
        'Hill Country Heirloom Red': 'Heat-loving Texas variety, perfect for NC summers'
      },
      durhamPlanting: {
        soilTemp: '65°F minimum, 70°F+ ideal',
        spacing: '12-18 inches apart, rows 3 feet apart',
        seedDepth: '1/2 to 1 inch deep',
        seedsPerFoot: '4-6 seeds per foot of row',
        daysToGermination: '7-14 days in warm soil',
        daysToHarvest: '50-65 days from planting'
      },
      shoppingList: {
        seeds: '1 packet plants 25-30 feet of row',
        quantityPer100sqft: '2-3 packets',
        cost: '$3-4 per packet'
      }
    },
    peppers: {
      name: { en: 'Hot Peppers', es: 'Chiles', fr: 'Piments' },
      zones: '5-11', minTemp: -5, maxTemp: 40, optimalTemp: [20, 30],
      plantingMonths: { temperate: [3, 4, 5], tropical: [1, 2, 11, 12], subtropical: [2, 3, 4, 10, 11] },
      harvestStart: 3, harvestDuration: 5, transplantWeeks: 6,
      drought: 'good', heat: 'excellent', humidity: 'good',
      // Durham-specific details
      varieties: {
        'Carolina Reaper': 'NC original, extremely hot, thrives in Durham',
        'Fish Pepper': 'Heirloom variety, excellent for Durham heat and humidity',
        'Tabasco': 'Commercial variety, very productive in NC summers',
        'Hungarian Hot Wax': 'Mild heat, excellent fresh eating, Durham favorite'
      },
      durhamPlanting: {
        soilTemp: '65°F minimum for transplants',
        spacing: '18-24 inches apart, rows 2-3 feet apart',
        seedDepth: '1/4 inch for seeds, transplant at soil level',
        seedsPerPacket: '25-50 seeds typical',
        daysToGermination: '7-14 days at 75-80°F',
        daysToHarvest: '70-90 days from transplant'
      },
      shoppingList: {
        seeds: '1 packet for 20-30 plants',
        transplants: '4-6 plants per 100 sq ft',
        quantityPer100sqft: '1 packet seeds OR 6 transplants',
        cost: '$3-4 per packet, $3-5 per transplant'
      }
    },
    amaranth: {
      name: { en: 'Amaranth Greens', es: 'Amaranto', fr: 'Amarante' },
      zones: '4-11', minTemp: -15, maxTemp: 42, optimalTemp: [22, 32],
      plantingMonths: { temperate: [4, 5, 6, 7], tropical: [1, 2, 3, 10, 11, 12], subtropical: [3, 4, 5, 8, 9] },
      harvestStart: 1.5, harvestDuration: 3, transplantWeeks: 0,
      drought: 'excellent', heat: 'excellent', humidity: 'excellent'
    },
    sweetPotato: {
      name: { en: 'Sweet Potato', es: 'Batata', fr: 'Patate douce' },
      zones: '6-11', minTemp: -8, maxTemp: 38, optimalTemp: [24, 30],
      plantingMonths: { temperate: [5, 6], tropical: [1, 2, 3, 10, 11, 12], subtropical: [3, 4, 5, 9, 10] },
      harvestStart: 4, harvestDuration: 1, transplantWeeks: 0,
      drought: 'excellent', heat: 'excellent', humidity: 'good'
    },
    malabarSpinach: {
      name: { en: 'Malabar Spinach', es: 'Espinaca de Malabar', fr: 'Épinard de Malabar' },
      zones: '7-11', minTemp: -5, maxTemp: 40, optimalTemp: [25, 35],
      plantingMonths: { temperate: [5, 6, 7], tropical: [1, 2, 3, 10, 11, 12], subtropical: [4, 5, 6, 8, 9] },
      harvestStart: 2, harvestDuration: 4, transplantWeeks: 4,
      drought: 'good', heat: 'excellent', humidity: 'excellent'
    }
  },
  coolSeason: {
    kale: {
      name: { en: 'Kale', es: 'Col rizada', fr: 'Chou frisé' },
      zones: '2-9', minTemp: -25, maxTemp: 25, optimalTemp: [10, 20],
      plantingMonths: { temperate: [8, 9, 1, 2, 3], tropical: [11, 12, 1, 2], subtropical: [9, 10, 11, 1, 2] },
      harvestStart: 2, harvestDuration: 4, transplantWeeks: 4,
      drought: 'fair', heat: 'poor', humidity: 'good',
      // Durham-specific details
      varieties: {
        'Winterbor': 'Very cold hardy, excellent for Durham winters',
        'Red Russian': 'Beautiful purple stems, mild flavor, heat tolerant',
        'Lacinato (Dinosaur)': 'Heat tolerant, good for spring and fall',
        'White Russian': 'Mild flavor, good for Durham spring/fall'
      },
      durhamPlanting: {
        soilTemp: '45-75°F optimal',
        spacing: '8-12 inches apart, rows 18 inches apart',
        seedDepth: '1/4 to 1/2 inch deep',
        seedsPerFoot: '6-8 seeds per foot of row',
        daysToGermination: '7-10 days',
        daysToHarvest: '55-75 days, baby leaves at 30 days'
      },
      shoppingList: {
        seeds: '1 packet plants 50-75 feet of row',
        quantityPer100sqft: '1-2 packets',
        cost: '$3-4 per packet'
      },
      durhamSchedule: {
        spring: 'Plant Feb 15 - Mar 15 for Apr-Jun harvest',
        fall: 'Plant Aug 1 - Sep 1 for Oct-Dec harvest',
        winter: 'Fall-planted kale overwinters, harvest through winter'
      }
    },
    cabbage: {
      name: { en: 'Cabbage', es: 'Repollo', fr: 'Chou' },
      zones: '1-9', minTemp: -30, maxTemp: 22, optimalTemp: [8, 18],
      plantingMonths: { temperate: [8, 9, 1, 2], tropical: [11, 12, 1], subtropical: [9, 10, 11, 1] },
      harvestStart: 3, harvestDuration: 2, transplantWeeks: 6,
      drought: 'fair', heat: 'poor', humidity: 'fair'
    },
    lettuce: {
      name: { en: 'Lettuce', es: 'Lechuga', fr: 'Laitue' },
      zones: '2-9', minTemp: -20, maxTemp: 24, optimalTemp: [12, 18],
      plantingMonths: { temperate: [9, 10, 1, 2, 3], tropical: [11, 12, 1, 2], subtropical: [9, 10, 11, 1, 2, 3] },
      harvestStart: 1.5, harvestDuration: 2, transplantWeeks: 3,
      drought: 'poor', heat: 'poor', humidity: 'good'
    },
    spinach: {
      name: { en: 'Spinach', es: 'Espinaca', fr: 'Épinard' },
      zones: '2-9', minTemp: -25, maxTemp: 20, optimalTemp: [10, 16],
      plantingMonths: { temperate: [8, 9, 10, 1, 2, 3], tropical: [11, 12, 1], subtropical: [9, 10, 11, 1, 2] },
      harvestStart: 1.5, harvestDuration: 2, transplantWeeks: 0,
      drought: 'poor', heat: 'poor', humidity: 'good'
    },
    carrots: {
      name: { en: 'Carrots', es: 'Zanahorias', fr: 'Carottes' },
      zones: '3-10', minTemp: -20, maxTemp: 28, optimalTemp: [12, 22],
      plantingMonths: { temperate: [9, 10, 1, 2, 3, 4], tropical: [11, 12, 1, 2], subtropical: [9, 10, 11, 1, 2, 3] },
      harvestStart: 2.5, harvestDuration: 1, transplantWeeks: 0,
      drought: 'fair', heat: 'fair', humidity: 'good'
    }
  },
  perennials: {
    rosemary: {
      name: { en: 'Rosemary', es: 'Romero', fr: 'Romarin' },
      zones: '6-10', minTemp: -10, maxTemp: 40, optimalTemp: [15, 30],
      plantingMonths: { temperate: [3, 4, 9, 10], tropical: [1, 2, 11, 12], subtropical: [3, 4, 5, 9, 10, 11] },
      harvestStart: 0.5, harvestDuration: 12, transplantWeeks: 0,
      drought: 'excellent', heat: 'excellent', humidity: 'fair'
    },
    thyme: {
      name: { en: 'Thyme', es: 'Tomillo', fr: 'Thym' },
      zones: '4-9', minTemp: -15, maxTemp: 35, optimalTemp: [15, 25],
      plantingMonths: { temperate: [3, 4, 9, 10], tropical: [11, 12, 1, 2], subtropical: [3, 4, 5, 9, 10, 11] },
      harvestStart: 0.5, harvestDuration: 12, transplantWeeks: 0,
      drought: 'excellent', heat: 'good', humidity: 'fair'
    },
    oregano: {
      name: { en: 'Oregano', es: 'Orégano', fr: 'Origan' },
      zones: '4-10', minTemp: -15, maxTemp: 38, optimalTemp: [18, 28],
      plantingMonths: { temperate: [3, 4, 9, 10], tropical: [1, 2, 11, 12], subtropical: [3, 4, 5, 9, 10, 11] },
      harvestStart: 0.5, harvestDuration: 12, transplantWeeks: 0,
      drought: 'good', heat: 'good', humidity: 'good'
    },
    mint: {
      name: { en: 'Mint', es: 'Menta', fr: 'Menthe' },
      zones: '3-9', minTemp: -20, maxTemp: 30, optimalTemp: [15, 25],
      plantingMonths: { temperate: [3, 4, 5, 9, 10], tropical: [11, 12, 1, 2], subtropical: [3, 4, 5, 9, 10, 11] },
      harvestStart: 0.5, harvestDuration: 12, transplantWeeks: 0,
      drought: 'poor', heat: 'fair', humidity: 'excellent'
    }
  }
};

// Climate zone classification for plant selection
export const CLIMATE_ZONES = {
  temperate: { minTemp: -30, maxTemp: 30, regions: ['northern-us', 'central-us', 'northern-europe', 'southern-canada'] },
  subtropical: { minTemp: -5, maxTemp: 35, regions: ['southern-us', 'mediterranean', 'southern-europe', 'parts-australia'] },
  tropical: { minTemp: 10, maxTemp: 40, regions: ['florida', 'hawaii', 'central-america', 'southeast-asia', 'caribbean'] }
};

// Region selection for localized recommendations
export const SUPPORTED_REGIONS = {
  'us': { name: 'United States', language: 'en', currency: 'USD' },
  'ca': { name: 'Canada', language: 'en', currency: 'CAD' },
  'mx': { name: 'Mexico', language: 'es', currency: 'MXN' },
  'gb': { name: 'United Kingdom', language: 'en', currency: 'GBP' },
  'fr': { name: 'France', language: 'fr', currency: 'EUR' },
  'es': { name: 'Spain', language: 'es', currency: 'EUR' },
  'au': { name: 'Australia', language: 'en', currency: 'AUD' }
};

// Climate-adaptive planting adjustments
export const CLIMATE_ADJUSTMENTS = {
  extreme: {
    heatSpecialists: { delayWeeks: 0, extendSeason: 2 }, // Plant on time, longer season
    coolSeason: { delayWeeks: 2, shortenSeason: -1 }, // Delay planting, shorter season
    perennials: { delayWeeks: 1, protection: 'shade_cloth' }
  },
  mild: {
    heatSpecialists: { delayWeeks: -2, extendSeason: -1 }, // Earlier planting
    coolSeason: { delayWeeks: -1, extendSeason: 1 }, // Earlier, longer season
    perennials: { delayWeeks: 0, protection: 'none' }
  }
};

// Utility function for intelligent percentage formatting (up to 3 decimals, only when useful)
export const formatPercentage = (decimal) => {
  const percentage = decimal * 100;
  
  // If it's a whole number, show no decimals
  if (percentage === Math.round(percentage)) {
    return Math.round(percentage);
  }
  
  // If it's close to a whole number (within 0.01), round to whole
  if (Math.abs(percentage - Math.round(percentage)) < 0.01) {
    return Math.round(percentage);
  }
  
  // If one decimal place is sufficient (e.g., 12.3 not 12.30)
  if (Math.abs(percentage - Math.round(percentage * 10) / 10) < 0.001) {
    return Math.round(percentage * 10) / 10;
  }
  
  // If two decimal places are sufficient (e.g., 12.34 not 12.340)
  if (Math.abs(percentage - Math.round(percentage * 100) / 100) < 0.0001) {
    return Math.round(percentage * 100) / 100;
  }
  
  // Otherwise use up to 2 decimal places
  return Math.round(percentage * 100) / 100;
};

// Alternative function for probabilities that are already percentages (not decimals)
export const formatProbability = (percentage) => {
  // If it's a whole number, show no decimals
  if (percentage === Math.round(percentage)) {
    return Math.round(percentage);
  }
  
  // If it's close to a whole number (within 0.01), round to whole
  if (Math.abs(percentage - Math.round(percentage)) < 0.01) {
    return Math.round(percentage);
  }
  
  // If one decimal place is sufficient
  if (Math.abs(percentage - Math.round(percentage * 10) / 10) < 0.001) {
    return Math.round(percentage * 10) / 10;
  }
  
  // If two decimal places are sufficient
  if (Math.abs(percentage - Math.round(percentage * 100) / 100) < 0.0001) {
    return Math.round(percentage * 100) / 100;
  }
  
  // Otherwise use up to 2 decimal places
  return Math.round(percentage * 100) / 100;
};

// Currency formatting utility with proper decimal precision
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  // Define precision rules by currency
  const currencyRules = {
    USD: { decimals: 2, symbol: '$' },
    EUR: { decimals: 2, symbol: '€' },
    GBP: { decimals: 2, symbol: '£' },
    CAD: { decimals: 2, symbol: 'C$' },
    AUD: { decimals: 2, symbol: 'A$' },
    JPY: { decimals: 0, symbol: '¥' },
    MXN: { decimals: 2, symbol: '$' }
  };
  
  const rule = currencyRules[currency] || currencyRules.USD;
  const formatted = Number(amount).toFixed(rule.decimals);
  
  return `${rule.symbol}${formatted}`;
};

// Utility for formatting amounts without currency symbol (for calculations)
export const formatAmount = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  return Number(amount).toFixed(decimals);
};

// Microclimate configuration options
export const MICROCLIMATE_OPTIONS = {
  slope: {
    flat: { name: 'Flat/Level', tempEffect: 0, drainageEffect: 0, description: 'Even ground, no slope effects' },
    gentle: { name: 'Gentle Slope (1-5°)', tempEffect: 1, drainageEffect: 1, description: 'Slight slope improves drainage' },
    moderate: { name: 'Moderate Slope (5-15°)', tempEffect: 2, drainageEffect: 2, description: 'Noticeable slope, good drainage' },
    steep: { name: 'Steep Slope (15°+)', tempEffect: 3, drainageEffect: 3, description: 'Steep terrain, excellent drainage' }
  },
  aspect: {
    south: { name: 'South-Facing', tempEffect: 3, seasonExtension: 3, description: 'Maximum sun exposure, warmest' },
    southeast: { name: 'Southeast-Facing', tempEffect: 2, seasonExtension: 2, description: 'Morning sun, good warmth' },
    southwest: { name: 'Southwest-Facing', tempEffect: 2, seasonExtension: 2, description: 'Afternoon sun, good warmth' },
    east: { name: 'East-Facing', tempEffect: 0, seasonExtension: 1, description: 'Morning sun only' },
    west: { name: 'West-Facing', tempEffect: 0, seasonExtension: 1, description: 'Afternoon sun only' },
    northeast: { name: 'Northeast-Facing', tempEffect: -1, seasonExtension: 0, description: 'Limited morning sun' },
    northwest: { name: 'Northwest-Facing', tempEffect: -1, seasonExtension: 0, description: 'Limited afternoon sun' },
    north: { name: 'North-Facing', tempEffect: -2, seasonExtension: -1, description: 'Minimal direct sun, coolest' }
  },
  windExposure: {
    protected: { name: 'Protected', tempEffect: 2, waterEffect: 1, description: 'Sheltered by buildings/trees' },
    moderate: { name: 'Moderate', tempEffect: 0, waterEffect: 0, description: 'Some wind protection' },
    exposed: { name: 'Exposed', tempEffect: -1, waterEffect: -1, description: 'Open to prevailing winds' },
    'very-exposed': { name: 'Very Exposed', tempEffect: -2, waterEffect: -2, description: 'Hilltop or open field' }
  },
  soilDrainage: {
    poor: { name: 'Poor Drainage', waterEffect: 2, rootCropEffect: -2, description: 'Clay soil, standing water' },
    moderate: { name: 'Moderate Drainage', waterEffect: 0, rootCropEffect: 0, description: 'Loamy soil, adequate drainage' },
    good: { name: 'Good Drainage', waterEffect: -1, rootCropEffect: 1, description: 'Sandy loam, drains well' },
    excellent: { name: 'Excellent Drainage', waterEffect: -2, rootCropEffect: 2, description: 'Sandy soil, fast drainage' }
  },
  buildingHeat: {
    minimal: { name: 'Minimal', tempEffect: 0, description: 'Away from buildings/pavement' },
    moderate: { name: 'Moderate', tempEffect: 2, description: 'Near some buildings/driveways' },
    significant: { name: 'Significant', tempEffect: 4, description: 'Adjacent to buildings/pavement' },
    'urban-heat-island': { name: 'Urban Heat Island', tempEffect: 6, description: 'Surrounded by concrete/asphalt' }
  },
  canopyShade: {
    'full-sun': { name: 'Full Sun (8+ hours)', sunHours: 9, tempEffect: 1, description: 'Direct sun most of day' },
    partial: { name: 'Partial Sun (4-6 hours)', sunHours: 5, tempEffect: 0, description: 'Morning or afternoon shade' },
    filtered: { name: 'Filtered Light', sunHours: 3, tempEffect: -1, description: 'Dappled shade through trees' },
    'heavy-shade': { name: 'Heavy Shade (<4 hours)', sunHours: 2, tempEffect: -2, description: 'Dense tree canopy' }
  },
  elevation: {
    'low-lying': { name: 'Low-lying Area', tempEffect: -1, frostRisk: 2, description: 'Valley or depression' },
    average: { name: 'Average Elevation', tempEffect: 0, frostRisk: 0, description: 'Neither high nor low' },
    elevated: { name: 'Elevated', tempEffect: 1, frostRisk: -1, description: 'Hill or raised area' },
    hilltop: { name: 'Hilltop', tempEffect: 2, frostRisk: -2, description: 'Highest point in area' }
  },
  waterAccess: {
    'rain-dependent': { name: 'Rain-dependent', irrigationCost: -50, reliability: -2, description: 'No irrigation system' },
    municipal: { name: 'Municipal Water', irrigationCost: 0, reliability: 0, description: 'City water supply' },
    well: { name: 'Well Water', irrigationCost: -25, reliability: 1, description: 'Private well' },
    pond: { name: 'Pond/Stream', irrigationCost: -75, reliability: -1, description: 'Natural water source' }
  },
  reflectiveHeat: {
    minimal: { name: 'Minimal', tempEffect: 0, description: 'Natural surroundings' },
    moderate: { name: 'Moderate', tempEffect: 2, description: 'Some pavement/walls nearby' },
    significant: { name: 'Significant', tempEffect: 4, description: 'Surrounded by reflective surfaces' }
  }
};

// ShadeMap.app API integration for precise solar data
export const SHADEMAP_CONFIG = {
  baseUrl: 'https://shademap.app/api',
  // API key would be provided by user or obtained through ShadeMap account
  requestSolarData: async (lat, lon, apiKey) => {
    if (!apiKey) {
      return null; // No API key provided, use manual selection
    }
    
    try {
      // Request annual solar exposure data for the coordinates
      const response = await fetch(`${SHADEMAP_CONFIG.baseUrl}/solar-exposure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          analysis_type: 'annual_hours',
          resolution: 'high'
        })
      });
      
      if (!response.ok) {
        throw new Error(`ShadeMap API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert ShadeMap data to our microclimate format
      return {
        annualSunHours: data.annual_sun_hours || 0,
        seasonalVariation: data.seasonal_variation || {},
        shadowPatterns: data.shadow_patterns || {},
        confidence: data.confidence || 'medium',
        dataSource: 'shademap'
      };
    } catch (error) {
      console.error('ShadeMap API request failed:', error);
      return null;
    }
  }
};

// Convert ShadeMap solar data to microclimate canopy shade setting
export const convertSolarDataToCanopyShade = (solarData) => {
  if (!solarData || !solarData.annualSunHours) {
    return null;
  }
  
  const dailyAverage = solarData.annualSunHours / 365;
  
  if (dailyAverage >= 8) {
    return 'full-sun';
  } else if (dailyAverage >= 6) {
    return 'partial';
  } else if (dailyAverage >= 4) {
    return 'filtered';
  } else {
    return 'heavy-shade';
  }
};

// Enhanced microclimate recommendations with solar data
export const getEnhancedMicroclimateRecommendations = (solarData, microclimate) => {
  const recommendations = [];
  
  if (solarData && solarData.dataSource === 'shademap') {
    const dailyAverage = solarData.annualSunHours / 365;
    
    recommendations.push({
      type: 'solar_precision',
      title: 'Precise Solar Data Available',
      description: `Based on satellite and terrain data: ${dailyAverage.toFixed(1)} hours daily sun`,
      confidence: solarData.confidence,
      action: 'crop recommendations optimized for exact light conditions'
    });
    
    // Seasonal recommendations based on solar variation
    if (solarData.seasonalVariation) {
      if (solarData.seasonalVariation.winter_sun_hours < 4) {
        recommendations.push({
          type: 'winter_shade',
          title: 'Winter Shade Challenge',
          description: 'Limited winter sun may affect cool-season crops',
          action: 'Consider cold frames or season extenders for winter growing'
        });
      }
      
      if (solarData.seasonalVariation.summer_sun_hours > 10) {
        recommendations.push({
          type: 'summer_intensity',
          title: 'Intense Summer Sun',
          description: 'Peak summer exposure may require heat protection',
          action: 'Plan shade cloth installation for heat-sensitive crops'
        });
      }
    }
  }
  
  // Combine with traditional microclimate factors
  const effects = calculateMicroclimateEffects(microclimate);
  
  if (effects.temperatureAdjustment > 5 && solarData && solarData.annualSunHours > 2800) {
    recommendations.push({
      type: 'heat_stress_risk',
      title: 'High Heat Stress Risk',
      description: 'Combination of full sun and warm microclimate creates challenging conditions',
      action: 'Prioritize heat-tolerant varieties and implement cooling strategies'
    });
  }
  
  return recommendations;
};

// Timing validation for planting recommendations
export const isPlantingSeasonValid = (crop, month, locationConfig) => {
  if (!crop || !crop.plantingMonths) return false;
  
  const climateZone = getClimateZoneFromLocation(locationConfig);
  let plantingMonths = crop.plantingMonths[climateZone] || crop.plantingMonths.temperate;
  
  // Handle case where plantingMonths is undefined or not an array
  if (!Array.isArray(plantingMonths)) {
    // Try to parse as JSON string if it came from database
    if (typeof plantingMonths === 'string') {
      try {
        plantingMonths = JSON.parse(plantingMonths);
      } catch (e) {
        return false;
      }
    } else {
      return false;
    }
  }
  
  // Account for microclimate season extension
  const seasonExtension = locationConfig?.seasonExtensionWeeks || 0;
  const extendedMonths = [...plantingMonths];
  
  // Add extended months if season is longer
  if (seasonExtension > 2) {
    plantingMonths.forEach(m => {
      const extendedMonth = m + 1 > 12 ? (m + 1) - 12 : m + 1;
      if (!extendedMonths.includes(extendedMonth)) {
        extendedMonths.push(extendedMonth);
      }
    });
  }
  
  return extendedMonths.includes(month);
};

// Calculate latest safe planting date for harvest before frost
export const getLatestPlantingDate = (crop, locationConfig) => {
  if (!crop || !locationConfig) return null;
  
  // Get approximate first fall frost date for hardiness zone
  const zoneNumber = getHardinessZoneNumber(locationConfig.hardiness);
  const frostDates = {
    3: { month: 9, day: 15 },  // Zone 3: mid-September
    4: { month: 10, day: 1 },  // Zone 4: early October
    5: { month: 10, day: 15 }, // Zone 5: mid-October
    6: { month: 10, day: 30 }, // Zone 6: late October
    7: { month: 11, day: 15 }, // Zone 7: mid-November
    8: { month: 12, day: 1 },  // Zone 8: early December
    9: { month: 12, day: 15 }, // Zone 9: mid-December
    10: { month: 1, day: 15 }, // Zone 10: rare frost
    11: { month: 2, day: 1 }   // Zone 11: very rare frost
  };
  
  const baseFrostDate = frostDates[zoneNumber] || frostDates[7];
  
  // Adjust for microclimate effects
  const microclimateAdjustment = locationConfig.microclimateEffects?.frostDateAdjustment || 0;
  const adjustedFrostDay = baseFrostDate.day + microclimateAdjustment;
  
  // Calculate days needed from planting to harvest
  const daysToMaturity = (crop.harvestStart || 2) * 30; // Convert months to days
  const transplantDays = (crop.transplantWeeks || 0) * 7;
  const totalDays = daysToMaturity + transplantDays;
  
  // Calculate latest planting date by working backwards from frost
  const frostDate = new Date();
  frostDate.setMonth(baseFrostDate.month - 1); // JS months are 0-indexed
  frostDate.setDate(adjustedFrostDay);
  
  const latestPlanting = new Date(frostDate);
  latestPlanting.setDate(latestPlanting.getDate() - totalDays);
  
  return latestPlanting;
};

// Check if direct sowing is still viable for current date
export const isDirectSowingViable = (crop, currentDate, locationConfig) => {
  const latestDate = getLatestPlantingDate(crop, locationConfig);
  if (!latestDate) return true; // Default to viable if we can't calculate
  
  return currentDate <= latestDate;
};

// Get alternative planting method when direct sowing is no longer viable
export const getAlternativePlantingMethod = (crop, currentMonth, locationConfig) => {
  if (!crop) return null;
  
  const currentDate = new Date();
  const isDirectViable = isDirectSowingViable(crop, currentDate, locationConfig);
  
  if (isDirectViable) {
    return null; // Direct sowing is still viable
  }
  
  const alternatives = [];
  
  // Check if transplants are still viable
  if (crop.transplantWeeks > 0) {
    const transplantDate = new Date();
    transplantDate.setDate(transplantDate.getDate() + (crop.transplantWeeks * 7));
    
    if (isDirectSowingViable(crop, transplantDate, locationConfig)) {
      alternatives.push({
        method: 'transplant',
        description: `Start transplants indoors now for planting in ${crop.transplantWeeks} weeks`,
        timing: `Start seeds indoors, transplant in ${crop.transplantWeeks} weeks`
      });
    }
  }
  
  // Check for next year planting
  const nextYearMonths = crop.plantingMonths[getClimateZoneFromLocation(locationConfig)] || crop.plantingMonths.temperate;
  const earliestNextMonth = Math.min(...nextYearMonths);
  
  alternatives.push({
    method: 'next_season',
    description: `Too late for this season - plan for next ${getMonthName(earliestNextMonth)}`,
    timing: `Next planting window: ${nextYearMonths.map(m => getMonthName(m)).join(', ')}`
  });
  
  // Check for season extension methods
  if (currentMonth >= 8) { // Late summer/fall
    alternatives.push({
      method: 'season_extension',
      description: 'Consider cold frames, row covers, or greenhouse for extended season',
      timing: 'Use protection to extend growing season'
    });
  }
  
  return alternatives;
};

// Helper function to get month names
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

// Helper function to determine climate zone from location
const getClimateZoneFromLocation = (locationConfig) => {
  if (!locationConfig) return 'temperate';
  
  const zoneNumber = getHardinessZoneNumber(locationConfig.hardiness);
  
  if (zoneNumber >= 10) return 'tropical';
  if (zoneNumber >= 8) return 'subtropical';
  return 'temperate';
};

// Get climate-adapted crops organized by category
export const getClimateAdaptedCrops = (locationConfig, selectedScenario = 'normal') => {
  if (!locationConfig) {
    return {
      heatTolerant: GLOBAL_CROP_DATABASE.heatTolerant || {},
      coolSeason: GLOBAL_CROP_DATABASE.coolSeason || {},
      perennials: GLOBAL_CROP_DATABASE.perennials || {}
    };
  }
  
  const climateZone = getClimateZoneFromLocation(locationConfig);
  const zoneNumber = getHardinessZoneNumber(locationConfig.hardiness);
  
  // Filter crops based on hardiness zone compatibility
  const filterCropsByZone = (crops) => {
    const filtered = {};
    
    Object.entries(crops).forEach(([key, crop]) => {
      if (!crop.zones) {
        filtered[key] = { ...crop, displayName: crop.name.en };
        return;
      }
      
      // Parse zone range (e.g., "6-10" or "2-9")
      const zoneParts = crop.zones.split('-');
      const minZone = parseInt(zoneParts[0]);
      const maxZone = parseInt(zoneParts[1]);
      
      if (zoneNumber >= minZone && zoneNumber <= maxZone) {
        filtered[key] = { 
          ...crop, 
          displayName: crop.name.en,
          plantingMonths: crop.plantingMonths[climateZone] || crop.plantingMonths.temperate
        };
      }
    });
    
    return filtered;
  };
  
  return {
    heatTolerant: filterCropsByZone(GLOBAL_CROP_DATABASE.heatTolerant || {}),
    coolSeason: filterCropsByZone(GLOBAL_CROP_DATABASE.coolSeason || {}),
    perennials: filterCropsByZone(GLOBAL_CROP_DATABASE.perennials || {})
  };
};

// Calculate microclimate adjustments
export const calculateMicroclimateEffects = (microclimate) => {
  const effects = {
    temperatureAdjustment: 0,  // degrees F adjustment from base zone
    seasonExtension: 0,        // weeks of extended growing season
    frostDateAdjustment: 0,    // days earlier/later for frost dates
    waterRequirementMultiplier: 1, // multiplier for water needs
    sunlightHours: 6,          // available sun hours per day
    costAdjustments: {}        // cost adjustments for different categories
  };

  // Process each microclimate factor
  Object.entries(microclimate).forEach(([factor, value]) => {
    const config = MICROCLIMATE_OPTIONS[factor];
    if (!config || !config[value]) return;

    const factorConfig = config[value];

    // Temperature effects
    if (factorConfig.tempEffect) {
      effects.temperatureAdjustment += factorConfig.tempEffect;
    }

    // Season extension effects
    if (factorConfig.seasonExtension) {
      effects.seasonExtension += factorConfig.seasonExtension;
    }

    // Frost risk effects (convert to date adjustment)
    if (factorConfig.frostRisk) {
      effects.frostDateAdjustment += factorConfig.frostRisk * 7; // 1 week per risk level
    }

    // Water requirement effects
    if (factorConfig.waterEffect) {
      effects.waterRequirementMultiplier *= (1 + factorConfig.waterEffect * 0.1);
    }

    // Sunlight hours
    if (factorConfig.sunHours) {
      effects.sunlightHours = factorConfig.sunHours;
    }

    // Cost adjustments
    if (factorConfig.irrigationCost) {
      effects.costAdjustments.irrigation = (effects.costAdjustments.irrigation || 0) + factorConfig.irrigationCost;
    }
  });

  // Frost pocket special handling
  if (microclimate.frostPocket) {
    effects.frostDateAdjustment += 14; // 2 weeks later spring, 2 weeks earlier fall
    effects.temperatureAdjustment -= 3; // 3°F colder on average
  }

  return effects;
};

// Get microclimate-adjusted crop recommendations
export const getMicroclimateAdjustedRecommendations = (baseConfig, microclimateEffects) => {
  const adjustedConfig = { ...baseConfig };
  
  // Return base config if no microclimate effects provided
  if (!microclimateEffects) return adjustedConfig;
  
  // Adjust hardiness zone based on temperature effects
  const currentZoneNumber = getHardinessZoneNumber(baseConfig.hardiness);
  const tempAdjustment = microclimateEffects.temperatureAdjustment || 0;
  
  // Each 5°F = roughly 0.5 hardiness zones
  const zoneAdjustment = Math.round(tempAdjustment / 10);
  const newZoneNumber = Math.max(1, Math.min(11, currentZoneNumber + zoneAdjustment));
  
  // Convert back to zone string (simplified)
  const zoneLetter = baseConfig.hardiness.includes('a') ? 'a' : 'b';
  adjustedConfig.microAdjustedZone = `${newZoneNumber}${zoneLetter}`;
  
  // Adjust season length
  adjustedConfig.seasonExtensionWeeks = microclimateEffects.seasonExtension || 0;
  
  // Adjust water requirements
  adjustedConfig.waterMultiplier = microclimateEffects.waterRequirementMultiplier || 1;
  
  // Sun requirements
  adjustedConfig.availableSunHours = microclimateEffects.sunlightHours || 6;
  
  return adjustedConfig;
};

// Generate comprehensive site-specific recommendations
export const generateSiteSpecificRecommendations = (locationConfig, microclimateEffects = null, solarData = null) => {
  const recommendations = [];
  
  // Priority crop recommendations based on microclimate
  const priorityCrops = getPriorityCropsForSite(locationConfig, microclimateEffects);
  if (priorityCrops.length > 0) {
    recommendations.push({
      type: 'priority_crops',
      title: 'Recommended Crops for Your Site',
      description: 'These crops are particularly well-suited to your specific microclimate conditions',
      items: priorityCrops.map(crop => ({
        name: crop.name,
        reason: crop.reason,
        confidence: crop.confidence,
        expectedYield: crop.expectedYield
      }))
    });
  }
  
  // Timing recommendations
  const timingRecs = getTimingRecommendations(locationConfig, microclimateEffects);
  if (timingRecs.length > 0) {
    recommendations.push({
      type: 'timing_adjustments',
      title: 'Planting Time Adjustments',
      description: 'How your microclimate affects planting and harvest timing',
      items: timingRecs
    });
  }
  
  // Infrastructure recommendations
  const infraRecs = getInfrastructureRecommendations(locationConfig, microclimateEffects, solarData);
  if (infraRecs.length > 0) {
    recommendations.push({
      type: 'infrastructure',
      title: 'Site Infrastructure Recommendations',
      description: 'Specific improvements for your garden conditions',
      items: infraRecs
    });
  }
  
  // Risk mitigation recommendations
  const riskRecs = getRiskMitigationRecommendations(locationConfig, microclimateEffects);
  if (riskRecs.length > 0) {
    recommendations.push({
      type: 'risk_mitigation',
      title: 'Risk Management Strategies',
      description: 'Protect your garden from site-specific challenges',
      items: riskRecs
    });
  }
  
  // Cost optimization recommendations
  const costRecs = getCostOptimizationRecommendations(locationConfig, microclimateEffects);
  if (costRecs.length > 0) {
    recommendations.push({
      type: 'cost_optimization',
      title: 'Cost Optimization Strategies',
      description: 'Maximize value from your specific site conditions',
      items: costRecs
    });
  }
  
  return recommendations;
};

// Get priority crops based on site conditions
const getPriorityCropsForSite = (locationConfig, microclimateEffects) => {
  const crops = [];
  
  // Return empty if no microclimate effects provided
  if (!microclimateEffects) return crops;
  
  const tempAdjustment = microclimateEffects.temperatureAdjustment || 0;
  const sunHours = microclimateEffects.sunlightHours || 6;
  const waterMultiplier = microclimateEffects.waterRequirementMultiplier || 1;
  
  // Hot microclimate - prioritize heat-tolerant crops
  if (tempAdjustment > 3) {
    crops.push({
      name: 'Okra',
      reason: `Your site runs ${tempAdjustment}°F warmer - perfect for heat-loving okra`,
      confidence: 'high',
      expectedYield: 'excellent'
    });
    crops.push({
      name: 'Hot Peppers',
      reason: 'Warm microclimate will boost pepper production significantly',
      confidence: 'high',
      expectedYield: 'excellent'
    });
    crops.push({
      name: 'Amaranth Greens',
      reason: 'Thrives in hot conditions where other greens struggle',
      confidence: 'high',
      expectedYield: 'very good'
    });
  }
  
  // Cool microclimate - extend cool season growing
  if (tempAdjustment < -2) {
    crops.push({
      name: 'Kale',
      reason: `Cooler site (${Math.abs(tempAdjustment)}°F below average) extends kale season`,
      confidence: 'high',
      expectedYield: 'excellent'
    });
    crops.push({
      name: 'Spinach',
      reason: 'Cool conditions prevent early bolting',
      confidence: 'high',
      expectedYield: 'excellent'
    });
    crops.push({
      name: 'Lettuce',
      reason: 'Can grow lettuce through warmer months',
      confidence: 'high',
      expectedYield: 'very good'
    });
  }
  
  // High sun exposure
  if (sunHours >= 8) {
    crops.push({
      name: 'Tomatoes',
      reason: `${sunHours} hours of daily sun ideal for maximum tomato production`,
      confidence: 'high',
      expectedYield: 'excellent'
    });
    crops.push({
      name: 'Peppers',
      reason: 'Full sun exposure maximizes pepper yields',
      confidence: 'high',
      expectedYield: 'excellent'
    });
  }
  
  // Partial shade adaptation
  if (sunHours < 6) {
    crops.push({
      name: 'Leafy Greens',
      reason: `${sunHours} hours sun perfect for cool-season greens`,
      confidence: 'high',
      expectedYield: 'very good'
    });
    crops.push({
      name: 'Herbs (Parsley, Cilantro)',
      reason: 'Many herbs prefer partial shade conditions',
      confidence: 'medium',
      expectedYield: 'good'
    });
  }
  
  // Water-efficient crops for dry sites
  if (waterMultiplier < 0.8) {
    crops.push({
      name: 'Rosemary',
      reason: 'Drought-tolerant herb perfect for dry microclimate',
      confidence: 'high',
      expectedYield: 'excellent'
    });
    crops.push({
      name: 'Thyme',
      reason: 'Thrives in well-draining, drier conditions',
      confidence: 'high',
      expectedYield: 'very good'
    });
  }
  
  return crops;
};

// Get timing adjustment recommendations
const getTimingRecommendations = (locationConfig, microclimateEffects) => {
  const recommendations = [];
  
  // Return empty if no microclimate effects provided
  if (!microclimateEffects) return recommendations;
  
  const seasonExtension = microclimateEffects.seasonExtension || 0;
  const tempAdjustment = microclimateEffects.temperatureAdjustment || 0;
  const frostAdjustment = microclimateEffects.frostDateAdjustment || 0;
  
  if (seasonExtension > 2) {
    recommendations.push({
      title: 'Extended Growing Season',
      description: `Your microclimate extends the growing season by ${seasonExtension} weeks`,
      action: 'Plant heat-sensitive crops 2-3 weeks earlier than typical for your zone'
    });
  }
  
  if (tempAdjustment > 5) {
    recommendations.push({
      title: 'Early Season Start',
      description: `Site runs ${tempAdjustment}°F warmer than average`,
      action: 'Start warm-season crops 2-3 weeks earlier than zone recommendations'
    });
  }
  
  if (frostAdjustment > 7) {
    recommendations.push({
      title: 'Frost Protection Needed',
      description: `Frost pocket conditions create ${Math.round(frostAdjustment/7)} weeks higher frost risk`,
      action: 'Plan for frost protection and avoid planting in lowest areas'
    });
  }
  
  if (tempAdjustment < -3) {
    recommendations.push({
      title: 'Cool Season Extension',
      description: `Cooler microclimate allows ${Math.abs(tempAdjustment)}°F temperature buffer`,
      action: 'Extend cool-season crops 3-4 weeks longer into summer'
    });
  }
  
  return recommendations;
};

// Get infrastructure recommendations
const getInfrastructureRecommendations = (locationConfig, microclimateEffects, solarData) => {
  const recommendations = [];
  
  // Return empty if no microclimate effects provided
  if (!microclimateEffects) return recommendations;
  
  const tempAdjustment = microclimateEffects.temperatureAdjustment || 0;
  const sunHours = microclimateEffects.sunlightHours || 6;
  const waterMultiplier = microclimateEffects.waterRequirementMultiplier || 1;
  
  // Heat management
  if (tempAdjustment > 5) {
    recommendations.push({
      title: 'Shade Infrastructure',
      description: 'Hot microclimate requires heat management',
      action: 'Install 30-50% shade cloth for summer protection',
      costEstimate: '$40-80',
      priority: 'high'
    });
  }
  
  // Water management
  if (waterMultiplier > 1.3) {
    recommendations.push({
      title: 'Enhanced Irrigation',
      description: 'Site conditions increase water needs significantly',
      action: 'Install drip irrigation with timers for consistent moisture',
      costEstimate: '$80-150',
      priority: 'high'
    });
  }
  
  // Light optimization
  if (sunHours < 5) {
    recommendations.push({
      title: 'Light Maximization',
      description: 'Limited sun exposure needs optimization',
      action: 'Use reflective mulch and prune overhanging branches',
      costEstimate: '$20-40',
      priority: 'medium'
    });
  }
  
  // Solar data specific recommendations
  if (solarData && solarData.seasonalVariation) {
    if (solarData.seasonalVariation.winter_sun_hours < 4) {
      recommendations.push({
        title: 'Winter Growing Enhancement',
        description: 'Low winter sun limits cold-season production',
        action: 'Install cold frames or mini-hoop tunnels for winter crops',
        costEstimate: '$60-120',
        priority: 'medium'
      });
    }
  }
  
  // Wind protection
  if (locationConfig.microclimate.windExposure === 'very-exposed') {
    recommendations.push({
      title: 'Wind Protection',
      description: 'High wind exposure requires barriers',
      action: 'Install windbreak fencing or plant protective hedging',
      costEstimate: '$50-150',
      priority: 'high'
    });
  }
  
  return recommendations;
};

// Get risk mitigation recommendations
const getRiskMitigationRecommendations = (locationConfig, microclimateEffects) => {
  const recommendations = [];
  
  // Return empty if no microclimate effects provided
  if (!microclimateEffects) return recommendations;
  
  const frostRisk = (microclimateEffects.frostDateAdjustment || 0) > 7;
  const heatStress = (microclimateEffects.temperatureAdjustment || 0) > 8;
  const droughtStress = (microclimateEffects.waterRequirementMultiplier || 1) > 1.5;
  
  if (frostRisk) {
    recommendations.push({
      title: 'Frost Protection Strategy',
      description: 'High frost risk requires active protection',
      actions: [
        'Keep row covers ready for unexpected cold snaps',
        'Plant tender crops in containers for mobility',
        'Install frost protection fabric on permanent structures'
      ]
    });
  }
  
  if (heatStress) {
    recommendations.push({
      title: 'Heat Stress Management',
      description: 'Extreme heat conditions need multiple protections',
      actions: [
        'Mulch heavily to keep soil cool',
        'Plant heat-sensitive crops in partial shade',
        'Schedule watering for early morning to reduce stress'
      ]
    });
  }
  
  if (droughtStress) {
    recommendations.push({
      title: 'Drought Resilience',
      description: 'High water needs require conservation strategies',
      actions: [
        'Use moisture-retaining mulch around all plants',
        'Group plants by water needs for efficient irrigation',
        'Select drought-tolerant varieties when possible'
      ]
    });
  }
  
  return recommendations;
};

// Get cost optimization recommendations
const getCostOptimizationRecommendations = (locationConfig, microclimateEffects) => {
  const recommendations = [];
  
  // Return empty if no microclimate effects provided
  if (!microclimateEffects) return recommendations;
  
  const tempAdjustment = microclimateEffects.temperatureAdjustment || 0;
  const seasonExtension = microclimateEffects.seasonExtension || 0;
  
  if (tempAdjustment > 3) {
    recommendations.push({
      title: 'Heat-Adapted Value Crops',
      description: 'Warm microclimate enables high-value heat crops',
      suggestion: 'Focus budget on heat-tolerant crops that command premium prices',
      examples: ['Hot peppers ($3-5/lb)', 'Okra ($2-3/lb)', 'Heat-tolerant herbs ($8-12/oz)']
    });
  }
  
  if (seasonExtension > 3) {
    recommendations.push({
      title: 'Season Extension ROI',
      description: 'Extended season enables succession planting',
      suggestion: 'Invest in quick-growing crops for multiple harvests',
      examples: ['Radishes (4 crops/season)', 'Lettuce (3-4 crops)', 'Spinach (3 crops)']
    });
  }
  
  if ((microclimateEffects.sunlightHours || 6) >= 8) {
    recommendations.push({
      title: 'High-Sun Premium Crops',
      description: 'Excellent sun exposure supports high-value crops',
      suggestion: 'Maximize return with sun-dependent premium crops',
      examples: ['Heirloom tomatoes ($4-6/lb)', 'Specialty peppers ($3-8/lb)', 'Basil ($8-15/oz)']
    });
  }
  
  return recommendations;
};

// Generate immediate action items for the current week
export const generateWeeklyActions = (locationConfig, portfolio, currentDate = new Date()) => {
  const actions = [];
  const currentMonth = currentDate.getMonth() + 1;
  const adaptedCrops = getClimateAdaptedCrops(locationConfig, 'extreme'); // Use current scenario
  
  // Check portfolio for actionable items
  Object.entries(portfolio || {}).forEach(([cropType, percentage]) => {
    if (percentage < 10) return; // Skip crops with minimal allocation
    
    const categoryName = cropType === 'heatSpecialists' ? 'heatTolerant' : cropType;
    if (!adaptedCrops[categoryName]) return;
    
    Object.entries(adaptedCrops[categoryName]).forEach(([cropKey, crop]) => {
      const isInSeason = isPlantingSeasonValid(crop, currentMonth, locationConfig);
      const isDirectViable = isDirectSowingViable(crop, currentDate, locationConfig);
      
      if (isInSeason) {
        if (crop.transplantWeeks > 0 && !isDirectViable) {
          // Check if transplants should be started soon
          const latestStart = getLatestPlantingDate(crop, locationConfig);
          if (latestStart) {
            const transplantStart = new Date(latestStart);
            transplantStart.setDate(transplantStart.getDate() - (crop.transplantWeeks * 7));
            const daysUntilStart = Math.ceil((transplantStart - currentDate) / (1000 * 60 * 60 * 24));
            
            if (daysUntilStart <= 7 && daysUntilStart >= 0) {
              actions.push({
                type: 'urgent',
                icon: '🌱',
                task: `Start ${crop.displayName} transplants indoors`,
                timeframe: daysUntilStart === 0 ? 'today' : `${daysUntilStart} days left`,
                priority: 'high'
              });
            }
          }
        } else if (isDirectViable) {
          actions.push({
            type: 'planting',
            icon: '🌿',
            task: `Direct sow ${crop.displayName}`,
            timeframe: 'this week',
            priority: 'medium'
          });
        }
      }
    });
  });
  
  // Add infrastructure actions based on microclimate
  if (locationConfig?.microclimateEffects) {
    const effects = locationConfig.microclimateEffects;
    
    if (effects.temperatureAdjustment > 5 && currentMonth >= 4 && currentMonth <= 6) {
      actions.push({
        type: 'infrastructure',
        icon: '☂️',
        task: 'Install shade cloth for heat protection',
        timeframe: 'before summer heat',
        priority: 'high'
      });
    }
    
    if (effects.waterRequirementMultiplier > 1.3 && currentMonth >= 3 && currentMonth <= 5) {
      actions.push({
        type: 'infrastructure',
        icon: '💧',
        task: 'Upgrade irrigation system',
        timeframe: 'spring preparation',
        priority: 'medium'
      });
    }
  }
  
  return actions.slice(0, 4); // Limit to top 4 actions
};

// Generate monthly focus areas
export const generateMonthlyFocus = (locationConfig, portfolio, simulationResults) => {
  const currentMonth = new Date().getMonth() + 1;
  const focus = {
    planting: [],
    preparation: [],
    harvest: []
  };
  
  // Determine what to plant this month
  if (portfolio) {
    const topCategories = Object.entries(portfolio)
      .filter(([_, percentage]) => percentage >= 15)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);
    
    topCategories.forEach(([category, _]) => {
      const categoryName = category === 'heatSpecialists' ? 'heat-tolerant' : 
                          category === 'coolSeason' ? 'cool-season' : category;
      focus.planting.push(`${categoryName} crops`);
    });
  }
  
  // Add preparation tasks based on investment priorities
  if (simulationResults) {
    const investmentBreakdown = [
      { category: 'Infrastructure', amount: 110, season: [3, 4, 5] },
      { category: 'Irrigation', amount: 85, season: [4, 5, 6] },
      { category: 'Protection', amount: 25, season: [3, 4, 9, 10] }
    ];
    
    investmentBreakdown.forEach(item => {
      if (item.season.includes(currentMonth)) {
        focus.preparation.push(`${item.category}: $${item.amount}`);
      }
    });
  }
  
  // Add harvest reminders for current season
  if (currentMonth >= 6 && currentMonth <= 9) {
    focus.harvest.push('Summer crops at peak');
  } else if (currentMonth >= 10 || currentMonth <= 2) {
    focus.harvest.push('Cool-season crops');
  }
  
  return focus;
};

// Generate prioritized investment recommendations
export const generateInvestmentPriority = (locationConfig, microclimateEffects) => {
  const priorities = [];
  const currentMonth = new Date().getMonth() + 1;
  
  // Always include seeds as first priority
  priorities.push({
    category: 'Seeds & Starts',
    amount: 75,
    timing: 'buy now',
    urgency: 'immediate',
    description: 'Foundation of your garden'
  });
  
  // Add microclimate-specific priorities
  if (microclimateEffects?.temperatureAdjustment > 5) {
    priorities.push({
      category: 'Shade Infrastructure',
      amount: 60,
      timing: currentMonth >= 4 ? 'urgent' : 'before June',
      urgency: currentMonth >= 4 ? 'high' : 'medium',
      description: 'Essential for hot microclimate'
    });
  }
  
  if (microclimateEffects?.waterRequirementMultiplier > 1.2) {
    priorities.push({
      category: 'Irrigation Upgrade',
      amount: 85,
      timing: 'summer prep',
      urgency: 'medium',
      description: 'Efficient water management'
    });
  }
  
  // Add general infrastructure if needed
  if (priorities.length < 3) {
    priorities.push({
      category: 'Basic Infrastructure',
      amount: 45,
      timing: 'spring setup',
      urgency: 'low',
      description: 'Supports and containers'
    });
  }
  
  return priorities.slice(0, 3);
};

// Generate success outlook summary
export const generateSuccessOutlook = (simulationResults, locationConfig) => {
  if (!simulationResults || !simulationResults.harvestValue) return null;
  
  const outlook = {
    expectedValue: simulationResults.harvestValue?.mean || 0,
    confidence: simulationResults.successRate || 0,
    confidenceLevel: 'moderate'
  };
  
  // Determine confidence level
  if (outlook.confidence >= 80) {
    outlook.confidenceLevel = 'high';
    outlook.message = 'Excellent success potential';
  } else if (outlook.confidence >= 65) {
    outlook.confidenceLevel = 'good';
    outlook.message = 'Good success potential';
  } else if (outlook.confidence >= 50) {
    outlook.confidenceLevel = 'moderate';
    outlook.message = 'Moderate success expected';
  } else {
    outlook.confidenceLevel = 'challenging';
    outlook.message = 'Challenging conditions';
  }
  
  // Add microclimate boost message
  if (locationConfig?.microclimateEffects) {
    const effects = locationConfig.microclimateEffects;
    if (effects.temperatureAdjustment > 3 || effects.seasonExtension > 2) {
      outlook.boost = 'Microclimate advantages detected';
    }
  }
  
  return outlook;
};

// Generate top crop recommendations with visual confidence
export const generateTopCropRecommendations = (locationConfig, portfolio) => {
  if (!locationConfig || !portfolio) return [];
  
  const recommendations = [];
  const microEffects = locationConfig.microclimateEffects || {};
  const adaptedCrops = getClimateAdaptedCrops(locationConfig, 'extreme');
  
  // Get top portfolio categories
  const topCategories = Object.entries(portfolio)
    .filter(([_, percentage]) => percentage >= 10)
    .sort((a, b) => b[1] - a[1]);
  
  topCategories.forEach(([category, percentage]) => {
    const categoryName = category === 'heatSpecialists' ? 'heatTolerant' : category;
    if (!adaptedCrops[categoryName]) return;
    
    // Get top crops from this category
    const categoryRecommendations = Object.entries(adaptedCrops[categoryName])
      .slice(0, 2)
      .map(([cropKey, crop]) => {
        let confidence = 'medium';
        let reason = `${Math.round(percentage)}% of portfolio`;
        
        // Boost confidence based on microclimate
        if (category === 'heatSpecialists' && microEffects.temperatureAdjustment > 3) {
          confidence = 'high';
          reason = `Perfect for your warm microclimate`;
        } else if (category === 'coolSeason' && microEffects.temperatureAdjustment < -2) {
          confidence = 'high';
          reason = `Thrives in your cool conditions`;
        } else if (category === 'perennials') {
          confidence = 'high';
          reason = `Long-term investment`;
        }
        
        return {
          name: crop.displayName,
          confidence,
          reason,
          allocation: Math.round(percentage)
        };
      });
    
    recommendations.push(...categoryRecommendations);
  });
  
  return recommendations.slice(0, 6);
};