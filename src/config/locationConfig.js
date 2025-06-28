/**
 * Location-Specific Garden Configuration
 * Centralized config for different geographic locations and growing conditions
 */

// Import default configuration  
// import { DEFAULT_CONFIG } from './defaultConfig.js'; // Unused, commented out

// Default Zone 7b Configuration  
export const DURHAM_CONFIG = {
  location: {
    name: 'Zone 7b Location',
    zone: '7b',
    region: 'Southeast US',
    coordinates: { lat: 35.9940, lng: -78.8986 }
  },
  
  climate: {
    // Growing season characteristics
    lastFrost: { month: 3, day: 15, description: 'Mid-March' },
    firstFrost: { month: 11, day: 15, description: 'Mid-November' },
    growingSeason: 245, // days
    heatWaveThreshold: 95, // °F
    extremeHeatDays: 15, // average per year
    
    // Monthly characteristics
    seasons: {
      winter: [12, 1, 2],
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      fall: [9, 10, 11]
    },
    
    criticalMonths: {
      hottest: [7, 8], // July-August
      planting: [3, 4, 8, 9], // Spring and fall planting windows
      dormant: [12, 1, 2] // Planning season
    }
  },
  
  soil: {
    type: 'clay',
    drainage: 'poor_when_wet',
    pH: 6.2,
    amendments: [
      'Compost for drainage',
      'Never work when wet',
      'Add organic matter annually'
    ]
  },
  
  infrastructure: {
    irrigation: {
      essential: true,
      urgentMonths: [4, 5], // Must install before summer
      reason: 'Durham summers brutal without irrigation'
    },
    
    shadeCloth: {
      essential: true,
      percentage: 30,
      urgentMonths: [4],
      reason: 'Prevents crop failure in summer heat'
    },
    
    coldProtection: {
      useful: true,
      months: [10, 11],
      reason: 'Extends fall harvest season'
    }
  },
  
  suppliers: {
    preferred: [
      {
        name: 'True Leaf Market',
        url: 'trueleafmarket.com',
        specialty: 'Seeds',
        local: false,
        notes: 'Proven success with Durham gardeners'
      },
      {
        name: 'Southern Exposure Seed Exchange',
        url: 'southernexposure.com', 
        specialty: 'Heat-tolerant varieties',
        local: false,
        notes: 'Southeast-adapted varieties'
      },
      {
        name: 'Home Depot',
        specialty: 'Infrastructure supplies',
        local: true,
        notes: 'Immediate pickup for urgent items'
      }
    ]
  },
  
  bedConfiguration: {
    standard: [
      { name: '3×15 Bed', length: 15, width: 3, area: 45, use: 'succession crops' },
      { name: '4×8 Bed', length: 8, width: 4, area: 32, use: 'main heat crops' },
      { name: '4×5 Bed', length: 5, width: 4, area: 20, use: 'rotation/fall crops' },
      { name: 'Containers', area: 15, use: 'mobile/specialty crops' }
    ]
  },
  
  monthlyRecommendations: {
    1: { // January
      focus: 'Indoor seed starting prep',
      priority: 'seed-starting-setup',
      urgentItems: ['Indoor seed starting kit', 'Grow lights'],
      avoidItems: ['Irrigation installation', 'Shade cloth']
    },
    2: { // February  
      focus: 'Active seed starting',
      priority: 'seed-starting-supplies',
      urgentItems: ['Seed starting soil', 'Compost ordering'],
      avoidItems: ['Summer infrastructure']
    },
    3: { // March
      focus: 'Spring prep and planning',
      priority: 'infrastructure-planning', 
      urgentItems: ['Irrigation planning', 'Shade structure prep'],
      avoidItems: ['Fall seeds']
    },
    4: { // April
      focus: 'Critical installation window',
      priority: 'urgent-infrastructure',
      urgentItems: ['Irrigation system', 'Shade cloth'],
      avoidItems: ['Planning items']
    },
    5: { // May - August: Summer survival
      focus: 'Emergency interventions only',
      priority: 'emergency-only',
      urgentItems: ['Emergency shade', 'Mulch'],
      avoidItems: ['Infrastructure installation', 'Planning']
    },
    9: { // September
      focus: 'Fall transition',
      priority: 'fall-establishment',
      urgentItems: ['Fall planting supplies'],
      avoidItems: ['Summer infrastructure']
    },
    10: { // October-November: Winter prep
      focus: 'Winter preparation',
      priority: 'winter-prep',
      urgentItems: ['Cold protection', 'Season extension'],
      avoidItems: ['Summer items']
    },
    12: { // December
      focus: 'Planning and ordering',
      priority: 'next-year-planning',
      urgentItems: ['Seed orders', 'Planning tools'],
      avoidItems: ['Installation items']
    }
  }
};

