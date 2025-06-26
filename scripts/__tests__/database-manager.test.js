/**
 * Unit tests for DatabaseManager
 */

const DatabaseManager = require('../database-manager');
const fs = require('fs').promises;
const path = require('path');

describe('DatabaseManager', () => {
  let dbManager;
  const testDbPath = 'database/test_plant_varieties.db';

  beforeEach(() => {
    dbManager = new DatabaseManager(testDbPath);
  });

  afterEach(async () => {
    // Clean up test database
    try {
      await fs.unlink(testDbPath);
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('build()', () => {
    test('should build database successfully', async () => {
      const result = await dbManager.build();
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toContain('Database build completed successfully');
      expect(result.duration).toBeGreaterThan(0);
      
      // Verify database file exists
      const dbExists = await fs.access(testDbPath).then(() => true).catch(() => false);
      expect(dbExists).toBe(true);
    }, 10000);

    test('should handle missing SQL files gracefully', async () => {
      // Create a manager with non-existent SQL directory
      const badManager = new DatabaseManager(testDbPath);
      badManager.sqlDir = 'nonexistent';
      
      const result = await badManager.build();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('test()', () => {
    test('should run comprehensive tests on valid database', async () => {
      // Build database first
      await dbManager.build();
      
      const result = await dbManager.test();
      
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.tests.length).toBeGreaterThan(10);
      expect(result.duration).toBeGreaterThan(0);
      
      // Check that all tests passed
      const failedTests = result.tests.filter(test => !test.passed);
      expect(failedTests).toHaveLength(0);
      
      // Verify stats are populated
      expect(result.stats).toHaveProperty('regions');
      expect(result.stats).toHaveProperty('plants');
      expect(result.stats.regions).toBeGreaterThan(0);
      expect(result.stats.plants).toBeGreaterThan(0);
    }, 10000);

    test('should fail tests on missing database', async () => {
      const result = await dbManager.test();
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Database file not found');
    });
  });

  describe('verify()', () => {
    test('should verify valid database', async () => {
      await dbManager.build();
      
      const result = await dbManager.verify();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('ok');
    });

    test('should fail on missing database', async () => {
      const result = await dbManager.verify();
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('ENOENT');
    });
  });

  describe('status()', () => {
    test('should return data freshness information', async () => {
      await dbManager.build();
      
      const result = await dbManager.status();
      
      expect(result.success).toBe(true);
      expect(result.updates).toBeDefined();
      expect(result.lastUpdate).toBeDefined();
      expect(result.daysSinceUpdate).toBeGreaterThanOrEqual(0);
      expect(result.updates.length).toBeGreaterThan(0);
    });

    test('should handle missing database gracefully', async () => {
      const result = await dbManager.status();
      
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('helper methods', () => {
    test('should handle database queries correctly', async () => {
      await dbManager.build();
      
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(testDbPath);
      
      try {
        const result = await dbManager.queryDatabase(db, 'SELECT COUNT(*) as count FROM regions');
        expect(result).toBeDefined();
        expect(result[0]).toHaveProperty('count');
        expect(result[0].count).toBeGreaterThan(0);
        
        const count = await dbManager.getTableCount(db, 'regions');
        expect(count).toBe(result[0].count);
        
      } finally {
        await dbManager.closeDatabase(db);
      }
    });
  });
});