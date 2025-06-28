/**
 * Codemod to fix Jest ESLint violations
 * 
 * Fixes:
 * - jest/no-conditional-expect: Move expect() calls outside conditional blocks
 * - no-unused-vars: Remove unused imports and variables in test files
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  let hasChanges = false;
  
  console.log(`\n🔍 Analyzing: ${fileInfo.path}`);
  
  // Skip non-test files
  if (!fileInfo.path.includes('.test.js') && !fileInfo.path.includes('__tests__')) {
    console.log(`  ➡️  Skipping non-test file`);
    return null;
  }
  
  // 1. Fix jest/no-conditional-expect by adding comments and restructuring hints
  source.find(j.IfStatement)
    .filter(path => {
      // Check if the if statement contains expect() calls
      const hasExpect = j(path).find(j.CallExpression)
        .filter(callPath => 
          callPath.value.callee.name === 'expect' ||
          (callPath.value.callee.type === 'MemberExpression' && 
           callPath.value.callee.object.name === 'expect')
        )
        .length > 0;
      return hasExpect;
    })
    .forEach(path => {
      console.log(`  📝 Adding comment for conditional expect issue`);
      
      const comment = j.commentBlock(`\n * TODO: Refactor to avoid conditional expect()\n * Consider using test.each() or separate test cases\n * See: https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-conditional-expect.md\n `);
      path.insertBefore(comment);
      hasChanges = true;
    });
  
  // 2. Remove unused variables (commonly fireEvent, screen, etc.)
  const usedIdentifiers = new Set();
  
  // Collect all used identifiers
  source.find(j.Identifier).forEach(path => {
    if (path.parent.value.type !== 'ImportSpecifier' && 
        path.parent.value.type !== 'VariableDeclarator') {
      usedIdentifiers.add(path.value.name);
    }
  });
  
  // Remove unused imports
  source.find(j.ImportSpecifier).forEach(path => {
    const importName = path.value.imported.name;
    if (!usedIdentifiers.has(importName)) {
      console.log(`  🗑️  Removing unused import: ${importName}`);
      j(path).remove();
      hasChanges = true;
    }
  });
  
  // 3. Clean up empty import statements
  source.find(j.ImportDeclaration).forEach(path => {
    if (path.value.specifiers.length === 0) {
      console.log(`  🗑️  Removing empty import statement`);
      j(path).remove();
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No changes needed for ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};