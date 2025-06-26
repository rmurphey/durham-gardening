/**
 * Calendar Task Manager Hook
 * Enhanced task management for calendar activities with completion, dismissal, and recurring tasks
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'garden-calendar-state';

export const useCalendarTaskManager = () => {
  const [taskStates, setTaskStates] = useState({
    completedActivities: {},
    dismissedActivities: new Set(),
    recurringSchedules: {}
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setTaskStates({
          completedActivities: data.completedActivities || {},
          dismissedActivities: new Set(data.dismissedActivities || []),
          recurringSchedules: data.recurringSchedules || {}
        });
      }
    } catch (error) {
      console.error('Error loading calendar task state:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const data = {
        completedActivities: taskStates.completedActivities,
        dismissedActivities: Array.from(taskStates.dismissedActivities),
        recurringSchedules: taskStates.recurringSchedules
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving calendar task state:', error);
    }
  }, [taskStates]);

  /**
   * Mark a calendar activity as completed
   */
  const markActivityComplete = useCallback((activityId, activity) => {
    const now = Date.now();
    
    setTaskStates(prev => {
      const newState = { ...prev };
      
      if (activity.taskType === 'recurring') {
        // For recurring tasks, schedule next occurrence
        const nextDue = calculateNextDueDate(activity.frequency, now);
        newState.recurringSchedules = {
          ...prev.recurringSchedules,
          [activityId]: {
            frequency: activity.frequency,
            lastCompleted: now,
            nextDue: nextDue,
            completedCount: (prev.recurringSchedules[activityId]?.completedCount || 0) + 1
          }
        };
        
        // Also mark as completed temporarily
        newState.completedActivities = {
          ...prev.completedActivities,
          [activityId]: { completedAt: now, nextDue: nextDue }
        };
      } else {
        // For one-time tasks, mark as completed permanently
        newState.completedActivities = {
          ...prev.completedActivities,
          [activityId]: { completedAt: now, nextDue: null }
        };
      }
      
      return newState;
    });
  }, []);

  /**
   * Mark a calendar activity as dismissed (one-time removal)
   */
  const dismissActivity = useCallback((activityId) => {
    setTaskStates(prev => ({
      ...prev,
      dismissedActivities: new Set([...prev.dismissedActivities, activityId])
    }));
  }, []);

  /**
   * Mark an activity as incomplete (undo completion)
   */
  const markActivityIncomplete = useCallback((activityId) => {
    setTaskStates(prev => {
      const newCompletedActivities = { ...prev.completedActivities };
      delete newCompletedActivities[activityId];
      
      const newRecurringSchedules = { ...prev.recurringSchedules };
      delete newRecurringSchedules[activityId];
      
      return {
        ...prev,
        completedActivities: newCompletedActivities,
        recurringSchedules: newRecurringSchedules
      };
    });
  }, []);

  /**
   * Restore a dismissed activity
   */
  const undismissActivity = useCallback((activityId) => {
    setTaskStates(prev => {
      const newDismissed = new Set(prev.dismissedActivities);
      newDismissed.delete(activityId);
      return {
        ...prev,
        dismissedActivities: newDismissed
      };
    });
  }, []);

  /**
   * Get the current state of an activity
   */
  const getActivityState = useCallback((activityId, activity) => {
    // Check if dismissed
    if (taskStates.dismissedActivities.has(activityId)) {
      return 'dismissed';
    }
    
    // Check if completed
    const completed = taskStates.completedActivities[activityId];
    if (completed) {
      if (activity.taskType === 'recurring') {
        // For recurring tasks, check if next occurrence is due
        const now = Date.now();
        if (completed.nextDue && now >= completed.nextDue) {
          return 'pending'; // Due again
        }
        return 'completed'; // Still in waiting period
      } else {
        return 'completed'; // One-time task completed
      }
    }
    
    return 'pending';
  }, [taskStates]);

  /**
   * Get activities filtered by state
   */
  const getActivitiesByState = useCallback((activities, state) => {
    return activities.filter(activity => 
      getActivityState(activity.id, activity) === state
    );
  }, [getActivityState]);

  /**
   * Get count of pending urgent activities
   */
  const getUrgentPendingCount = useCallback((activities) => {
    return activities.filter(activity => 
      activity.urgency === 'urgent' && 
      getActivityState(activity.id, activity) === 'pending'
    ).length;
  }, [getActivityState]);

  /**
   * Get count of pending high priority activities
   */
  const getHighPriorityPendingCount = useCallback((activities) => {
    return activities.filter(activity => 
      (activity.urgency === 'urgent' || activity.urgency === 'high') && 
      getActivityState(activity.id, activity) === 'pending'
    ).length;
  }, [getActivityState]);

  /**
   * Clear old completed activities (cleanup)
   */
  const clearOldCompletedActivities = useCallback((daysOld = 30) => {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    setTaskStates(prev => {
      const newCompletedActivities = {};
      
      Object.entries(prev.completedActivities).forEach(([id, data]) => {
        if (data.completedAt > cutoffTime) {
          newCompletedActivities[id] = data;
        }
      });
      
      return {
        ...prev,
        completedActivities: newCompletedActivities
      };
    });
  }, []);

  /**
   * Get upcoming recurring tasks that are due
   */
  const getUpcomingRecurringTasks = useCallback((activities) => {
    const now = Date.now();
    const upcomingWindow = 24 * 60 * 60 * 1000; // 24 hours
    
    return activities.filter(activity => {
      if (activity.taskType !== 'recurring') return false;
      
      const schedule = taskStates.recurringSchedules[activity.id];
      if (!schedule) return false;
      
      return schedule.nextDue && 
             schedule.nextDue <= (now + upcomingWindow) && 
             schedule.nextDue > now;
    });
  }, [taskStates]);

  /**
   * Reset all task states (for development/testing)
   */
  const resetAllTaskStates = useCallback(() => {
    setTaskStates({
      completedActivities: {},
      dismissedActivities: new Set(),
      recurringSchedules: {}
    });
  }, []);

  return {
    // State getters
    getActivityState,
    getActivitiesByState,
    getUrgentPendingCount,
    getHighPriorityPendingCount,
    getUpcomingRecurringTasks,
    
    // Actions
    markActivityComplete,
    dismissActivity,
    markActivityIncomplete,
    undismissActivity,
    clearOldCompletedActivities,
    resetAllTaskStates,
    
    // Raw state for debugging
    taskStates
  };
};

/**
 * Calculate next due date for recurring tasks
 */
function calculateNextDueDate(frequency, fromTime) {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY; // Approximate
  
  switch (frequency) {
    case 'daily':
      return fromTime + DAY;
    case 'weekly':
      return fromTime + WEEK;
    case 'monthly':
      return fromTime + MONTH;
    default:
      return null;
  }
}

/**
 * Format time remaining until next occurrence
 */
export function formatTimeUntilNext(nextDueTime) {
  if (!nextDueTime) return null;
  
  const now = Date.now();
  const diff = nextDueTime - now;
  
  if (diff <= 0) return 'Due now';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${minutes}m`;
  }
}