/**
 * Tests for Indoor Start Templates
 * Comprehensive validation of indoor start activity templates and data integrity
 */

import { databaseService } from '../databaseService.js';

describe('Indoor Start Templates', () => {
  let service;

  beforeEach(() => {
    service = new (databaseService.constructor)();
  });

  describe('Template Insertion Validation', () => {
    test('should have all major crops with indoor start templates', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Mock indoor start templates for all major crops
      mockDb.all.mockResolvedValueOnce([
        { plant_key: 'tomatoes', month: 2, activity_type: 'indoor-starting' },
        { plant_key: 'tomatoes', month: 3, activity_type: 'indoor-starting' },
        { plant_key: 'hot_peppers', month: 2, activity_type: 'indoor-starting' },
        { plant_key: 'hot_peppers', month: 3, activity_type: 'indoor-starting' },
        { plant_key: 'sweet_peppers', month: 2, activity_type: 'indoor-starting' },
        { plant_key: 'sweet_peppers', month: 3, activity_type: 'indoor-starting' },
        { plant_key: 'eggplant', month: 2, activity_type: 'indoor-starting' },
        { plant_key: 'eggplant', month: 3, activity_type: 'indoor-starting' },
        { plant_key: 'basil', month: 2, activity_type: 'indoor-starting' },
        { plant_key: 'basil', month: 3, activity_type: 'indoor-starting' },
        { plant_key: 'basil', month: 4, activity_type: 'indoor-starting' }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      expect(templates).toHaveLength(11);
      
      // Check that all major crops are covered
      const cropsCovered = [...new Set(templates.map(t => t.plant_key))];
      expect(cropsCovered).toContain('tomatoes');
      expect(cropsCovered).toContain('hot_peppers');
      expect(cropsCovered).toContain('sweet_peppers');
      expect(cropsCovered).toContain('eggplant');
      expect(cropsCovered).toContain('basil');
    });

    test('should validate template data structure', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          region_id: 1,
          plant_id: 19,
          activity_type_id: 11,
          month: 2,
          action_template: 'Start {varieties} tomato seeds indoors',
          timing_template: '8-10 weeks before last frost (April 15)',
          priority: 'high',
          conditions: '{"temperature": "70-75F", "light": "grow_lights_or_south_window"}',
          variety_suggestions: '["Cherokee Purple", "Early Girl", "Celebrity"]',
          supplier_preferences: '["True Leaf Market", "Johnny Seeds"]',
          estimated_cost_min: 3.50,
          estimated_cost_max: 8.00,
          bed_size_requirements: '{"space": "seed_trays", "quantity": "12_cells"}'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      const template = templates[0];
      
      // Validate required fields
      expect(template.id).toBeDefined();
      expect(template.region_id).toBe(1);
      expect(template.plant_id).toBe(19);
      expect(template.activity_type_id).toBe(11);
      expect(template.month).toBeGreaterThanOrEqual(1);
      expect(template.month).toBeLessThanOrEqual(12);
      expect(template.action_template).toBeDefined();
      expect(template.timing_template).toBeDefined();
      expect(template.priority).toMatch(/^(low|medium|high|critical)$/);
      
      // Validate cost data
      expect(template.estimated_cost_min).toBeGreaterThan(0);
      expect(template.estimated_cost_max).toBeGreaterThanOrEqual(template.estimated_cost_min);
      
      // Validate JSON fields format
      expect(template.conditions).toBeDefined();
      expect(template.variety_suggestions).toBeDefined();
      expect(template.supplier_preferences).toBeDefined();
      expect(template.bed_size_requirements).toBeDefined();
    });

    test('should validate timing relationships', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        { month: 2, timing_template: '8-10 weeks before last frost', priority: 'high' },
        { month: 3, timing_template: '6-8 weeks before last frost', priority: 'high' },
        { month: 4, timing_template: '2-4 weeks before last frost', priority: 'low' }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      // Early starts should be high priority
      const februaryTemplates = templates.filter(t => t.month === 2);
      februaryTemplates.forEach(template => {
        expect(template.priority).toBe('high');
        expect(template.timing_template).toContain('8-10 weeks');
      });
      
      // Later starts should have lower priority
      const aprilTemplates = templates.filter(t => t.month === 4);
      aprilTemplates.forEach(template => {
        expect(template.priority).toBe('low');
        expect(template.timing_template).toContain('2-4 weeks');
      });
    });
  });

  describe('Template Query by Month/Crop', () => {
    test('should query templates by specific month', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Mock February indoor start templates
      mockDb.all.mockResolvedValueOnce([
        {
          plant_key: 'tomatoes',
          month: 2,
          activity_type: 'indoor-starting',
          action_template: 'Start tomato seeds indoors',
          priority: 'high'
        },
        {
          plant_key: 'hot_peppers', 
          month: 2,
          activity_type: 'indoor-starting',
          action_template: 'Start hot pepper seeds indoors',
          priority: 'high'
        }
      ]);
      
      service.db = mockDb;
      
      const februaryTemplates = await service.getActivityTemplates(1, 2, ['tomatoes', 'hot_peppers']);
      
      expect(februaryTemplates).toHaveLength(2);
      februaryTemplates.forEach(template => {
        expect(template.month).toBe(2);
        expect(template.activity_type).toBe('indoor-starting');
        expect(['tomatoes', 'hot_peppers']).toContain(template.plant_key);
      });
    });

    test('should query templates by specific crop', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Mock all tomato indoor start templates
      mockDb.all.mockResolvedValueOnce([
        { plant_key: 'tomatoes', month: 2, action_template: 'Start tomato seeds indoors' },
        { plant_key: 'tomatoes', month: 3, action_template: 'Start tomato seeds indoors - second round' }
      ]);
      
      service.db = mockDb;
      
      const tomatoTemplates = await service.getActivityTemplates(1, null, ['tomatoes']);
      
      expect(tomatoTemplates).toHaveLength(2);
      tomatoTemplates.forEach(template => {
        expect(template.plant_key).toBe('tomatoes');
        expect(template.action_template).toContain('tomato');
      });
    });

    test('should handle multiple succession plantings', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Mock basil templates with succession plantings
      mockDb.all.mockResolvedValueOnce([
        { plant_key: 'basil', month: 2, priority: 'medium', timing_template: '6-8 weeks before last frost' },
        { plant_key: 'basil', month: 3, priority: 'medium', timing_template: '4-6 weeks before last frost' },
        { plant_key: 'basil', month: 4, priority: 'low', timing_template: '2-4 weeks before last frost' }
      ]);
      
      service.db = mockDb;
      
      const basilTemplates = await service.getActivityTemplates(1, null, ['basil']);
      
      expect(basilTemplates).toHaveLength(3);
      
      // Should show progression of timing and priority
      const monthOrder = basilTemplates.map(t => t.month).sort();
      expect(monthOrder).toEqual([2, 3, 4]);
      
      // Later plantings should have lower priority
      const aprilBasil = basilTemplates.find(t => t.month === 4);
      expect(aprilBasil.priority).toBe('low');
    });
  });

  describe('Data Consistency Checks', () => {
    test('should validate priority consistency with timing', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        { month: 2, priority: 'high', timing_template: '10-12 weeks before last frost' },
        { month: 3, priority: 'high', timing_template: '8-10 weeks before last frost' },
        { month: 4, priority: 'low', timing_template: '2-4 weeks before last frost' }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      // Early season (Feb/Mar) should be high priority
      const earlyTemplates = templates.filter(t => t.month <= 3);
      earlyTemplates.forEach(template => {
        expect(template.priority).toBe('high');
      });
      
      // Late season (April) should be lower priority
      const lateTemplates = templates.filter(t => t.month >= 4);
      lateTemplates.forEach(template => {
        expect(['low', 'medium']).toContain(template.priority);
      });
    });

    test('should validate cost data consistency', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        { estimated_cost_min: 2.50, estimated_cost_max: 5.00, plant_key: 'basil' },
        { estimated_cost_min: 3.50, estimated_cost_max: 8.00, plant_key: 'tomatoes' },
        { estimated_cost_min: 4.00, estimated_cost_max: 10.00, plant_key: 'hot_peppers' }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      templates.forEach(template => {
        // Min cost should be positive
        expect(template.estimated_cost_min).toBeGreaterThan(0);
        
        // Max cost should be >= min cost
        expect(template.estimated_cost_max).toBeGreaterThanOrEqual(template.estimated_cost_min);
        
        // Costs should be reasonable (under $20)
        expect(template.estimated_cost_max).toBeLessThan(20.00);
      });
    });

    test('should validate JSON field integrity', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          conditions: '{"temperature": "70-75F", "light": "grow_lights"}',
          variety_suggestions: '["Cherokee Purple", "Early Girl"]',
          supplier_preferences: '["True Leaf Market", "Johnny Seeds"]',
          bed_size_requirements: '{"space": "seed_trays", "quantity": "12_cells"}'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      const template = templates[0];
      
      // Should be valid JSON
      expect(() => JSON.parse(template.conditions)).not.toThrow();
      expect(() => JSON.parse(template.variety_suggestions)).not.toThrow();
      expect(() => JSON.parse(template.supplier_preferences)).not.toThrow();
      expect(() => JSON.parse(template.bed_size_requirements)).not.toThrow();
      
      // Check data structure
      const conditions = JSON.parse(template.conditions);
      expect(conditions).toHaveProperty('temperature');
      expect(conditions).toHaveProperty('light');
      
      const varieties = JSON.parse(template.variety_suggestions);
      expect(Array.isArray(varieties)).toBe(true);
      expect(varieties.length).toBeGreaterThan(0);
      
      const suppliers = JSON.parse(template.supplier_preferences);
      expect(Array.isArray(suppliers)).toBe(true);
      expect(suppliers.length).toBeGreaterThan(0);
    });

    test('should validate Durham-specific timing', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        { timing_template: '8-10 weeks before last frost (April 15)', month: 2 },
        { timing_template: '6-8 weeks before last frost', month: 3 },
        { timing_template: '2-4 weeks before last frost', month: 4 }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      templates.forEach(template => {
        // All timing should reference last frost
        expect(template.timing_template).toContain('before last frost');
        
        // Earlier months should have longer timing
        if (template.month === 2) {
          expect(template.timing_template).toMatch(/[8-9][0-9]*.*weeks/);
        }
        if (template.month === 4) {
          expect(template.timing_template).toMatch(/[2-4].*weeks/);
        }
      });
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with calendar generation', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          plant_key: 'tomatoes',
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start {varieties} tomato seeds indoors',
          timing_template: '8-10 weeks before last frost',
          priority: 'high',
          variety_suggestions: '["Cherokee Purple", "Early Girl"]'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      
      // Should be usable by calendar service
      expect(templates[0]).toMatchObject({
        plant_key: 'tomatoes',
        activity_type: 'indoor-starting',
        month: 2,
        priority: 'high'
      });
      
      // Should have data for template replacement
      expect(templates[0].action_template).toContain('{varieties}');
      expect(templates[0].variety_suggestions).toBeDefined();
    });

    test('should handle crop filtering correctly', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        { plant_key: 'tomatoes', activity_type: 'indoor-starting' },
        { plant_key: 'basil', activity_type: 'indoor-starting' }
      ]);
      
      service.db = mockDb;
      
      const tomatoOnly = await service.getActivityTemplates(1, 2, ['tomatoes']);
      const basilOnly = await service.getActivityTemplates(1, 2, ['basil']);
      const both = await service.getActivityTemplates(1, 2, ['tomatoes', 'basil']);
      
      expect(tomatoOnly).toHaveLength(1);
      expect(tomatoOnly[0].plant_key).toBe('tomatoes');
      
      expect(basilOnly).toHaveLength(1);
      expect(basilOnly[0].plant_key).toBe('basil');
      
      expect(both).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing templates gracefully', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([]); // No templates
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      expect(templates).toEqual([]);
      expect(templates).toHaveLength(0);
    });

    test('should handle malformed JSON in templates', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          variety_suggestions: 'invalid_json{[',
          supplier_preferences: '["True Leaf Market"]',
          conditions: 'not_json_at_all'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplatesByType('indoor-starting');
      
      // Should not throw, should handle gracefully
      expect(templates).toHaveLength(1);
      expect(templates[0].variety_suggestions).toBe('invalid_json{[');
      expect(templates[0].conditions).toBe('not_json_at_all');
    });

    test('should handle database query errors', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockRejectedValueOnce(new Error('Database connection failed'));
      
      service.db = mockDb;
      
      await expect(service.getActivityTemplatesByType('indoor-starting')).rejects.toThrow('Database connection failed');
    });
  });
});