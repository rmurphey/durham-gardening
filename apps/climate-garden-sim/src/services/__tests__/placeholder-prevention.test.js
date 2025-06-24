/**
 * CRITICAL TEST: Zero Tolerance Placeholder Prevention
 * These tests MUST NEVER FAIL. Placeholders in UI are FORBIDDEN.
 */

import { databaseService } from '../databaseService.js';
import { generateDatabaseGardenCalendar } from '../databaseCalendarService.js';

describe('ZERO TOLERANCE: Placeholder Prevention', () => {
  
  beforeAll(async () => {
    // Ensure database is initialized
    await databaseService.initializeDatabase();
  });

  describe('Database Service Validation', () => {
    test('validateNoPlaceholders should THROW on any placeholder', () => {
      const testCases = [
        'Clear {bed} for winter',
        'Order {varieties} from {supplier}',
        'Plant {quantity} {variety} in {bed}',
        'Some text with {unknown_placeholder}',
        'Multiple {bed} and {variety} placeholders'
      ];

      testCases.forEach(text => {
        expect(() => {
          databaseService.validateNoPlaceholders(text);
        }).toThrow(/Template placeholders FORBIDDEN/);
      });
    });

    test('validateNoPlaceholders should PASS on clean text', () => {
      const cleanTexts = [
        'Clear 4×8 Bed for winter',
        'Order Habanero, Jalapeño from True Leaf Market',
        'Plant 12 Beauregard sweet potato slips',
        'No placeholders here at all'
      ];

      cleanTexts.forEach(text => {
        expect(() => {
          const result = databaseService.validateNoPlaceholders(text);
          expect(result).toBe(text);
        }).not.toThrow();
      });
    });
  });

  describe('Template Processing - ZERO TOLERANCE', () => {
    test('generateActionText must NEVER return placeholders', async () => {
      // Test all activity types for all months
      for (let month = 1; month <= 12; month++) {
        const activityTemplates = await databaseService.getActivityTemplates(1, month, ['hot_peppers', 'kale', 'sweet_potato']);
        const rotationTemplates = await databaseService.getRotationTemplates(1, month);
        const successionTemplates = await databaseService.getSuccessionTemplates(1, month);

        const allTemplates = [...activityTemplates, ...rotationTemplates, ...successionTemplates];

        allTemplates.forEach(template => {
          const actionText = databaseService.generateActionText(template);
          
          // CRITICAL: Check for any placeholder pattern
          const placeholderMatch = actionText.match(/\{[^}]+\}/g);
          
          if (placeholderMatch) {
            console.error('CRITICAL FAILURE:', {
              month,
              template,
              actionText,
              placeholders: placeholderMatch
            });
          }
          
          expect(placeholderMatch).toBeNull();
          expect(actionText).not.toMatch(/\{[^}]+\}/);
        });
      }
    });

    test('generateTimingText must NEVER return placeholders', async () => {
      // Test all activity types for all months
      for (let month = 1; month <= 12; month++) {
        const activityTemplates = await databaseService.getActivityTemplates(1, month, ['hot_peppers', 'kale', 'sweet_potato']);
        const rotationTemplates = await databaseService.getRotationTemplates(1, month);
        const successionTemplates = await databaseService.getSuccessionTemplates(1, month);

        const allTemplates = [...activityTemplates, ...rotationTemplates, ...successionTemplates];

        allTemplates.forEach(template => {
          const timingText = databaseService.generateTimingText(template);
          
          // CRITICAL: Check for any placeholder pattern
          const placeholderMatch = timingText.match(/\{[^}]+\}/g);
          
          if (placeholderMatch) {
            console.error('CRITICAL FAILURE in timing:', {
              month,
              template,
              timingText,
              placeholders: placeholderMatch
            });
          }
          
          expect(placeholderMatch).toBeNull();
          expect(timingText).not.toMatch(/\{[^}]+\}/);
        });
      }
    });
  });

  describe('End-to-End Calendar Generation - ZERO TOLERANCE', () => {
    test('Garden calendar must NEVER contain placeholders', async () => {
      const locationConfig = { name: 'Durham, NC', climate_zone: '7b' };
      const calendar = await generateDatabaseGardenCalendar(
        'high_heat_resilience', 
        'mild_winter_extended', 
        'fresh_eating_priority',
        locationConfig
      );

      calendar.forEach(monthData => {
        monthData.activities.forEach(activity => {
          // Check action text
          const actionMatch = activity.action.match(/\{[^}]+\}/g);
          if (actionMatch) {
            console.error('CRITICAL: Placeholders in calendar action:', {
              month: monthData.month,
              activity,
              placeholders: actionMatch
            });
          }
          expect(actionMatch).toBeNull();

          // Check timing text
          const timingMatch = activity.timing.match(/\{[^}]+\}/g);
          if (timingMatch) {
            console.error('CRITICAL: Placeholders in calendar timing:', {
              month: monthData.month,
              activity,
              placeholders: timingMatch
            });
          }
          expect(timingMatch).toBeNull();
        });
      });
    });
  });

  describe('Database Content Validation', () => {
    test('Should log all remaining placeholders in database', async () => {
      // This test documents what placeholders exist in the database
      // so we can track them down and eliminate them
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      try {
        for (let month = 1; month <= 12; month++) {
          const templates = await databaseService.getActivityTemplates(1, month);
          const rotations = await databaseService.getRotationTemplates(1, month);
          const successions = await databaseService.getSuccessionTemplates(1, month);
          
          [...templates, ...rotations, ...successions].forEach(template => {
            const actionPlaceholders = template.action_template?.match(/\{[^}]+\}/g);
            const timingPlaceholders = template.timing_template?.match(/\{[^}]+\}/g);
            
            if (actionPlaceholders || timingPlaceholders) {
              console.log('Database template with placeholders:', {
                id: template.id,
                month,
                type: template.activity_type,
                action_placeholders: actionPlaceholders,
                timing_placeholders: timingPlaceholders,
                action_template: template.action_template,
                timing_template: template.timing_template
              });
            }
          });
        }
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });
});