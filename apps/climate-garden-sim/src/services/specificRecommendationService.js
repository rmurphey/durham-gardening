/**
 * Specific Recommendation Service
 * Converts all vague planning tasks into specific, actionable recommendations
 * with exact products, prices, and shopping list integration
 */

/**
 * Generate specific actionable recommendations for any planning scenario
 */
export const generateSpecificRecommendations = (scenario, context = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const { bedSizes = ['3×15', '4×8', '4×5'], budget = 'moderate' } = context;

  switch (scenario) {
    case 'spring-garden-layout':
      return getSpringLayoutRecommendations(currentMonth, bedSizes);
    
    case 'fall-garden-planning':
      return getFallPlanningRecommendations(currentMonth);
    
    case 'winter-garden-planning':
      return getWinterPlanningRecommendations(currentMonth);
    
    case 'next-year-planning':
      return getNextYearPlanningRecommendations(currentMonth);
    
    case 'heat-wave-preparation':
      return getHeatWaveRecommendations(currentMonth);
    
    case 'bed-rotation-planning':
      return getBedRotationRecommendations(currentMonth, bedSizes);
    
    case 'garden-review':
      return getGardenReviewRecommendations(currentMonth);
    
    default:
      return [];
  }
};

const getSpringLayoutRecommendations = (month, bedSizes) => {
  if (month < 1 || month > 4) return [];
  
  return [
    {
      id: 'soil-test-kit',
      item: 'Soil pH and Nutrient Test Kit',
      price: 12.99,
      category: 'Spring Prep',
      urgency: 'medium',
      timing: 'Test soil before adding amendments',
      why: 'Know exact soil needs before buying fertilizers and amendments',
      where: 'Home Depot or Amazon',
      quantity: 1,
      specifications: 'Tests pH, nitrogen, phosphorus, potassium levels'
    },
    {
      id: 'measuring-layout-kit',
      item: 'Garden Layout Planning Kit',
      price: 18.00,
      category: 'Planning Tools',
      urgency: 'low',
      timing: 'Use during winter planning months',
      why: 'Accurate bed measurements for optimal plant spacing',
      where: 'Harbor Freight or Amazon',
      quantity: 1,
      specifications: '25ft tape measure, stakes, string, grid planning sheets'
    },
    {
      id: 'succession-planting-calendar',
      item: 'Succession Planting Seed Collection',
      price: 32.00,
      category: 'Spring Seeds',
      urgency: 'medium',
      timing: 'Order now for staggered plantings',
      why: 'Continuous harvest with 2-week intervals',
      where: 'True Leaf Market',
      quantity: 1,
      specifications: 'Lettuce, radish, beans in weekly succession packets'
    }
  ];
};

const getFallPlanningRecommendations = (month) => {
  if (month < 6 || month > 9) return [];
  
  return [
    {
      id: 'fall-seed-collection',
      item: 'Fall Garden Seed Collection',
      price: 28.00,
      category: 'Fall Seeds',
      urgency: month >= 8 ? 'urgent' : 'high',
      timing: month >= 8 ? 'Order immediately for September planting' : 'Order for August-September planting',
      why: 'Cool-season crops for fall and winter harvest',
      where: 'Southern Exposure or True Leaf Market',
      quantity: 1,
      specifications: 'Kale, spinach, lettuce, radishes, Asian greens'
    },
    {
      id: 'fall-fertilizer',
      item: 'Organic Fall Garden Fertilizer',
      price: 15.99,
      category: 'Fall Prep',
      urgency: 'medium',
      timing: 'Apply before fall planting',
      why: 'Lower nitrogen blend appropriate for fall growth',
      where: 'Local nursery or Espoma online',
      quantity: 1,
      specifications: '4-6-4 NPK ratio, covers 500 sq ft'
    },
    {
      id: 'row-covers',
      item: 'Floating Row Covers for Season Extension',
      price: 22.00,
      category: 'Season Extension',
      urgency: 'medium',
      timing: 'Install before first frost threat',
      why: 'Extends fall harvest by 4-6 weeks',
      where: 'Johnny Seeds or local supplier',
      quantity: 1,
      specifications: '10x20ft lightweight fabric, includes hoops'
    }
  ];
};

const getWinterPlanningRecommendations = (month) => {
  if (month < 10 && month > 2) return [];
  
  return [
    {
      id: 'cold-frame-kit',
      item: 'DIY Cold Frame Construction Kit',
      price: 89.99,
      category: 'Winter Growing',
      urgency: month >= 11 ? 'urgent' : 'high',
      timing: month >= 11 ? 'Build immediately before hard freeze' : 'Build before November freeze',
      why: 'Grow fresh greens through Durham winter',
      where: 'Home Depot or cold frame kit supplier',
      quantity: 1,
      specifications: 'Polycarbonate panels, hinges, automatic vent opener'
    },
    {
      id: 'winter-seeds',
      item: 'Winter Hardy Greens Seed Collection',
      price: 24.00,
      category: 'Winter Seeds',
      urgency: 'medium',
      timing: 'Plant in cold frame by early November',
      why: 'Fresh greens all winter in protected environment',
      where: 'High Mowing Seeds or Southern Exposure',
      quantity: 1,
      specifications: 'Winter-hardy kale, spinach, mache, winter lettuce'
    }
  ];
};

