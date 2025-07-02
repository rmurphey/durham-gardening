/**
 * Specific Recommendation Service
 * Simplified service that works with dynamic locationConfig
 */

/**
 * Generate specific actionable recommendations for any planning scenario
 * Now uses dynamic locationConfig instead of static Durham-specific data
 */
export const generateSpecificRecommendations = (scenario, context = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const { 
    bedSizes = [
      { name: 'Standard Bed', length: 8, width: 4, area: 32, use: 'main crops' },
      { name: 'Small Bed', length: 4, width: 4, area: 16, use: 'herbs and greens' }
    ],
    locationConfig = null
  } = context;
  
  // Use provided locationConfig or basic defaults
  const location = locationConfig || {
    name: 'Your Garden',
    hardiness: '7b',
    lat: null,
    lon: null
  };

  const params = { currentMonth, bedSizes, locationConfig: location };
  
  switch (scenario) {
    case 'spring-garden-layout':
      return getSpringLayoutRecommendations(params);
    
    case 'fall-garden-planning':
      return getFallPlanningRecommendations(params);
    
    case 'winter-garden-planning':
      return getWinterPlanningRecommendations(params);
    
    case 'next-year-planning':
      return getNextYearPlanningRecommendations(params);
    
    case 'seed-starting-setup':
      return getSeedStartingRecommendations(params);
    
    default:
      return getGeneralRecommendations(params);
  }
};

// Simplified recommendation functions without Durham-specific data
const getSpringLayoutRecommendations = ({ currentMonth, bedSizes, locationConfig }) => {
  return {
    title: 'Spring Garden Layout',
    description: 'Set up your garden beds for the growing season',
    items: [
      {
        category: 'Planning',
        items: [
          'Measure and plan bed locations',
          'Determine sun/shade patterns',
          'Plan irrigation access'
        ]
      },
      {
        category: 'Infrastructure',
        items: [
          'Install irrigation system',
          'Set up plant supports',
          'Prepare soil amendments'
        ]
      }
    ]
  };
};

const getFallPlanningRecommendations = ({ currentMonth, bedSizes, locationConfig }) => {
  return {
    title: 'Fall Garden Planning',
    description: 'Prepare for fall and winter growing season',
    items: [
      {
        category: 'Cool Season Crops',
        items: [
          'Plant lettuce and greens',
          'Start broccoli transplants',
          'Sow radish and turnips'
        ]
      },
      {
        category: 'Season Extension',
        items: [
          'Install row covers',
          'Plan cold frames',
          'Harvest summer crops'
        ]
      }
    ]
  };
};

const getWinterPlanningRecommendations = ({ currentMonth, bedSizes, locationConfig }) => {
  return {
    title: 'Winter Garden Planning',
    description: 'Maintain productivity through winter months',
    items: [
      {
        category: 'Hardy Crops',
        items: [
          'Maintain kale and collards',
          'Harvest root vegetables',
          'Protect tender plants'
        ]
      },
      {
        category: 'Planning',
        items: [
          'Order next year\'s seeds',
          'Plan garden improvements',
          'Review this year\'s successes'
        ]
      }
    ]
  };
};

const getNextYearPlanningRecommendations = ({ currentMonth, bedSizes, locationConfig }) => {
  return {
    title: 'Next Year Planning',
    description: 'Strategic planning for the upcoming growing season',
    items: [
      {
        category: 'Seed Orders',
        items: [
          'Review variety performance',
          'Order new varieties to try',
          'Plan succession plantings'
        ]
      },
      {
        category: 'Infrastructure',
        items: [
          'Plan garden expansions',
          'Upgrade irrigation systems',
          'Improve soil amendments'
        ]
      }
    ]
  };
};

const getSeedStartingRecommendations = ({ currentMonth, bedSizes, locationConfig }) => {
  return {
    title: 'Seed Starting Setup',
    description: 'Equipment and supplies for indoor seed starting',
    items: [
      {
        category: 'Equipment',
        items: [
          'Seed starting trays',
          'Grow lights or sunny window',
          'Heat mat for germination'
        ]
      },
      {
        category: 'Supplies',
        items: [
          'Seed starting mix',
          'Labels for varieties',
          'Transplant containers'
        ]
      }
    ]
  };
};

const getGeneralRecommendations = ({ currentMonth, bedSizes, locationConfig }) => {
  return {
    title: 'General Garden Recommendations',
    description: 'Basic gardening guidance for your location',
    items: [
      {
        category: 'Seasonal Tasks',
        items: [
          'Monitor weather conditions',
          'Maintain plant health',
          'Plan upcoming activities'
        ]
      },
      {
        category: 'Garden Care',
        items: [
          'Water deeply and regularly',
          'Mulch around plants',
          'Observe pest and disease pressure'
        ]
      }
    ]
  };
};