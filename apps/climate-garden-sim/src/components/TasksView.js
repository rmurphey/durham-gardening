/**
 * Tasks View Component
 * Dedicated view for all garden tasks and timing
 */

import React from 'react';
import TaskCardList from './TaskCardList';
import { generateGardenTasks } from '../services/temporalShoppingService';

const TasksView = ({ taskActions }) => {
  const allTasks = generateGardenTasks() || [];
  
  const urgentTasks = allTasks.filter(task => 
    task.urgency === 'urgent' || task.daysUntilPlanting <= 7
  );
  
  const upcomingTasks = allTasks.filter(task => 
    task.urgency !== 'urgent' && task.daysUntilPlanting > 7
  );

  return (
    <div className="tasks-view">
      <div className="view-header">
        <h2>📋 Garden Tasks</h2>
        <p className="view-subtitle">Time-sensitive garden actions and indoor starting guidance</p>
      </div>

      {urgentTasks.length > 0 && (
        <div className="urgent-tasks-section">
          <h3>🔥 Urgent (Next 7 Days)</h3>
          <TaskCardList 
            tasks={urgentTasks}
            onMarkComplete={taskActions.markTaskComplete}
            getTaskStatus={taskActions.getTaskStatus}
          />
        </div>
      )}

      {upcomingTasks.length > 0 && (
        <div className="upcoming-tasks-section">
          <h3>📅 Upcoming Tasks</h3>
          <TaskCardList 
            tasks={upcomingTasks}
            onMarkComplete={taskActions.markTaskComplete}
            getTaskStatus={taskActions.getTaskStatus}
          />
        </div>
      )}

      {allTasks.length === 0 && (
        <div className="no-tasks">
          <p>✅ No time-sensitive garden tasks right now.</p>
          <p>Check back regularly as seasons change!</p>
        </div>
      )}

      <div className="tasks-help">
        <h4>💡 About Garden Tasks</h4>
        <ul>
          <li><strong>🏠 Indoor Starting</strong> - Critical timing windows for seed starting</li>
          <li><strong>🌱 Plant Care</strong> - Seasonal maintenance and protection</li>
          <li><strong>⚡ Urgent</strong> - Must be done within 7 days</li>
          <li><strong>📅 Upcoming</strong> - Plan ahead for optimal timing</li>
        </ul>
      </div>
    </div>
  );
};

export default TasksView;