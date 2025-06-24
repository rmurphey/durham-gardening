/**
 * Durham-Specific Smart Recommendations
 * Actionable gardening advice for Durham, NC conditions
 */

import { DURHAM_CROPS } from '../config/durhamConfig.js';
// import { DURHAM_CALENDAR } from '../config/durhamConfig.js'; // Available for future calendar integration

/**
 * Generate this month's focus for Durham gardening
 */
export const generateDurhamMonthlyFocus = (portfolio, simulationResults) => {
  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[currentMonth];

  // Get base calendar activities for this month
  // Note: monthlyActivities could be used for automated activity suggestions
  // const monthlyActivities = DURHAM_CALENDAR[monthName.toLowerCase()] || {};
  
  let focus = `**${monthName} Focus for Durham Gardens:**\n\n`;

  switch (currentMonth) {
    case 1: // January
      focus += "🌱 **Planning Season**\n";
      focus += "- Order heat-tolerant seeds while selection is best\n";
      focus += "- Plan bed rotations and new plantings\n";
      focus += "- Harvest any remaining kale and winter greens\n";
      break;

    case 2: // February  
      focus += "🌿 **Early Spring Prep**\n";
      focus += "- Start pepper and tomato seeds indoors with heat mat\n";
      focus += "- Direct sow kale and lettuce if soil isn't muddy\n";
      focus += "- Add compost to beds (only when clay soil isn't sticky)\n";
      break;

    case 3: // March
      focus += "🌱 **Spring Planting Begins**\n";
      focus += "- Continue cool-season plantings\n";
      focus += "- Harden off indoor seedlings\n";
      focus += "- Prepare irrigation for summer heat\n";
      break;

    case 4: // April
      focus += "☀️ **Transition Month**\n";
      focus += "- Last chance for cool crops before heat\n";
      focus += "- Transplant warm-season crops after soil warms\n";
      focus += "- Install shade cloth framework\n";
      break;

    case 5: // May
      focus += "🔥 **Summer Heat Prep**\n";
      focus += "- Plant heat lovers: okra, peppers, sweet potatoes\n";
      focus += "- Heavy mulching and shade cloth installation\n";
      focus += "- Deep watering schedules begin\n";
      break;

    case 6: // June
      focus += "🌞 **Heat Management**\n";
      focus += "- Harvest spring crops before they bolt\n";
      focus += "- Maintain mulch and watering\n";
      focus += "- Order fall seeds while available\n";
      break;

    case 7: // July
      focus += "🔥 **Survival Mode**\n";
      focus += "- Daily okra harvest in early morning\n";
      focus += "- Provide extra shade for struggling plants\n";
      focus += "- Keep plants alive through heat waves\n";
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
      focus += "- Install cold protection\n";
      break;

    case 12: // December
      focus += "📋 **Planning & Maintenance**\n";
      focus += "- Plan next year's garden\n";
      focus += "- Order early spring seeds\n";
      focus += "- Tool maintenance and planning\n";
      break;
    
    default:
      focus += "🌱 **Year-Round Durham Gardening**\n";
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
        const advice = getPortfolioAdvice(cropType, currentMonth);
        if (advice) focus += `- ${advice}\n`;
      }
    });
  }

  return focus;
};

/**
 * Generate weekly actions for Durham
 */
export const generateDurhamWeeklyActions = (portfolio) => {
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
 * Generate top crop recommendations for Durham
 */
export const generateDurhamTopCrops = (portfolio) => {
  const currentMonth = new Date().getMonth() + 1;
  const recommendations = [];

  // Get seasonal recommendations
  const allCrops = { ...DURHAM_CROPS.heatLovers, ...DURHAM_CROPS.coolSeason, ...DURHAM_CROPS.perennials };
  
  Object.entries(allCrops).forEach(([cropKey, crop]) => {
    const isInSeason = isCropInSeason(cropKey, currentMonth);
    if (isInSeason) {
      recommendations.push({
        crop: crop.name,
        confidence: 'high',
        reason: getSeasonalReason(cropKey, currentMonth),
        varieties: Object.keys(crop.varieties || {}).slice(0, 2),
        timing: crop.planting?.timing || 'Check Durham calendar'
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
 * Generate Durham-specific site recommendations
 */
export const generateDurhamSiteRecommendations = () => {
  const currentMonth = new Date().getMonth() + 1;
  const recommendations = [];

  // Year-round Durham tips
  recommendations.push({
    category: 'Clay Soil Management',
    tip: 'Never work Durham clay soil when wet - wait until it crumbles',
    priority: 'high',
    season: 'all'
  });

  recommendations.push({
    category: 'Heat Protection',
    tip: '30% shade cloth is essential for Durham summer success',
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
    recommendations.push({
      category: 'Winter Growing',
      tip: 'Kale and hardy greens can overwinter in Durham with minimal protection',
      priority: 'medium',
      season: 'winter'
    });
  }

  recommendations.push({
    category: 'Durham Climate',
    tip: 'Plan for extended heat waves - backup shade and extra water capacity',
    priority: 'medium',
    season: 'all'
  });

  return recommendations;
};

/**
 * Generate investment priorities for Durham
 */
export const generateDurhamInvestmentPriority = (customInvestment) => {
  const priorities = [];
  const currentMonth = new Date().getMonth() + 1;

  // Durham-specific infrastructure priorities
  if (currentMonth >= 3 && currentMonth <= 5) {
    priorities.push({
      category: 'Irrigation System',
      amount: 85,
      timing: 'Before summer heat',
      urgency: 'high',
      description: 'Essential for Durham summer survival'
    });
  }

  priorities.push({
    category: 'Shade Cloth',
    amount: 45,
    timing: 'Early spring setup',
    urgency: 'high',
    description: 'Critical for Durham heat protection'
  });

  priorities.push({
    category: 'Mulch & Compost',
    amount: 60,
    timing: 'Spring application',
    urgency: 'medium',
    description: 'Clay soil improvement and moisture retention'
  });

  priorities.push({
    category: 'Heat-Tolerant Seeds',
    amount: 25,
    timing: 'Early season ordering',
    urgency: 'medium',
    description: 'Durham-proven varieties'
  });

  return priorities;
};

// Helper functions
function getPortfolioAdvice(cropType, month) {
  switch (cropType) {
    case 'heatSpecialists':
      if (month >= 5 && month <= 7) return 'Perfect time for heat-loving crops';
      if (month === 3 || month === 4) return 'Start heat crops indoors';
      break;
    case 'coolSeason':
      if (month >= 2 && month <= 4) return 'Prime cool season planting time';
      if (month >= 8 && month <= 9) return 'Fall cool crops can be planted now';
      break;
    case 'perennials':
      if (month === 3 || month === 4) return 'Spring care for established perennials';
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

function getSeasonalReason(cropKey, month) {
  if (isCropInSeason(cropKey, month)) {
    return `Perfect timing for Durham Zone 7b`;
  }
  return `Check Durham calendar for best timing`;
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