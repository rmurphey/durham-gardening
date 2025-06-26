/**
 * Database-Driven Garden Calendar Service
 * Generates calendar activities using database templates instead of hard-coded logic
 */

import { databaseService } from './databaseService.js';
import { shouldShowCropActivity } from '../config/gardenStatus.js';

/**
 * Generate garden calendar using database templates
 * @param {string} summerScenario - Selected summer scenario  
 * @param {string} winterScenario - Selected winter scenario
 * @param {string} portfolioKey - Selected portfolio strategy
 * @param {Object} locationConfig - Location configuration
 * @param {Object} customPortfolio - Custom portfolio if applicable
 * @returns {Promise<Array>} Array of monthly calendar entries
 */
export const generateDatabaseGardenCalendar = async (
  summerScenario, 
  winterScenario, 
  portfolioKey, 
  locationConfig, 
  customPortfolio = null
) => {
  if (!locationConfig || !summerScenario || !winterScenario || !portfolioKey) {
    return [];
  }

  const currentMonth = new Date().getMonth() + 1;
  const calendar = [];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get enabled crops from portfolio - expanded to include indoor start crops
  const enabledCrops = [
    // Original crops
    'hot_peppers', 'sweet_potato', 'kale', 'lettuce', 'spinach',
    // New indoor start crops
    'tomatoes', 'sweet_peppers', 'eggplant', 'basil',
    // Additional herbs and quick crops
    'oregano', 'thyme', 'mint', 'arugula', 'radishes',
    // Microgreen varieties
    'microgreen_peas', 'microgreen_radish', 'microgreen_broccoli',
    // Sprouting varieties
    'mung_beans', 'alfalfa_sprouts', 'broccoli_sprouts',
    // Hydroponic suitable crops
    'hydroponic_lettuce', 'hydroponic_herbs', 'hydroponic_greens'
  ];

  // Generate calendar for next 12 months
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12;
    const monthNumber = monthIndex + 1;
    const month = months[monthIndex];
    const activities = [];

    console.log(`Generating calendar for ${month} (month ${monthNumber})`);
    console.log(`Enabled crops:`, enabledCrops);

    try {
      // Get activities from database templates
      const [activityTemplates, rotationTemplates, successionTemplates] = await Promise.all([
        databaseService.getActivityTemplates(1, monthNumber, enabledCrops),
        databaseService.getRotationTemplates(1, monthNumber), 
        databaseService.getSuccessionTemplates(1, monthNumber)
      ]);

      console.log(`${month} - Found ${activityTemplates.length} activity templates, ${rotationTemplates.length} rotation templates, ${successionTemplates.length} succession templates`);

      // Process activity templates
      activityTemplates.forEach(template => {
        // Debug logging for indoor start activities
        if (template.activity_type === 'indoor-starting') {
          console.log(`Processing indoor start template:`, template);
        }
        
        // Check if this crop activity should be shown based on garden status
        if (template.plant_key && !shouldShowCropActivity(template.plant_key, template.activity_type)) {
          console.log(`Filtered out activity: ${template.plant_key} ${template.activity_type}`);
          return;
        }

        const activity = {
          type: template.activity_type,
          crop: template.plant_key ? getCropDisplayName(template.plant_key) : 'General',
          action: databaseService.generateActionText(template),
          timing: databaseService.generateTimingText(template),
          priority: template.priority || 'medium'
        };
        
        // Debug logging for indoor start activities
        if (template.activity_type === 'indoor-starting') {
          console.log(`Added indoor start activity:`, activity);
        }
        
        activities.push(activity);
      });

      // Process rotation templates  
      rotationTemplates.forEach(template => {
        activities.push({
          type: template.activity_type,
          crop: 'Bed Management',
          action: databaseService.generateActionText(template),
          timing: databaseService.generateTimingText(template),
          priority: template.priority || 'medium'
        });
      });

      // Process succession templates
      successionTemplates.forEach(template => {
        // Check garden status for succession crops
        if (template.plant_key && !shouldShowCropActivity(template.plant_key, template.activity_type)) {
          return;
        }

        activities.push({
          type: template.activity_type,
          crop: template.plant_key ? getCropDisplayName(template.plant_key) : 'Succession Planning',
          action: databaseService.generateActionText(template),
          timing: databaseService.generateTimingText(template),
          priority: template.priority || 'medium'
        });
      });

      // Add Durham seasonal activities and comprehensive maintenance tasks
      addDurhamSeasonalActivities(activities, monthNumber);
      addMaintenanceTasks(activities, monthNumber, summerScenario, winterScenario, locationConfig);

    } catch (error) {
      console.error(`Error generating calendar for month ${monthNumber}:`, error);
      // Fallback to basic activity
      activities.push({
        type: 'planning',
        crop: 'Garden Planning',
        action: 'Review garden status and plan activities',
        timing: 'Monthly garden check-in',
        priority: 'low'
      });
    }

    // Sort activities by priority and type
    activities.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const typeOrder = { 
        'indoor-starting': 1,
        'aerogarden': 2,
        'microgreen': 3,
        'sprouting': 4,
        'screen-porch': 5,
        'shopping': 6,
        'direct-sow': 7, 
        'transplant': 8,
        'succession': 9,
        'harvest': 10, 
        'care': 11,
        'rotation': 12,
        'infrastructure': 13,
        'planning': 14
      };
      
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return typeOrder[a.type] - typeOrder[b.type];
    });

    calendar.push({
      month,
      monthNumber,
      activities: activities.slice(0, 8) // Limit to 8 activities per month
    });
  }

  return calendar;
};

/**
 * Get display name for crop key
 * @param {string} cropKey - Plant key from database
 * @returns {string} Display name
 */
function getCropDisplayName(cropKey) {
  const displayNames = {
    'hot_peppers': 'Hot Peppers',
    'sweet_potato': 'Sweet Potato', 
    'kale': 'Kale',
    'lettuce': 'Lettuce',
    'spinach': 'Spinach',
    'okra': 'Okra',
    'amaranth': 'Amaranth',
    'malabar_spinach': 'Malabar Spinach',
    'cabbage': 'Cabbage',
    'carrots': 'Carrots',
    'tomatoes': 'Tomatoes',
    'sweet_peppers': 'Sweet Peppers',
    'eggplant': 'Eggplant',
    'basil': 'Basil',
    'oregano': 'Oregano',
    'thyme': 'Thyme',
    'mint': 'Mint',
    'arugula': 'Arugula',
    'radishes': 'Radishes',
    'microgreen_peas': 'Pea Microgreens',
    'microgreen_radish': 'Radish Microgreens',
    'microgreen_broccoli': 'Broccoli Microgreens',
    'mung_beans': 'Mung Bean Sprouts',
    'alfalfa_sprouts': 'Alfalfa Sprouts',
    'broccoli_sprouts': 'Broccoli Sprouts',
    'hydroponic_lettuce': 'Hydroponic Lettuce',
    'hydroponic_herbs': 'Hydroponic Herbs',
    'hydroponic_greens': 'Hydroponic Greens'
  };
  
  return displayNames[cropKey] || cropKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Add comprehensive maintenance tasks for Durham gardening
 * @param {Array} activities - Activities array to modify
 * @param {number} monthNumber - Month number (1-12)
 * @param {string} summerScenario - Summer climate scenario
 * @param {string} winterScenario - Winter climate scenario
 * @param {Object} locationConfig - Location configuration
 */
function addMaintenanceTasks(activities, monthNumber, summerScenario, winterScenario, locationConfig) {
  const maintenanceTasks = [];
  
  // Monthly maintenance patterns for Durham, NC (Zone 7b)
  switch (monthNumber) {
    case 1: // January
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Garden Planning', action: 'Plan garden layout and order seeds', timing: 'Winter planning', priority: 'high' },
        { type: 'maintenance', crop: 'Fruit Trees', action: 'Prune dormant fruit trees and berry bushes', timing: 'While dormant', priority: 'high' },
        { type: 'maintenance', crop: 'Pest Management', action: 'Apply dormant oil spray if needed', timing: 'Dormant season only', priority: 'medium' },
        { type: 'maintenance', crop: 'Equipment', action: 'Clean and sharpen garden tools', timing: 'Monthly maintenance', priority: 'medium' },
        { type: 'maintenance', crop: 'Compost', action: 'Turn compost pile', timing: 'Monthly turning', priority: 'low' }
      );
      break;
      
    case 2: // February
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Seed Starting', action: 'Start seeds indoors for cool-season crops', timing: 'Indoor growing', priority: 'high' },
        { type: 'maintenance', crop: 'Soil Testing', action: 'Test soil pH and nutrients', timing: 'Annual soil check', priority: 'high' },
        { type: 'maintenance', crop: 'Infrastructure', action: 'Clean and organize potting area', timing: 'Pre-season prep', priority: 'medium' }
      );
      break;
      
    case 3: // March
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Fertilization', action: 'Apply pre-emergent fertilizer to beds', timing: 'Spring feeding', priority: 'high' },
        { type: 'maintenance', crop: 'Soil Preparation', action: 'Apply 2-3 inch layer of compost to beds', timing: 'Spring bed prep', priority: 'high' },
        { type: 'maintenance', crop: 'Irrigation', action: 'Set up and test irrigation systems', timing: 'System startup', priority: 'high' },
        { type: 'maintenance', crop: 'Protection', action: 'Install row covers for frost protection', timing: 'Spring frost season', priority: 'medium' }
      );
      break;
      
    case 4: // April
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Watering', action: 'Begin deep weekly watering schedule', timing: 'Growing season starts', priority: 'high' },
        { type: 'maintenance', crop: 'Fertilization', action: 'Side-dress heavy feeders with compost', timing: 'Monthly feeding', priority: 'high' },
        { type: 'maintenance', crop: 'Mulching', action: 'Apply mulch around plants to retain moisture', timing: 'Spring mulching', priority: 'high' },
        { type: 'maintenance', crop: 'Pest Control', action: 'Monitor for early pest activity', timing: 'Weekly monitoring', priority: 'medium' }
      );
      break;
      
    case 5: // May
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Heat Protection', action: 'Install shade cloth for heat-sensitive crops', timing: 'Before summer heat', priority: 'high' },
        { type: 'maintenance', crop: 'Fertilization', action: 'Apply liquid fertilizer to actively growing plants', timing: 'Bi-weekly feeding', priority: 'high' },
        { type: 'maintenance', crop: 'Weeding', action: 'Weed beds thoroughly before summer heat', timing: 'Spring weeding', priority: 'high' },
        { type: 'maintenance', crop: 'Mulching', action: 'Refresh mulch layer to 3-4 inches', timing: 'Pre-summer mulching', priority: 'medium' }
      );
      break;
      
    case 6: // June
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Watering', action: 'Water deeply every 2-3 days in heat', timing: 'Summer heat schedule', priority: 'critical' },
        { type: 'maintenance', crop: 'Fertilization', action: 'Apply summer fertilizer to heat-tolerant crops', timing: 'Heat-season feeding', priority: 'high' },
        { type: 'maintenance', crop: 'Heat Monitoring', action: 'Monitor for heat stress, provide extra shade', timing: 'Daily heat checks', priority: 'high' },
        { type: 'maintenance', crop: 'Harvesting', action: 'Harvest early summer crops regularly', timing: 'Peak harvest season', priority: 'high' }
      );
      break;
      
    case 7: // July
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Critical Watering', action: 'Water early morning and evening if needed', timing: 'Peak heat survival', priority: 'critical' },
        { type: 'maintenance', crop: 'Foliar Feeding', action: 'Apply foliar feeding to stressed plants', timing: 'Weekly stress relief', priority: 'high' },
        { type: 'maintenance', crop: 'Pest Control', action: 'Monitor for summer pests (aphids, spider mites)', timing: 'Heat pest season', priority: 'high' },
        { type: 'maintenance', crop: 'Extreme Protection', action: 'Provide maximum shade during heat waves', timing: 'Heat wave response', priority: 'critical' }
      );
      break;
      
    case 8: // August
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Continued Watering', action: 'Continue intensive watering schedule', timing: 'Late summer heat', priority: 'critical' },
        { type: 'maintenance', crop: 'Fall Preparation', action: 'Prepare beds for fall plantings', timing: 'Fall season prep', priority: 'high' },
        { type: 'maintenance', crop: 'Soil Building', action: 'Apply organic matter to fall planting areas', timing: 'Fall bed preparation', priority: 'medium' }
      );
      break;
      
    case 9: // September
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Watering Transition', action: 'Transition to fall watering schedule', timing: 'Season transition', priority: 'high' },
        { type: 'maintenance', crop: 'Fall Fertilization', action: 'Apply fall fertilizer to cool-season crops', timing: 'Fall growing support', priority: 'high' },
        { type: 'maintenance', crop: 'Cover Crops', action: 'Plant cover crops in empty beds', timing: 'Soil building season', priority: 'high' },
        { type: 'maintenance', crop: 'Garden Cleanup', action: 'Begin fall cleanup of spent summer plants', timing: 'Season transition cleanup', priority: 'medium' }
      );
      break;
      
    case 10: // October
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Reduced Watering', action: 'Reduce watering as temperatures cool', timing: 'Cool season transition', priority: 'medium' },
        { type: 'maintenance', crop: 'Winter Protection', action: 'Apply winter protection fertilizer', timing: 'Pre-winter strengthening', priority: 'high' },
        { type: 'maintenance', crop: 'Leaf Management', action: 'Collect and compost fallen leaves', timing: 'Fall leaf season', priority: 'medium' }
      );
      break;
      
    case 11: // November
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Frost Protection', action: 'Install row covers for frost protection', timing: 'First frost preparation', priority: 'high' },
        { type: 'maintenance', crop: 'Winter Mulching', action: 'Apply thick mulch layer for winter protection', timing: 'Winter preparation', priority: 'high' },
        { type: 'maintenance', crop: 'Equipment Storage', action: 'Drain and store irrigation equipment', timing: 'Winterization', priority: 'high' },
        { type: 'maintenance', crop: 'Compost', action: 'Turn compost and prepare for winter', timing: 'Winter compost prep', priority: 'medium' }
      );
      break;
      
    case 12: // December
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Cold Protection', action: 'Monitor protection systems during cold snaps', timing: 'Winter monitoring', priority: 'high' },
        { type: 'maintenance', crop: 'Planning', action: 'Plan next year\'s garden improvements', timing: 'Year-end planning', priority: 'medium' },
        { type: 'maintenance', crop: 'Tool Maintenance', action: 'Clean and store garden tools for winter', timing: 'Winter storage', priority: 'medium' }
      );
      break;
    default:
      // No specific maintenance tasks for this month
      break;
  }
  
  // Add climate-specific adjustments
  if (summerScenario === 'extreme' || summerScenario === 'catastrophic') {
    if (monthNumber >= 6 && monthNumber <= 8) {
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Emergency Heat', action: 'Install emergency shade structures', timing: 'Extreme heat response', priority: 'critical' },
        { type: 'maintenance', crop: 'Soil Moisture', action: 'Monitor soil moisture twice daily', timing: 'Critical monitoring', priority: 'critical' },
        { type: 'maintenance', crop: 'Cooling', action: 'Apply cooling mulch (light-colored materials)', timing: 'Heat mitigation', priority: 'high' }
      );
    }
  }
  
  if (winterScenario === 'traditional' || winterScenario === 'mild') {
    if (monthNumber >= 11 || monthNumber <= 2) {
      maintenanceTasks.push(
        { type: 'maintenance', crop: 'Cold Frame Care', action: 'Monitor cold frames and row covers', timing: 'Winter growing support', priority: 'high' },
        { type: 'maintenance', crop: 'Winter Harvest', action: 'Harvest cold-hardy greens regularly', timing: 'Winter production', priority: 'medium' }
      );
    }
  }
  
  activities.push(...maintenanceTasks);
}

