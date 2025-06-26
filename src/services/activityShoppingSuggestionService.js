/**
 * Activity Shopping Suggestion Service
 * Maps completed calendar activities to relevant shopping suggestions
 */

import { generateTemporalShoppingRecommendations } from './temporalShoppingService.js';

/**
 * Determine if an activity should trigger shopping suggestions
 * @param {Object} activity - Calendar activity object
 * @returns {boolean} Whether activity should show shopping suggestions
 */
export const shouldTriggerShoppingSuggestions = (activity) => {
  // Direct shopping activity types
  const shoppingActivityTypes = [
    'shopping',
    'infrastructure', 
    'indoor-starting',
    'seed-starting'
  ];
  
  if (shoppingActivityTypes.includes(activity.type)) {
    return true;
  }
  
  // Check for shopping keywords in activity text
  const shoppingKeywords = [
    'order', 'buy', 'purchase', 'install', 'setup', 'get', 'acquire',
    'supplies', 'equipment', 'kit', 'system', 'materials'
  ];
  
  const activityText = `${activity.action} ${activity.timing || ''}`.toLowerCase();
  const hasShoppingKeywords = shoppingKeywords.some(keyword => 
    activityText.includes(keyword)
  );
  
  if (hasShoppingKeywords) {
    return true;
  }
  
  // Urgent activities that might need supplies
  if (activity.urgency === 'urgent' || activity.priority === 'critical') {
    const urgentSupplyKeywords = ['protection', 'irrigation', 'shade', 'heat', 'tools'];
    return urgentSupplyKeywords.some(keyword => activityText.includes(keyword));
  }
  
  return false;
};

/**
 * Generate shopping suggestions for a completed activity
 * @param {Object} activity - Completed calendar activity
 * @param {Array} existingShoppingItems - Current shopping list to avoid duplicates
 * @returns {Array} Array of shopping suggestions with metadata
 */
export const generateShoppingSuggestionsForActivity = (activity, existingShoppingItems = []) => {
  if (!shouldTriggerShoppingSuggestions(activity)) {
    return [];
  }
  
  console.log(`🛒 Generating shopping suggestions for activity: ${activity.type} - ${activity.action}`);
  
  // Get current temporal shopping recommendations
  const temporalRecommendations = generateTemporalShoppingRecommendations();
  
  // Create lookup for existing items to avoid duplicates
  const existingItemsSet = new Set(
    existingShoppingItems.map(item => item.item?.toLowerCase() || item.name?.toLowerCase())
  );
  
  let suggestions = [];
  
  // Activity-specific suggestion mapping
  switch (activity.type) {
    case 'shopping':
      // Direct shopping activity - look for related items
      suggestions = findRelatedShoppingItems(activity, temporalRecommendations);
      break;
      
    case 'infrastructure':
      suggestions = generateInfrastructureSuggestions(activity, temporalRecommendations);
      break;
      
    case 'indoor-starting':
    case 'seed-starting':
      suggestions = generateIndoorStartingSuggestions(activity, temporalRecommendations);
      break;
      
    default:
      // Parse activity text for context
      suggestions = generateContextualSuggestions(activity, temporalRecommendations);
      break;
  }
  
  // Filter out existing items and add activity context
  const filteredSuggestions = suggestions
    .filter(suggestion => !existingItemsSet.has(suggestion.item.toLowerCase()))
    .map(suggestion => ({
      ...suggestion,
      sourceActivity: {
        id: activity.id,
        type: activity.type,
        crop: activity.crop,
        action: activity.action
      },
      suggestionReason: generateSuggestionReason(activity, suggestion)
    }))
    .slice(0, 3); // Limit to top 3 suggestions
  
  console.log(`🛒 Generated ${filteredSuggestions.length} shopping suggestions for ${activity.type} activity`);
  
  return filteredSuggestions;
};

/**
 * Find related shopping items from temporal recommendations
 */
function findRelatedShoppingItems(activity, temporalRecommendations) {
  const activityText = activity.action.toLowerCase();
  
  return temporalRecommendations.filter(item => {
    const itemText = item.item.toLowerCase();
    
    // Look for keyword overlap
    const activityKeywords = activityText.split(' ');
    const itemKeywords = itemText.split(' ');
    
    return activityKeywords.some(keyword => 
      keyword.length > 3 && itemKeywords.some(itemKeyword => 
        itemKeyword.includes(keyword) || keyword.includes(itemKeyword)
      )
    );
  });
}

