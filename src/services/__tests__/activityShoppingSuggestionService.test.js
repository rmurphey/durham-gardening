/**
 * Tests for Activity Shopping Suggestion Service
 */

import { 
  shouldTriggerShoppingSuggestions, 
  generateShoppingSuggestionsForActivity,
  formatSuggestionForShoppingList 
} from '../activityShoppingSuggestionService.js';

// Mock temporal shopping service
jest.mock('../temporalShoppingService.js', () => ({
  generateTemporalShoppingRecommendations: jest.fn(() => [
    {
      id: 'seed-starting-kit',
      item: 'Seed starting kit with heat mat',
      price: 67,
      category: 'Equipment',
      urgency: 'high',
      why: 'Need to start peppers/tomatoes indoors soon',
      timing: 'Buy immediately'
    },
    {
      id: 'irrigation-system',
      item: 'Drip irrigation system',
      price: 89,
      category: 'Infrastructure',
      urgency: 'urgent',
      why: 'Must install before summer heat arrives',
      timing: 'Install NOW'
    },
    {
      id: 'tomato-seeds',
      item: 'Cherokee Purple tomato seeds',
      price: 4,
      category: 'Seeds',
      urgency: 'medium',
      why: 'Order now for best variety selection',
      timing: 'Order in spring'
    }
  ])
}));

describe('shouldTriggerShoppingSuggestions', () => {
  test('should trigger for shopping activity types', () => {
    const shoppingActivity = {
      type: 'shopping',
      action: 'Order seed starting supplies',
      crop: 'Equipment'
    };
    
    expect(shouldTriggerShoppingSuggestions(shoppingActivity)).toBe(true);
  });

  test('should trigger for infrastructure activity types', () => {
    const infrastructureActivity = {
      type: 'infrastructure',
      action: 'Install drip irrigation system',
      crop: 'Garden Setup'
    };
    
    expect(shouldTriggerShoppingSuggestions(infrastructureActivity)).toBe(true);
  });

  test('should trigger for indoor-starting activity types', () => {
    const indoorStartActivity = {
      type: 'indoor-starting',
      action: 'Start tomato seeds indoors',
      crop: 'Tomatoes'
    };
    
    expect(shouldTriggerShoppingSuggestions(indoorStartActivity)).toBe(true);
  });

  test('should trigger for activities with shopping keywords', () => {
    const keywordActivity = {
      type: 'care',
      action: 'Buy fertilizer for tomatoes',
      crop: 'Tomatoes'
    };
    
    expect(shouldTriggerShoppingSuggestions(keywordActivity)).toBe(true);
  });

  test('should trigger for urgent activities with supply keywords', () => {
    const urgentActivity = {
      type: 'maintenance',
      action: 'Install shade protection immediately',
      urgency: 'urgent',
      crop: 'General'
    };
    
    expect(shouldTriggerShoppingSuggestions(urgentActivity)).toBe(true);
  });

  test('should NOT trigger for regular harvest activities', () => {
    const harvestActivity = {
      type: 'harvest',
      action: 'Harvest lettuce leaves',
      crop: 'Lettuce'
    };
    
    expect(shouldTriggerShoppingSuggestions(harvestActivity)).toBe(false);
  });

  test('should NOT trigger for regular care activities', () => {
    const careActivity = {
      type: 'care',
      action: 'Water tomato plants',
      crop: 'Tomatoes'
    };
    
    expect(shouldTriggerShoppingSuggestions(careActivity)).toBe(false);
  });

  test('should NOT trigger for direct-sow activities', () => {
    const sowActivity = {
      type: 'direct-sow',
      action: 'Sow radish seeds in garden',
      crop: 'Radishes'
    };
    
    expect(shouldTriggerShoppingSuggestions(sowActivity)).toBe(false);
  });
});

