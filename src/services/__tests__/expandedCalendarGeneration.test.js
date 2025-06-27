/**
 * Tests for Expanded Calendar Generation with Indoor Start Crops
 * Validates calendar service with new crop list and indoor start activities
 */

import { generateDatabaseGardenCalendar } from '../databaseCalendarService.js';
import { DEFAULT_CONFIG as DURHAM_CONFIG } from '../../config/defaultConfig.js';
import { databaseService } from '../databaseService.js';

// Mock the database service
jest.mock('../databaseService.js');

describe('Expanded Calendar Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Calendar Generation with New Crops', () => {
    test('should generate calendar with indoor start activities in February', async () => {
      // Mock database service responses
      const mockIndoorStartTemplates = [
        {
          id: 1,
          plant_key: 'tomatoes',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start {varieties} tomato seeds indoors',
          timing_template: '8-10 weeks before last frost',
          priority: 'high',
          variety_suggestions: ['Cherokee Purple', 'Early Girl'],
          supplier_preferences: ['True Leaf Market'],
          bed_requirements: { space: 'seed_trays', quantity: '12_cells' }
        },
        {
          id: 2,
          plant_key: 'hot_peppers',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start {varieties} hot pepper seeds indoors',
          timing_template: '10-12 weeks before last frost',
          priority: 'high',
          variety_suggestions: ['Fish Pepper', 'Hungarian Hot Wax'],
          supplier_preferences: ['True Leaf Market'],
          bed_requirements: { space: 'seed_trays', quantity: '8_cells' }
        }
      ];

      const mockRotationTemplates = [];
      const mockSuccessionTemplates = [];

      databaseService.getActivityTemplates.mockResolvedValue(mockIndoorStartTemplates);
      databaseService.getRotationTemplates.mockResolvedValue(mockRotationTemplates);
      databaseService.getSuccessionTemplates.mockResolvedValue(mockSuccessionTemplates);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template
          .replace('{varieties}', template.variety_suggestions?.join(', ') || 'recommended varieties')
          .replace('{supplier}', template.supplier_preferences?.[0] || 'preferred supplier');
      });

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      expect(calendar).toHaveLength(12);

      // Find February
      const february = calendar.find(month => month.month === 'February');
      expect(february).toBeDefined();
      expect(february.activities).toHaveLength(2);

      // Check indoor start activities
      const indoorStartActivities = february.activities.filter(activity => 
        activity.type === 'indoor-starting'
      );
      expect(indoorStartActivities).toHaveLength(2);

      // Validate tomato activity
      const tomatoActivity = indoorStartActivities.find(a => a.crop === 'Tomatoes');
      expect(tomatoActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Tomatoes',
        priority: 'high',
        timing: '8-10 weeks before last frost'
      });
      expect(tomatoActivity.action).toContain('Cherokee Purple, Early Girl');

      // Validate pepper activity  
      const pepperActivity = indoorStartActivities.find(a => a.crop === 'Hot Peppers');
      expect(pepperActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Hot Peppers',
        priority: 'high',
        timing: '10-12 weeks before last frost'
      });
      expect(pepperActivity.action).toContain('Fish Pepper, Hungarian Hot Wax');
    });

    test('should include all new crops in enabled crops list', async () => {
      // Mock empty responses to focus on crop list testing
      databaseService.getActivityTemplates.mockResolvedValue([]);
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);

      await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter', 
        'conservative',
        DURHAM_CONFIG
      );

      // Verify that getActivityTemplates was called with expanded crop list
      expect(databaseService.getActivityTemplates).toHaveBeenCalled();
      
      const callArgs = databaseService.getActivityTemplates.mock.calls[0];
      const enabledCrops = callArgs[2]; // Third parameter is enabledCrops array

      // Check that all new indoor start crops are included
      expect(enabledCrops).toContain('tomatoes');
      expect(enabledCrops).toContain('sweet_peppers');
      expect(enabledCrops).toContain('eggplant');
      expect(enabledCrops).toContain('basil');

      // Check that original crops are still included
      expect(enabledCrops).toContain('hot_peppers');
      expect(enabledCrops).toContain('kale');
      expect(enabledCrops).toContain('lettuce');

      // Check total crop count increased
      expect(enabledCrops.length).toBeGreaterThan(5); // Original was 5 crops
    });

    test('should handle March indoor start activities', async () => {
      const mockMarchTemplates = [
        {
          id: 3,
          plant_key: 'basil',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} basil seeds indoors',
          timing_template: '4-6 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['Sweet Basil', 'Thai Basil'],
          supplier_preferences: ['True Leaf Market']
        },
        {
          id: 4,
          plant_key: 'eggplant',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} eggplant seeds indoors',
          timing_template: '8-10 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['Japanese Long', 'Thai Long Green'],
          supplier_preferences: ['True Leaf Market']
        }
      ];

      // Mock February with empty, March with activities
      databaseService.getActivityTemplates.mockImplementation((regionId, month, crops) => {
        if (month === 3) return Promise.resolve(mockMarchTemplates);
        return Promise.resolve([]);
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template
          .replace('{varieties}', template.variety_suggestions?.join(', ') || 'recommended varieties');
      });

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const march = calendar.find(month => month.month === 'March');
      expect(march).toBeDefined();
      expect(march.activities).toHaveLength(2);

      const basilActivity = march.activities.find(a => a.crop === 'Basil');
      expect(basilActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Basil',
        priority: 'medium',
        timing: '4-6 weeks before last frost'
      });

      const eggplantActivity = march.activities.find(a => a.crop === 'Eggplant');
      expect(eggplantActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Eggplant',
        priority: 'medium',
        timing: '8-10 weeks before last frost'
      });
    });
  });

  describe('Activity Filtering Tests', () => {
    test('should filter activities by enabled crops correctly', async () => {
      const mockTemplates = [
        {
          plant_key: 'tomatoes',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start tomato seeds',
          priority: 'high'
        },
        {
          plant_key: 'unknown_crop',
          activity_type: 'indoor-starting', 
          month: 2,
          action_template: 'Start unknown seeds',
          priority: 'high'
        }
      ];

      databaseService.getActivityTemplates.mockResolvedValue(mockTemplates);
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => template.action_template);

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      // Verify that getActivityTemplates was called with correct enabled crops
      const enabledCrops = databaseService.getActivityTemplates.mock.calls[0][2];
      
      // tomatoes should be in enabled crops
      expect(enabledCrops).toContain('tomatoes');
      
      // unknown_crop should not be in enabled crops
      expect(enabledCrops).not.toContain('unknown_crop');
    });

    test('should handle crop activity filtering based on garden status', async () => {
      const mockTemplates = [
        {
          plant_key: 'tomatoes',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start tomato seeds',
          priority: 'high'
        }
      ];

      databaseService.getActivityTemplates.mockResolvedValue(mockTemplates);
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => template.action_template);

      // Mock shouldShowCropActivity to return true
      const shouldShowCropActivity = jest.fn().mockReturnValue(true);
      jest.doMock('../../config/gardenStatus.js', () => ({
        shouldShowCropActivity
      }));

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const february = calendar.find(month => month.month === 'February');
      expect(february.activities).toHaveLength(1);
      expect(february.activities[0].crop).toBe('Tomatoes');
    });
  });

  describe('Performance Tests', () => {
    test('should handle expanded dataset efficiently', async () => {
      // Create a larger mock dataset
      const mockTemplates = [];
      const crops = ['tomatoes', 'hot_peppers', 'sweet_peppers', 'eggplant', 'basil', 'oregano', 'thyme'];
      
      crops.forEach((crop, cropIndex) => {
        [2, 3, 4].forEach(month => {
          mockTemplates.push({
            id: cropIndex * 3 + month,
            plant_key: crop,
            activity_type: 'indoor-starting',
            month: month,
            action_template: `Start ${crop} seeds indoors`,
            priority: month === 2 ? 'high' : 'medium',
            variety_suggestions: [`${crop} variety 1`, `${crop} variety 2`],
            supplier_preferences: ['True Leaf Market']
          });
        });
      });

      databaseService.getActivityTemplates.mockResolvedValue(mockTemplates);
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => template.action_template);

      const startTime = Date.now();
      
      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (under 1 second)
      expect(duration).toBeLessThan(1000);

      // Should generate full calendar
      expect(calendar).toHaveLength(12);

      // Should handle multiple activities per month
      const february = calendar.find(month => month.month === 'February');
      const march = calendar.find(month => month.month === 'March');
      const april = calendar.find(month => month.month === 'April');

      expect(february.activities.length).toBeGreaterThan(0);
      expect(march.activities.length).toBeGreaterThan(0);
      expect(april.activities.length).toBeGreaterThan(0);

      // Total activities should equal number of templates for months 2-4
      const expectedMonthlyTemplates = mockTemplates.filter(t => t.month >= 2 && t.month <= 4);
      const totalActivities = february.activities.length + march.activities.length + april.activities.length;
      expect(totalActivities).toBe(expectedMonthlyTemplates.length);
    });

    test('should maintain performance with large crop list', async () => {
      // Verify that database queries are called efficiently
      databaseService.getActivityTemplates.mockResolvedValue([]);
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);

      await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      // Should make exactly 12 calls to getActivityTemplates (one per month)
      expect(databaseService.getActivityTemplates).toHaveBeenCalledTimes(12);
      
      // Should make exactly 12 calls to getRotationTemplates (one per month)
      expect(databaseService.getRotationTemplates).toHaveBeenCalledTimes(12);
      
      // Should make exactly 12 calls to getSuccessionTemplates (one per month)
      expect(databaseService.getSuccessionTemplates).toHaveBeenCalledTimes(12);

      // Each call should include the expanded crop list
      databaseService.getActivityTemplates.mock.calls.forEach(call => {
        const enabledCrops = call[2];
        expect(enabledCrops.length).toBeGreaterThan(5);
        expect(enabledCrops).toContain('tomatoes');
        expect(enabledCrops).toContain('basil');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      databaseService.getActivityTemplates.mockRejectedValue(new Error('Database error'));
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      // Should still return a calendar, possibly with fewer activities
      expect(calendar).toHaveLength(12);
      expect(Array.isArray(calendar)).toBe(true);
    });

    test('should handle invalid parameters gracefully', async () => {
      const calendar = await generateDatabaseGardenCalendar(
        null, // Invalid summer scenario
        null, // Invalid winter scenario  
        null, // Invalid portfolio
        null  // Invalid location config
      );

      // Should return empty array for invalid parameters
      expect(calendar).toEqual([]);
    });
  });
});