/**
 * Add Durham-specific seasonal activities (infrastructure, general care)
 * @param {Array} activities - Activities array to modify
 * @param {number} monthNumber - Month number (1-12)
 */
function addDurhamSeasonalActivities(activities, monthNumber) {
  const seasonalActivities = {
    1: {
      type: 'planning',
      crop: 'Garden Planning', 
      action: 'Order heat-tolerant seeds for Durham summer',
      timing: 'Best selection available early',
      priority: 'medium'
    },
    2: {
      type: 'infrastructure',
      crop: 'Soil Preparation',
      action: 'Spread compost on beds, avoid working wet clay soil',
      timing: 'Durham clay needs dry conditions',
      priority: 'high'
    },
    4: {
      type: 'infrastructure',
      crop: 'Irrigation Setup',
      action: 'Install drip irrigation, Durham summers are brutal', 
      timing: 'Before heat stress begins',
      priority: 'high'
    },
    5: {
      type: 'infrastructure',
      crop: 'Summer Heat Prep',
      action: 'Install 30% shade cloth over sensitive crops',
      timing: 'Before 90°F+ days arrive',
      priority: 'high'
    },
    6: {
      type: 'care',
      crop: 'Cool-Season Crops',
      action: 'Harvest remaining spring crops before they bolt',
      timing: 'Before summer heat ruins quality',
      priority: 'high'
    },
    8: {
      type: 'infrastructure', 
      crop: 'Fall Prep',
      action: 'Plan and prepare fall garden beds',
      timing: 'Late summer transition',
      priority: 'medium'
    },
    11: {
      type: 'infrastructure',
      crop: 'Winter Prep',
      action: 'Install cold frames, protect tender plants',
      timing: 'Winter preparation',
      priority: 'medium'
    },
    12: {
      type: 'planning',
      crop: 'Garden Planning',
      action: 'Review this year, plan next year\'s garden',
      timing: 'Year-end reflection',
      priority: 'low'
    }
  };

  const activity = seasonalActivities[monthNumber];
  if (activity) {
    activities.push(activity);
  }
}