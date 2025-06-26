/**
 * Shopping Suggestion Modal Component
 * Shows relevant shopping suggestions after completing calendar activities
 */

import React, { useState, useEffect } from 'react';

const ShoppingSuggestionModal = ({ 
  isOpen, 
  onClose, 
  suggestions = [], 
  activity, 
  onAddToShoppingList,
  onAddAllToShoppingList 
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  const handleToggleSuggestion = (suggestionId) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
    } else {
      newSelected.add(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedSuggestions.size === 0) return;
    
    setIsProcessing(true);
    
    const selectedItems = suggestions.filter(suggestion => 
      selectedSuggestions.has(suggestion.id || suggestion.item)
    );
    
    try {
      for (const suggestion of selectedItems) {
        await onAddToShoppingList(suggestion);
      }
      
      // Reset and close
      setSelectedSuggestions(new Set());
      onClose();
    } catch (error) {
      console.error('Error adding suggestions to shopping list:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAll = async () => {
    setIsProcessing(true);
    
    try {
      await onAddAllToShoppingList(suggestions);
      onClose();
    } catch (error) {
      console.error('Error adding all suggestions to shopping list:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price varies';
    return `$${price}`;
  };

  const getUrgencyBadge = (suggestion) => {
    const urgency = suggestion.urgency || suggestion.priority;
    if (urgency === 'urgent' || urgency === 'critical') {
      return <span className="urgency-badge urgent">URGENT</span>;
    }
    if (urgency === 'high') {
      return <span className="urgency-badge high">HIGH</span>;
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shopping-suggestion-modal" role="dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🛒 Shopping Suggestions</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="activity-context">
            <p>
              <strong>Completed:</strong> {activity.crop} - {activity.action}
            </p>
            <p className="suggestion-intro">
              Here are some items that might be helpful for this type of activity:
            </p>
          </div>
          
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => {
              const suggestionId = suggestion.id || suggestion.item;
              const isSelected = selectedSuggestions.has(suggestionId);
              
              return (
                <div 
                  key={suggestionId || index}
                  className={`suggestion-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleSuggestion(suggestionId)}
                >
                  <div className="suggestion-header">
                    <div className="suggestion-title">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSuggestion(suggestionId)}
                        onClick={e => e.stopPropagation()}
                      />
                      <span className="suggestion-name">{suggestion.item}</span>
                      {getUrgencyBadge(suggestion)}
                    </div>
                    <div className="suggestion-price">
                      {formatPrice(suggestion.price)}
                    </div>
                  </div>
                  
                  <div className="suggestion-details">
                    <div className="suggestion-category">
                      {suggestion.category || 'General'}
                    </div>
                    {suggestion.suggestionReason && (
                      <div className="suggestion-reason">
                        {suggestion.suggestionReason}
                      </div>
                    )}
                    {suggestion.why && (
                      <div className="suggestion-why">
                        <em>{suggestion.why}</em>
                      </div>
                    )}
                    {suggestion.timing && (
                      <div className="suggestion-timing">
                        <strong>Timing:</strong> {suggestion.timing}
                      </div>
                    )}
                    {suggestion.consequences && (
                      <div className="suggestion-consequences">
                        <strong>Note:</strong> {suggestion.consequences}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="modal-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isProcessing}
            >
              Skip
            </button>
            
            <button 
              className="btn btn-outline"
              onClick={handleAddAll}
              disabled={isProcessing || suggestions.length === 0}
            >
              {isProcessing ? 'Adding...' : `Add All (${suggestions.length})`}
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={handleAddSelected}
              disabled={isProcessing || selectedSuggestions.size === 0}
            >
              {isProcessing 
                ? 'Adding...' 
                : selectedSuggestions.size > 0 
                  ? `Add Selected (${selectedSuggestions.size})` 
                  : 'Add Selected'
              }
            </button>
          </div>
          
          <div className="selection-summary">
            {selectedSuggestions.size > 0 && (
              <span>
                {selectedSuggestions.size} of {suggestions.length} selected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingSuggestionModal;