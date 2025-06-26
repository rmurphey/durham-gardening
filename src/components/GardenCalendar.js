/**
 * Interactive Garden Calendar Component
 * Displays month-by-month garden planning calendar with task management
 */

import React, { useEffect, useRef, useState } from 'react';
import { useCalendarTaskManager } from '../hooks/useCalendarTaskManager.js';
import { formatTimeUntilNext } from '../hooks/useCalendarTaskManager.js';
import { RecurringTaskScheduler, createTaskNotificationSystem } from '../utils/recurringTaskScheduler.js';

// Helper function to get category icons for activities
function getCategoryIcon(activityType) {
  const icons = {
    'maintenance': '🔧',
    'direct-sow': '🌱',
    'transplant': '🌿',
    'harvest': '🥬',
    'care': '💚',
    'infrastructure': '🏗️',
    'planning': '📋',
    'shopping': '🛒',
    'succession': '🔄',
    'rotation': '🔄',
    'indoor-starting': '🌱', // Seedling icon for indoor starts
    'seed-starting': '🌱',   // Alternative naming
    'aerogarden': '💧',      // Hydroponic growing system
    'microgreen': '🌿',      // Quick-growing microgreens
    'sprouting': '🫘',       // Sprouting seeds/beans
    'screen-porch': '🏠',    // Protected growing space
    'urgent-task': '🚨'      // Urgent task indicator
  };
  return <span className="activity-icon">{icons[activityType] || '📝'}</span>;
}

