/**
 * Quick test script to verify no placeholders remain in templates
 */

const { databaseService } = require('./src/services/databaseService.js');

// Create test service instance
const service = new (databaseService.constructor)();

// Wait for initialization and test templates
setTimeout(() => {
  console.log('Testing rotation templates...');
  
  const rotationTemplates = service.rotationTemplates || [];
  console.log(`Found ${rotationTemplates.length} rotation templates`);
  
  rotationTemplates.forEach((template, index) => {
    const result = service.generateActionText(template);
    console.log(`Template ${index}: "${result}"`);
    
    const placeholders = result.match(/\{[^}]+\}/g);
    if (placeholders) {
      console.error(`❌ FAIL: Template ${index} contains placeholders: ${placeholders.join(', ')}`);
    } else {
      console.log(`✅ PASS: No placeholders found`);
    }
  });
  
  console.log('\nTesting succession templates...');
  const successionTemplates = service.successionTemplates || [];
  console.log(`Found ${successionTemplates.length} succession templates`);
  
  successionTemplates.forEach((template, index) => {
    const result = service.generateActionText(template);
    console.log(`Template ${index}: "${result}"`);
    
    const placeholders = result.match(/\{[^}]+\}/g);
    if (placeholders) {
      console.error(`❌ FAIL: Template ${index} contains placeholders: ${placeholders.join(', ')}`);
    } else {
      console.log(`✅ PASS: No placeholders found`);
    }
  });
  
  process.exit(0);
}, 1000);