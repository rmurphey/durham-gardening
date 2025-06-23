/**
 * Climate Garden Simulation - Database Manager
 * Node.js-based database automation with comprehensive error handling
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
  constructor(dbPath = 'database/plant_varieties.db') {
    this.dbPath = dbPath;
    this.sqlDir = 'database';
  }

  /**
   * Execute SQL file with proper error handling
   */
  async executeSqlFile(db, filePath) {
    try {
      const sql = await fs.readFile(filePath, 'utf8');
      
      return new Promise((resolve, reject) => {
        // Use exec for multi-statement SQL
        db.exec(sql, (err) => {
          if (err) {
            reject(new Error(`SQL Error in ${path.basename(filePath)}: ${err.message}`));
            return;
          }
          resolve();
        });
      });
    } catch (error) {
      throw new Error(`Failed to read SQL file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Build database from source files
   */
  async build() {
    const results = {
      success: false,
      steps: [],
      errors: [],
      duration: 0
    };
    
    const startTime = Date.now();
    
    try {
      // Remove existing database
      try {
        await fs.unlink(this.dbPath);
        results.steps.push('Removed existing database');
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        results.steps.push('No existing database to remove');
      }

      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      await fs.mkdir(dbDir, { recursive: true });

      const db = new sqlite3.Database(this.dbPath);

      // Execute SQL files in order
      const sqlFiles = [
        'create_plant_database.sql',
        'populate_data.sql',
        'add_growing_tips.sql',
        'add_companion_plants.sql',
        'update_data.sql'
      ];

      for (const sqlFile of sqlFiles) {
        const filePath = path.join(this.sqlDir, sqlFile);
        await this.executeSqlFile(db, filePath);
        results.steps.push(`Executed ${sqlFile}`);
      }

      // Close database connection
      await new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      results.steps.push('Database build completed successfully');
      results.success = true;
      
    } catch (error) {
      results.errors.push(error.message);
      results.success = false;
    }
    
    results.duration = Date.now() - startTime;
    return results;
  }

  /**
   * Comprehensive database testing
   */
  async test() {
    const results = {
      success: false,
      tests: [],
      errors: [],
      stats: {},
      duration: 0
    };
    
    const startTime = Date.now();

    try {
      // Check if database exists
      try {
        await fs.access(this.dbPath);
        results.tests.push({ name: 'Database file exists', passed: true });
      } catch (err) {
        results.tests.push({ name: 'Database file exists', passed: false, error: 'Database file not found' });
        results.errors.push('Database file not found. Run build first.');
        return results;
      }

      const db = new sqlite3.Database(this.dbPath);

      // Test 1: Database integrity
      const integrityResult = await this.queryDatabase(db, "PRAGMA integrity_check;");
      const integrityPassed = integrityResult[0]?.integrity_check === 'ok';
      results.tests.push({ 
        name: 'Database integrity', 
        passed: integrityPassed,
        error: integrityPassed ? null : 'Integrity check failed'
      });

      if (!integrityPassed) {
        results.errors.push('Database integrity check failed');
        await this.closeDatabase(db);
        return results;
      }

      // Test 2: Table counts
      const tableTests = [
        { table: 'regions', min: 2, description: 'Regions (US, CA)' },
        { table: 'plants', min: 15, description: 'Plant varieties' },
        { table: 'plant_names', min: 15, description: 'Plant names' },
        { table: 'growing_tips', min: 50, description: 'Growing tips' },
        { table: 'companion_plants', min: 40, description: 'Companion relationships' },
        { table: 'market_prices', min: 25, description: 'Market prices' }
      ];

      for (const test of tableTests) {
        const count = await this.getTableCount(db, test.table);
        const passed = count >= test.min;
        results.tests.push({
          name: `${test.description} count`,
          passed,
          value: count,
          expected: `>= ${test.min}`,
          error: passed ? null : `Expected at least ${test.min}, got ${count}`
        });
        
        if (!passed) {
          results.errors.push(`Insufficient ${test.description}: ${count} < ${test.min}`);
        }
        
        results.stats[test.table] = count;
      }

      // Test 3: View functionality
      const viewTests = [
        { view: 'plant_details', min: 15, description: 'Plant details view' },
        { view: 'regional_planting_calendar', min: 30, description: 'Planting calendar' },
        { view: 'plant_market_data', min: 25, description: 'Market data view' }
      ];

      for (const test of viewTests) {
        try {
          const count = await this.getTableCount(db, test.view);
          const passed = count >= test.min;
          results.tests.push({
            name: `${test.description} functionality`,
            passed,
            value: count,
            expected: `>= ${test.min}`,
            error: passed ? null : `View returned insufficient data: ${count} < ${test.min}`
          });
          
          if (!passed) {
            results.errors.push(`View ${test.view} insufficient data: ${count} < ${test.min}`);
          }
        } catch (error) {
          results.tests.push({
            name: `${test.description} functionality`,
            passed: false,
            error: `View query failed: ${error.message}`
          });
          results.errors.push(`View ${test.view} failed: ${error.message}`);
        }
      }

      // Test 4: Data completeness
      const completenessTests = [
        {
          name: 'Plants without English names',
          query: `SELECT COUNT(*) as count FROM plants p WHERE NOT EXISTS (
            SELECT 1 FROM plant_names pn WHERE pn.plant_id = p.id AND pn.language = 'en'
          )`,
          expected: 0
        },
        {
          name: 'Heat-tolerant plants',
          query: `SELECT COUNT(*) as count FROM plants p 
                  JOIN plant_categories pc ON p.category_id = pc.id 
                  WHERE pc.category_key = 'heat_tolerant'`,
          expected: 4,
          operator: '>='
        },
        {
          name: 'Cool-season plants',
          query: `SELECT COUNT(*) as count FROM plants p 
                  JOIN plant_categories pc ON p.category_id = pc.id 
                  WHERE pc.category_key = 'cool_season'`,
          expected: 5,
          operator: '>='
        },
        {
          name: 'Perennial herbs',
          query: `SELECT COUNT(*) as count FROM plants p 
                  JOIN plant_categories pc ON p.category_id = pc.id 
                  WHERE pc.category_key = 'perennials'`,
          expected: 4,
          operator: '>='
        }
      ];

      for (const test of completenessTests) {
        try {
          const result = await this.queryDatabase(db, test.query);
          const count = result[0]?.count || 0;
          const operator = test.operator || '===';
          let passed;
          
          switch (operator) {
            case '>=':
              passed = count >= test.expected;
              break;
            case '===':
            default:
              passed = count === test.expected;
              break;
          }
          
          results.tests.push({
            name: test.name,
            passed,
            value: count,
            expected: `${operator} ${test.expected}`,
            error: passed ? null : `Expected ${operator} ${test.expected}, got ${count}`
          });
          
          if (!passed) {
            results.errors.push(`${test.name}: expected ${operator} ${test.expected}, got ${count}`);
          }
        } catch (error) {
          results.tests.push({
            name: test.name,
            passed: false,
            error: `Query failed: ${error.message}`
          });
          results.errors.push(`${test.name} query failed: ${error.message}`);
        }
      }

      await this.closeDatabase(db);
      
      results.success = results.errors.length === 0;
      
    } catch (error) {
      results.errors.push(`Test execution failed: ${error.message}`);
      results.success = false;
    }
    
    results.duration = Date.now() - startTime;
    return results;
  }

  /**
   * Quick database verification
   */
  async verify() {
    try {
      await fs.access(this.dbPath);
      const db = new sqlite3.Database(this.dbPath);
      const result = await this.queryDatabase(db, "PRAGMA integrity_check;");
      await this.closeDatabase(db);
      
      return {
        success: result[0]?.integrity_check === 'ok',
        message: result[0]?.integrity_check || 'Unknown error'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get data freshness status
   */
  async status() {
    try {
      const db = new sqlite3.Database(this.dbPath);
      const updates = await this.queryDatabase(db, `
        SELECT update_type, description, updated_at,
               julianday('now') - julianday(updated_at) as days_since_update
        FROM data_updates 
        ORDER BY updated_at DESC
      `);
      await this.closeDatabase(db);
      
      return {
        success: true,
        updates,
        lastUpdate: updates[0]?.updated_at,
        daysSinceUpdate: updates[0]?.days_since_update
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Helper methods
  async queryDatabase(db, sql) {
    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getTableCount(db, tableName) {
    const result = await this.queryDatabase(db, `SELECT COUNT(*) as count FROM ${tableName}`);
    return result[0]?.count || 0;
  }

  async closeDatabase(db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = DatabaseManager;