describe('generateShoppingSuggestionsForActivity', () => {
  test('should return empty array for non-triggering activities', () => {
    const harvestActivity = {
      type: 'harvest',
      action: 'Harvest lettuce',
      crop: 'Lettuce'
    };
    
    const suggestions = generateShoppingSuggestionsForActivity(harvestActivity);
    expect(suggestions).toEqual([]);
  });

  test('should generate suggestions for infrastructure activities', () => {
    const infrastructureActivity = {
      id: 'install-irrigation',
      type: 'infrastructure',
      action: 'Install drip irrigation system',
      crop: 'Garden Setup'
    };
    
    const suggestions = generateShoppingSuggestionsForActivity(infrastructureActivity);
    
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0]).toHaveProperty('sourceActivity');
    expect(suggestions[0].sourceActivity.id).toBe('install-irrigation');
    expect(suggestions[0]).toHaveProperty('suggestionReason');
  });

  test('should generate suggestions for indoor-starting activities', () => {
    const indoorStartActivity = {
      id: 'start-tomatoes',
      type: 'indoor-starting',
      action: 'Start tomato seeds indoors',
      crop: 'Tomatoes'
    };
    
    const suggestions = generateShoppingSuggestionsForActivity(indoorStartActivity);
    
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Should include equipment for indoor starting
    const equipmentSuggestion = suggestions.find(s => s.category === 'Equipment');
    expect(equipmentSuggestion).toBeDefined();
    expect(equipmentSuggestion.suggestionReason).toContain('indoor starting');
  });

  test('should filter out existing shopping items', () => {
    const shoppingActivity = {
      id: 'buy-equipment',
      type: 'shopping',
      action: 'Order seed starting kit',
      crop: 'Equipment'
    };
    
    const existingItems = [
      { item: 'Seed starting kit with heat mat' },
      { name: 'Drip irrigation system' }
    ];
    
    const suggestions = generateShoppingSuggestionsForActivity(shoppingActivity, existingItems);
    
    // Should not include items that are already in shopping list
    const seedKitSuggestion = suggestions.find(s => s.item.includes('Seed starting kit'));
    expect(seedKitSuggestion).toBeUndefined();
  });

  test('should limit suggestions to 3 items', () => {
    const shoppingActivity = {
      id: 'general-shopping',
      type: 'shopping',
      action: 'Order garden supplies',
      crop: 'Equipment'
    };
    
    const suggestions = generateShoppingSuggestionsForActivity(shoppingActivity);
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });
});

describe('formatSuggestionForShoppingList', () => {
  test('should format suggestion correctly for shopping list', () => {
    const suggestion = {
      item: 'Seed starting kit with heat mat',
      price: 67,
      category: 'Equipment',
      urgency: 'high',
      suggestionReason: 'Essential for: Tomatoes indoor starting',
      sourceActivity: {
        id: 'start-tomatoes',
        type: 'indoor-starting',
        crop: 'Tomatoes',
        action: 'Start tomato seeds indoors'
      }
    };
    
    const formatted = formatSuggestionForShoppingList(suggestion);
    
    expect(formatted).toHaveProperty('id');
    expect(formatted.name).toBe('Seed starting kit with heat mat');
    expect(formatted.price).toBe(67);
    expect(formatted.category).toBe('Equipment');
    expect(formatted.priority).toBe('high');
    expect(formatted.why).toBe('Essential for: Tomatoes indoor starting');
    expect(formatted.source).toBe('activity-completion');
    expect(formatted.sourceActivity).toEqual(suggestion.sourceActivity);
  });

  test('should generate unique IDs for different suggestions', () => {
    const suggestion1 = { item: 'Item 1', price: 10, category: 'Test' };
    const suggestion2 = { item: 'Item 2', price: 20, category: 'Test' };
    
    const formatted1 = formatSuggestionForShoppingList(suggestion1);
    const formatted2 = formatSuggestionForShoppingList(suggestion2);
    
    expect(formatted1.id).not.toBe(formatted2.id);
  });

  test('should handle missing optional fields gracefully', () => {
    const minimalSuggestion = {
      item: 'Basic Item'
    };
    
    const formatted = formatSuggestionForShoppingList(minimalSuggestion);
    
    expect(formatted.name).toBe('Basic Item');
    expect(formatted.price).toBe(0);
    expect(formatted.category).toBe('General');
    expect(formatted.priority).toBe('medium');
    expect(formatted.source).toBe('activity-completion');
  });
});