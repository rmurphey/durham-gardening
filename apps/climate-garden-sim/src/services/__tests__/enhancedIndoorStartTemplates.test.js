/**
 * Tests for Enhanced Indoor Start Templates
 * Validates new indoor start crop templates and their integration
 */

import { generateDatabaseGardenCalendar } from '../databaseCalendarService.js';
import { DURHAM_CONFIG } from '../../config/durhamConfig.js';
import { databaseService } from '../databaseService.js';

// Mock the database service
jest.mock('../databaseService.js');

describe('Enhanced Indoor Start Templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Herb Indoor Start Templates', () => {
    test('should generate March calendar with herb indoor start templates', async () => {
      const mockHerbTemplates = [
        {
          id: 5,
          plant_key: 'oregano',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} oregano seeds indoors',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['Greek Oregano', 'Italian Oregano'],
          supplier_preferences: ['True Leaf Market']
        },
        {
          id: 6,
          plant_key: 'thyme',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} thyme seeds indoors',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['English Thyme', 'French Thyme'],
          supplier_preferences: ['True Leaf Market']
        },
        {
          id: 7,
          plant_key: 'mint',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} mint seeds indoors',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['Spearmint', 'Peppermint'],
          supplier_preferences: ['True Leaf Market']
        }
      ];

      // Mock database responses
      databaseService.getActivityTemplates.mockImplementation((regionId, month) => {
        if (month === 3) return Promise.resolve(mockHerbTemplates);
        return Promise.resolve([]);
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template.replace(
          '{varieties}', 
          template.variety_suggestions?.join(', ') || 'recommended varieties'
        );
      });

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const march = calendar.find(month => month.month === 'March');
      expect(march).toBeDefined();
      expect(march.activities).toHaveLength(3);

      // Check oregano activity
      const oreganoActivity = march.activities.find(a => a.crop === 'Oregano');
      expect(oreganoActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Oregano',
        priority: 'medium',
        timing: '6-8 weeks before last frost'
      });
      expect(oreganoActivity.action).toContain('Greek Oregano, Italian Oregano');

      // Check thyme activity
      const thymeActivity = march.activities.find(a => a.crop === 'Thyme');
      expect(thymeActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Thyme',
        priority: 'medium',
        timing: '6-8 weeks before last frost'
      });
      expect(thymeActivity.action).toContain('English Thyme, French Thyme');

      // Check mint activity
      const mintActivity = march.activities.find(a => a.crop === 'Mint');
      expect(mintActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Mint',
        priority: 'medium',
        timing: '6-8 weeks before last frost'
      });
      expect(mintActivity.action).toContain('Spearmint, Peppermint');
    });
  });

  describe('Quick-Growing Crop Templates', () => {
    test('should generate February calendar with early arugula indoor start', async () => {
      const mockFebruaryTemplates = [
        {
          id: 8,
          plant_key: 'arugula',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start {varieties} arugula seeds indoors for early harvest',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['Slow Bolt Arugula', 'Wild Rocket'],
          supplier_preferences: ['True Leaf Market']
        }
      ];

      databaseService.getActivityTemplates.mockImplementation((regionId, month) => {
        if (month === 2) return Promise.resolve(mockFebruaryTemplates);
        return Promise.resolve([]);
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template.replace(
          '{varieties}', 
          template.variety_suggestions?.join(', ') || 'recommended varieties'
        );
      });

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const february = calendar.find(month => month.month === 'February');
      expect(february).toBeDefined();
      expect(february.activities).toHaveLength(1);

      const arugalaActivity = february.activities.find(a => a.crop === 'Arugula');
      expect(arugalaActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Arugula',
        priority: 'medium',
        timing: '6-8 weeks before last frost'
      });
      expect(arugalaActivity.action).toContain('early harvest');
      expect(arugalaActivity.action).toContain('Slow Bolt Arugula, Wild Rocket');
    });

    test('should generate March calendar with main season arugula and radish templates', async () => {
      const mockMarchTemplates = [
        {
          id: 9,
          plant_key: 'arugula',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} arugula seeds indoors',
          timing_template: '4-6 weeks before last frost',
          priority: 'medium',
          variety_suggestions: ['Slow Bolt Arugula', 'Wild Rocket'],
          supplier_preferences: ['True Leaf Market']
        },
        {
          id: 10,
          plant_key: 'radishes',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} radish seeds indoors for early harvest',
          timing_template: '4-6 weeks before last frost',
          priority: 'low',
          variety_suggestions: ['Cherry Belle', 'French Breakfast'],
          supplier_preferences: ['True Leaf Market']
        }
      ];

      databaseService.getActivityTemplates.mockImplementation((regionId, month) => {
        if (month === 3) return Promise.resolve(mockMarchTemplates);
        return Promise.resolve([]);
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template.replace(
          '{varieties}', 
          template.variety_suggestions?.join(', ') || 'recommended varieties'
        );
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

      // Check main season arugula
      const arugalaActivity = march.activities.find(a => a.crop === 'Arugula');
      expect(arugalaActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Arugula',
        priority: 'medium',
        timing: '4-6 weeks before last frost'
      });
      expect(arugalaActivity.action).not.toContain('early harvest');

      // Check radish activity
      const radishActivity = march.activities.find(a => a.crop === 'Radishes');
      expect(radishActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Radishes',
        priority: 'low',
        timing: '4-6 weeks before last frost'
      });
      expect(radishActivity.action).toContain('Cherry Belle, French Breakfast');
    });

    test('should generate April calendar with succession radish template', async () => {
      const mockAprilTemplates = [
        {
          id: 11,
          plant_key: 'radishes',
          activity_type: 'indoor-starting',
          month: 4,
          action_template: 'Start {varieties} radish seeds indoors for succession harvest',
          timing_template: '2-4 weeks before last frost',
          priority: 'low',
          variety_suggestions: ['Cherry Belle', 'Easter Egg Mix'],
          supplier_preferences: ['True Leaf Market']
        }
      ];

      databaseService.getActivityTemplates.mockImplementation((regionId, month) => {
        if (month === 4) return Promise.resolve(mockAprilTemplates);
        return Promise.resolve([]);
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template.replace(
          '{varieties}', 
          template.variety_suggestions?.join(', ') || 'recommended varieties'
        );
      });

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const april = calendar.find(month => month.month === 'April');
      expect(april).toBeDefined();
      expect(april.activities).toHaveLength(1);

      const radishActivity = april.activities.find(a => a.crop === 'Radishes');
      expect(radishActivity).toMatchObject({
        type: 'indoor-starting',
        crop: 'Radishes',
        priority: 'low',
        timing: '2-4 weeks before last frost'
      });
      expect(radishActivity.action).toContain('succession harvest');
      expect(radishActivity.action).toContain('Cherry Belle, Easter Egg Mix');
    });
  });

  describe('Template Integration Tests', () => {
    test('should handle all enhanced templates in a comprehensive calendar', async () => {
      const mockAllTemplates = [
        // February - early arugula
        {
          plant_key: 'arugula',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start arugula seeds indoors for early harvest',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium'
        },
        // March - herbs and main season crops
        {
          plant_key: 'oregano',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start oregano seeds indoors',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium'
        },
        {
          plant_key: 'thyme',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start thyme seeds indoors',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium'
        },
        {
          plant_key: 'mint',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start mint seeds indoors',
          timing_template: '6-8 weeks before last frost',
          priority: 'medium'
        },
        {
          plant_key: 'arugula',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start arugula seeds indoors',
          timing_template: '4-6 weeks before last frost',
          priority: 'medium'
        },
        {
          plant_key: 'radishes',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start radish seeds indoors for early harvest',
          timing_template: '4-6 weeks before last frost',
          priority: 'low'
        },
        // April - succession radish
        {
          plant_key: 'radishes',
          activity_type: 'indoor-starting',
          month: 4,
          action_template: 'Start radish seeds indoors for succession harvest',
          timing_template: '2-4 weeks before last frost',
          priority: 'low'
        }
      ];

      databaseService.getActivityTemplates.mockImplementation((regionId, month) => {
        return Promise.resolve(mockAllTemplates.filter(t => t.month === month));
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => template.action_template);

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      // February should have 1 activity (early arugula)
      const february = calendar.find(month => month.month === 'February');
      expect(february.activities).toHaveLength(1);
      expect(february.activities[0].crop).toBe('Arugula');

      // March should have 5 activities (herbs + arugula + radish)
      const march = calendar.find(month => month.month === 'March');
      expect(march.activities).toHaveLength(5);
      const marchCrops = march.activities.map(a => a.crop).sort();
      expect(marchCrops).toEqual(['Arugula', 'Mint', 'Oregano', 'Radishes', 'Thyme']);

      // April should have 1 activity (succession radish)
      const april = calendar.find(month => month.month === 'April');
      expect(april.activities).toHaveLength(1);
      expect(april.activities[0].crop).toBe('Radishes');
      expect(april.activities[0].action).toContain('succession');
    });

    test('should maintain proper priority levels for enhanced templates', async () => {
      const mockTemplates = [
        {
          plant_key: 'oregano',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start oregano seeds indoors',
          priority: 'medium'
        },
        {
          plant_key: 'radishes',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start radish seeds indoors',
          priority: 'low'
        }
      ];

      databaseService.getActivityTemplates.mockImplementation((regionId, month) => {
        if (month === 3) return Promise.resolve(mockTemplates);
        return Promise.resolve([]);
      });
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => template.action_template);

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const march = calendar.find(month => month.month === 'March');
      
      const oreganoActivity = march.activities.find(a => a.crop === 'Oregano');
      expect(oreganoActivity.priority).toBe('medium');

      const radishActivity = march.activities.find(a => a.crop === 'Radishes');
      expect(radishActivity.priority).toBe('low');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing variety suggestions gracefully', async () => {
      const mockTemplates = [
        {
          plant_key: 'oregano',
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start {varieties} oregano seeds indoors',
          priority: 'medium'
          // Missing variety_suggestions
        }
      ];

      databaseService.getActivityTemplates.mockResolvedValue(mockTemplates);
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);
      databaseService.generateActionText.mockImplementation((template) => {
        return template.action_template.replace('{varieties}', 'recommended varieties');
      });

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      const march = calendar.find(month => month.month === 'March');
      const oreganoActivity = march.activities.find(a => a.crop === 'Oregano');
      
      expect(oreganoActivity.action).toContain('recommended varieties');
    });

    test('should handle database errors for enhanced templates', async () => {
      databaseService.getActivityTemplates.mockRejectedValue(new Error('Database error'));
      databaseService.getRotationTemplates.mockResolvedValue([]);
      databaseService.getSuccessionTemplates.mockResolvedValue([]);

      const calendar = await generateDatabaseGardenCalendar(
        'hot_summer',
        'mild_winter',
        'conservative',
        DURHAM_CONFIG
      );

      // Should still return a calendar structure
      expect(calendar).toHaveLength(12);
      expect(Array.isArray(calendar)).toBe(true);
    });
  });
});