const getNextYearPlanningRecommendations = (month) => {
  if (month < 11 && month > 2) return [];
  
  return [
    {
      id: 'next-year-seed-order',
      item: 'Early Bird 2025 Seed Collection',
      price: 55.00,
      category: 'Next Year Planning',
      urgency: 'low',
      timing: 'Order by January for best selection and prices',
      why: 'Secure popular varieties before they sell out',
      where: 'True Leaf Market or Southern Exposure',
      quantity: 1,
      specifications: 'Full year collection: spring, summer, fall varieties'
    },
    {
      id: 'garden-journal',
      item: 'Garden Planning Journal and Tracker',
      price: 16.99,
      category: 'Planning Tools',
      urgency: 'low',
      timing: 'Start tracking this winter',
      why: 'Record successes and failures for better next-year planning',
      where: 'Amazon or bookstore',
      quantity: 1,
      specifications: 'Planting tracker, harvest log, weather notes, variety records'
    }
  ];
};

const getHeatWaveRecommendations = (month) => {
  if (month < 4 || month > 8) return [];
  
  return [
    {
      id: 'emergency-cooling-kit',
      item: 'Garden Heat Emergency Kit',
      price: 45.00,
      category: 'Heat Wave Prep',
      urgency: month >= 6 ? 'urgent' : 'high',
      timing: month >= 6 ? 'Deploy immediately during heat waves' : 'Prepare before summer heat',
      why: 'Save crops during 95°F+ Durham heat waves',
      where: 'Local garden center for immediate pickup',
      quantity: 1,
      specifications: 'Shade cloth, soaker hoses, mulch, plant cooling spray'
    },
    {
      id: 'backup-water-system',
      item: 'Backup Watering System',
      price: 67.00,
      category: 'Heat Wave Prep',
      urgency: 'high',
      timing: 'Install before peak summer',
      why: 'Redundant watering when primary irrigation fails',
      where: 'Home Depot or irrigation supplier',
      quantity: 1,
      specifications: 'Portable sprinkler, 100ft hose, timer, backup fittings'
    }
  ];
};

const getBedRotationRecommendations = (month, bedSizes) => {
  const currentSeason = month >= 3 && month <= 8 ? 'growing' : 'planning';
  
  if (currentSeason === 'growing') return []; // Don't recommend bed changes during growing season
  
  return [
    {
      id: 'soil-amendment-rotation',
      item: 'Bed Rotation Soil Amendment Kit',
      price: 34.00,
      category: 'Soil Management',
      urgency: 'medium',
      timing: 'Apply during bed transitions',
      why: 'Different amendments for different crop families',
      where: 'Local nursery or bulk supplier',
      quantity: 1,
      specifications: 'Compost, bone meal, kelp meal for proper rotation'
    },
    {
      id: 'cover-crop-seeds',
      item: 'Cover Crop Seed Mix for Bed Rest',
      price: 18.00,
      category: 'Soil Improvement',
      urgency: 'low',
      timing: 'Plant in unused beds during off-season',
      why: 'Improve soil structure and fertility between main crops',
      where: 'Southern States or seed supplier',
      quantity: 1,
      specifications: 'Crimson clover, winter rye mix for Durham Zone 7b'
    }
  ];
};

const getGardenReviewRecommendations = (month) => {
  return [
    {
      id: 'garden-evaluation-tools',
      item: 'Garden Assessment and Planning Tools',
      price: 24.99,
      category: 'Garden Analysis',
      urgency: 'low',
      timing: 'Use during any season for evaluation',
      why: 'Systematic review of garden performance and needs',
      where: 'Amazon or garden supply',
      quantity: 1,
      specifications: 'pH meter, moisture meter, planning templates, record sheets'
    }
  ];
};

/**
 * Convert any vague planning task into specific recommendations
 */
export const convertVagueTaskToSpecific = (vagueTask, context = {}) => {
  // Map common vague task patterns to specific scenarios
  const taskMappings = {
    'plan spring garden layout': 'spring-garden-layout',
    'design bed rotations': 'bed-rotation-planning', 
    'plan succession plantings': 'spring-garden-layout',
    'plan fall garden': 'fall-garden-planning',
    'plan winter garden': 'winter-garden-planning',
    'plan next year': 'next-year-planning',
    'heat wave planning': 'heat-wave-preparation',
    'review garden status': 'garden-review',
    'prepare for season': month => {
      const currentMonth = new Date().getMonth() + 1;
      if (currentMonth >= 9 || currentMonth <= 2) return 'winter-garden-planning';
      if (currentMonth >= 6 && currentMonth <= 8) return 'heat-wave-preparation';
      return 'spring-garden-layout';
    }
  };
  
  const taskLower = vagueTask.toLowerCase();
  let scenario = null;
  
  // Find matching scenario
  for (const [pattern, scenarioOrFunc] of Object.entries(taskMappings)) {
    if (taskLower.includes(pattern)) {
      scenario = typeof scenarioOrFunc === 'function' ? scenarioOrFunc() : scenarioOrFunc;
      break;
    }
  }
  
  if (!scenario) {
    console.warn(`No specific recommendations found for vague task: ${vagueTask}`);
    return [];
  }
  
  return generateSpecificRecommendations(scenario, context);
};