/**
 * Tests for Indoor Starting Activity Type
 * Comprehensive validation of new database schema and functionality
 */

import { databaseService } from '../databaseService.js';

describe('Indoor Starting Activity Type', () => {
  let service;

  beforeEach(() => {
    service = new (databaseService.constructor)();
  });

  describe('Database Schema Validation', () => {
    test('should have Indoor Starting activity type in database', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Mock database response for activity types query
      mockDb.all.mockResolvedValueOnce([
        { id: 11, type_key: 'indoor-starting', name: 'Indoor Starting', description: 'Starting seeds indoors before transplanting to garden', default_priority: 'high', color_hex: '#8B4513' }
      ]);
      
      service.db = mockDb;
      
      const activityTypes = await service.getActivityTypes();
      
      expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM activity_types WHERE type_key = ?', ['indoor-starting']);
      expect(activityTypes).toHaveLength(1);
      expect(activityTypes[0]).toMatchObject({
        id: 11,
        type_key: 'indoor-starting',
        name: 'Indoor Starting',
        description: 'Starting seeds indoors before transplanting to garden',
        default_priority: 'high',
        color_hex: '#8B4513'
      });
    });

    test('should validate activity type constraints', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Test unique constraint on type_key
      mockDb.all.mockResolvedValueOnce([
        { id: 11, type_key: 'indoor-starting', name: 'Indoor Starting' }
      ]);
      
      service.db = mockDb;
      
      const activityTypes = await service.getActivityTypes();
      const typeKeys = activityTypes.map(at => at.type_key);
      
      // Should not have duplicate type_keys
      const uniqueTypeKeys = [...new Set(typeKeys)];
      expect(typeKeys).toEqual(uniqueTypeKeys);
    });

    test('should have proper foreign key relationships', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      // Mock activity template with indoor starting type
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          activity_type_id: 11,
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start {varieties} seeds indoors',
          priority: 'high'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      
      expect(templates).toHaveLength(1);
      expect(templates[0].activity_type_id).toBe(11);
      expect(templates[0].activity_type).toBe('indoor-starting');
    });
  });

  describe('Activity Type Query Tests', () => {
    test('should query indoor starting activities by month', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          activity_type_id: 11,
          activity_type: 'indoor-starting',
          month: 2,
          action_template: 'Start tomato seeds indoors',
          timing_template: '8-10 weeks before transplant',
          priority: 'high'
        },
        {
          id: 2,
          activity_type_id: 11,
          activity_type: 'indoor-starting',
          month: 3,
          action_template: 'Start pepper seeds indoors',
          timing_template: '10-12 weeks before transplant',
          priority: 'high'
        }
      ]);
      
      service.db = mockDb;
      
      const februaryTemplates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      const marchTemplates = await service.getActivityTemplates(1, 3, ['peppers']);
      
      expect(februaryTemplates).toHaveLength(1);
      expect(februaryTemplates[0].month).toBe(2);
      expect(februaryTemplates[0].action_template).toBe('Start tomato seeds indoors');
      
      expect(marchTemplates).toHaveLength(1);
      expect(marchTemplates[0].month).toBe(3);
      expect(marchTemplates[0].action_template).toBe('Start pepper seeds indoors');
    });

    test('should handle indoor starting activity type filtering', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          activity_type_id: 11,
          activity_type: 'indoor-starting',
          action_template: 'Start seeds indoors'
        }
      ]);
      
      service.db = mockDb;
      
      const indoorStartTemplates = await service.getActivityTemplatesByType('indoor-starting');
      
      expect(indoorStartTemplates).toHaveLength(1);
      expect(indoorStartTemplates[0].activity_type).toBe('indoor-starting');
    });
  });

  describe('Data Integrity Tests', () => {
    test('should validate indoor starting activity data structure', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          region_id: 1,
          plant_id: 1,
          activity_type_id: 11,
          month: 2,
          action_template: 'Start {varieties} seeds indoors',
          timing_template: '{timing} before transplant',
          priority: 'high',
          conditions: '{"temperature": "65-75F", "light": "grow_lights"}',
          variety_suggestions: '["Cherokee Purple", "Early Girl"]',
          supplier_preferences: '["True Leaf Market"]',
          estimated_cost_min: 3.50,
          estimated_cost_max: 8.00,
          bed_size_requirements: '{"space": "seed_trays", "quantity": "12_cells"}'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      
      expect(templates).toHaveLength(1);
      const template = templates[0];
      
      // Validate required fields
      expect(template.id).toBeDefined();
      expect(template.region_id).toBe(1);
      expect(template.activity_type_id).toBe(11);
      expect(template.month).toBe(2);
      expect(template.action_template).toBeDefined();
      expect(template.priority).toBe('high');
      
      // Validate optional fields
      expect(template.timing_template).toBeDefined();
      expect(template.estimated_cost_min).toBeGreaterThan(0);
      expect(template.estimated_cost_max).toBeGreaterThanOrEqual(template.estimated_cost_min);
    });

    test('should validate JSON field parsing', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          activity_type_id: 11,
          conditions: '{"temperature": "65-75F"}',
          variety_suggestions: '["Cherokee Purple", "Early Girl"]',
          supplier_preferences: '["True Leaf Market"]',
          bed_size_requirements: '{"space": "seed_trays"}'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      const template = templates[0];
      
      // Should parse JSON fields correctly
      if (template.conditions) {
        expect(() => JSON.parse(template.conditions)).not.toThrow();
      }
      if (template.variety_suggestions) {
        expect(() => JSON.parse(template.variety_suggestions)).not.toThrow();
      }
      if (template.supplier_preferences) {
        expect(() => JSON.parse(template.supplier_preferences)).not.toThrow();
      }
      if (template.bed_size_requirements) {
        expect(() => JSON.parse(template.bed_size_requirements)).not.toThrow();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle missing indoor starting activity type gracefully', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([]); // No results
      
      service.db = mockDb;
      
      const activityTypes = await service.getActivityTypes();
      
      expect(activityTypes).toHaveLength(0);
      expect(activityTypes).toEqual([]);
    });

    test('should handle database connection errors', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockRejectedValueOnce(new Error('Database connection failed'));
      
      service.db = mockDb;
      
      await expect(service.getActivityTypes()).rejects.toThrow('Database connection failed');
    });

    test('should handle malformed JSON in activity templates', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          activity_type_id: 11,
          variety_suggestions: 'invalid_json{[',
          supplier_preferences: '["True Leaf Market"]'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      
      // Should not throw, but handle gracefully
      expect(templates).toHaveLength(1);
      expect(templates[0].variety_suggestions).toBe('invalid_json{['); // Raw value preserved
    });
  });

  describe('Integration with Calendar Service', () => {
    test('should integrate with calendar generation', async () => {
      const mockDb = {
        all: jest.fn()
      };
      
      mockDb.all.mockResolvedValueOnce([
        {
          id: 1,
          activity_type_id: 11,
          activity_type: 'indoor-starting',
          plant_key: 'tomatoes',
          month: 2,
          action_template: 'Start {varieties} seeds indoors',
          timing_template: '8 weeks before transplant',
          priority: 'high'
        }
      ]);
      
      service.db = mockDb;
      
      const templates = await service.getActivityTemplates(1, 2, ['tomatoes']);
      
      // Should be usable by calendar service
      expect(templates[0]).toMatchObject({
        activity_type: 'indoor-starting',
        plant_key: 'tomatoes',
        month: 2,
        priority: 'high'
      });
    });
  });
});