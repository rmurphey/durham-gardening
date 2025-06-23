#!/usr/bin/env node
/**
 * Climate Garden Simulation - Database CLI
 * Command-line interface for database operations
 */

const DatabaseManager = require('./database-manager');
const path = require('path');

class DatabaseCLI {
  constructor() {
    this.dbManager = new DatabaseManager();
  }

  async run() {
    const command = process.argv[2];
    
    try {
      switch (command) {
        case 'build':
          await this.build();
          break;
        case 'test':
          await this.test();
          break;
        case 'verify':
          await this.verify();
          break;
        case 'status':
          await this.status();
          break;
        case 'update':
          await this.update();
          break;
        default:
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }

  async build() {
    console.log('🔨 Building Climate Garden Simulation Database...\n');
    
    const results = await this.dbManager.build();
    
    if (results.success) {
      console.log('✅ Database build completed successfully!\n');
      
      console.log('📋 Build Steps:');
      results.steps.forEach(step => console.log(`  ✓ ${step}`));
      
      console.log(`\n⏱️  Build time: ${results.duration}ms`);
      
      // Show database stats
      await this.showStats();
      
    } else {
      console.log('❌ Database build failed!\n');
      
      console.log('🚫 Errors:');
      results.errors.forEach(error => console.log(`  ✗ ${error}`));
      
      if (results.steps.length > 0) {
        console.log('\n📋 Completed Steps:');
        results.steps.forEach(step => console.log(`  ✓ ${step}`));
      }
      
      process.exit(1);
    }
  }

  async test() {
    console.log('🧪 Testing Climate Garden Simulation Database...\n');
    
    const results = await this.dbManager.test();
    
    if (results.success) {
      console.log('✅ All database tests passed!\n');
    } else {
      console.log('❌ Database tests failed!\n');
    }
    
    // Show test results
    console.log('📊 Test Results:');
    console.log('===============');
    
    let passed = 0;
    let failed = 0;
    
    results.tests.forEach(test => {
      if (test.passed) {
        passed++;
        const valueInfo = test.value !== undefined ? ` (${test.value})` : '';
        console.log(`  ✓ ${test.name}${valueInfo}`);
      } else {
        failed++;
        console.log(`  ✗ ${test.name}: ${test.error}`);
      }
    });
    
    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
    
    if (Object.keys(results.stats).length > 0) {
      console.log('\n📊 Database Statistics:');
      Object.entries(results.stats).forEach(([table, count]) => {
        console.log(`  ${table}: ${count}`);
      });
    }
    
    console.log(`\n⏱️  Test time: ${results.duration}ms`);
    
    if (!results.success) {
      console.log('\n🚫 Errors:');
      results.errors.forEach(error => console.log(`  ✗ ${error}`));
      process.exit(1);
    }
  }

  async verify() {
    console.log('🔍 Verifying database integrity...');
    
    const result = await this.dbManager.verify();
    
    if (result.success) {
      console.log('✅ Database integrity verified successfully');
    } else {
      console.log('❌ Database integrity check failed:', result.message);
      process.exit(1);
    }
  }

  async status() {
    console.log('📊 Database Status Report\n');
    
    const result = await this.dbManager.status();
    
    if (result.success) {
      console.log(`📅 Last Updated: ${result.lastUpdate}`);
      console.log(`⏰ Days Since Update: ${Math.round(result.daysSinceUpdate * 10) / 10}\n`);
      
      console.log('📋 Update History:');
      result.updates.forEach(update => {
        const daysAgo = Math.round(update.days_since_update * 10) / 10;
        console.log(`  • ${update.update_type}: ${update.description}`);
        console.log(`    Updated: ${update.updated_at} (${daysAgo} days ago)`);
      });
      
      // Freshness warning
      if (result.daysSinceUpdate > 30) {
        console.log('\n⚠️  Warning: Database is more than 30 days old. Consider updating.');
      } else if (result.daysSinceUpdate > 7) {
        console.log('\n💡 Info: Database is more than 7 days old.');
      } else {
        console.log('\n✅ Database is current.');
      }
      
    } else {
      console.log('❌ Could not retrieve status:', result.message);
      process.exit(1);
    }
  }

  async update() {
    console.log('🔄 Running full database update cycle...\n');
    
    // Build first
    await this.build();
    
    console.log('\n');
    
    // Then test
    await this.test();
    
    console.log('\n✅ Database update completed successfully!');
  }

  async showStats() {
    try {
      const testResults = await this.dbManager.test();
      
      if (testResults.stats && Object.keys(testResults.stats).length > 0) {
        console.log('\n📊 Database Statistics:');
        Object.entries(testResults.stats).forEach(([table, count]) => {
          console.log(`  ${table}: ${count}`);
        });
      }
      
      // Get file size
      const fs = require('fs').promises;
      try {
        const stats = await fs.stat(this.dbManager.dbPath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`\n💾 Database size: ${sizeKB}KB`);
      } catch (err) {
        // Ignore file size errors
      }
      
    } catch (error) {
      // Ignore stats errors during build
    }
  }

  showHelp() {
    console.log(`
🌱 Climate Garden Simulation - Database Manager

Usage: node scripts/database.js <command>

Commands:
  build    Build database from source SQL files
  test     Run comprehensive database tests
  verify   Quick database integrity check
  status   Show data freshness and update history
  update   Full rebuild and test cycle

Examples:
  node scripts/database.js build
  node scripts/database.js test
  node scripts/database.js update

NPM Scripts:
  npm run db:build    - Build database
  npm run db:test     - Run tests
  npm run db:verify   - Verify integrity
  npm run db:status   - Check status
  npm run db:update   - Full update cycle
`);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new DatabaseCLI();
  cli.run().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = DatabaseCLI;