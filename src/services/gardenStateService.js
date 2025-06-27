/**
 * Garden State Service
 * Generates honest recommendations based on actual plantings and weather forecasts
 */

import { 
  estimateHarvestDate, 
  getDaysSincePlanting,
  PLANTING_STATUS 
} from './gardenLog.js';
import { GLOBAL_CROP_DATABASE } from '../config.js';

/**
 * Get real harvest readiness based on actual plantings and weather
 */
export const getActualHarvestReadiness = (gardenLog, forecastData = null) => {
  const readyToHarvest = [];
  const almostReady = [];
  
  gardenLog.plantings.forEach(planting => {
    if (planting.status === PLANTING_STATUS.READY) {
      // Already marked as ready by user
      readyToHarvest.push({
        ...planting,
        readyStatus: 'user-confirmed',
        daysReady: getDaysSinceStatusChange(planting, PLANTING_STATUS.READY) || 0
      });
      return;
    }

    // Find crop data
    const cropData = findCropInDatabase(planting.crop);
    if (!cropData || !planting.plantedDate) return;

    const estimatedReady = estimateHarvestDate(planting, cropData);
    if (!estimatedReady) return;

    const today = new Date();
    const daysUntilReady = Math.ceil((estimatedReady - today) / (1000 * 60 * 60 * 24));

    // Apply weather adjustments
    const weatherAdjustment = calculateWeatherImpact(planting, forecastData, cropData);
    const adjustedDaysUntilReady = daysUntilReady + weatherAdjustment.delayDays;

    if (adjustedDaysUntilReady <= 0) {
      readyToHarvest.push({
        ...planting,
        readyStatus: 'estimated-ready',
        estimatedReadyDate: estimatedReady,
        weatherImpact: weatherAdjustment,
        note: weatherAdjustment.note
      });
    } else if (adjustedDaysUntilReady <= 7) {
      almostReady.push({
        ...planting,
        readyStatus: 'almost-ready',
        daysUntilReady: adjustedDaysUntilReady,
        estimatedReadyDate: new Date(today.getTime() + (adjustedDaysUntilReady * 24 * 60 * 60 * 1000)),
        weatherImpact: weatherAdjustment,
        note: weatherAdjustment.note
      });
    }
  });

  return { readyToHarvest, almostReady };
};

/**
 * Generate weather-aware urgent tasks based on actual plantings
 */
export const getActualUrgentTasks = (gardenLog, forecastData = null, locationConfig = {}) => {
  const urgentTasks = [];
  // today variable available but not used in current implementation

  // Check forecast for upcoming weather events
  const weatherThreats = analyzeWeatherThreats(forecastData);

  gardenLog.plantings.forEach(planting => {
    const cropData = findCropInDatabase(planting.crop);
    if (!cropData) return;

    const daysSincePlanting = getDaysSincePlanting(planting);
    const plantingAge = daysSincePlanting || 0;

    // Weather-specific urgent tasks
    weatherThreats.forEach(threat => {
      const protection = getWeatherProtection(planting, threat, cropData, plantingAge);
      if (protection.urgent) {
        urgentTasks.push({
          type: 'weather-protection',
          planting,
          task: protection.action,
          deadline: threat.date,
          urgency: protection.urgency,
          reason: `${threat.type} forecast: ${threat.description}`,
          weatherThreat: threat
        });
      }
    });

    // Growth stage urgent tasks
    const growthTasks = getGrowthStageUrgentTasks(planting, cropData, plantingAge);
    urgentTasks.push(...growthTasks);

    // Harvest timing tasks
    const harvestTasks = getHarvestTimingTasks(planting, cropData, forecastData);
    urgentTasks.push(...harvestTasks);
  });

  // Sort by urgency and deadline
  return urgentTasks.sort((a, b) => {
    const urgencyOrder = { 'critical': 3, 'high': 2, 'medium': 1 };
    const aUrgency = urgencyOrder[a.urgency] || 0;
    const bUrgency = urgencyOrder[b.urgency] || 0;
    
    if (aUrgency !== bUrgency) return bUrgency - aUrgency;
    
    // Sort by deadline if same urgency
    const aDeadline = new Date(a.deadline || '2099-12-31');
    const bDeadline = new Date(b.deadline || '2099-12-31');
    return aDeadline - bDeadline;
  });
};