// ActivityCard component for interactive task management
const ActivityCard = ({ activity, state, onComplete, onDismiss, onUndoComplete, taskManager }) => {
  const isCompleted = state === 'completed';
  const isRecurring = activity.taskType === 'recurring';
  const canDismiss = activity.canDismiss && !isRecurring;
  
  // Get next due time for recurring completed tasks
  const completedData = taskManager.taskStates.completedActivities[activity.id];
  const nextDueTime = completedData?.nextDue;
  const timeUntilNext = nextDueTime ? formatTimeUntilNext(nextDueTime) : null;

  return (
    <div className={`activity activity-${activity.type} priority-${activity.priority || 'medium'} state-${state}`}>
      <div className="activity-header">
        <div className="activity-header-row">
          <div className="activity-header-left">
            <span className="activity-crop">{activity.crop}</span>
            {getCategoryIcon(activity.type)}
          </div>
          
          <div className="activity-controls">
            {!isCompleted && (
              <>
                <button 
                  className="activity-btn complete-btn"
                  onClick={onComplete}
                  title={isRecurring ? `Mark as done (will remind ${activity.frequency})` : "Mark as completed"}
                >
                  ✓
                </button>
                {canDismiss && (
                  <button 
                    className="activity-btn dismiss-btn"
                    onClick={onDismiss}
                    title="Dismiss this task"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
            
            {isCompleted && (
              <div className="activity-completed">
                <span className="completed-indicator">✓ Done</span>
                <button 
                  className="activity-btn undo-btn"
                  onClick={onUndoComplete}
                  title="Mark as not done"
                >
                  ↺
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="activity-meta-row">
          <div className="activity-tags">
            {(activity.urgency === 'urgent' || activity.priority === 'critical') && (
              <span className={`activity-priority priority-${activity.urgency || activity.priority}`}>
                {activity.urgency === 'urgent' || activity.priority === 'critical' ? 'URGENT' : 'HIGH'}
              </span>
            )}
            {isRecurring && (
              <span className="activity-frequency">
                {activity.frequency}
              </span>
            )}
          </div>
          
          {isCompleted && isRecurring && timeUntilNext && (
            <span className="next-due">Next: {timeUntilNext}</span>
          )}
        </div>
      </div>
      
      <div className="activity-content">
        <div className="activity-action">{activity.action}</div>
        {activity.timing && (
          <div className="activity-timing">{activity.timing}</div>
        )}
        {activity.consequences && activity.urgency === 'urgent' && (
          <div className="activity-consequences">
            <em>⚠️ {activity.consequences}</em>
          </div>
        )}
      </div>
    </div>
  );
};

const GardenCalendar = ({ gardenCalendar }) => {
  const taskManager = useCalendarTaskManager();
  const schedulerRef = useRef(null);
  const notificationSystemRef = useRef(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize notification system and scheduler
  useEffect(() => {
    if (!notificationSystemRef.current) {
      notificationSystemRef.current = createTaskNotificationSystem();
      
      // Set up notification callbacks
      notificationSystemRef.current.setNotificationCallback((count, message) => {
        console.log(`🔔 ${message}`);
        // Trigger a re-render to show newly available tasks
        setRefreshTrigger(prev => prev + 1);
      });
    }

    if (!schedulerRef.current && taskManager) {
      schedulerRef.current = new RecurringTaskScheduler(
        taskManager,
        (count) => {
          if (notificationSystemRef.current) {
            notificationSystemRef.current.notifyTasksAvailable(count);
          }
        }
      );
      schedulerRef.current.start();
    }

    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop();
      }
    };
  }, [taskManager]);

  // Schedule recurring tasks when they're completed
  useEffect(() => {
    if (!schedulerRef.current || !gardenCalendar) return;

    gardenCalendar.forEach(monthData => {
      monthData.activities.forEach(activity => {
        if (activity.taskType === 'recurring') {
          const completedData = taskManager.taskStates.completedActivities[activity.id];
          if (completedData && completedData.nextDue) {
            schedulerRef.current.scheduleRecurringTask(activity.id, completedData.nextDue);
          }
        }
      });
    });
  }, [gardenCalendar, taskManager.taskStates, refreshTrigger]);

  if (!gardenCalendar || gardenCalendar.length === 0) {
    return null;
  }

  const handleActivityComplete = (activity) => {
    taskManager.markActivityComplete(activity.id, activity);
  };

  const handleActivityDismiss = (activity) => {
    taskManager.dismissActivity(activity.id);
  };

  const handleActivityUndoComplete = (activity) => {
    taskManager.markActivityIncomplete(activity.id);
  };

  // Count urgent pending tasks for notification
  const urgentPendingTasks = gardenCalendar.reduce((count, month) => {
    return count + month.activities.filter(activity => 
      activity.urgency === 'urgent' && 
      taskManager.getActivityState(activity.id, activity) === 'pending'
    ).length;
  }, 0);

  return (
    <section className="card garden-calendar">
      <div className="card-header">
        <h2 className="card-title">Garden Calendar</h2>
        <p className="card-subtitle calendar-subtitle">Month-by-month Durham garden planning</p>
        
        {/* Activity Icon Legend */}
        <div className="activity-legend">
          <span className="legend-item">🌱 Seeds/Starts</span>
          <span className="legend-item">🌿 Transplant</span>
          <span className="legend-item">🥬 Harvest</span>
          <span className="legend-item">💚 Care</span>
          <span className="legend-item">🔧 Maintenance</span>
          <span className="legend-item">🛒 Shopping</span>
          <span className="legend-item">🔄 Succession</span>
          <span className="legend-item">🏗️ Infrastructure</span>
          <span className="legend-item">💧 Hydroponic</span>
          <span className="legend-item">🏠 Protected</span>
        </div>
        
        {urgentPendingTasks > 0 && (
          <div className="urgent-tasks-banner">
            🚨 {urgentPendingTasks} urgent task{urgentPendingTasks > 1 ? 's' : ''} need{urgentPendingTasks === 1 ? 's' : ''} attention
          </div>
        )}
      </div>
      
      <div className="calendar-grid">
        {gardenCalendar.map((month, index) => {
          const currentMonth = new Date().getMonth() + 1;
          const isCurrentMonth = month.month === getMonthName(currentMonth);
          
          return (
            <div key={index} className={`calendar-month ${isCurrentMonth ? 'current' : ''}`}>
              <div className="month-header">
                <h5>{month.month}</h5>
                {isCurrentMonth && <span className="month-emphasis">current</span>}
              </div>
              <div className="month-activities">
                {month.activities.map((activity, i) => {
                  const activityState = taskManager.getActivityState(activity.id, activity);
                  const isDismissed = activityState === 'dismissed';
                  
                  if (isDismissed) return null; // Don't render dismissed activities
                  
                  return (
                    <ActivityCard
                      key={activity.id || i}
                      activity={activity}
                      state={activityState}
                      onComplete={() => handleActivityComplete(activity)}
                      onDismiss={() => handleActivityDismiss(activity)}
                      onUndoComplete={() => handleActivityUndoComplete(activity)}
                      taskManager={taskManager}
                    />
                  );
                })}
                {month.activities.filter(a => taskManager.getActivityState(a.id, a) !== 'dismissed').length === 0 && (
                  <div className="activity activity-rest">
                    <em>Planning and preparation month</em>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

// Helper function to get month name
function getMonthName(monthNumber) {
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  return monthNames[monthNumber];
}

export default GardenCalendar;