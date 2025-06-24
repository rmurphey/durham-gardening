/**
 * Garden Calendar Generation Service
 * Creates month-by-month planting and care schedules
 */

import { 
  getClimateAdaptedCrops
} from '../config.js';
import { getPortfolioStrategies } from '../data/portfolioStrategies.js';
import { DURHAM_CROPS } from '../config/durhamConfig.js';
import { shouldShowCropActivity } from '../config/gardenStatus.js';

/**
 * Get climate zone classification from location
 * @param {Object} locationConfig - Location configuration
 * @returns {string} Climate zone
 */
const getClimateZoneFromLocation = (locationConfig) => {
  if (!locationConfig) return 'temperate';
  
  const hardiness = parseInt(locationConfig.hardiness?.[0] || '7');
  if (hardiness <= 5) return 'cold';
  if (hardiness >= 9) return 'subtropical';
  return 'temperate';
};

/**
 * Add Durham-specific shopping and preparation activities
 * @param {Array} activities - Activities array to modify
 * @param {number} monthNumber - Current month (1-12)
 * @param {Object} portfolio - Portfolio allocation
 */
const addDurhamShoppingActivities = (activities, monthNumber, portfolio) => {
  Object.entries(portfolio).forEach(([cropType, percentage]) => {
    if (percentage < 5) return;

    let relevantCrops = {};
    if (cropType === 'heatSpecialists') {
      relevantCrops = DURHAM_CROPS.heatLovers;
    } else if (cropType === 'coolSeason') {
      relevantCrops = DURHAM_CROPS.coolSeason;
    } else if (cropType === 'perennials') {
      relevantCrops = DURHAM_CROPS.perennials;
    }

    Object.entries(relevantCrops).forEach(([cropKey, crop]) => {
      // Skip crops that aren't wanted based on garden status
      if (!shouldShowCropActivity(cropKey, 'shopping')) return;
      
      const seeds = crop.shopping?.seeds || 'seeds';
      const cost = crop.shopping?.cost || '$3-4';

      // Add shopping activities based on planting timing
      switch (cropKey) {
        // No okra case - we don't want it
          
        case 'hotPeppers':
          if (monthNumber === 2) {
            activities.push({
              type: 'shopping',
              crop: 'Hot Peppers',
              action: `Buy pepper seeds (${seeds}) - ${cost}`,
              timing: 'Start indoors in March',
              priority: 'medium'
            });
          }
          break;
          
        case 'sweetPotato':
          if (monthNumber === 4) {
            activities.push({
              type: 'shopping',
              crop: 'Sweet Potato',
              action: `Order sweet potato slips (${crop.shopping?.slips || '10-15 slips'}) - ${cost}`,
              timing: 'Plant in mid-May',
              priority: 'medium'
            });
          }
          break;
          
        case 'kale':
          if (monthNumber === 2) {
            activities.push({
              type: 'shopping',
              crop: 'Kale (Spring)',
              action: `Buy kale seeds (${seeds}) - ${cost}`,
              timing: 'Plant mid-February to March',
              priority: 'medium'
            });
          }
          if (monthNumber === 7) {
            activities.push({
              type: 'shopping',
              crop: 'Kale (Fall)',
              action: `Buy kale seeds (${seeds}) - ${cost}`,
              timing: 'Plant August for fall harvest',
              priority: 'medium'
            });
          }
          break;
          
        case 'lettuce':
          if (monthNumber === 1) {
            activities.push({
              type: 'shopping',
              crop: 'Lettuce',
              action: `Buy lettuce seeds (${seeds}) - ${cost}`,
              timing: 'Start succession planting in February',
              priority: 'low'
            });
          }
          if (monthNumber === 8) {
            activities.push({
              type: 'shopping',
              crop: 'Lettuce (Fall)',
              action: `Buy lettuce seeds (${seeds}) - ${cost}`,
              timing: 'Fall succession planting',
              priority: 'low'
            });
          }
          break;
          
        case 'asparagus':
          if (monthNumber === 2) {
            activities.push({
              type: 'shopping',
              crop: 'Asparagus',
              action: `Order asparagus crowns (${crop.shopping?.crowns || '1-year crowns'}) - ${cost}`,
              timing: 'Plant in March-April',
              priority: 'low'
            });
          }
          break;
      }
    });
  });
};

/**
 * Add succession planting activities for continuous harvest
 * @param {Array} activities - Activities array to modify
 * @param {number} monthNumber - Current month (1-12)
 * @param {Object} portfolio - Portfolio allocation
 */
const addSuccessionPlantingActivities = (activities, monthNumber, portfolio) => {
  // Succession crops and their intervals
  const successionCrops = {
    lettuce: {
      months: [2, 3, 4, 9, 10], // Spring and fall
      interval: '2 weeks',
      note: 'For continuous fresh harvest'
    },
    kale: {
      months: [2, 3, 8, 9], // Spring and fall plantings
      interval: '3 weeks', 
      note: 'Stagger for steady supply'
    },
    hotPeppers: {
      months: [3, 4], // Start multiple rounds
      interval: '4 weeks',
      note: 'Multiple harvests throughout season'
    }
  };

  Object.entries(portfolio).forEach(([cropType, percentage]) => {
    if (percentage < 5) return;

    let relevantCrops = {};
    if (cropType === 'heatSpecialists') {
      relevantCrops = DURHAM_CROPS.heatLovers;
    } else if (cropType === 'coolSeason') {
      relevantCrops = DURHAM_CROPS.coolSeason;
    }

    Object.entries(relevantCrops).forEach(([cropKey, crop]) => {
      const succession = successionCrops[cropKey];
      if (succession && succession.months.includes(monthNumber)) {
        activities.push({
          type: 'succession',
          crop: crop.name,
          action: `Succession plant ${crop.name} (every ${succession.interval})`,
          timing: succession.note,
          priority: 'medium'
        });
      }
    });
  });
};

/**
 * Add crop rotation activities based on seasonal transitions
 * @param {Array} activities - Activities array to modify
 * @param {number} monthNumber - Current month (1-12)
 * @param {Object} portfolio - Portfolio allocation
 * @param {number} monthIndex - Month index in calendar (for rotation timing)
 */
const addCropRotationActivities = (activities, monthNumber, portfolio, monthIndex) => {
  // Durham-specific rotation schedule
  const rotationPlan = {
    // Spring transition (March-April)  
    spring: {
      months: [3, 4],
      actions: [
        {
          type: 'rotation',
          crop: 'Winter Crops',
          action: 'Remove spent winter greens, prepare beds for summer crops',
          timing: 'Before soil warms for summer planting',
          priority: 'medium'
        },
        {
          type: 'rotation',
          crop: 'Soil Health',
          action: 'Add compost to beds, check soil drainage',
          timing: 'Durham clay needs amendment before summer',
          priority: 'medium'
        }
      ]
    },
    // Summer transition (July-August)
    summer: {
      months: [7, 8],
      actions: [
        {
          type: 'rotation',
          crop: 'Spring Crops',
          action: 'Clear bolted spring crops, plant fall succession',
          timing: 'Make space for fall plantings',
          priority: 'medium'
        },
        {
          type: 'rotation',
          crop: 'Bed Preparation',
          action: 'Mulch heavily for fall crops, plan winter garden',
          timing: 'Prepare for fall/winter rotation',
          priority: 'low'
        }
      ]
    },
    // Fall transition (October-November)
    fall: {
      months: [10, 11],
      actions: [
        {
          type: 'rotation',
          crop: 'Summer Crops',
          action: 'Harvest and clear spent summer crops',
          timing: 'Before first frost preparation',
          priority: 'high'
        },
        {
          type: 'rotation',
          crop: 'Winter Garden',
          action: 'Protect overwintering crops, plan spring rotation',
          timing: 'Set up winter garden system',
          priority: 'low'
        }
      ]
    }
  };

  // Add appropriate rotation activities
  Object.values(rotationPlan).forEach(season => {
    if (season.months.includes(monthNumber)) {
      season.actions.forEach(action => {
        activities.push(action);
      });
    }
  });

  // Add specific crop family rotation reminders
  if (monthNumber === 12) { // December planning
    activities.push({
      type: 'rotation',
      crop: 'Rotation Planning',
      action: 'Plan next year crop rotation: avoid same families in same beds',
      timing: 'Durham crop families: nightshades, brassicas, legumes',
      priority: 'low'
    });
  }
};

