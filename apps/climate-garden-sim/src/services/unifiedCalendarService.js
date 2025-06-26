/**
 * Unified Calendar Service
 * Merges garden tasks and calendar activities into a single timeline with task management
 */

import { generateDatabaseGardenCalendar } from './databaseCalendarService.js';
import { generateGardenTasks } from './temporalShoppingService.js';
import { shouldShowCropActivity } from '../config/gardenStatus.js';

/**
 * Generate unified calendar with embedded task functionality
 * @param {string} summerScenario - Selected summer scenario  
 * @param {string} winterScenario - Selected winter scenario
 * @param {string} portfolioKey - Selected portfolio strategy
 * @param {Object} locationConfig - Location configuration
 * @param {Object} customPortfolio - Custom portfolio if applicable
 * @returns {Promise<Array>} Array of monthly calendar entries with task metadata
 */
export const generateUnifiedCalendar = async (
  summerScenario, 
  winterScenario, 
  portfolioKey, 
  locationConfig, 
  customPortfolio = null
) => {
  if (!locationConfig || !summerScenario || !winterScenario || !portfolioKey) {
    return [];
  }

  console.log('🌿 Generating unified calendar with embedded tasks...');

  // Get base calendar activities from database
  const baseCalendar = await generateDatabaseGardenCalendar(
    summerScenario, 
    winterScenario, 
    portfolioKey, 
    locationConfig, 
    customPortfolio
  );

  // Get current garden tasks for task metadata
  const currentTasks = generateGardenTasks();
  
  // Create task lookup for enriching calendar activities
  const taskLookup = new Map();
  currentTasks.forEach(task => {
    taskLookup.set(task.id, task);
  });

  // Enhance calendar activities with task metadata
  const enhancedCalendar = baseCalendar.map(monthData => {
    const enhancedActivities = monthData.activities.map(activity => {
      // Generate unique activity ID
      const activityId = generateActivityId(activity, monthData.monthNumber);
      
      // Determine if this is a task-type activity
      const isTaskActivity = isActivityTaskType(activity);
      
      // Add task metadata
      const enhancedActivity = {
        ...activity,
        id: activityId,
        
        // Task management fields
        taskType: determineTaskType(activity),
        frequency: determineFrequency(activity),
        urgency: determineUrgency(activity),
        consequences: generateConsequences(activity),
        state: 'pending', // Will be updated by task manager
        completedAt: null,
        nextDueDate: null,
        originalDueDate: calculateDueDate(monthData.monthNumber),
        
        // Enhanced metadata
        isTaskActivity,
        requiresCompletion: isTaskActivity,
        canDismiss: !isRecurringActivity(activity),
        canMarkDone: true
      };

      return enhancedActivity;
    });

    return {
      ...monthData,
      activities: enhancedActivities
    };
  });

  // Add urgent garden tasks as high-priority calendar activities
  const urgentTaskActivities = addUrgentTasksToCalendar(currentTasks, enhancedCalendar);
  
  console.log(`🌿 Generated unified calendar with ${enhancedCalendar.length} months and ${urgentTaskActivities.length} urgent task activities`);
  
  return enhancedCalendar;
};

/**
 * Generate unique activity ID based on content and timing
 */
function generateActivityId(activity, monthNumber) {
  const content = `${activity.type}-${activity.crop}-${activity.action}`.replace(/[^a-zA-Z0-9]/g, '-');
  return `${monthNumber}-${content}-${Date.now() % 10000}`;
}

/**
 * Determine if an activity should be treated as a task
 */
function isActivityTaskType(activity) {
  const taskActivityTypes = [
    'indoor-starting',
    'shopping', 
    'direct-sow',
    'transplant',
    'harvest',
    'care',
    'maintenance'
  ];
  
  return taskActivityTypes.includes(activity.type) || 
         activity.priority === 'high' || 
         activity.priority === 'critical';
}

/**
 * Determine task type (one-time vs recurring)
 */
