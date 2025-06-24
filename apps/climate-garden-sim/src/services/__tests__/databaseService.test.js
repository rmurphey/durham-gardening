/**
 * Tests for databaseService template placeholder replacement
 * Prevents regression of {bed}, {variety}, {supplier} etc. appearing in UI
 */

import { databaseService } from '../databaseService.js';

describe('DatabaseService Template Replacement', () => {
  let service;

  beforeEach(() => {
    service = new (databaseService.constructor)();
  });

  // CRITICAL TEST: NO PLACEHOLDERS EVER IN OUTPUT
  describe('ZERO TOLERANCE for placeholders in UI', () => {
    test('should NEVER return text with ANY placeholder pattern', () => {
      // Test ALL templates in the system from fallback data
      const allTemplates = [
        ...service.activityTemplates,
        ...service.rotationTemplates,
        ...service.successionTemplates
      ];
      
      allTemplates.forEach((template, index) => {
        const result = service.generateActionText(template);
        
        // ABSOLUTE REQUIREMENT: No curly brace placeholders
        const placeholders = result.match(/\{[^}]+\}/g);
        expect(placeholders).toBeNull(`Template ${index} (${template.id}) contains unreplaced placeholders: ${placeholders?.join(', ')} in result: "${result}"`);
        
        // Additional safety checks
        expect(result).not.toContain('{bed}');
        expect(result).not.toContain('{variety}');
        expect(result).not.toContain('{varieties}');
        expect(result).not.toContain('{supplier}');
        expect(result).not.toContain('{quantity}');
        expect(result).not.toContain('{timing}');
        expect(result).not.toContain('{location}');
        expect(result).not.toContain('{season}');
        expect(result).not.toContain('{cost}');
        
        // Result must be a meaningful string
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.trim().length).toBeGreaterThan(0);
      });
    });

    test('should handle completely malformed templates safely', () => {
      const malformedTemplates = [
        { action_template: '{unknown_placeholder_123}' },
        { action_template: '{bed} {variety} {supplier} {mystery_var}' },
        { action_template: 'Some text {undefined_var} more text {another_var}' },
        { action_template: '{{{nested}}}' },
        { action_template: '{bed' }, // Malformed - missing closing brace
        { action_template: 'bed}' },  // Malformed - missing opening brace
        { action_template: '' },      // Empty
        { action_template: null },    // Null
        { action_template: undefined }, // Undefined
        {},                           // Missing action_template entirely
      ];

      malformedTemplates.forEach((template, index) => {
        const result = service.generateActionText(template);
        
        // Must NEVER contain curly braces
        const placeholders = result.match(/\{[^}]+\}/g);
        expect(placeholders).toBeNull(`Malformed template ${index} still contains placeholders: ${placeholders?.join(', ')} in result: "${result}"`);
        
        // Must return safe fallback
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('generateActionText', () => {
    test('should replace all placeholders with actual data', () => {
      const template = {
        action_template: 'Order {varieties} from {supplier} for {bed} - {quantity} plants',
        variety_suggestions: ['Cherokee Purple', 'Early Girl'],
        supplier_preferences: ['True Leaf Market'],
        bed_requirements: {
          recommended_bed: '4×8 Bed',
          quantity: 12
        }
      };

      const result = service.generateActionText(template);
      
      expect(result).toBe('Order Cherokee Purple, Early Girl from True Leaf Market for 4×8 Bed - 12 plants');
      expect(result).not.toContain('{');
      expect(result).not.toContain('}');
    });

    test('should replace all placeholders with fallbacks when data is missing', () => {
      const template = {
        action_template: 'Order {varieties} from {supplier} for {bed} - {quantity} plants of {variety}',
        // All data missing - should use fallbacks
      };

      const result = service.generateActionText(template);
      
      expect(result).toBe('Order recommended varieties from preferred supplier for any available bed - appropriate amount plants of recommended variety');
      expect(result).not.toContain('{');
      expect(result).not.toContain('}');
    });

    test('should handle single variety vs multiple varieties', () => {
      const singleVarietyTemplate = {
        action_template: 'Plant {variety} in {bed}',
        variety_suggestions: ['Cherokee Purple'],
        bed_requirements: {
          recommended_bed: '4×8 Bed'
        }
      };

      const multipleVarietyTemplate = {
        action_template: 'Order {varieties} for {bed}',
        variety_suggestions: ['Cherokee Purple', 'Early Girl', 'Brandywine'],
        bed_requirements: {
          recommended_bed: '4×8 Bed'
        }
      };

      const singleResult = service.generateActionText(singleVarietyTemplate);
      const multipleResult = service.generateActionText(multipleVarietyTemplate);
      
      expect(singleResult).toBe('Plant Cherokee Purple in 4×8 Bed');
      expect(multipleResult).toBe('Order Cherokee Purple, Early Girl for 4×8 Bed');
      
      expect(singleResult).not.toContain('{');
      expect(multipleResult).not.toContain('{');
    });

    test('should handle partial data with fallbacks', () => {
      const template = {
        action_template: 'Order {variety} from {supplier} for {bed}',
        variety_suggestions: ['Cherokee Purple'],
        // supplier_preferences missing
        // bed_requirements missing
      };

      const result = service.generateActionText(template);
      
      expect(result).toBe('Order Cherokee Purple from preferred supplier for any available bed');
      expect(result).not.toContain('{');
      expect(result).not.toContain('}');
    });

    test('should never return text with unreplaced placeholders', () => {
      const problematicTemplates = [
        {
          action_template: 'Buy {unknown_placeholder} from {supplier}',
          supplier_preferences: ['Test Supplier']
        },
        {
          action_template: 'Plant {variety} in {bed} with {mystery_variable}',
          variety_suggestions: ['Test Variety'],
          bed_requirements: { recommended_bed: 'Test Bed' }
        },
        {
          action_template: '{varieties} {supplier} {bed} {quantity} {variety}',
          // Empty template - all fallbacks
        }
      ];

      problematicTemplates.forEach((template, index) => {
        const result = service.generateActionText(template);
        
        // Should not contain any unreplaced placeholders
        expect(result).not.toMatch(/\{[^}]+\}/);
        
        // Known placeholders should be replaced
        expect(result).not.toContain('{varieties}');
        expect(result).not.toContain('{variety}');
        expect(result).not.toContain('{supplier}');
        expect(result).not.toContain('{bed}');
        expect(result).not.toContain('{quantity}');
      });
    });
  });

  describe('Regression Prevention', () => {
    test('should never allow {bed} to appear in final output', () => {
      const template = {
        action_template: 'Plant tomatoes in {bed}',
        bed_requirements: null // Force fallback
      };

      const result = service.generateActionText(template);
      
      expect(result).not.toContain('{bed}');
      expect(result).toBe('Plant tomatoes in any available bed');
    });

    test('should never allow {supplier} to appear in final output', () => {
      const template = {
        action_template: 'Order from {supplier}',
        supplier_preferences: [] // Force fallback
      };

      const result = service.generateActionText(template);
      
      expect(result).not.toContain('{supplier}');
      expect(result).toBe('Order from preferred supplier');
    });

    test('should never allow {variety} or {varieties} to appear in final output', () => {
      const template = {
        action_template: 'Plant {variety} and order {varieties}',
        variety_suggestions: null // Force fallback
      };

      const result = service.generateActionText(template);
      
      expect(result).not.toContain('{variety}');
      expect(result).not.toContain('{varieties}');
      expect(result).toBe('Plant recommended variety and order recommended varieties');
    });
  });
});