/**
 * Calculate weather impact on crop development
 */
const calculateWeatherImpact = (planting, forecastData, cropData) => {
  if (!forecastData || !forecastData.days) {
    return { delayDays: 0, note: null };
  }

  let delayDays = 0;
  let notes = [];

  // Analyze next 10 days of forecast
  forecastData.days.slice(0, 10).forEach(day => {
    // Heat stress delays
    if (day.high > 95 && cropData.heat !== 'excellent') {
      delayDays += 0.5;
      notes.push('extreme heat slowing growth');
    }

    // Cold delays
    if (day.low < 50 && cropData.heat === 'excellent') {
      delayDays += 0.3;
      notes.push('cool weather slowing warm-season crops');
    }

    // Drought stress
    if (day.precipitation < 0.1 && cropData.drought !== 'excellent') {
      delayDays += 0.2;
      notes.push('dry conditions affecting growth');
    }

    // Excessive rain delays
    if (day.precipitation > 1.5) {
      delayDays += 0.3;
      notes.push('excessive rain delaying harvest');
    }
  });

  return {
    delayDays: Math.round(delayDays),
    note: notes.length > 0 ? `Weather impact: ${notes.join(', ')}` : null
  };
};

/**
 * Analyze forecast for weather threats
 */
const analyzeWeatherThreats = (forecastData) => {
  if (!forecastData || !forecastData.days) return [];

  const threats = [];
  const today = new Date();

  forecastData.days.forEach((day, index) => {
    const date = new Date(today.getTime() + (index * 24 * 60 * 60 * 1000));

    // Frost threat
    if (day.low <= 32) {
      threats.push({
        type: 'frost',
        date,
        description: `Low of ${day.low}°F`,
        severity: day.low <= 28 ? 'hard-freeze' : 'light-frost'
      });
    }

    // Heat wave
    if (day.high >= 100) {
      threats.push({
        type: 'extreme-heat',
        date,
        description: `High of ${day.high}°F`,
        severity: day.high >= 105 ? 'dangerous' : 'stressful'
      });
    }

    // Heavy rain
    if (day.precipitation >= 2.0) {
      threats.push({
        type: 'heavy-rain',
        date,
        description: `${day.precipitation}" of rain`,
        severity: day.precipitation >= 4.0 ? 'flooding' : 'heavy'
      });
    }

    // High winds (if available in forecast)
    if (day.windSpeed && day.windSpeed >= 25) {
      threats.push({
        type: 'high-winds',
        date,
        description: `Winds ${day.windSpeed} mph`,
        severity: day.windSpeed >= 40 ? 'damaging' : 'strong'
      });
    }
  });

  return threats;
};

/**
 * Get weather protection recommendations for specific plantings
 */
