/**
 * Task Card List Component
 * Renders a list of garden tasks using TaskCard components
 */

import React from 'react';
import TaskCard from './TaskCard';

const TaskCardList = ({
  tasks = [],
  onMarkComplete,
  getTaskStatus,
  title = "Garden Tasks",
  showTitle = false
}) => {
  const handleStateChange = (cardId, newState, data) => {
    switch (newState) {
      case 'completed':
        if (data.action === 'mark_done') {
          onMarkComplete?.(cardId);
        }
        break;
      default:
        break;
    }
  };

  const getCardState = (task) => {
    const status = getTaskStatus?.(task.id);
    return status === 'completed' ? 'completed' : 'pending';
  };

  const convertToCardProps = (task) => {
    return {
      id: task.id,
      title: task.title || task.task,
      action: task.action || task.description || task.why,
      timing: task.timing || task.plantingWindow,
      location: task.location,
      tools: task.tools,
      daysUntilDeadline: task.daysUntilPlanting,
      consequences: task.consequences,
      urgency: task.urgency || 'medium',
      category: task.category || 'Garden Care',
      state: getCardState(task),
      onStateChange: handleStateChange,
      onMarkComplete
    };
  };

  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="task-card-list">
      {showTitle && (
        <h3 className="task-card-list__title">{title}</h3>
      )}
      <div className="task-card-list__cards">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            {...convertToCardProps(task)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskCardList;