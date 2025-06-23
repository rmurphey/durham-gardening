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
  budget: 400
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

// Utility function for consistent percentage formatting (zero decimal places)
export const formatPercentage = (decimal) => {
  return Math.round(decimal * 100);
};