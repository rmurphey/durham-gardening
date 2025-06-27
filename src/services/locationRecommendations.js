/**
 * Location-Aware Smart Recommendations
 * Actionable gardening advice for any US location with hardiness zone support
 */

import { DURHAM_CROPS } from '../config/durhamConfig.js';
// import { DURHAM_CALENDAR } from '../config/durhamConfig.js'; // Available for future calendar integration

/**
 * Generate this month's focus for location-specific gardening
 */
export const generateLocationMonthlyFocus = (portfolio, simulationResults, locationConfig = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[currentMonth];
  
  // Get location information
  const locationName = locationConfig.name || 'your location';
  const hardiness = locationConfig.hardiness || '7b';
  const hardinessNumber = parseInt(hardiness) || 7;

  // Get base calendar activities for this month
  // Note: monthlyActivities could be used for automated activity suggestions
  // const monthlyActivities = DURHAM_CALENDAR[monthName.toLowerCase()] || {};
  
  let focus = `**${monthName} Focus for ${locationName}:**\n\n`;

  switch (currentMonth) {
    case 1: // January
      focus += "🌱 **Planning Season**\n";
      focus += "- Order heat-tolerant seeds while selection is best\n";
      focus += "- Plan bed rotations and new plantings\n";
      focus += hardinessNumber >= 7 ? "- Harvest any remaining kale and winter greens\n" : "- Plan for earlier spring planting (warmer zone)\n";
      break;

    case 2: // February  
      focus += "🌿 **Early Spring Prep**\n";
      focus += "- Start pepper and tomato seeds indoors with heat mat\n";
      focus += "- Direct sow kale and lettuce if soil isn't muddy\n";
      focus += "- Support soil ecosystem with compost (only when clay soil isn't sticky)\n";
      break;

    case 3: // March
      focus += "🌱 **Spring Planting Begins**\n";
      focus += "- Continue cool-season plantings\n";
      focus += "- Harden off indoor seedlings\n";
      focus += "- Prepare to support plants through summer heat\n";
      break;

    case 4: // April
      focus += "☀️ **Transition Month**\n";
      focus += "- Last chance for cool crops before heat\n";
      focus += hardinessNumber >= 8 ? "- Transplant warm-season crops (warmer zone allows earlier planting)\n" : "- Transplant warm-season crops after soil warms\n";
      focus += "- Prepare shade support structures for heat protection\n";
      break;

    case 5: // May
      focus += "🔥 **Summer Heat Prep**\n";
      focus += "- Plant heat lovers: okra, peppers, sweet potatoes\n";
      focus += "- Heavy mulching and shade protection deployment\n";
      focus += "- Begin deep watering to support root systems\n";
      break;

    case 6: // June
      focus += "🌞 **Heat Management**\n";
      focus += "- Harvest spring crops before they bolt\n";
      focus += "- Maintain mulch protection and consistent watering\n";
      focus += "- Order fall seeds while available\n";
      break;

    case 7: // July
      focus += "🔥 **Survival Mode**\n";
      focus += "- Daily okra harvest in early morning\n";
      focus += "- Support struggling plants with additional shade\n";
      focus += "- Maintain plant health through heat waves\n";
      break;

    case 8: // August
      focus += "🍂 **Fall Planning**\n";
      focus += "- Start fall transplants indoors\n";
      focus += "- Continue summer harvest\n";
      focus += "- Prepare beds for fall crops\n";
      break;

    case 9: // September
      focus += "🌿 **Fall Transition**\n";
      focus += "- Transplant fall crops\n";
      focus += "- Continue summer harvest\n";
      focus += "- Plan winter garden\n";
      break;

    case 10: // October
      focus += "🎃 **Fall Harvest**\n";
      focus += "- Harvest sweet potatoes before frost\n";
      focus += "- Plant quick cool crops\n";
      focus += "- Prepare for winter protection\n";
      break;

    case 11: // November
      focus += "❄️ **Winter Prep**\n";
      focus += "- Harvest kale (sweetest after frost)\n";
      focus += "- Clean up spent summer crops\n";
      focus += "- Provide cold protection for vulnerable plants\n";
      break;

    case 12: // December
      focus += "📋 **Planning & Maintenance**\n";
      focus += "- Plan next year's garden\n";
      focus += "- Order early spring seeds\n";
      focus += "- Tool maintenance and planning\n";
      break;
    
    default:
      focus += `🌱 **Year-Round Gardening (Zone ${hardiness})**\n`;
      focus += "- Monitor soil moisture and weather conditions\n";
      focus += "- Continue succession plantings appropriate for season\n";
      focus += "- Maintain garden infrastructure and tools\n";
      break;
  }

  // Add portfolio-specific advice
  if (portfolio) {
    focus += "\n**Your Portfolio Focus:**\n";
    Object.entries(portfolio).forEach(([cropType, percentage]) => {
      if (percentage >= 15) {
        const advice = getPortfolioAdvice(cropType, currentMonth, hardiness);
        if (advice) focus += `- ${advice}\n`;
      }
    });
  }

  return focus;
};

