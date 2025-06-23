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
      drought: 'excellent', heat: 'excellent', humidity: 'excellent'
    },
    peppers: {
      name: { en: 'Hot Peppers', es: 'Chiles', fr: 'Piments' },
      zones: '5-11', minTemp: -5, maxTemp: 40, optimalTemp: [20, 30],
      plantingMonths: { temperate: [3, 4, 5], tropical: [1, 2, 11, 12], subtropical: [2, 3, 4, 10, 11] },
      harvestStart: 3, harvestDuration: 5, transplantWeeks: 6,
      drought: 'good', heat: 'excellent', humidity: 'good'
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
      drought: 'fair', heat: 'poor', humidity: 'good'
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
  
  // Otherwise use up to 3 decimal places
  return Math.round(percentage * 1000) / 1000;
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
  
  // Otherwise use up to 3 decimal places
  return Math.round(percentage * 1000) / 1000;
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
  
  // Adjust hardiness zone based on temperature effects
  const currentZoneNumber = getHardinessZoneNumber(baseConfig.hardiness);
  const tempAdjustment = microclimateEffects.temperatureAdjustment;
  
  // Each 5°F = roughly 0.5 hardiness zones
  const zoneAdjustment = Math.round(tempAdjustment / 10);
  const newZoneNumber = Math.max(1, Math.min(11, currentZoneNumber + zoneAdjustment));
  
  // Convert back to zone string (simplified)
  const zoneLetter = baseConfig.hardiness.includes('a') ? 'a' : 'b';
  adjustedConfig.microAdjustedZone = `${newZoneNumber}${zoneLetter}`;
  
  // Adjust season length
  adjustedConfig.seasonExtensionWeeks = microclimateEffects.seasonExtension;
  
  // Adjust water requirements
  adjustedConfig.waterMultiplier = microclimateEffects.waterRequirementMultiplier;
  
  // Sun requirements
  adjustedConfig.availableSunHours = microclimateEffects.sunlightHours;
  
  return adjustedConfig;
};