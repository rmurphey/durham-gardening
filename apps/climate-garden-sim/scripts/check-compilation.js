#!/usr/bin/env node

/**
 * Pre-commit compilation check
 * This script verifies that React app compiles without errors
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Checking React compilation...');

try {
  // Run a quick compilation check
  execSync('npm run build', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    timeout: 60000 // 1 minute timeout
  });
  
  console.log('✅ React app compiles successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ React compilation failed');
  console.error('Error:', error.message);
  process.exit(1);
}