/**
 * Generate weekly actions for location
 */
export const generateLocationWeeklyActions = (portfolio) => {
  const currentMonth = new Date().getMonth() + 1;
  const actions = [];

  // Add seasonal actions
  switch (currentMonth) {
    case 2:
    case 3:
      actions.push({
        icon: '🌱',
        task: 'Check soil moisture before working clay soil',
        urgency: 'high',
        timing: 'Before any garden work'
      });
      break;
    case 5:
    case 6:
    case 7:
      actions.push({
        icon: '💧',
        task: 'Deep water in early morning before heat',
        urgency: 'high', 
        timing: 'Daily during heat waves'
      });
      break;
    case 8:
    case 9:
      actions.push({
        icon: '🌿',
        task: 'Start fall transplants indoors',
        urgency: 'medium',
        timing: 'For fall garden'
      });
      break;
    
    default:
      // No specific seasonal actions for this month
      break;
  }

  // Add portfolio-specific actions
  if (portfolio) {
    Object.entries(portfolio).forEach(([cropType, percentage]) => {
      if (percentage >= 10) {
        const cropActions = getCropSpecificActions(cropType, currentMonth);
        actions.push(...cropActions);
      }
    });
  }

  return actions.slice(0, 4); // Top 4 actions
};

/**
 * Generate top crop recommendations for location
 */
export const generateLocationTopCrops = (portfolio, locationConfig = {}, gardenLog = null) => {
  const currentMonth = new Date().getMonth() + 1;
  const hardiness = locationConfig.hardiness || '7b';
  const recommendations = [];

  // Get crops already planted (if garden log available)
  const plantedCrops = gardenLog ? 
    gardenLog.plantings.map(p => p.crop) : [];

  // Get seasonal recommendations
  const allCrops = { ...DURHAM_CROPS.heatLovers, ...DURHAM_CROPS.coolSeason, ...DURHAM_CROPS.perennials };
  
  Object.entries(allCrops).forEach(([cropKey, crop]) => {
    const isInSeason = isCropInSeason(cropKey, currentMonth);
    const alreadyPlanted = plantedCrops.includes(cropKey);
    
    if (isInSeason && !alreadyPlanted) {
      recommendations.push({
        cropKey, // Add cropKey for garden log integration
        crop: crop.name,
        confidence: 'high',
        reason: getSeasonalReason(cropKey, currentMonth, hardiness),
        varieties: Object.keys(crop.varieties || {}).slice(0, 2),
        timing: crop.planting?.timing || `Check Zone ${hardiness} calendar`
      });
    }
  });

  // Sort by portfolio relevance if available
  if (portfolio) {
    recommendations.sort((a, b) => {
      const aRelevance = getPortfolioRelevance(a.crop, portfolio);
      const bRelevance = getPortfolioRelevance(b.crop, portfolio);
      return bRelevance - aRelevance;
    });
  }

  return recommendations.slice(0, 3); // Top 3 recommendations
};

/**
 * Generate location-specific site recommendations
 */
