#!/usr/bin/env node

/**
 * Pre-commit hook to validate function call signatures
 * Checks that imported functions are called with correct parameter counts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract function signatures from JSDoc
function extractFunctionSignature(content, functionName) {
  const jsdocPattern = new RegExp(
    `/\\*\\*[\\s\\S]*?@param[\\s\\S]*?\\*/[\\s\\S]*?export\\s+const\\s+${functionName}\\s*=\\s*\\(([^)]+)\\)`,
    'g'
  );
  
  const match = jsdocPattern.exec(content);
  if (!match) return null;
  
  const params = match[1].split(',').map(p => p.trim().split('=')[0].trim());
  return params;
}

// Find function calls in a file
function findFunctionCalls(content, functionName) {
  const callPattern = new RegExp(`${functionName}\\s*\\(([^)]*)\\)`, 'g');
  const calls = [];
  let match;
  
  while ((match = callPattern.exec(content)) !== null) {
    const args = match[1] ? match[1].split(',').map(a => a.trim()).filter(a => a) : [];
    calls.push({
      args,
      argCount: args.length,
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return calls;
}

// Main validation
function validateFunctionCalls() {
  const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file.endsWith('.js') && file.startsWith('src/'));
  
  const errors = [];
  
  // Define critical functions to validate
  const functionsToValidate = [
    { name: 'getCriticalTimingWindows', file: 'src/services/dashboardDataService.js', requiresLocation: true },
    { name: 'getReadyToHarvest', file: 'src/services/dashboardDataService.js', requiresLocation: true },
    { name: 'generateLocationTopCrops', file: 'src/services/locationRecommendations.js', requiresLocation: true },
    { name: 'generateLocationMonthlyFocus', file: 'src/services/locationRecommendations.js', requiresLocation: true }
  ];
  
  for (const func of functionsToValidate) {
    if (!fs.existsSync(func.file)) continue;
    
    const definitionContent = fs.readFileSync(func.file, 'utf8');
    const expectedParams = extractFunctionSignature(definitionContent, func.name);
    
    if (!expectedParams) continue;
    
    // Check all files that might call this function
    for (const file of changedFiles) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes(func.name)) continue;
      
      const calls = findFunctionCalls(content, func.name);
      
      for (const call of calls) {
        if (call.argCount !== expectedParams.length) {
          errors.push(
            `${file}:${call.line} - ${func.name} expects ${expectedParams.length} parameters, got ${call.argCount}`
          );
        }
        
        // Additional validation for location-requiring functions
        if (func.requiresLocation && call.argCount > 0) {
          const lastArg = call.args[call.args.length - 1];
          if (!lastArg.includes('locationConfig') && !lastArg.includes('location')) {
            errors.push(
              `${file}:${call.line} - ${func.name} requires locationConfig parameter for location-aware recommendations`
            );
          }
        }
      }
    }
  }
  
  if (errors.length > 0) {
    console.error('Function call validation errors:');
    errors.forEach(error => console.error(`  ${error}`));
    process.exit(1);
  }
  
  console.log('✅ Function call validation passed');
}

if (require.main === module) {
  validateFunctionCalls();
}

module.exports = { validateFunctionCalls };