function determineTaskType(activity) {
  const recurringTypes = ['care', 'maintenance'];
  const recurringKeywords = ['daily', 'weekly', 'monitor', 'water', 'check'];
  
  if (recurringTypes.includes(activity.type)) {
    return 'recurring';
  }
  
  const text = `${activity.action} ${activity.timing}`.toLowerCase();
  if (recurringKeywords.some(keyword => text.includes(keyword))) {
    return 'recurring';
  }
  
  return 'one-time';
}

/**
 * Determine frequency for recurring tasks
 */
function determineFrequency(activity) {
  const text = `${activity.action} ${activity.timing}`.toLowerCase();
  
  if (text.includes('daily')) return 'daily';
  if (text.includes('weekly')) return 'weekly';
  if (text.includes('monthly')) return 'monthly';
  if (activity.type === 'maintenance') return 'weekly';
  if (activity.type === 'care') return 'daily';
  
  return null; // one-time tasks
}

/**
 * Determine urgency level based on activity type and priority
 */
function determineUrgency(activity) {
  // Use existing priority if available
  if (activity.priority === 'critical') return 'urgent';
  if (activity.priority === 'high') return 'urgent';
  if (activity.priority === 'medium') return 'high';
  if (activity.priority === 'low') return 'medium';
  
  // Determine urgency by activity type
  const urgentTypes = ['indoor-starting', 'transplant'];
  if (urgentTypes.includes(activity.type)) return 'urgent';
  
  const highTypes = ['direct-sow', 'harvest', 'shopping'];
  if (highTypes.includes(activity.type)) return 'high';
  
  return 'medium';
}

/**
 * Generate consequences text for task activities
 */
function generateConsequences(activity) {
  const consequenceMap = {
    'indoor-starting': 'Late start reduces growing season and plant vigor',
    'direct-sow': 'Missing planting window delays harvest timing',
    'transplant': 'Plants become root-bound and stressed',
    'harvest': 'Crops pass peak quality and may bolt',
    'care': 'Plants suffer stress and reduced productivity',
    'maintenance': 'Garden infrastructure degrades',
    'shopping': 'Items sell out or prices increase',
    'rotation': 'Soil nutrients become depleted'
  };
  
  return consequenceMap[activity.type] || 'Task timing becomes less optimal';
}

/**
 * Calculate due date based on month number
 */
function calculateDueDate(monthNumber) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  let targetYear = currentYear;
  if (monthNumber < currentMonth) {
    targetYear = currentYear + 1;
  }
  
  return new Date(targetYear, monthNumber - 1, 15).getTime();
}

/**
 * Check if activity is recurring
 */
function isRecurringActivity(activity) {
  return determineTaskType(activity) === 'recurring';
}

/**
 * Add urgent garden tasks as calendar activities
 */
function addUrgentTasksToCalendar(tasks, calendar) {
  const urgentTasks = tasks.filter(task => task.urgency === 'urgent');
  const currentMonth = new Date().getMonth() + 1;
  
  // Find current month in calendar
  const currentMonthData = calendar.find(month => month.monthNumber === currentMonth);
  
  if (currentMonthData && urgentTasks.length > 0) {
    urgentTasks.forEach(task => {
      const taskActivity = {
        id: `urgent-task-${task.id}`,
        type: 'urgent-task',
        crop: task.category,
        action: task.item,
        timing: task.timing,
        priority: 'critical',
        
        // Task metadata
        taskType: 'one-time',
        frequency: null,
        urgency: 'urgent',
        consequences: task.consequences,
        state: 'pending',
        completedAt: null,
        nextDueDate: null,
        originalDueDate: Date.now() + (task.daysUntilPlanting * 24 * 60 * 60 * 1000),
        
        // Enhanced metadata
        isTaskActivity: true,
        requiresCompletion: true,
        canDismiss: true,
        canMarkDone: true,
        
        // Original task data
        originalTask: task
      };
      
      // Insert at beginning of activities (highest priority)
      currentMonthData.activities.unshift(taskActivity);
    });
  }
  
  return urgentTasks;
}

/**
 * Get crop display name for unified calendar
 */
export function getUnifiedCropDisplayName(cropKey) {
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