export const generateLocationSiteRecommendations = (locationConfig = {}) => {
  const currentMonth = new Date().getMonth() + 1;
  const locationName = locationConfig.name || 'your location';
  const hardiness = locationConfig.hardiness || '7b';
  const hardinessNumber = parseInt(hardiness) || 7;
  const recommendations = [];

  // Climate-aware soil management
  if (locationName.toLowerCase().includes('nc') || locationName.toLowerCase().includes('clay')) {
    recommendations.push({
      category: 'Clay Soil Management',
      tip: `Never work ${locationName} clay soil when wet - wait until it crumbles`,
      priority: 'high',
      season: 'all'
    });
  } else {
    recommendations.push({
      category: 'Soil Management',
      tip: `Adapt soil work timing to your local ${locationName} conditions`,
      priority: 'medium',
      season: 'all'
    });
  }

  // Heat protection based on hardiness zone
  const shadeRecommendation = hardinessNumber >= 8 ? 
    '40% shade cloth recommended for extremely hot climates' : 
    '30% shade cloth is essential for summer success';
  
  recommendations.push({
    category: 'Heat Protection',
    tip: `${shadeRecommendation} in Zone ${hardiness}`,
    priority: 'high',
    season: 'summer'
  });

  // Seasonal recommendations
  if (currentMonth >= 5 && currentMonth <= 8) {
    recommendations.push({
      category: 'Summer Watering',
      tip: 'Deep water in early morning, mulch heavily to retain moisture',
      priority: 'high',
      season: 'summer'
    });
  }

  if (currentMonth >= 11 || currentMonth <= 2) {
    const winterTip = hardinessNumber >= 8 ? 
      `Extended growing season in Zone ${hardiness} allows more diverse winter crops` :
      hardinessNumber <= 6 ?
      `Zone ${hardiness} requires more winter protection - use cold frames and row covers` :
      `Kale and hardy greens can overwinter in Zone ${hardiness} with minimal protection`;
    
    recommendations.push({
      category: 'Winter Growing',
      tip: winterTip,
      priority: 'medium',
      season: 'winter'
    });
  }

  recommendations.push({
    category: 'Climate Planning',
    tip: `Plan for Zone ${hardiness} extremes - backup shade and extra water capacity`,
    priority: 'medium',
    season: 'all'
  });

  console.log("Generated location site recommendations:", recommendations);
  return recommendations;
};

/**
 * Generate specific, actionable investment recommendations for location
 * Only recommends items that have immediate value based on current date
 */
