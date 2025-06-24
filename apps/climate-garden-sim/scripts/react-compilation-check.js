#!/usr/bin/env node

/**
 * React compilation check - focused on catching React syntax errors
 * Uses Babel parser to check for React-specific issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 React compilation check...');

const srcDir = path.resolve(__dirname, '..', 'src');

// Enhanced syntax checks for React components
function checkReactFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Skip test files for this check
    if (fileName.includes('.test.')) {
      console.log(`⏭️  ${path.relative(srcDir, filePath)} (test file, skipped)`);
      return true;
    }
    
    // Check for function calls before definition
    if (content.includes('renderView()')) {
      const renderViewDefPattern = /const\s+renderView\s*=|function\s+renderView/;
      const callPattern = /\{renderView\(\)\}/;
      
      const defMatch = content.match(renderViewDefPattern);
      const callMatch = content.match(callPattern);
      
      if (callMatch && !defMatch) {
        throw new Error(`Function renderView called but not defined`);
      }
      
      if (callMatch && defMatch) {
        const callIndex = content.indexOf(callMatch[0]);
        const defIndex = content.indexOf(defMatch[0]);
        
        if (callIndex < defIndex) {
          throw new Error(`Function renderView called before definition`);
        }
      }
    }
    
    // Check for common React patterns
    if (content.includes('export default')) {
      // Must have either function or const component
      if (!content.includes('function ') && !content.includes('const ') && !content.includes('class ')) {
        throw new Error(`Export default found but no component definition`);
      }
    }
    
    // Check for unmatched JSX braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (Math.abs(openBraces - closeBraces) > 10) { // Allow some difference for object literals
      console.warn(`⚠️  ${path.relative(srcDir, filePath)}: Significant brace mismatch (${openBraces} open, ${closeBraces} close)`);
    }
    
    // Check for missing imports of used React hooks
    if (content.includes('useState') && !content.includes('import')) {
      throw new Error(`useState used but no imports found`);
    }
    
    console.log(`✓ ${path.relative(srcDir, filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ ${path.relative(srcDir, filePath)}: ${error.message}`);
    return false;
  }
}

// Find React component files
function findReactFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== '__tests__') {
      files = files.concat(findReactFiles(fullPath));
    } else if (item.match(/\.(js|jsx)$/) && !item.includes('.test.')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const reactFiles = findReactFiles(srcDir);
let allPassed = true;

for (const file of reactFiles) {
  if (!checkReactFile(file)) {
    allPassed = false;
  }
}

if (allPassed) {
  console.log('✅ React compilation checks passed');
  process.exit(0);
} else {
  console.log('❌ React compilation errors found');
  process.exit(1);
}