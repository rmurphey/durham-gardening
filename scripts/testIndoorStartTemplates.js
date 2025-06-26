/**
 * Direct database test for indoor start templates
 * Tests the actual database without mocking
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/plant_varieties.db');

async function testIndoorStartTemplates() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(new Error(`Failed to open database: ${err.message}`));
        return;
      }
      console.log('✅ Connected to database');
    });

    const tests = [];
    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Indoor Starting activity type exists
    tests.push(new Promise((resolve, reject) => {
      totalTests++;
      db.get(`
        SELECT id, type_key, name, default_priority 
        FROM activity_types 
        WHERE type_key = 'indoor-starting'
      `, (err, row) => {
        if (err) {
          console.log('❌ Test 1 Failed: Activity type query error:', err.message);
          reject(err);
        } else if (!row) {
          console.log('❌ Test 1 Failed: Indoor Starting activity type not found');
          reject(new Error('Activity type not found'));
        } else {
          console.log('✅ Test 1 Passed: Indoor Starting activity type exists');
          console.log(`   ID: ${row.id}, Priority: ${row.default_priority}`);
          passedTests++;
          resolve();
        }
      });
    }));

    // Test 2: Indoor start templates exist for major crops
    tests.push(new Promise((resolve, reject) => {
      totalTests++;
      db.all(`
        SELECT 
          p.plant_key,
          COUNT(*) as template_count,
          MIN(at.month) as earliest_month,
          MAX(at.month) as latest_month
        FROM activity_templates at
        JOIN plants p ON at.plant_id = p.id
        JOIN activity_types aty ON at.activity_type_id = aty.id
        WHERE aty.type_key = 'indoor-starting'
        GROUP BY p.plant_key
        ORDER BY p.plant_key
      `, (err, rows) => {
        if (err) {
          console.log('❌ Test 2 Failed: Template query error:', err.message);
          reject(err);
        } else {
          const expectedCrops = ['basil', 'eggplant', 'hot_peppers', 'sweet_peppers', 'tomatoes'];
          const foundCrops = rows.map(r => r.plant_key);
          
          const missingCrops = expectedCrops.filter(crop => !foundCrops.includes(crop));
          
          if (missingCrops.length > 0) {
            console.log('❌ Test 2 Failed: Missing crops:', missingCrops);
            reject(new Error('Missing crops'));
          } else {
            console.log('✅ Test 2 Passed: All major crops have indoor start templates');
            rows.forEach(row => {
              console.log(`   ${row.plant_key}: ${row.template_count} templates (months ${row.earliest_month}-${row.latest_month})`);
            });
            passedTests++;
            resolve();
          }
        }
      });
    }));

    // Test 3: Template data integrity
    tests.push(new Promise((resolve, reject) => {
      totalTests++;
      db.all(`
        SELECT 
          at.id,
          p.plant_key,
          at.month,
          at.priority,
          at.estimated_cost_min,
          at.estimated_cost_max,
          at.timing_template,
          LENGTH(at.variety_suggestions) as varieties_length,
          LENGTH(at.supplier_preferences) as suppliers_length
        FROM activity_templates at
        JOIN plants p ON at.plant_id = p.id
        JOIN activity_types aty ON at.activity_type_id = aty.id
        WHERE aty.type_key = 'indoor-starting'
      `, (err, rows) => {
        if (err) {
          console.log('❌ Test 3 Failed: Data integrity query error:', err.message);
          reject(err);
        } else {
          let allValid = true;
          const issues = [];
          
          rows.forEach(row => {
            // Check month range
            if (row.month < 1 || row.month > 12) {
              issues.push(`${row.plant_key}: Invalid month ${row.month}`);
              allValid = false;
            }
            
            // Check priority values
            if (!['low', 'medium', 'high', 'critical'].includes(row.priority)) {
              issues.push(`${row.plant_key}: Invalid priority ${row.priority}`);
              allValid = false;
            }
            
            // Check cost data
            if (row.estimated_cost_min <= 0 || row.estimated_cost_max < row.estimated_cost_min) {
              issues.push(`${row.plant_key}: Invalid cost data ${row.estimated_cost_min}-${row.estimated_cost_max}`);
              allValid = false;
            }
            
            // Check timing template
            if (!row.timing_template || !row.timing_template.includes('frost')) {
              issues.push(`${row.plant_key}: Missing or invalid timing template`);
              allValid = false;
            }
            
            // Check JSON fields
            if (row.varieties_length < 10 || row.suppliers_length < 10) {
              issues.push(`${row.plant_key}: JSON fields appear too short`);
              allValid = false;
            }
          });
          
          if (!allValid) {
            console.log('❌ Test 3 Failed: Data integrity issues:');
            issues.forEach(issue => console.log(`   ${issue}`));
            reject(new Error('Data integrity issues'));
          } else {
            console.log('✅ Test 3 Passed: All template data is valid');
            console.log(`   Validated ${rows.length} templates`);
            passedTests++;
            resolve();
          }
        }
      });
    }));

    // Test 4: JSON field parsing
    tests.push(new Promise((resolve, reject) => {
      totalTests++;
      db.get(`
        SELECT 
          variety_suggestions,
          supplier_preferences,
          bed_size_requirements,
          conditions
        FROM activity_templates at
        JOIN activity_types aty ON at.activity_type_id = aty.id
        WHERE aty.type_key = 'indoor-starting'
        LIMIT 1
      `, (err, row) => {
        if (err) {
          console.log('❌ Test 4 Failed: JSON query error:', err.message);
          reject(err);
        } else {
          try {
            const varieties = JSON.parse(row.variety_suggestions);
            const suppliers = JSON.parse(row.supplier_preferences);
            const bedRequirements = JSON.parse(row.bed_size_requirements);
            const conditions = JSON.parse(row.conditions);
            
            // Validate structure
            if (!Array.isArray(varieties) || varieties.length === 0) {
              throw new Error('Invalid varieties array');
            }
            
            if (!Array.isArray(suppliers) || suppliers.length === 0) {
              throw new Error('Invalid suppliers array');
            }
            
            if (typeof bedRequirements !== 'object' || !bedRequirements.space) {
              throw new Error('Invalid bed requirements object');
            }
            
            if (typeof conditions !== 'object' || !conditions.temperature) {
              throw new Error('Invalid conditions object');
            }
            
            console.log('✅ Test 4 Passed: JSON fields parse correctly');
            console.log(`   Varieties: ${varieties.join(', ')}`);
            console.log(`   Suppliers: ${suppliers.join(', ')}`);
            console.log(`   Temperature: ${conditions.temperature}`);
            passedTests++;
            resolve();
            
          } catch (parseError) {
            console.log('❌ Test 4 Failed: JSON parsing error:', parseError.message);
            reject(parseError);
          }
        }
      });
    }));

    // Test 5: Priority and timing consistency
    tests.push(new Promise((resolve, reject) => {
      totalTests++;
      db.all(`
        SELECT month, priority, timing_template
        FROM activity_templates at
        JOIN activity_types aty ON at.activity_type_id = aty.id
        WHERE aty.type_key = 'indoor-starting'
        ORDER BY month
      `, (err, rows) => {
        if (err) {
          console.log('❌ Test 5 Failed: Consistency query error:', err.message);
          reject(err);
        } else {
          let consistencyValid = true;
          const issues = [];
          
          // Early season (Feb/Mar) should be high priority
          const earlyTemplates = rows.filter(r => r.month <= 3);
          const lateTemplates = rows.filter(r => r.month >= 4);
          
          earlyTemplates.forEach(template => {
            if (template.priority !== 'high' && template.priority !== 'medium') {
              issues.push(`Month ${template.month}: Expected high/medium priority, got ${template.priority}`);
              consistencyValid = false;
            }
          });
          
          // All should reference frost timing
          rows.forEach(template => {
            if (!template.timing_template.toLowerCase().includes('frost')) {
              issues.push(`Month ${template.month}: Timing should reference frost`);
              consistencyValid = false;
            }
          });
          
          if (!consistencyValid) {
            console.log('❌ Test 5 Failed: Priority/timing consistency issues:');
            issues.forEach(issue => console.log(`   ${issue}`));
            reject(new Error('Consistency issues'));
          } else {
            console.log('✅ Test 5 Passed: Priority and timing are consistent');
            console.log(`   Early templates: ${earlyTemplates.length}, Late templates: ${lateTemplates.length}`);
            passedTests++;
            resolve();
          }
        }
      });
    }));

    // Run all tests
    Promise.all(tests)
      .then(() => {
        console.log('\n🎉 All tests passed!');
        console.log(`✅ ${passedTests}/${totalTests} tests successful`);
        db.close();
        resolve({
          success: true,
          passedTests,
          totalTests,
          message: 'All indoor start template tests passed'
        });
      })
      .catch((error) => {
        console.log('\n❌ Some tests failed');
        console.log(`✅ ${passedTests}/${totalTests} tests successful`);
        db.close();
        reject({
          success: false,
          passedTests,
          totalTests,
          error: error.message
        });
      });
  });
}

// Run the tests
if (require.main === module) {
  testIndoorStartTemplates()
    .then(result => {
      console.log('\n📊 Test Summary:', result.message);
      process.exit(0);
    })
    .catch(result => {
      console.log('\n📊 Test Summary:', result.error);
      process.exit(1);
    });
}

module.exports = testIndoorStartTemplates;