export const generateLocationInvestmentPriority = (customInvestment, locationConfig = {}) => {
  const recommendations = [];
  const currentMonth = new Date().getMonth() + 1;
  const locationName = locationConfig.name || 'your location';
  const hardiness = locationConfig.hardiness || '7b';
  const hardinessNumber = parseInt(hardiness) || 7;

  // December (Month 12) - Planning season, order for spring
  if (currentMonth === 12) {
    recommendations.push({
      id: 'heat-tolerant-seeds-early',
      item: 'Early Spring Seed Order: Heat-tolerant varieties bundle',
      price: 45.00,
      category: 'Planning',
      urgency: 'medium',
      timing: hardinessNumber >= 8 ? 'Order now for best selection, plant in January-February' : 'Order now for best selection, plant in February-March',
      why: `Get first pick of heat-tolerant varieties for Zone ${hardiness} before they sell out`,
      where: 'True Leaf Market, Southern Exposure',
      quantity: 1,
      specifications: 'Okra, amaranth, heat-tolerant lettuce, and pepper seeds'
    });

    recommendations.push({
      id: 'garden-planning-tools',
      item: 'Garden Planning Tools: Measuring tape, stakes, string',
      price: 25.00,
      category: 'Planning',
      urgency: 'low',
      timing: 'Plan bed layouts during winter downtime',
      why: 'Prep for efficient spring planting and bed organization',
      where: 'Home Depot or Harbor Freight',
      quantity: 1,
      specifications: '25ft measuring tape, 10 wooden stakes, 100ft garden string'
    });
  }

  // January (Month 1) - Indoor seed starting prep
  else if (currentMonth === 1) {
    recommendations.push({
      id: 'seed-starting-setup',
      item: 'Indoor Seed Starting Kit with Heat Mat',
      price: 67.00,
      category: 'Seed Starting',
      urgency: 'high',
      timing: hardinessNumber >= 8 ? 'Set up now for January starts (warmer zone)' : 'Set up now for February pepper/tomato starts',
      why: `Essential for starting warm-season crops indoors before last frost in Zone ${hardiness}`,
      where: 'Amazon or local nursery',
      quantity: 1,
      specifications: 'Seed trays, heat mat, dome covers, seed starting soil'
    });

    recommendations.push({
      id: 'grow-lights',
      item: 'LED Grow Light for Seedlings',
      price: 45.00,
      category: 'Seed Starting',
      urgency: 'high',
      timing: 'Install before starting seeds in February',
      why: 'Winter light insufficient for strong seedling development',
      where: 'Amazon or grow supply store',
      quantity: 1,
      specifications: 'Full spectrum LED, adjustable height, covers 2x4 area'
    });
  }

  // February (Month 2) - Active seed starting season
  else if (currentMonth === 2) {
    recommendations.push({
      id: 'quality-seed-starting-soil',
      item: 'Premium Seed Starting Mix (2 cu ft)',
      price: 18.00,
      category: 'Seed Starting',
      urgency: 'high',
      timing: 'Buy now for immediate pepper and tomato seeding',
      why: 'Regular potting soil too heavy for delicate seedlings',
      where: 'Local nursery preferred for freshness',
      quantity: 2,
      specifications: 'Sterile, fine-textured, good drainage for germination'
    });

    recommendations.push({
      id: 'compost-spring-prep',
      item: 'Bulk Compost Delivery (1 cubic yard)',
      price: 45.00,
      category: 'Soil Amendment',
      urgency: 'medium',
      timing: 'Order for March delivery when clay soil is workable',
      why: `${locationName} soil needs amendment before spring planting`,
      where: 'Local nursery or landscape supply',
      quantity: 1,
      specifications: 'Aged compost, delivered when soil conditions allow working'
    });
  }

  // March (Month 3) - Spring prep and infrastructure
  else if (currentMonth === 3) {
    recommendations.push({
      id: 'irrigation-planning',
      item: 'Drip Irrigation Planning Kit',
      price: 35.00,
      category: 'Irrigation Prep',
      urgency: 'high',
      timing: 'Design now, install in April before heat',
      why: 'Critical to have watering plan before Durham summer heat arrives',
      where: 'DripWorks.com for planning materials',
      quantity: 1,
      specifications: 'Measuring tools, planning guide, sample fittings'
    });

    recommendations.push({
      id: 'shade-structure-materials',
      item: 'PVC Shade Structure Materials',
      price: 35.00,
      category: 'Heat Prep',
      urgency: 'medium',
      timing: 'Prepare support structure now, deploy cloth in April',
      why: 'Framework must be ready before deploying shade protection',
      where: 'Home Depot or Lowes',
      quantity: 1,
      specifications: '1/2" PVC pipes, joints, ground stakes for bed coverage'
    });
  }

  // April (Month 4) - Critical deployment window
  else if (currentMonth === 4) {
    recommendations.push({
      id: 'drip-irrigation-system',
      item: 'Complete Drip Irrigation System',
      price: 89.99,
      category: 'Irrigation',
      urgency: 'urgent',
      timing: 'Deploy NOW before May heat waves begin',
      why: 'Last chance to establish support systems before summer survival mode',
      where: 'Home Depot for immediate pickup',
      quantity: 1,
      specifications: 'Timer, tubing, emitters for all three beds'
    });

    recommendations.push({
      id: 'shade-cloth-install',
      item: 'Agfabric 30% Shade Cloth',
      price: 42.99,
      category: 'Heat Protection',
      urgency: 'urgent',
      timing: 'Deploy immediately - heat stress starts early May',
      why: 'Essential for supporting plants through intense heat',
      where: 'Amazon for quick delivery',
      quantity: 1,
      specifications: '12x20ft covers 4×8 and 4×5 beds with overlap'
    });
  }

  // May-August (Months 5-8) - Summer survival mode, minimal infrastructure changes
  else if (currentMonth >= 5 && currentMonth <= 8) {
    recommendations.push({
      id: 'emergency-shade',
      item: 'Emergency Shade Cloth (if not installed)',
      price: 25.00,
      category: 'Emergency Heat Protection',
      urgency: 'urgent',
      timing: 'Deploy immediately to support struggling plants',
      why: 'Crops are actively suffering from heat stress without protection',
      where: 'Local store for same-day pickup',
      quantity: 1,
      specifications: 'Quick-install shade cloth for immediate relief'
    });

    recommendations.push({
      id: 'mulch-emergency',
      item: 'Organic Mulch (5 bags)',
      price: 30.00,
      category: 'Soil Protection',
      urgency: 'high',
      timing: 'Apply immediately to retain moisture',
      why: 'Reduces watering frequency and keeps roots cool',
      where: 'Home Depot or Lowes',
      quantity: 5,
      specifications: 'Shredded hardwood or straw, 2-3 inch layer'
    });

    // Only recommend fall seeds in July-August
    if (currentMonth >= 7) {
      recommendations.push({
        id: 'fall-garden-seeds',
        item: 'Fall Garden Seed Collection',
        price: 25.00,
        category: 'Fall Planning',
        urgency: 'medium',
        timing: 'Order now for August-September planting',
        why: 'Plan fall garden while summer crops are still producing',
        where: 'True Leaf Market or Southern Exposure',
        quantity: 1,
        specifications: 'Kale, lettuce, spinach for fall harvest'
      });
    }
  }

  // September (Month 9) - Fall transition
  else if (currentMonth === 9) {
    recommendations.push({
      id: 'fall-planting-supplies',
      item: 'Fall Planting Supplies',
      price: 35.00,
      category: 'Fall Garden',
      urgency: 'high',
      timing: 'Use immediately for fall crop establishment',
      why: 'Window for fall planting closes quickly in Durham',
      where: 'Local nursery for fresh transplants',
      quantity: 1,
      specifications: 'Fall transplants, fall fertilizer, row cover'
    });
  }

  // October-November (Months 10-11) - Winter prep
  else if (currentMonth >= 10 && currentMonth <= 11) {
    recommendations.push({
      id: 'winter-protection',
      item: 'Cold Weather Protection Kit',
      price: 45.00,
      category: 'Winter Prep',
      urgency: 'high',
      timing: 'Install before first hard freeze (mid-late November)',
      why: 'Extends harvest season for cold-hardy crops',
      where: 'Amazon or garden center',
      quantity: 1,
      specifications: 'Row covers, frost blankets, hoops for winter greens'
    });

    recommendations.push({
      id: 'cold-frame',
      item: 'Cold Frame for Season Extension',
      price: 125.00,
      category: 'Season Extension',
      urgency: 'medium',
      timing: 'Install now for winter growing',
      why: 'Allows continued harvest of greens through winter',
      where: 'Local greenhouse supply or Amazon',
      quantity: 1,
      specifications: 'Polycarbonate cold frame, covers 4×5 bed section'
    });
  }

  // Filter out any items that don't make sense for current month
  const timeSensitiveRecommendations = recommendations.filter(item => {
    // Remove items that are clearly out of season
    if (currentMonth >= 6 && currentMonth <= 8) {
      // Summer: no irrigation installation, no shade cloth unless emergency
      return !item.item.includes('Installation') || item.category.includes('Emergency');
    }
    if (currentMonth >= 11 || currentMonth <= 1) {
      // Winter: no summer prep items
      return !item.category.includes('Heat');
    }
    return true;
  });

  return timeSensitiveRecommendations;
};

