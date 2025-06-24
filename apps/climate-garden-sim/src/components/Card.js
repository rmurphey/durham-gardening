/**
 * Base Card Component
 * Foundation for all recommendation card types with unified state management
 */

import React, { useState } from 'react';

const Card = ({
  id,
  type = 'default', // 'purchase', 'task', 'planning', 'info'
  state = 'pending', // 'pending', 'committed', 'completed', 'dismissed'
  priority = 'medium', // 'urgent', 'high', 'medium', 'low'
  secondaryStates = [], // ['urgent', 'blocked', 'in-progress']
  
  // Content
  title,
  description,
  expandedContent,
  
  // Visual
  icon,
  
  // Actions
  primaryAction,
  secondaryActions = [],
  onStateChange,
  
  // Additional props
  timeline,
  cost,
  category,
  consequences,
  dependencies,
  
  children,
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🔥';
      case 'high': return '⚡';
      case 'medium': return '⏰';
      case 'low': return '💡';
      default: return '📋';
    }
  };
  
  const getStateIcon = (state) => {
    switch (state) {
      case 'committed': return '✓';
      case 'completed': return '✅';
      case 'dismissed': return '✗';
      case 'pending':
      default: return null;
    }
  };
  
  const hasSecondaryState = (stateToCheck) => {
    return secondaryStates.includes(stateToCheck);
  };
  
  const handleStateChange = (newState, data = {}) => {
    if (onStateChange) {
      onStateChange(id, newState, data);
    }
  };
  
  const cardClasses = [
    'card',
    `card--${type}`,
    `card--${state}`,
    `card--priority-${priority}`,
    ...secondaryStates.map(s => `card--${s}`),
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cardClasses} {...props}>
      {/* Card Header */}
      <div className="card__header">
        <div className="card__header-main">
          <div className="card__icon">
            {icon || getPriorityIcon(priority)}
          </div>
          
          <div className="card__title-area">
            <h3 className="card__title">{title}</h3>
            {category && <span className="card__category">{category}</span>}
          </div>
          
          <div className="card__indicators">
            {/* Priority indicator */}
            <span className={`card__priority card__priority--${priority}`}>
              {priority}
            </span>
            
            {/* State indicator */}
            {getStateIcon(state) && (
              <span className={`card__state-icon card__state-icon--${state}`}>
                {getStateIcon(state)}
              </span>
            )}
            
            {/* Secondary state indicators */}
            {hasSecondaryState('urgent') && (
              <span className="card__urgent-indicator">URGENT</span>
            )}
            {hasSecondaryState('blocked') && (
              <span className="card__blocked-indicator">BLOCKED</span>
            )}
          </div>
        </div>
        
        {/* Timeline and cost info */}
        {(timeline || cost) && (
          <div className="card__meta">
            {timeline && <span className="card__timeline">{timeline}</span>}
            {cost && <span className="card__cost">${cost}</span>}
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div className="card__content">
        <div className="card__description">
          {description}
        </div>
        
        {/* Dependencies warning */}
        {dependencies && dependencies.length > 0 && (
          <div className="card__dependencies">
            <span className="card__dependencies-icon">🔗</span>
            <span>Requires: {dependencies.join(', ')}</span>
          </div>
        )}
        
        {/* Consequences warning */}
        {consequences && (
          <div className="card__consequences">
            <span className="card__consequences-icon">⚠️</span>
            <span>{consequences}</span>
          </div>
        )}
        
        {/* Expandable content */}
        {expandedContent && (
          <div className="card__expandable">
            {isExpanded && (
              <div className="card__expanded-content">
                {expandedContent}
              </div>
            )}
            <button 
              className="card__expand-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
        
        {/* Custom children content */}
        {children}
      </div>
      
      {/* Card Actions */}
      {(primaryAction || secondaryActions.length > 0) && state === 'pending' && (
        <div className="card__actions">
          {primaryAction && (
            <button 
              className={`card__action card__action--primary card__action--${type}`}
              onClick={() => handleStateChange('committed', { action: primaryAction.id })}
              disabled={hasSecondaryState('blocked')}
            >
              {primaryAction.label}
            </button>
          )}
          
          {secondaryActions.map((action, index) => (
            <button
              key={action.id || index}
              className={`card__action card__action--secondary card__action--${action.type || 'default'}`}
              onClick={() => handleStateChange(action.targetState || 'committed', { action: action.id })}
              disabled={hasSecondaryState('blocked')}
            >
              {action.label}
            </button>
          ))}
          
          {/* Dismiss action - always available */}
          <button
            className="card__action card__action--dismiss"
            onClick={() => handleStateChange('dismissed')}
          >
            Not Now
          </button>
        </div>
      )}
      
      {/* State-specific action areas */}
      {state === 'committed' && (
        <div className="card__state-actions">
          <button 
            className="card__action card__action--complete"
            onClick={() => handleStateChange('completed')}
          >
            Mark Complete
          </button>
          <button 
            className="card__action card__action--revert"
            onClick={() => handleStateChange('pending')}
          >
            Undo
          </button>
        </div>
      )}
      
      {state === 'dismissed' && (
        <div className="card__state-actions">
          <button 
            className="card__action card__action--restore"
            onClick={() => handleStateChange('pending')}
          >
            Reconsider
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;