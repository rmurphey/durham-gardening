/**
 * Specific Recommendation Service
 * Converts all vague planning tasks into specific, actionable recommendations
 * with exact products, prices, and shopping list integration
 */

import { getLocationConfig, getCurrentMonthConfig, getSupplierPreferences } from '../config/locationConfig.js';

/**
 * Generate specific actionable recommendations for any planning scenario
 */
export const generateSpecificRecommendations = (scenario, context = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const { 
    bedSizes, 
    location = 'Durham, NC' 
  } = context;
  
  const locationConfig = getLocationConfig(location);
  const monthConfig = getCurrentMonthConfig(location);
  const suppliers = getSupplierPreferences(location);
  
  // Use location config for bed sizes if not provided
  const beds = bedSizes || locationConfig.bedConfiguration.standard;

  const params = { currentMonth, beds, locationConfig, monthConfig, suppliers };
  
  switch (scenario) {
    case 'spring-garden-layout':
      return getSpringLayoutRecommendations(params);
    
    case 'fall-garden-planning':
      return getFallPlanningRecommendations(params);
    
    case 'winter-garden-planning':
      return getWinterPlanningRecommendations(params);
    
    case 'next-year-planning':
      return getNextYearPlanningRecommendations(params);
    
    case 'heat-wave-preparation':
      return getHeatWaveRecommendations(params);
    
    case 'bed-rotation-planning':
      return getBedRotationRecommendations(params);
    
    case 'garden-review':
      return getGardenReviewRecommendations(params);
    
    default:
      return [];
  }
};

const getSpringLayoutRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  const springMonths = locationConfig.climate.seasons.spring;
  if (!springMonths.includes(currentMonth)) return [];
  
  const seedSupplier = suppliers.find(s => s.specialty?.includes('Seeds'))?.name || 'Local nursery';
  const localSupplier = suppliers.find(s => s.local)?.name || 'Local store';
  
  return [
    {
      id: 'soil-test-kit',
      item: `${locationConfig.soil.type.charAt(0).toUpperCase() + locationConfig.soil.type.slice(1)} Soil Test Kit`,
      price: 12.99,
      category: 'Spring Prep',
      urgency: 'medium',
      timing: 'Test soil before adding amendments',
      why: `Know exact needs for ${locationConfig.location.name} ${locationConfig.soil.type} soil`,
      where: localSupplier,
      quantity: 1,
      specifications: `Tests pH, nutrients for ${locationConfig.soil.type} soil management`
    },
    {
      id: 'measuring-layout-kit',
      item: 'Garden Layout Planning Kit',
      price: 18.00,
      category: 'Planning Tools',
      urgency: 'low',
      timing: 'Use during winter planning months',
      why: `Accurate measurements for ${beds.map(b => b.name || b).join(', ')} bed layout`,
      where: localSupplier,
      quantity: 1,
      specifications: '25ft tape measure, stakes, string, grid planning sheets'
    },
    {
      id: 'succession-planting-calendar',
      item: `${locationConfig.location.zone} Succession Planting Collection`,
      price: 32.00,
      category: 'Spring Seeds',
      urgency: 'medium',
      timing: 'Order now for staggered plantings',
      why: `Continuous harvest adapted to ${locationConfig.location.zone} growing season`,
      where: seedSupplier,
      quantity: 1,
      specifications: `Zone ${locationConfig.location.zone} varieties in succession packets`
    }
  ];
};

const getFallPlanningRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  // Check if we're in fall planning season (summer to early fall)
  if (currentMonth < 6 || currentMonth > 9) return [];
  
  const seedSupplier = suppliers.find(s => s.specialty?.includes('Seeds') || s.specialty?.includes('Heat-tolerant'))?.name || 'Local nursery';
  const localSupplier = suppliers.find(s => s.local)?.name || 'Local store';
  const firstFrost = locationConfig.climate.firstFrost;
  
  return [
    {
      id: 'fall-seed-collection',
      item: `${locationConfig.location.zone} Fall Garden Seed Collection`,
      price: 28.00,
      category: 'Fall Seeds',
      urgency: currentMonth >= 8 ? 'urgent' : 'high',
      timing: currentMonth >= 8 ? 'Order immediately for September planting' : 'Order for August-September planting',
      why: `Cool-season crops for fall harvest before ${firstFrost.description} frost`,
      where: seedSupplier,
      quantity: 1,
      specifications: `Zone ${locationConfig.location.zone} fall varieties: kale, spinach, lettuce, radishes`
    },
    {
      id: 'fall-fertilizer',
      item: `${locationConfig.soil.type.charAt(0).toUpperCase() + locationConfig.soil.type.slice(1)} Soil Fall Fertilizer`,
      price: 15.99,
      category: 'Fall Prep',
      urgency: 'medium',
      timing: 'Apply before fall planting',
      why: `Lower nitrogen blend appropriate for ${locationConfig.soil.type} soil and fall growth`,
      where: localSupplier,
      quantity: 1,
      specifications: `4-6-4 NPK ratio for ${locationConfig.soil.type} soil, covers 500 sq ft`
    },
    {
      id: 'row-covers',
      item: 'Season Extension Row Covers',
      price: 22.00,
      category: 'Season Extension',
      urgency: 'medium',
      timing: `Install before ${firstFrost.description} frost threat`,
      why: `Extends fall harvest by 4-6 weeks in ${locationConfig.location.zone}`,
      where: seedSupplier,
      quantity: 1,
      specifications: `10x20ft lightweight fabric for ${locationConfig.location.zone} frost protection`
    }
  ];
};

const getWinterPlanningRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  const winterMonths = locationConfig.climate.seasons.winter;
  const fallMonths = locationConfig.climate.seasons.fall;
  if (!winterMonths.includes(currentMonth) && !fallMonths.includes(currentMonth)) return [];
  
  const localSupplier = suppliers.find(s => s.local)?.name || 'Local store';
  const seedSupplier = suppliers.find(s => s.specialty?.includes('Seeds'))?.name || 'Local nursery';
  const firstFrost = locationConfig.climate.firstFrost;
  
  return [
    {
      id: 'cold-frame-kit',
      item: `${locationConfig.location.zone} Cold Frame Kit`,
      price: 89.99,
      category: 'Winter Growing',
      urgency: currentMonth >= 11 ? 'urgent' : 'high',
      timing: currentMonth >= 11 ? 'Build immediately before hard freeze' : `Build before ${firstFrost.description} freeze`,
      why: `Grow fresh greens through ${locationConfig.location.name} winter`,
      where: localSupplier,
      quantity: 1,
      specifications: `Polycarbonate panels for ${locationConfig.location.zone} winter conditions`
    },
    {
      id: 'winter-seeds',
      item: `${locationConfig.location.zone} Winter Hardy Greens`,
      price: 24.00,
      category: 'Winter Seeds',
      urgency: 'medium',
      timing: `Plant in cold frame by ${firstFrost.description}`,
      why: `Fresh greens all winter in ${locationConfig.location.zone} protected environment`,
      where: seedSupplier,
      quantity: 1,
      specifications: `Zone ${locationConfig.location.zone} winter varieties: hardy kale, spinach, mache`
    }
  ];
};

const getNextYearPlanningRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  const winterMonths = locationConfig.climate.seasons.winter;
  if (!winterMonths.includes(currentMonth) && currentMonth !== 11) return [];
  
  const seedSupplier = suppliers.find(s => s.specialty?.includes('Seeds'))?.name || 'Local nursery';
  const nextYear = new Date().getFullYear() + 1;
  
  return [
    {
      id: 'next-year-seed-order',
      item: `Early Bird ${nextYear} ${locationConfig.location.zone} Seed Collection`,
      price: 55.00,
      category: 'Next Year Planning',
      urgency: 'low',
      timing: 'Order by January for best selection and prices',
      why: `Secure ${locationConfig.location.zone}-adapted varieties before they sell out`,
      where: seedSupplier,
      quantity: 1,
      specifications: `Full year collection for ${locationConfig.location.zone}: spring, summer, fall varieties`
    },
    {
      id: 'garden-journal',
      item: `${locationConfig.location.name} Garden Planning Journal`,
      price: 16.99,
      category: 'Planning Tools',
      urgency: 'low',
      timing: 'Start tracking this winter',
      why: `Record ${locationConfig.location.name} specific successes and failures`,
      where: 'Amazon or bookstore',
      quantity: 1,
      specifications: `${locationConfig.location.zone} planting tracker, harvest log, local weather notes`
    }
  ];
};

const getHeatWaveRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  if (currentMonth < 4 || currentMonth > 8) return [];
  
  const localSupplier = suppliers.find(s => s.local)?.name || 'Local store';
  const heatThreshold = locationConfig.climate.heatWaveThreshold;
  const summerMonths = locationConfig.climate.criticalMonths.hottest;
  
  return [
    {
      id: 'emergency-cooling-kit',
      item: `${locationConfig.location.name} Heat Emergency Kit`,
      price: 45.00,
      category: 'Heat Wave Prep',
      urgency: summerMonths.includes(currentMonth) ? 'urgent' : 'high',
      timing: summerMonths.includes(currentMonth) ? 'Deploy immediately during heat waves' : 'Prepare before summer heat',
      why: `Save crops during ${heatThreshold}°F+ ${locationConfig.location.name} heat waves`,
      where: localSupplier,
      quantity: 1,
      specifications: `${locationConfig.infrastructure.shadeCloth.percentage}% shade cloth, soaker hoses, mulch for ${locationConfig.soil.type} soil`
    },
    {
      id: 'backup-water-system',
      item: 'Backup Watering System',
      price: 67.00,
      category: 'Heat Wave Prep',
      urgency: 'high',
      timing: 'Deploy before peak summer',
      why: `Redundant watering essential for ${locationConfig.location.name} summer survival`,
      where: localSupplier,
      quantity: 1,
      specifications: `Portable sprinkler, 100ft hose, timer for ${beds.reduce((total, bed) => total + (bed.area || 20), 0)} sq ft`
    }
  ];
};

const getBedRotationRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  const growingMonths = [...locationConfig.climate.seasons.spring, ...locationConfig.climate.seasons.summer];
  
  if (growingMonths.includes(currentMonth)) return []; // Don't recommend bed changes during growing season
  
  const localSupplier = suppliers.find(s => s.local)?.name || 'Local store';
  const totalArea = beds.reduce((sum, bed) => sum + (bed.area || 20), 0);
  
  return [
    {
      id: 'soil-amendment-rotation',
      item: `${locationConfig.soil.type.charAt(0).toUpperCase() + locationConfig.soil.type.slice(1)} Soil Amendment Kit`,
      price: 34.00,
      category: 'Soil Management',
      urgency: 'medium',
      timing: 'Apply during bed transitions',
      why: `Different amendments for ${locationConfig.soil.type} soil crop families`,
      where: localSupplier,
      quantity: 1,
      specifications: `Compost, bone meal, kelp meal for ${locationConfig.soil.type} soil rotation`
    },
    {
      id: 'cover-crop-seeds',
      item: `${locationConfig.location.zone} Cover Crop Seed Mix`,
      price: 18.00,
      category: 'Soil Improvement',
      urgency: 'low',
      timing: 'Plant in unused beds during off-season',
      why: `Improve ${locationConfig.soil.type} soil structure and fertility between main crops`,
      where: localSupplier,
      quantity: Math.ceil(totalArea / 200), // 1 package per 200 sq ft
      specifications: `Crimson clover, winter rye mix for ${locationConfig.location.zone}`
    }
  ];
};

const getGardenReviewRecommendations = ({ currentMonth, beds, locationConfig, suppliers }) => {
  const localSupplier = suppliers.find(s => s.local)?.name || 'Local store';
  
  return [
    {
      id: 'garden-evaluation-tools',
      item: `${locationConfig.location.name} Garden Assessment Kit`,
      price: 24.99,
      category: 'Garden Analysis',
      urgency: 'low',
      timing: 'Use during any season for evaluation',
      why: `Systematic review of ${locationConfig.location.zone} garden performance and needs`,
      where: localSupplier,
      quantity: 1,
      specifications: `pH meter for ${locationConfig.soil.type} soil, moisture meter, ${locationConfig.location.zone} planning templates`
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