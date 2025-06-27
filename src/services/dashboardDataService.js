/**
 * Dashboard Data Service
 * Provides critical, actionable information based on actual garden state
 */

import { getActualHarvestReadiness, getActualUrgentTasks } from './gardenStateService.js';

/**
 * Get current weather impact and location-specific alerts
 */
export const getLocationWeatherAlerts = (locationConfig = {}) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  const alerts = [];
  const locationName = locationConfig.name || 'your location';
  
  // Seasonal alerts based on location climate patterns
  if (month >= 6 && month <= 8) {
    // Summer heat alerts
    alerts.push({
      type: 'heat-warning',
      icon: '🌡️',
      title: 'Summer Heat Active',
      message: 'Water early morning or evening. Check for heat stress on lettuce/spinach.',
      action: 'Harvest any bolting greens today',
      urgency: 'high'
    });
    
    // Only show clay soil alerts if we know it's relevant to the location
    if (dayOfYear >= 181 && dayOfYear <= 220 && locationName.toLowerCase().includes('nc')) {
      alerts.push({
        type: 'soil-caution',
        icon: '🏔️',
        title: 'Soil Work Caution',
        message: 'Avoid working wet soil. Wait 24hrs after rain before garden work.',
        action: 'Check soil squeeze test',
        urgency: 'medium'
      });
    }
  }
  
  if (month >= 3 && month <= 4) {
    // Spring transition
    alerts.push({
      type: 'transition-season',
      icon: '🌱',
      title: 'Spring Transition Window',
      message: 'Last weeks for cool-season crops before summer heat arrives.',
      action: 'Plant final lettuce succession',
      urgency: 'high'
    });
  }
  
  if (month >= 9 && month <= 10) {
    // Fall planting window
    alerts.push({
      type: 'fall-window',
      icon: '🍂',
      title: 'Fall Planting Active',
      message: 'Prime time for cool-season crops. Heat stress declining.',
      action: 'Start fall lettuce, kale, spinach',
      urgency: 'high'
    });
  }
  
  // Durham-specific timing alerts
  if (month === 1 || month === 2) {
    alerts.push({
      type: 'seed-ordering',
      icon: '📦',
      title: 'Seed Ordering Season',
      message: 'Best selection and pricing available for heat-tolerant varieties.',
      action: 'Order summer seeds now',
      urgency: 'medium'
    });
  }
  
  return alerts;
};

// Backward compatibility export for tests
export const getDurhamWeatherAlerts = () => getLocationWeatherAlerts({ name: 'Durham, NC', hardiness: '7b' });

/**
 * Get crops ready to harvest based on actual garden log
 * @param {Object|null} gardenLog - Garden log with plantings array
 * @param {Object|null} forecastData - Weather forecast data
 * @param {Object} locationConfig - Location configuration object (REQUIRED for harvest timing)
 * @returns {Array} Array of harvest-ready items
 */
export const getReadyToHarvest = (gardenLog = null, forecastData = null, locationConfig) => {
  if (!locationConfig || !locationConfig.coordinates) {
    console.warn('getReadyToHarvest: Missing locationConfig coordinates, using fallback');
    // Return empty array for graceful degradation instead of throwing
    return [];
  }
  
  if (!gardenLog || !gardenLog.plantings.length) {
    return []; // No theoretical recommendations - only show actual plantings
  }

  const { readyToHarvest, almostReady } = getActualHarvestReadiness(gardenLog, forecastData);
  
  // Format for dashboard display
  return readyToHarvest.map(planting => ({
    crop: planting.crop,
    variety: planting.variety || 'Unknown variety',
    daysReady: planting.daysReady || 0,
    location: planting.location || 'Garden',
    note: planting.note || 'Ready to harvest',
    readyStatus: planting.readyStatus,
    plantingId: planting.id
  }));
};

/**
 * Get critical timing windows based on actual garden state
 * @param {Object|null} gardenLog - Garden log with plantings array
 * @param {Object|null} forecastData - Weather forecast data
 * @param {Object} locationConfig - Location configuration object (REQUIRED)
 * @returns {Array} Array of critical timing window objects
 */