// Template for other locations
export const LOCATION_TEMPLATE = {
  location: {
    name: '',
    zone: '',
    region: '',
    coordinates: { lat: 0, lng: 0 }
  },
  climate: {
    lastFrost: { month: 0, day: 0, description: '' },
    firstFrost: { month: 0, day: 0, description: '' },
    growingSeason: 0,
    heatWaveThreshold: 0,
    extremeHeatDays: 0,
    seasons: {
      winter: [],
      spring: [],
      summer: [],
      fall: []
    }
  },
  soil: {
    type: '',
    drainage: '',
    pH: 0,
    amendments: []
  },
  infrastructure: {
    irrigation: { essential: false, urgentMonths: [], reason: '' },
    shadeCloth: { essential: false, percentage: 0, urgentMonths: [], reason: '' },
    coldProtection: { useful: false, months: [], reason: '' }
  },
  suppliers: {
    preferred: []
  },
  bedConfiguration: {
    standard: []
  },
  monthlyRecommendations: {}
};

// Additional location configs can be added here
// export const SEATTLE_CONFIG = { ... };
// export const PHOENIX_CONFIG = { ... };

// Helper functions to get location-specific data
export const getLocationConfig = (locationName = 'Zone 7b Location') => {
  switch (locationName) {
    case 'Zone 7b Location':
    case 'Durham, NC': // Legacy support
      return DURHAM_CONFIG;
    default:
      console.warn(`Location config not found for: ${locationName}. Using Zone 7b default.`);
      return DURHAM_CONFIG;
  }
};

export const getCurrentMonthConfig = (locationName = 'Zone 7b Location') => {
  const config = getLocationConfig(locationName);
  const currentMonth = new Date().getMonth() + 1;
  
  // Get monthly config, with fallback logic
  let monthConfig = config.monthlyRecommendations[currentMonth];
  
  if (!monthConfig) {
    // Fall back to season-based recommendations
    const { seasons } = config.climate;
    if (seasons.winter.includes(currentMonth)) {
      monthConfig = config.monthlyRecommendations[12] || { focus: 'Winter maintenance', priority: 'planning' };
    } else if (seasons.spring.includes(currentMonth)) {
      monthConfig = config.monthlyRecommendations[3] || { focus: 'Spring preparation', priority: 'planning' };
    } else if (seasons.summer.includes(currentMonth)) {
      monthConfig = config.monthlyRecommendations[5] || { focus: 'Summer maintenance', priority: 'emergency-only' };
    } else {
      monthConfig = config.monthlyRecommendations[9] || { focus: 'Fall transition', priority: 'seasonal' };
    }
  }
  
  return {
    ...monthConfig,
    locationConfig: config,
    currentMonth
  };
};

export const getSupplierPreferences = (locationName = 'Zone 7b Location', category = 'all') => {
  const config = getLocationConfig(locationName);
  const suppliers = config.suppliers.preferred;
  
  if (category === 'all') return suppliers;
  
  return suppliers.filter(supplier => 
    supplier.specialty?.toLowerCase().includes(category.toLowerCase())
  );
};

export const shouldRecommendItem = (itemCategory, locationName = 'Zone 7b Location') => {
  const monthConfig = getCurrentMonthConfig(locationName);
  const { urgentItems = [], avoidItems = [] } = monthConfig;
  
  // Check if item should be avoided this month
  if (avoidItems.some(avoid => itemCategory.toLowerCase().includes(avoid.toLowerCase()))) {
    return false;
  }
  
  // Check if item is urgent this month  
  if (urgentItems.some(urgent => itemCategory.toLowerCase().includes(urgent.toLowerCase()))) {
    return true;
  }
  
  // Default: allow non-urgent, non-avoided items
  return true;
};