/**
 * Generate infrastructure-specific suggestions
 */
function generateInfrastructureSuggestions(activity, temporalRecommendations) {
  const suggestions = [];
  const activityText = activity.action.toLowerCase();
  
  // Map infrastructure keywords to shopping categories
  const infrastructureMap = {
    'irrigation': ['irrigation', 'drip', 'watering', 'hose'],
    'shade': ['shade', 'cloth', 'protection'],
    'heat': ['heat', 'protection', 'mat', 'warming'],
    'soil': ['soil', 'compost', 'amendment', 'mulch'],
    'tools': ['tools', 'equipment', 'supplies']
  };
  
  Object.entries(infrastructureMap).forEach(([category, keywords]) => {
    if (keywords.some(keyword => activityText.includes(keyword))) {
      const relatedItems = temporalRecommendations.filter(item =>
        keywords.some(keyword => 
          item.item.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword)
        )
      );
      suggestions.push(...relatedItems);
    }
  });
  
  return suggestions;
}

/**
 * Generate indoor starting specific suggestions
 */
function generateIndoorStartingSuggestions(activity, temporalRecommendations) {
  const suggestions = [];
  
  // Indoor starting equipment
  const indoorStartingItems = temporalRecommendations.filter(item =>
    item.category === 'Equipment' ||
    item.item.toLowerCase().includes('seed starting') ||
    item.item.toLowerCase().includes('heat mat') ||
    item.item.toLowerCase().includes('grow light') ||
    item.item.toLowerCase().includes('indoor')
  );
  
  suggestions.push(...indoorStartingItems);
  
  // Seeds related to the crop
  if (activity.crop && activity.crop !== 'General') {
    const cropSeeds = temporalRecommendations.filter(item =>
      item.category === 'Seeds' &&
      (item.item.toLowerCase().includes(activity.crop.toLowerCase()) ||
       activity.crop.toLowerCase().includes(item.item.toLowerCase().split(' ')[0]))
    );
    suggestions.push(...cropSeeds);
  }
  
  return suggestions;
}

/**
 * Generate contextual suggestions based on activity text
 */
function generateContextualSuggestions(activity, temporalRecommendations) {
  const activityText = `${activity.action} ${activity.timing || ''}`.toLowerCase();
  const suggestions = [];
  
  // Generic keyword matching
  const contextKeywords = [
    'protection', 'irrigation', 'fertilizer', 'mulch', 'tools',
    'supplies', 'equipment', 'seeds', 'plants'
  ];
  
  contextKeywords.forEach(keyword => {
    if (activityText.includes(keyword)) {
      const relatedItems = temporalRecommendations.filter(item =>
        item.item.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword)
      );
      suggestions.push(...relatedItems);
    }
  });
  
  return suggestions;
}

/**
 * Generate reason text for why this suggestion is relevant
 */
function generateSuggestionReason(activity, suggestion) {
  const reasons = {
    'shopping': `Related to: ${activity.action}`,
    'infrastructure': `Needed for: ${activity.action}`,
    'indoor-starting': `Essential for: ${activity.crop} indoor starting`,
    'seed-starting': `Required for: ${activity.crop} seed starting`
  };
  
  return reasons[activity.type] || `Suggested for: ${activity.action}`;
}

/**
 * Get shopping suggestion priority based on activity urgency
 */
export const getShoppingSuggestionPriority = (activity, suggestion) => {
  if (activity.urgency === 'urgent' || activity.priority === 'critical') {
    return 'high';
  }
  
  if (suggestion.urgency === 'urgent' || suggestion.urgency === 'high') {
    return 'high';
  }
  
  return 'medium';
};

/**
 * Format suggestion for display in shopping list
 */
export const formatSuggestionForShoppingList = (suggestion) => {
  return {
    id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: suggestion.item,
    price: suggestion.price || 0,
    category: suggestion.category || 'General',
    priority: suggestion.urgency || 'medium',
    why: suggestion.suggestionReason || suggestion.why,
    timing: suggestion.timing || 'When convenient',
    source: 'activity-completion',
    sourceActivity: suggestion.sourceActivity
  };
};