// Helper functions
function getPortfolioAdvice(cropType, month, hardiness = '7b') {
  const hardinessNumber = parseInt(hardiness) || 7;
  
  switch (cropType) {
    case 'heatSpecialists':
      if (month >= 5 && month <= 7) return `Perfect time for heat-loving crops (Zone ${hardiness})`;
      if (month === 3 || month === 4) return hardinessNumber >= 7 ? 'Start heat crops indoors' : 'Wait for warmer weather to start heat crops';
      break;
    case 'coolSeason':
      if (month >= 2 && month <= 4) return `Prime cool season planting time (Zone ${hardiness})`;
      if (month >= 8 && month <= 9) return hardinessNumber <= 7 ? 'Fall cool crops can be planted now' : 'Extended growing season for cool crops';
      break;
    case 'perennials':
      if (month === 3 || month === 4) return `Spring care for established perennials (Zone ${hardiness})`;
      break;
    
    default:
      return null;
  }
  return null;
}

function getCropSpecificActions(cropType, month) {
  const actions = [];
  
  if (cropType === 'heatSpecialists' && (month >= 6 && month <= 8)) {
    actions.push({
      icon: '🌶️',
      task: 'Daily okra harvest, regular pepper picking',
      urgency: 'medium',
      timing: 'Early morning'
    });
  }
  
  if (cropType === 'coolSeason' && (month === 2 || month === 3 || month === 8)) {
    actions.push({
      icon: '🥬',
      task: 'Succession plant lettuce and greens',
      urgency: 'medium',
      timing: 'Every 2-3 weeks'
    });
  }

  return actions;
}

function isCropInSeason(cropKey, month) {
  // Simplified seasonal logic for Durham
  const heatCrops = ['okra', 'hotPeppers', 'sweetPotato'];
  const coolCrops = ['kale', 'lettuce'];
  
  if (heatCrops.includes(cropKey)) {
    return month >= 4 && month <= 8;
  }
  if (coolCrops.includes(cropKey)) {
    return month <= 4 || month >= 8;
  }
  return true; // Perennials
}

function getSeasonalReason(cropKey, month, hardiness = '7b') {
  if (isCropInSeason(cropKey, month)) {
    return `Perfect timing for Zone ${hardiness}`;
  }
  return `Check local calendar for Zone ${hardiness} timing`;
}

function getPortfolioRelevance(cropName, portfolio) {
  // Simple relevance scoring based on portfolio allocation
  for (const [type, percentage] of Object.entries(portfolio)) {
    if (type === 'heatSpecialists' && ['Okra', 'Hot Peppers', 'Sweet Potato'].includes(cropName)) {
      return percentage;
    }
    if (type === 'coolSeason' && ['Kale', 'Lettuce'].includes(cropName)) {
      return percentage;
    }
  }
  return 0;
}