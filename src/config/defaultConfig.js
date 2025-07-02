/**
 * Generic Default Configuration
 * Location-agnostic defaults for garden application
 */

// Generic fallback configuration - no location-specific data
export const DEFAULT_CONFIG = {
  name: 'My Garden',
  hardiness: null,
  lat: null,
  lon: null,
  
  // Generic defaults that apply to most temperate gardens
  avgRainfall: 40,
  heatDays: 90,
  heatIntensity: 3,
  winterSeverity: 3,
  gardenSize: 2,
  investmentLevel: 3,
  marketMultiplier: 1.0,
  gardenSizeActual: 100,
  budget: 400,
  microclimate: {
    slope: 'flat',
    aspect: 'south',
    windExposure: 'moderate',
    soilDrainage: 'moderate',
    buildingHeat: 'minimal',
    canopyShade: 'partial',
    elevation: 'average',
    waterAccess: 'municipal',
    frostPocket: false,
    reflectiveHeat: 'minimal'
  }
};

// Generic crop categories - no location-specific varieties or timing
export const DEFAULT_CROPS = {
  // Heat-tolerant crops suitable for summer growing
  heatLovers: [
    'okra',
    'hot peppers', 
    'sweet potatoes',
    'eggplant',
    'southern peas',
    'yard-long beans'
  ],
  
  // Cool season crops for spring/fall/winter
  coolSeason: [
    'kale',
    'lettuce',
    'spinach',
    'arugula',
    'radishes',
    'carrots',
    'beets',
    'broccoli'
  ],
  
  // Perennial crops - long-term investments
  perennials: [
    'asparagus',
    'rhubarb',
    'berry bushes',
    'fruit trees',
    'herbs'
  ]
};

// Generic planting principles - no specific dates or locations
export const DEFAULT_CALENDAR = {
  winter: {
    focus: 'Planning and seed ordering',
    activities: ['Plan garden layout', 'Order seeds', 'Indoor seed starting prep']
  },
  spring: {
    focus: 'Cool season planting and preparation',
    activities: ['Start cool season crops', 'Prepare beds', 'Set up infrastructure']
  },
  summer: {
    focus: 'Heat season crops and maintenance',
    activities: ['Plant heat-loving crops', 'Harvest and maintain', 'Plan fall garden']
  },
  fall: {
    focus: 'Fall planting and harvest',
    activities: ['Plant fall crops', 'Harvest summer crops', 'Prepare for winter']
  }
};

// No legacy Durham exports - force users to configure their actual location