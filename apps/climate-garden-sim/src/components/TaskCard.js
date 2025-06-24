/**
 * Task Card Component
 * Specialized card for garden task recommendations (plant, water, harvest, etc.)
 */

import React from 'react';
import Card from './Card';

const TaskCard = ({
  id,
  title,
  action,
  timing,
  location,
  tools,
  daysUntilDeadline,
  consequences,
  urgency = 'medium',
  state = 'pending',
  category = 'Garden Care',
  onStateChange,
  onMarkComplete,
  ...props
}) => {
  const getTaskActions = () => {
    const primaryAction = {
      id: 'mark_todo',
      label: 'Add to My Tasks'
    };
    
    const secondaryActions = [
      {
        id: 'mark_done',
        label: 'Already Done',
        type: 'completed',
        targetState: 'completed'
      }
    ];
    
    return { primaryAction, secondaryActions };
  };
  
  const handleStateChange = (cardId, newState, data) => {
    // Handle task-specific state changes
    if (newState === 'committed' && data.action === 'mark_todo') {
      // Add to user's task list
      // Integration point for task management system
    } else if (newState === 'completed' && data.action === 'mark_done') {
      onMarkComplete?.(id);
    }
    
    // Call parent state change handler
    onStateChange?.(cardId, newState, data);
  };
  
  const getTimeline = () => {
    if (daysUntilDeadline !== undefined) {
      if (daysUntilDeadline <= 0) {
        return 'Due now!';
      } else if (daysUntilDeadline <= 7) {
        return `Due in ${daysUntilDeadline} days`;
      } else {
        return `Due in ${Math.ceil(daysUntilDeadline / 7)} weeks`;
      }
    }
    return timing;
  };
  
  const getSecondaryStates = () => {
    const states = [];
    if (daysUntilDeadline !== undefined && daysUntilDeadline <= 3) {
      states.push('urgent');
    }
    return states;
  };
  
  const getDependencies = () => {
    if (tools && tools.length > 0) {
      return tools;
    }
    return null;
  };
  
  const getExpandedContent = () => {
    return (
      <div>
        {location && (
          <div className="task-details">
            <strong>Location:</strong> {location}
          </div>
        )}
        {tools && tools.length > 0 && (
          <div className="task-details">
            <strong>Tools needed:</strong> {tools.join(', ')}
          </div>
        )}
        {timing && (
          <div className="task-details">
            <strong>Best timing:</strong> {timing}
          </div>
        )}
        <div className="task-details">
          <strong>Task details:</strong> {action || 'Complete this garden task for optimal growing conditions.'}
        </div>
      </div>
    );
  };
  
  const getTaskIcon = () => {
    if (category.includes('Indoor')) return '🏠';
    if (category.includes('Plant')) return '🌱';
    if (category.includes('Water')) return '💧';
    if (category.includes('Harvest')) return '🌾';
    if (category.includes('Care')) return '🌿';
    return '📋';
  };
  
  const { primaryAction, secondaryActions } = getTaskActions();
  
  return (
    <Card
      id={id}
      type="task"
      state={state}
      priority={urgency}
      secondaryStates={getSecondaryStates()}
      title={title}
      description={action}
      expandedContent={getExpandedContent()}
      icon={getTaskIcon()}
      category={category}
      timeline={getTimeline()}
      consequences={consequences}
      dependencies={getDependencies()}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      onStateChange={handleStateChange}
      {...props}
    />
  );
};

export default TaskCard;