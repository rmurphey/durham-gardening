/**
 * Dashboard Data Service
 * Provides critical, actionable information for Durham garden dashboard
 */

import { DURHAM_CROPS } from '../config/durhamConfig.js';

/**
 * Get current weather impact and Durham-specific alerts
 */
export const getDurhamWeatherAlerts = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  const alerts = [];
  
  // Seasonal alerts based on Durham climate patterns
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
    
    if (dayOfYear >= 181 && dayOfYear <= 220) { // July 1st to early August
      alerts.push({
        type: 'clay-soil',
        icon: '🏔️',
        title: 'Clay Soil Alert',
        message: 'Avoid working wet clay soil. Wait 24hrs after rain before garden work.',
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

/**
 * Get crops ready to harvest now based on Durham calendar
 */
export const getReadyToHarvest = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  
  const harvestReady = [];
  
  // Durham-specific harvest timing
  switch (month) {
    case 1:
    case 2:
      harvestReady.push(
        { crop: 'Kale', variety: 'Red Russian', daysReady: 0, value: '$8/lb', note: 'Peak flavor in cold' },
        { crop: 'Spinach', variety: 'Bloomsdale', daysReady: 3, value: '$12/lb', note: 'Before bolting' }
      );
      break;
    case 3:
    case 4:
      harvestReady.push(
        { crop: 'Lettuce', variety: 'Jericho', daysReady: 2, value: '$6/head', note: 'Before heat stress' },
        { crop: 'Kale', variety: 'Red Russian', daysReady: 0, value: '$8/lb', note: 'Last harvest before summer' }
      );
      break;
    case 5:
    case 6:
      harvestReady.push(
        { crop: 'Lettuce', variety: 'Heat-tolerant', daysReady: 0, value: '$6/head', note: 'Harvest immediately' },
        { crop: 'Peas', variety: 'Sugar snap', daysReady: 5, value: '$4/lb', note: 'Before pod gets tough' }
      );
      break;
    case 7:
    case 8:
      harvestReady.push(
        { crop: 'Okra', variety: 'Clemson Spineless', daysReady: 0, value: '$3/lb', note: 'Daily harvest needed' },
        { crop: 'Tomatoes', variety: 'Heat-tolerant', daysReady: 2, value: '$5/lb', note: 'Peak ripening' }
      );
      break;
    case 9:
    case 10:
      harvestReady.push(
        { crop: 'Fall Lettuce', variety: 'Jericho', daysReady: 0, value: '$6/head', note: 'Perfect weather window' },
        { crop: 'Kale', variety: 'Red Russian', daysReady: 5, value: '$8/lb', note: 'Sweetens with cool weather' }
      );
      break;
    case 11:
    case 12:
      harvestReady.push(
        { crop: 'Kale', variety: 'Red Russian', daysReady: 0, value: '$8/lb', note: 'Cold-sweetened leaves' },
        { crop: 'Spinach', variety: 'Bloomsdale', daysReady: 0, value: '$12/lb', note: 'Peak cold-weather growth' }
      );
      break;
  }
  
  return harvestReady;
};

/**
 * Get critical timing windows happening now
 */
export const getCriticalTimingWindows = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const dayOfMonth = now.getDate();
  
  const windows = [];
  
  // Durham-specific critical windows
  if (month === 3 && dayOfMonth >= 15) {
    windows.push({
      type: 'planting-deadline',
      icon: '⏰',
      title: 'Cool Season Deadline',
      message: 'Last 2 weeks to plant lettuce/spinach before heat',
      daysLeft: Math.max(0, 31 - dayOfMonth),
      action: 'Plant now or wait until fall'
    });
  }
  
  if (month === 4 && dayOfMonth >= 15) {
    windows.push({
      type: 'transplant-window',
      icon: '🌱',
      title: 'Warm Crop Transplant Window',
      message: 'Soil warming - safe to transplant tomatoes/peppers',
      daysLeft: 15,
      action: 'Transplant indoor seedlings'
    });
  }
  
  if (month === 8 && dayOfMonth >= 15) {
    windows.push({
      type: 'fall-prep',
      icon: '🍂',
      title: 'Fall Planting Prep',
      message: 'Start fall crops now for October/November harvest',
      daysLeft: 15,
      action: 'Start kale, lettuce, spinach seeds'
    });
  }
  
  if (month === 1 || month === 2) {
    windows.push({
      type: 'seed-ordering',
      icon: '📦',
      title: 'Annual Seed Ordering',
      message: 'Prime ordering window for best selection',
      daysLeft: month === 1 ? 60 : 30,
      action: 'Review and order heat-tolerant varieties'
    });
  }
  
  return windows;
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
        'Apply water before temperatures rise'
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
          'Shade cloth for lettuce/spinach',
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
          'Prepare supports for warm season crops'
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
          'Extend harvest with row covers'
        ]
      });
      break;
  }
  
  return guidance;
};