/**
 * Generate comprehensive garden calendar
 * @param {string} summerScenario - Selected summer scenario
 * @param {string} winterScenario - Selected winter scenario  
 * @param {string} portfolioKey - Selected portfolio strategy
 * @param {Object} locationConfig - Location configuration
 * @param {Object} customPortfolio - Custom portfolio if applicable
 * @returns {Array} Array of monthly calendar entries
 */
export const generateGardenCalendar = (summerScenario, winterScenario, portfolioKey, locationConfig, customPortfolio = null) => {
  if (!locationConfig || !summerScenario || !winterScenario || !portfolioKey) {
    return [];
  }

  const portfolio = getPortfolioStrategies(locationConfig, customPortfolio)[portfolioKey];
  if (!portfolio) return [];

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const calendar = [];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get climate-adapted crops for this location and scenario
  const adaptedCrops = getClimateAdaptedCrops(locationConfig, summerScenario);
  const climateZone = getClimateZoneFromLocation(locationConfig);
  
  
  // Generate dynamic calendar for next 12 months
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12;
    const monthNumber = monthIndex + 1;
    const month = months[monthIndex];
    const activities = [];
    
    // Generate SPECIFIC per-plant activities based on Durham, NC conditions
    Object.entries(portfolio).forEach(([cropType, percentage]) => {
      if (percentage < 5) return;
      
      const categoryName = cropType === 'heatSpecialists' ? 'heatTolerant' : cropType;
      const crops = adaptedCrops[categoryName] || {};
      
      Object.entries(crops).forEach(([cropKey, crop]) => {
        if (!crop) return;
        
        const displayName = crop.displayName || crop.name?.en || cropKey;
        const plantingMonths = crop.plantingMonths?.[climateZone] || crop.plantingMonths?.temperate || [];
        
        // SPECIFIC PLANTING SCHEDULES for Durham, NC (Zone 7b)
        switch (cropKey) {
          case 'okra':
            if (monthNumber === 5) {
              activities.push({
                type: 'direct-sow',
                crop: 'Okra',
                action: 'Direct sow okra seeds in warm soil (65°F+)',
                timing: 'After last frost, soil is warm',
                priority: 'medium'
              });
            }
            if (monthNumber === 8) {
              activities.push({
                type: 'harvest',
                crop: 'Okra',
                action: 'Daily okra harvest - cut pods when 3-4 inches long',
                timing: 'Peak production season',
                priority: 'high'
              });
            }
            break;
            
          case 'peppers':
          case 'hotPeppers':
            if (monthNumber === 7) {
              activities.push({
                type: 'care',
                crop: 'Hot Peppers',
                action: 'Support heavy pepper plants, consistent watering in heat',
                timing: 'Durham summer care',
                priority: 'medium'
              });
            }
            if (monthNumber >= 7 && monthNumber <= 10) {
              activities.push({
                type: 'harvest',
                crop: 'Hot Peppers',
                action: 'Harvest peppers regularly to encourage production',
                timing: 'Peak harvest season',
                priority: 'high'
              });
            }
            break;
            
          case 'kale':
            if (monthNumber === 8) {
              activities.push({
                type: 'direct-sow',
                crop: 'Kale',
                action: 'Direct sow kale for fall harvest',
                timing: '12-14 weeks before first frost',
                priority: 'medium'
              });
            }
            if (monthNumber === 2) {
              activities.push({
                type: 'direct-sow',
                crop: 'Kale',
                action: 'Direct sow kale for spring harvest',
                timing: '4-6 weeks before last frost',
                priority: 'medium'
              });
            }
            if (monthNumber === 10) {
              activities.push({
                type: 'harvest',
                crop: 'Kale',
                action: 'Harvest outer kale leaves, leave center growing',
                timing: 'Sweet after light frost',
                priority: 'medium'
              });
            }
            break;
            
          case 'sweetPotato':
            if (monthNumber === 7) {
              activities.push({
                type: 'care',
                crop: 'Sweet Potato',
                action: 'Mulch sweet potato beds, train vines away from paths',
                timing: 'Summer growth management',
                priority: 'medium'
              });
            }
            if (monthNumber === 9) {
              activities.push({
                type: 'harvest',
                crop: 'Sweet Potato',
                action: 'Harvest sweet potatoes before first frost',
                timing: 'Before soil gets too cold',
                priority: 'high'
              });
            }
            break;

          case 'cantaloupe':
          case 'melon':
            if (monthNumber >= 7 && monthNumber <= 9) {
              activities.push({
                type: 'harvest',
                crop: 'Cantaloupe',
                action: 'Check for ripe melons - should slip easily from vine',
                timing: 'Peak summer harvest',
                priority: 'high'
              });
            }
            if (monthNumber === 7) {
              activities.push({
                type: 'care',
                crop: 'Cantaloupe',
                action: 'Place boards under developing melons, consistent watering',
                timing: 'Fruit development stage',
                priority: 'medium'
              });
            }
            break;

          case 'cucumber':
            if (monthNumber >= 6 && monthNumber <= 9) {
              activities.push({
                type: 'harvest',
                crop: 'Cucumber',
                action: 'Daily cucumber harvest to maintain production',
                timing: 'Continuous harvest period',
                priority: 'high'
              });
            }
            if (monthNumber === 7) {
              activities.push({
                type: 'care',
                crop: 'Cucumber',
                action: 'Support vines, deep watering in Durham heat',
                timing: 'Summer vine management',
                priority: 'medium'
              });
            }
            break;

          case 'tomatillo':
            if (monthNumber >= 7 && monthNumber <= 10) {
              activities.push({
                type: 'harvest',
                crop: 'Tomatillo',
                action: 'Harvest tomatillos when husks are full and papery',
                timing: 'Extended harvest season',
                priority: 'high'
              });
            }
            if (monthNumber === 7) {
              activities.push({
                type: 'care',
                crop: 'Tomatillo',
                action: 'Support tall tomatillo plants, prune suckers',
                timing: 'Summer growth management',
                priority: 'medium'
              });
            }
            break;

          case 'squash':
            if (monthNumber === 6) {
              activities.push({
                type: 'cleanup',
                crop: 'Squash',
                action: 'Remove dying squash plants, clear beds for succession planting',
                timing: 'Replace failed summer crops',
                priority: 'high'
              });
            }
            break;
            
          case 'amaranth':
            if (monthNumber === 4) {
              activities.push({
                type: 'direct-sow',
                crop: 'Amaranth',
                action: 'Direct sow amaranth greens every 3 weeks',
                timing: 'After last frost through summer',
                priority: 'medium'
              });
            }
            if (monthNumber === 6) {
              activities.push({
                type: 'succession',
                crop: 'Amaranth',
                action: 'Second succession planting of amaranth',
                timing: 'For continuous greens harvest',
                priority: 'medium'
              });
            }
            break;
            
          case 'malabarSpinach':
            if (monthNumber === 5) {
              activities.push({
                type: 'transplant',
                crop: 'Malabar Spinach',
                action: 'Transplant Malabar spinach with trellis support',
                timing: 'After soil is consistently warm',
                priority: 'medium'
              });
            }
            if (monthNumber === 7) {
              activities.push({
                type: 'harvest',
                crop: 'Malabar Spinach',
                action: 'Harvest young Malabar spinach leaves',
                timing: 'Cut-and-come-again harvest',
                priority: 'medium'
              });
            }
            break;
            
          case 'cabbage':
            if (monthNumber === 8) {
              activities.push({
                type: 'start-transplants',
                crop: 'Cabbage',
                action: 'Start cabbage transplants for fall crop',
                timing: '12-14 weeks before first frost',
                priority: 'high'
              });
            }
            if (monthNumber === 2) {
              activities.push({
                type: 'start-transplants',
                crop: 'Cabbage',
                action: 'Start cabbage transplants for spring crop',
                timing: '6-8 weeks before last frost',
                priority: 'high'
              });
            }
            break;
        }
        
        // Add general harvest activities based on crop timing
        if (plantingMonths.includes(monthNumber) && !['okra', 'peppers', 'kale', 'sweetPotato', 'cabbage'].includes(cropKey)) {
          if (crop.transplantWeeks > 0) {
            activities.push({
              type: 'start-transplants',
              crop: displayName,
              action: `Start ${displayName} transplants indoors`,
              timing: `${crop.transplantWeeks} weeks before transplanting`,
              priority: 'medium'
            });
          } else {
            activities.push({
              type: 'direct-sow',
              crop: displayName,
              action: `Direct sow ${displayName}`,
              timing: 'Check soil temperature requirements',
              priority: 'medium'
            });
          }
        }
      });
    });
    
    // Add Durham-specific shopping, succession, and rotation activities
    addDurhamShoppingActivities(activities, monthNumber, portfolio);
    addSuccessionPlantingActivities(activities, monthNumber, portfolio);
    addCropRotationActivities(activities, monthNumber, portfolio, i);
    
    // Add DURHAM, NC SPECIFIC seasonal activities
    switch (monthNumber) {
      case 1: // January - Durham specific
        activities.push({
          type: 'planning',
          crop: 'Garden Planning',
          action: 'Order heat-tolerant seeds for Durham summer',
          timing: 'Best selection available early',
          priority: 'medium'
        });
        break;
      case 2: // February - Durham specific
        activities.push({
          type: 'infrastructure',
          crop: 'Soil Preparation',
          action: 'Spread compost on beds, avoid working wet clay soil',
          timing: 'Durham clay needs dry conditions',
          priority: 'high'
        });
        activities.push({
          type: 'care',
          crop: 'Overwintered Kale',
          action: 'Harvest sweet kale leaves after cold snaps',
          timing: 'Cold makes kale sweeter',
          priority: 'medium'
        });
        break;
      case 3: // March - Durham specific
        activities.push({
          type: 'infrastructure',
          crop: 'Bed Preparation',
          action: 'Work beds when clay soil crumbles, not sticky',
          timing: 'Wait for proper moisture level',
          priority: 'high'
        });
        activities.push({
          type: 'care',
          crop: 'Perennial Herbs',
          action: 'Cut back rosemary, thyme; mulch around plants',
          timing: 'After last hard freeze risk',
          priority: 'medium'
        });
        break;
      case 4: // April - Durham specific
        activities.push({
          type: 'infrastructure',
          crop: 'Irrigation Setup',
          action: 'Install drip irrigation, Durham summers are brutal',
          timing: 'Before heat stress begins',
          priority: 'high'
        });
        activities.push({
          type: 'care',
          crop: 'Spring Transplants',
          action: 'Harden off pepper, tomato transplants gradually',
          timing: '7-10 days before transplanting',
          priority: 'high'
        });
        break;
      case 5: // May - Durham heat prep
        activities.push({
          type: 'infrastructure',
          crop: 'Summer Heat Prep',
          action: 'Install 30% shade cloth over sensitive crops',
          timing: 'Before 90°F+ days arrive',
          priority: 'high'
        });
        activities.push({
          type: 'care',
          crop: 'Newly Transplanted Plants',
          action: 'Deep water morning, mulch 3-4 inches thick',
          timing: 'Establish before heat stress',
          priority: 'high'
        });
        break;
      case 6: // June - Durham heat begins
        activities.push({
          type: 'care',
          crop: 'Heat-Sensitive Crops',
          action: 'Mist kale, lettuce in afternoon heat (85°F+)',
          timing: 'Cool-season crops struggle now',
          priority: 'high'
        });
        activities.push({
          type: 'harvest',
          crop: 'Cool-Season Crops',
          action: 'Harvest remaining spring crops before they bolt',
          timing: 'Before summer heat ruins quality',
          priority: 'high'
        });
        break;
      case 7: // July - Durham heat peak
        activities.push({
          type: 'care',
          crop: 'Heat-Tolerant Crops',
          action: 'Water okra, peppers deeply every 2-3 days',
          timing: 'During 95°F+ Durham heat waves',
          priority: 'high'
        });
        activities.push({
          type: 'harvest',
          crop: 'Heat Crops',
          action: 'Harvest okra daily, peppers twice weekly',
          timing: 'Early morning before heat',
          priority: 'high'
        });
        break;
      case 8: // August
        activities.push({
          type: 'infrastructure',
          crop: 'Fall Prep',
          action: 'Plan and prepare fall garden beds',
          timing: 'Late summer transition',
          priority: 'medium'
        });
        activities.push({
          type: 'care',
          crop: 'Cool-Season Prep',
          action: 'Start cool-season transplants indoors',
          timing: 'Prepare for fall planting',
          priority: 'high'
        });
        break;
      case 10: // October
        activities.push({
          type: 'care',
          crop: 'Garden Maintenance',
          action: 'Harvest and preserve, clean up spent plants',
          timing: 'Fall harvest season',
          priority: 'high'
        });
        break;
      case 11: // November
        activities.push({
          type: 'infrastructure',
          crop: 'Winter Prep',
          action: 'Install cold frames, protect tender plants',
          timing: 'Winter preparation',
          priority: 'medium'
        });
        activities.push({
          type: 'care',
          crop: 'Perennial Herbs',
          action: 'Cut back and mulch around perennials',
          timing: 'Winter protection',
          priority: 'medium'
        });
        break;
      case 12: // December
        activities.push({
          type: 'planning',
          crop: 'Garden Planning',
          action: 'Review this year, plan next year\'s garden',
          timing: 'Year-end reflection',
          priority: 'low'
        });
        break;
    }
    
    // Sort activities by priority and type
    activities.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      const typeOrder = { 
        'start-transplants': 1, 
        'transplant': 2,
        'direct-sow': 3, 
        'harvest': 4, 
        'succession': 5,
        'care': 6, 
        'infrastructure': 7,
        'planning': 8
      };
      
      // First sort by priority, then by type
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return typeOrder[a.type] - typeOrder[b.type];
    });
    
    // SYSTEMATIC FILTER: Only show activities relevant to current garden status
    const filteredActivities = activities.filter(activity => 
      shouldShowCropActivity(activity.crop, activity.type)
    );
    
    calendar.push({
      month,
      monthNumber,
      activities: filteredActivities.slice(0, 8) // Limit to 8 activities per month
    });
  }
  
  return calendar;
};

/**
 * Get month emphasis for calendar display
 * @param {number} monthNumber - Month number (1-12)
 * @param {Object} locationConfig - Location configuration
 * @returns {string} Month emphasis description
 */
export const getMonthEmphasis = (monthNumber, locationConfig) => {
  const climateZone = getClimateZoneFromLocation(locationConfig);
  
  // Spring emphasis
  if (monthNumber >= 3 && monthNumber <= 5) {
    return climateZone === 'cold' ? 'Cold protection and indoor starts' : 'Active planting season';
  }
  
  // Summer emphasis  
  if (monthNumber >= 6 && monthNumber <= 8) {
    return climateZone === 'subtropical' ? 'Heat management and succession planting' : 'Peak growing season';
  }
  
  // Fall emphasis
  if (monthNumber >= 9 && monthNumber <= 11) {
    return 'Fall planting and harvest preservation';
  }
  
  // Winter emphasis
  return climateZone === 'cold' ? 'Planning and indoor growing' : 'Cool season crops';
};