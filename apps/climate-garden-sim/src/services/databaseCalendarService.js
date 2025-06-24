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

  // Get enabled crops from portfolio (simplified for now)
  const enabledCrops = ['hot_peppers', 'sweet_potato', 'kale', 'lettuce', 'spinach'];

  // Generate calendar for next 12 months
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12;
    const monthNumber = monthIndex + 1;
    const month = months[monthIndex];
    const activities = [];

    try {
      // Get activities from database templates
      const [activityTemplates, rotationTemplates, successionTemplates] = await Promise.all([
        databaseService.getActivityTemplates(1, monthNumber, enabledCrops),
        databaseService.getRotationTemplates(1, monthNumber), 
        databaseService.getSuccessionTemplates(1, monthNumber)
      ]);

      // Process activity templates
      activityTemplates.forEach(template => {
        // Check if this crop activity should be shown based on garden status
        if (template.plant_key && !shouldShowCropActivity(template.plant_key, template.activity_type)) {
          return;
        }

        activities.push({
          type: template.activity_type,
          crop: template.plant_key ? getCropDisplayName(template.plant_key) : 'General',
          action: databaseService.generateActionText(template),
          timing: template.timing_template || '',
          priority: template.priority || 'medium'
        });
      });

      // Process rotation templates  
      rotationTemplates.forEach(template => {
        activities.push({
          type: template.activity_type,
          crop: 'Bed Management',
          action: template.action_template,
          timing: template.timing_template || '',
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
          action: template.action_template,
          timing: template.timing_template || '',
          priority: template.priority || 'medium'
        });
      });

      // Add Durham seasonal activities (keeping some general ones)
      addDurhamSeasonalActivities(activities, monthNumber);

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
        'shopping': 1,
        'direct-sow': 2, 
        'transplant': 3,
        'succession': 4,
        'harvest': 5, 
        'care': 6,
        'rotation': 7,
        'infrastructure': 8,
        'planning': 9
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
    'carrots': 'Carrots'
  };
  
  return displayNames[cropKey] || cropKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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