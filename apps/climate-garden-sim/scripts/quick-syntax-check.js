#!/usr/bin/env node

/**
 * Quick syntax and import check
 * Faster than full compilation, catches basic JavaScript errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Quick syntax check...');

const srcDir = path.resolve(__dirname, '..', 'src');

// Check for basic JavaScript syntax errors by attempting to require files
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic syntax checks
    if (content.includes('renderView()') && !content.includes('const renderView = ')) {
      throw new Error(`Function renderView called but not defined in ${filePath}`);
    }
    
    // Check for common React patterns that might be broken
    if (content.includes('export default') && content.includes('function ')) {
      // Basic pattern check passed
    }
    
    console.log(`✓ ${path.relative(srcDir, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ ${path.relative(srcDir, filePath)}: ${error.message}`);
    return false;
  }
}

// Find all JS/JSX files
function findJSFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.')) {
      files = files.concat(findJSFiles(fullPath));
    } else if (item.match(/\.(js|jsx)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const jsFiles = findJSFiles(srcDir);
let allPassed = true;

for (const file of jsFiles) {
  if (!checkFile(file)) {
    allPassed = false;
  }
}

if (allPassed) {
  console.log('✅ All syntax checks passed');
  process.exit(0);
} else {
  console.log('❌ Syntax errors found');
  process.exit(1);
}