const getWeatherProtection = (planting, threat, cropData, plantingAge) => {
  const protectionActions = {
    frost: {
      tender: { action: 'Cover with frost cloth or bring containers indoors', urgency: 'critical' },
      hardy: { action: 'Harvest any ready produce before frost', urgency: 'high' },
      established: { action: 'Mulch around plants for root protection', urgency: 'medium' }
    },
    'extreme-heat': {
      young: { action: 'Provide shade cloth and extra watering', urgency: 'high' },
      established: { action: 'Deep water early morning, add mulch', urgency: 'medium' },
      'heat-sensitive': { action: 'Provide afternoon shade and frequent watering', urgency: 'high' }
    },
    'heavy-rain': {
      'poor-drainage': { action: 'Improve drainage or move containers to protected area', urgency: 'high' },
      young: { action: 'Stake tall plants and protect from soil splash', urgency: 'medium' },
      established: { action: 'Harvest ripe produce before rain', urgency: 'medium' }
    },
    'high-winds': {
      tall: { action: 'Stake plants and harvest heavy fruit', urgency: 'high' },
      young: { action: 'Provide wind protection or move containers', urgency: 'high' },
      established: { action: 'Check and reinforce existing stakes', urgency: 'medium' }
    }
  };

  // Determine plant vulnerability category
  let category = 'established';
  
  if (plantingAge < 30) category = 'young';
  if (threat.type === 'frost' && cropData.zones && !cropData.zones.includes('6')) category = 'tender';
  if (threat.type === 'extreme-heat' && cropData.heat === 'poor') category = 'heat-sensitive';
  if (threat.type === 'heavy-rain' && cropData.drainage === 'poor') category = 'poor-drainage';
  if (threat.type === 'high-winds' && planting.notes?.includes('tall')) category = 'tall';

  const protection = protectionActions[threat.type]?.[category] || protectionActions[threat.type]?.established;
  
  return {
    urgent: protection && ['critical', 'high'].includes(protection.urgency),
    action: protection?.action || 'Monitor plant for stress',
    urgency: protection?.urgency || 'low'
  };
};

/**
 * Get urgent tasks based on growth stage
 */
const getGrowthStageUrgentTasks = (planting, cropData, plantingAge) => {
  const tasks = [];

  // Transplant timing for seedlings started indoors
  if (planting.status === PLANTING_STATUS.GERMINATED && planting.location?.includes('indoor')) {
    if (plantingAge >= 21) { // 3 weeks old
      tasks.push({
        type: 'transplant',
        planting,
        task: 'Transplant seedlings outdoors (weather permitting)',
        urgency: 'high',
        reason: 'Seedlings ready for transplanting'
      });
    }
  }

  // Support for growing plants
  if (planting.status === PLANTING_STATUS.GROWING && plantingAge >= 30) {
    if (['tomatoes', 'peppers', 'peas', 'beans'].includes(planting.crop)) {
      tasks.push({
        type: 'support',
        planting,
        task: 'Install plant supports (stakes, cages, or trellises)',
        urgency: 'medium',
        reason: 'Plants need support before becoming heavy with fruit'
      });
    }
  }

  return tasks;
};

/**
 * Get harvest timing tasks based on weather
 */
const getHarvestTimingTasks = (planting, cropData, forecastData) => {
  const tasks = [];

  // Rush harvest before bad weather
  if (planting.status === PLANTING_STATUS.READY) {
    const weatherThreats = analyzeWeatherThreats(forecastData);
    
    weatherThreats.forEach(threat => {
      if (['frost', 'heavy-rain'].includes(threat.type)) {
        const daysUntil = Math.ceil((threat.date - new Date()) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 3) {
          tasks.push({
            type: 'urgent-harvest',
            planting,
            task: `Harvest ${planting.crop} before ${threat.type}`,
            deadline: threat.date,
            urgency: 'high',
            reason: `${threat.description} forecast in ${daysUntil} days`
          });
        }
      }
    });
  }

  return tasks;
};

/**
 * Find crop data in the global database
 */
const findCropInDatabase = (cropKey) => {
  for (const category of Object.values(GLOBAL_CROP_DATABASE)) {
    if (category[cropKey]) {
      return category[cropKey];
    }
  }
  return null;
};

/**
 * Helper to get days since status change
 */
const getDaysSinceStatusChange = (planting, targetStatus) => {
  if (planting.status !== targetStatus) return null;
  
  // This would need status change history to be accurate
  // For now, estimate based on lastUpdated
  const lastUpdate = new Date(planting.lastUpdated);
  const today = new Date();
  return Math.ceil((today - lastUpdate) / (1000 * 60 * 60 * 24));
};