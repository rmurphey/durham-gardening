/**
 * Garden Tasks Panel Component
 * Displays time-sensitive garden tasks and indoor starting guidance
 */

import React, { useState } from 'react';
import { getTemporalContext } from '../services/temporalShoppingService';

const GardenTasksPanel = ({ tasks = [], onMarkComplete, getTaskStatus }) => {
  const [showTiming, setShowTiming] = useState(true);

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'urgent': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '⏰';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const getTaskButton = (task) => {
    const status = getTaskStatus(task.id);
    
    if (status === 'completed') {
      return <span className="task-status completed">✓ Done</span>;
    }
    
    return (
      <button 
        className="complete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onMarkComplete(task.id);
        }}
      >
        Mark Done
      </button>
    );
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="garden-tasks-panel">
        <h3>📋 Garden Tasks</h3>
        <p>No time-sensitive tasks right now.</p>
      </div>
    );
  }

  return (
    <div className="garden-tasks-panel">
      <div className="panel-header">
        <h3>📋 Garden Tasks</h3>
        <div className="header-controls">
          <span className="item-count">{tasks.length} tasks</span>
          <button 
            className={`timing-toggle ${showTiming ? 'active' : ''}`}
            onClick={() => setShowTiming(!showTiming)}
            title="Toggle timing details"
          >
            📅 Timing
          </button>
        </div>
      </div>

      <div className="task-list">
        {tasks.map((task) => {
          const status = getTaskStatus(task.id);
          
          return (
            <div 
              key={task.id} 
              className={`task-item ${status} ${task.daysUntilPlanting <= 14 ? 'urgent-timing' : ''}`}
              data-category={task.category}
            >
              <div className="task-main">
                <div className="task-icon">
                  {getUrgencyIcon(task.urgency)}
                </div>
                <div className="task-content">
                  <div className="task-name">{task.item}</div>
                  <div className="task-reason">{task.why}</div>
                  
                  {showTiming && task.plantingDate && (
                    <div className="timing-info">
                      <div className="planting-timeline">
                        <span className="timeline-label">Timing:</span>
                        <span className="planting-date">{task.plantingWindow}</span>
                        <span className="time-until">
                          ({getTemporalContext(task)} away)
                        </span>
                      </div>
                      {task.consequences && (
                        <div className="consequences">
                          <span className="warning-icon">⚠️</span>
                          {task.consequences}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="task-actions">
                {getTaskButton(task)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GardenTasksPanel;