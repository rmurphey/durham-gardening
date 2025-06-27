#!/usr/bin/env node

/**
 * Example AST-aware refactoring script using jscodeshift
 * Demonstrates proper function signature updates
 */

const jscodeshift = require('jscodeshift');
const fs = require('fs');

// Example codemod to add locationConfig parameter to function calls
const addLocationConfigParam = (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  
  // Find function calls to specific functions
  const targetFunctions = ['getCriticalTimingWindows', 'getReadyToHarvest'];
  
  root.find(j.CallExpression)
    .filter(path => {
      const callee = path.value.callee;
      return callee.type === 'Identifier' && 
             targetFunctions.includes(callee.name);
    })
    .forEach(path => {
      const args = path.value.arguments;
      
      // Check if locationConfig is already present
      const hasLocationConfig = args.some(arg => 
        arg.type === 'Identifier' && 
        arg.name === 'locationConfig'
      );
      
      if (!hasLocationConfig) {
        // Add locationConfig as last parameter
        args.push(j.identifier('locationConfig'));
      }
    });
  
  return root.toSource();
};

// Example usage:
// npx jscodeshift -t scripts/ast-refactor-example.js src/components/**/*.js

module.exports = addLocationConfigParam;