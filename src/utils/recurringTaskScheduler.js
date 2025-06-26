/**
 * Recurring Task Scheduler
 * Handles automatic scheduling and notifications for recurring garden tasks
 */

/**
 * Task scheduler for recurring activities with async refresh capability
 */
export class RecurringTaskScheduler {
  constructor(taskManager, onTasksBecomeAvailable) {
    this.taskManager = taskManager;
    this.onTasksBecomeAvailable = onTasksBecomeAvailable;
    this.activeTimers = new Map();
    this.isRunning = false;
  }

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleNextCheck();
    console.log('🔄 Recurring task scheduler started');
  }

  /**
   * Stop the scheduler and clear all timers
   */
  stop() {
    this.isRunning = false;
    this.clearAllTimers();
    console.log('⏹️ Recurring task scheduler stopped');
  }

  /**
   * Schedule the next check for due recurring tasks
   */
  scheduleNextCheck() {
    if (!this.isRunning) return;

    // Check every 15 minutes for newly due tasks
    const checkInterval = 15 * 60 * 1000; // 15 minutes
    
    const timer = setTimeout(() => {
      this.checkForDueTasks();
      this.scheduleNextCheck(); // Schedule next check
    }, checkInterval);

    this.activeTimers.set('main-check', timer);
  }

  /**
   * Check for tasks that have become due and notify
   */
  checkForDueTasks() {
    if (!this.isRunning) return;

    const now = Date.now();
    const { recurringSchedules } = this.taskManager.taskStates;
    
    let newlyDueTasks = 0;
    
    Object.entries(recurringSchedules).forEach(([activityId, schedule]) => {
      if (schedule.nextDue && now >= schedule.nextDue) {
        newlyDueTasks++;
        console.log(`⏰ Recurring task ${activityId} is now due`);
      }
    });

    if (newlyDueTasks > 0 && this.onTasksBecomeAvailable) {
      this.onTasksBecomeAvailable(newlyDueTasks);
    }
  }

  /**
   * Schedule a specific recurring task
   */
  scheduleRecurringTask(activityId, nextDueTime) {
    if (!this.isRunning) return;

    // Clear existing timer for this task
    const existingTimer = this.activeTimers.get(activityId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const now = Date.now();
    const delay = Math.max(0, nextDueTime - now);

    if (delay > 0) {
      const timer = setTimeout(() => {
        console.log(`⏰ Recurring task ${activityId} is due now`);
        if (this.onTasksBecomeAvailable) {
          this.onTasksBecomeAvailable(1);
        }
      }, delay);

      this.activeTimers.set(activityId, timer);
      console.log(`📅 Scheduled recurring task ${activityId} for ${new Date(nextDueTime).toLocaleString()}`);
    }
  }

  /**
   * Cancel scheduling for a specific task
   */
  cancelTaskScheduling(activityId) {
    const timer = this.activeTimers.get(activityId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(activityId);
      console.log(`❌ Cancelled scheduling for task ${activityId}`);
    }
  }

  /**
   * Clear all active timers
   */
  clearAllTimers() {
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
  }

  /**
   * Get summary of scheduled tasks
   */
  getSchedulingSummary() {
    return {
      isRunning: this.isRunning,
      activeTimers: this.activeTimers.size,
      scheduledTasks: Array.from(this.activeTimers.keys())
    };
  }
}

/**
 * Create a notification system for newly available tasks
 */
export function createTaskNotificationSystem() {
  let notificationCallback = null;
  let badgeUpdateCallback = null;

  const notify = (count, message) => {
    if (notificationCallback) {
      notificationCallback(count, message);
    }
    
    if (badgeUpdateCallback) {
      badgeUpdateCallback(count);
    }
    
    console.log(`🔔 Task notification: ${message} (${count} tasks)`);
  };

  return {
    setNotificationCallback: (callback) => {
      notificationCallback = callback;
    },
    
    setBadgeUpdateCallback: (callback) => {
      badgeUpdateCallback = callback;
    },
    
    notifyTasksAvailable: (count) => {
      const message = count === 1 
        ? 'A recurring task is now due' 
        : `${count} recurring tasks are now due`;
      notify(count, message);
    },
    
    notifyUrgentTasks: (count) => {
      const message = count === 1
        ? 'An urgent task requires attention'
        : `${count} urgent tasks require attention`;
      notify(count, message);
    }
  };
}

/**
 * Frequency helpers for recurring task scheduling
 */
export const FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly', 
  MONTHLY: 'monthly'
};

export const FREQUENCY_INTERVALS = {
  [FREQUENCIES.DAILY]: 24 * 60 * 60 * 1000,     // 1 day
  [FREQUENCIES.WEEKLY]: 7 * 24 * 60 * 60 * 1000, // 7 days  
  [FREQUENCIES.MONTHLY]: 30 * 24 * 60 * 60 * 1000 // 30 days (approximate)
};

/**
 * Calculate next occurrence for a frequency
 */
export function calculateNextOccurrence(frequency, fromTime = Date.now()) {
  const interval = FREQUENCY_INTERVALS[frequency];
  if (!interval) return null;
  
  return fromTime + interval;
}

/**
 * Get human-readable frequency description
 */
export function getFrequencyDescription(frequency) {
  const descriptions = {
    [FREQUENCIES.DAILY]: 'Daily',
    [FREQUENCIES.WEEKLY]: 'Weekly', 
    [FREQUENCIES.MONTHLY]: 'Monthly'
  };
  
  return descriptions[frequency] || 'One-time';
}

/**
 * Format time until next occurrence
 */
export function formatTimeUntil(futureTime) {
  const now = Date.now();
  const diff = futureTime - now;
  
  if (diff <= 0) return 'Due now';
  
  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}