export const getCriticalTimingWindows = (gardenLog = null, forecastData = null, locationConfig) => {
  if (!locationConfig || !locationConfig.coordinates) {
    console.warn('getCriticalTimingWindows: Missing locationConfig coordinates, using fallback');
    return [];
  }
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const dayOfMonth = now.getDate();
  
  if (!gardenLog || !gardenLog.plantings.length) {
    return []; // No theoretical recommendations - only show actual garden-based windows
  }

  // Get urgent tasks from actual garden state
  const urgentTasks = getActualUrgentTasks(gardenLog, forecastData, locationConfig);
  
  // Convert urgent tasks to critical timing windows format
  const windows = urgentTasks
    .filter(task => task.urgency === 'critical' || task.urgency === 'high')
    .slice(0, 3) // Limit to top 3 most critical
    .map(task => ({
      type: task.type,
      icon: getTaskIcon(task.type),
      title: task.task,
      message: task.reason,
      daysLeft: task.deadline ? Math.max(0, Math.ceil((new Date(task.deadline) - now) / (1000 * 60 * 60 * 24))) : null,
      action: task.task,
      plantingId: task.planting?.id,
      urgency: task.urgency
    }));
  
  return windows;
};

/**
 * Get icon for task type
 */
const getTaskIcon = (taskType) => {
  const icons = {
    'weather-protection': '⛈️',
    'transplant': '🌱',
    'support': '🪴',
    'urgent-harvest': '🥬',
    'watering': '💧',
    'fertilize': '🌿'
  };
  return icons[taskType] || '⚠️';
};

/**
 * Get simulation summary for dashboard display
 * Connects to actual Monte Carlo simulation results instead of fake ROI
 */
export const getSimulationSummary = (simulationResults, totalInvestment) => {
  if (!simulationResults) {
    return {
      hasSimulation: false,
      message: 'Run simulation to see garden outlook',
      action: 'Configure and run simulation →',
      confidence: 'No data'
    };
  }

  const expectedReturn = simulationResults.mean || 0;
  const successRate = simulationResults.successRate || 0;
  const confidenceRange = simulationResults.percentiles || {};
  
  // Calculate risk level based on variance and success rate
  let riskLevel = 'Low';
  let riskColor = 'success';
  
  if (successRate < 50) {
    riskLevel = 'High';
    riskColor = 'error';
  } else if (successRate < 70) {
    riskLevel = 'Medium';
    riskColor = 'warning';
  }
  
  // Format confidence interval
  const p10 = confidenceRange.p10 || 0;
  const p90 = confidenceRange.p90 || 0;
  const confidenceText = `$${Math.round(expectedReturn)} ± $${Math.round(Math.abs(p90 - p10) / 2)}`;
  
  return {
    hasSimulation: true,
    expectedReturn: Math.round(expectedReturn),
    successRate: Math.round(successRate),
    riskLevel,
    riskColor,
    confidenceText,
    totalInvestment: totalInvestment || 0,
    message: expectedReturn > 0 ? 'Positive garden outlook' : 'Consider adjusting strategy',
    action: 'View detailed analysis →'
  };
};

/**
 * Get actionable Durham-specific guidance for today
 */
export const getTodaysActionableGuidance = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const hour = now.getHours();
  
  const guidance = [];
  
  // Time-of-day specific guidance
  if (hour >= 6 && hour <= 10) {
    guidance.push({
      type: 'morning-tasks',
      icon: '🌅',
      title: 'Morning Garden Time',
      actions: [
        'Check overnight watering results',
        'Harvest heat-sensitive crops',
        'Support plants with early watering before heat'
      ]
    });
  }
  
  if (hour >= 17 && hour <= 20) {
    guidance.push({
      type: 'evening-tasks',
      icon: '🌆',
      title: 'Evening Garden Time',
      actions: [
        'Deep watering for overnight absorption',
        'Check for pest damage',
        'Plan tomorrow\'s harvest'
      ]
    });
  }
  
  // Durham seasonal guidance
  switch (month) {
    case 6:
    case 7:
    case 8:
      guidance.push({
        type: 'summer-priority',
        icon: '☀️',
        title: 'Summer Heat Strategy',
        actions: [
          'Provide shade protection for lettuce/spinach',
          'Mulch heavily to retain moisture',
          'Daily okra harvest prevents tough pods'
        ]
      });
      break;
    case 3:
    case 4:
      guidance.push({
        type: 'spring-transition',
        icon: '🌱',
        title: 'Spring Transition Focus',
        actions: [
          'Clay soil: wait 24hrs after rain to work',
          'Last plantings of cool crops',
          'Set up supports to help warm season crops thrive'
        ]
      });
      break;
    case 9:
    case 10:
      guidance.push({
        type: 'fall-opportunity',
        icon: '🍂',
        title: 'Fall Growing Window',
        actions: [
          'Best growing conditions of the year',
          'Start succession plantings every 2 weeks',
          'Support extended harvest with protective covers'
        ]
      });
      break;
    default:
      // No specific seasonal guidance for this month
      break;
  }
  
  return guidance;
};