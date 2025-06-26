/**
 * Planning Card Component
 * Specialized card for planning decisions (bed rotation, timing, strategy)
 */

import React from 'react';
import Card from './Card';

const PlanningCard = ({
  id,
  title,
  decision,
  options = [],
  recommendation,
  impact,
  timing,
  urgency = 'medium',
  state = 'pending',
  category = 'Garden Planning',
  onStateChange,
  onPlanDecision,
  ...props
}) => {
  const getPlanningActions = () => {
    if (options.length > 0) {
      // Multiple choice planning decision
      const primaryAction = {
        id: 'choose_option',
        label: 'Choose Option'
      };
      
      const secondaryActions = options.map((option, index) => ({
        id: `option_${index}`,
        label: option.label || option,
        type: 'option',
        targetState: 'committed',
        data: { option: option.value || option }
      }));
      
      return { primaryAction: null, secondaryActions };
    } else {
      // Simple accept/defer planning decision
      const primaryAction = {
        id: 'accept_plan',
        label: 'Accept Plan'
      };
      
      const secondaryActions = [
        {
          id: 'defer_plan',
          label: 'Decide Later',
          type: 'defer',
          targetState: 'dismissed'
        }
      ];
      
      return { primaryAction, secondaryActions };
    }
  };
  
  const handleStateChange = (cardId, newState, data) => {
    // Handle planning-specific state changes
    if (newState === 'committed') {
      if (data.action === 'accept_plan') {
        onPlanDecision?.(id, { decision: 'accepted', plan: recommendation });
      } else if (data.action?.startsWith('option_')) {
        const option = data.option || data.action;
        onPlanDecision?.(id, { decision: 'option_selected', option });
      }
    }
    
    // Call parent state change handler
    onStateChange?.(cardId, newState, data);
  };
  
  const getTimeline = () => {
    return timing || 'Plan when convenient';
  };
  
  const getExpandedContent = () => {
    return (
      <div>
        {recommendation && (
          <div className="planning-details">
            <strong>Our recommendation:</strong> {recommendation}
          </div>
        )}
        {impact && (
          <div className="planning-details">
            <strong>Impact:</strong> {impact}
          </div>
        )}
        {options.length > 0 && (
          <div className="planning-details">
            <strong>Available options:</strong>
            <ul className="planning-options">
              {options.map((option, index) => (
                <li key={index}>
                  <strong>{option.label || option}:</strong> {option.description || ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {timing && (
          <div className="planning-details">
            <strong>Decision timing:</strong> {timing}
          </div>
        )}
      </div>
    );
  };
  
  const getPlanningIcon = () => {
    if (category.includes('Rotation')) return '🔄';
    if (category.includes('Layout')) return '📐';
    if (category.includes('Season')) return '📅';
    if (category.includes('Strategy')) return '🎯';
    return '📋';
  };
  
  const { primaryAction, secondaryActions } = getPlanningActions();
  
  return (
    <Card
      id={id}
      type="planning"
      state={state}
      priority={urgency}
      title={title}
      description={decision}
      expandedContent={getExpandedContent()}
      icon={getPlanningIcon()}
      category={category}
      timeline={getTimeline()}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      onStateChange={handleStateChange}
      {...props}
    >
      {/* Custom content for planning cards */}
      {options.length > 0 && state === 'pending' && (
        <div className="planning-options-grid">
          {options.map((option, index) => (
            <button
              key={index}
              className="planning-option-button"
              onClick={() => handleStateChange(id, 'committed', { 
                action: `option_${index}`, 
                option: option.value || option 
              })}
            >
              <div className="option-label">{option.label || option}</div>
              {option.description && (
                <div className="option-description">{option.description}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PlanningCard;