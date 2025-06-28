/**
 * AST Codemod: Fix nav-badge querySelector patterns
 * 
 * Transforms:
 * const badge = linkElement.querySelector('.nav-badge');
 * expect(badge).toBeInTheDocument();
 * 
 * Into:
 * expect(within(linkElement).queryByTestId('nav-badge')).toBeInTheDocument();
 * 
 * Or for negative assertions:
 * expect(badge).not.toBeInTheDocument();
 * Into:
 * expect(within(linkElement).queryByTestId('nav-badge')).not.toBeInTheDocument();
 * 
 * USAGE HISTORY:
 * - 2025-06-28: Tested on Navigation.test.js (Commit: 161e146)
 *   - Result: FAILED - TypeError: Received an unexpected value [object Object]
 *   - Files processed: 1
 *   - Changes made: 0 (transformation error)
 *   - Time: 0.331s
 *   - Issue: Complex AST manipulation of variable declarations + expect statement patterns
 *   - Resolution: Used manual approach instead - successfully fixed 8 nav-badge patterns
 *   - Learning: AST struggles with multi-statement transformations, manual approach more reliable
 *   - Associated commit: "Continue systematic Testing Library cleanup: 97→77 warnings (-21%)"
 *   - Manual fixes included: querySelector('.nav-badge') → within(link).getByText(badgeText)
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  let hasChanges = false;
  let needsWithinImport = false;
  
  console.log(`\n🔍 Processing: ${fileInfo.path}`);
  
  // Skip non-test files
  if (!fileInfo.path.includes('.test.js') && !fileInfo.path.includes('__tests__')) {
    console.log(`  ➡️  Skipping non-test file`);
    return null;
  }
  
  // Find variable declarations for querySelector('.nav-badge')
  source.find(j.VariableDeclarator, {
    init: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        property: { name: 'querySelector' }
      },
      arguments: [{ value: '.nav-badge' }]
    }
  }).forEach(path => {
    const declarator = path.value;
    const variableName = declarator.id.name;
    const objectName = declarator.init.callee.object.name;
    
    console.log(`  🔄 Found nav-badge querySelector: ${variableName} = ${objectName}.querySelector('.nav-badge')`);
    
    // Find all expect statements using this variable
    const parentFunction = j(path).closest(j.Function);
    if (parentFunction.length === 0) return;
    
    // Look for expect statements in the same function
    j(parentFunction).find(j.CallExpression, {
      callee: { name: 'expect' },
      arguments: [{ name: variableName }]
    }).forEach(expectPath => {
      const expectCall = expectPath.value;
      
      // Check if it's a .toBeInTheDocument() or .not.toBeInTheDocument() call
      const parent = expectPath.parent;
      if (parent.value.type === 'MemberExpression') {
        const methodChain = parent.value;
        if (methodChain.property.name === 'toBeInTheDocument' ||
            (methodChain.object.type === 'MemberExpression' && 
             methodChain.object.property.name === 'not' && 
             methodChain.property.name === 'toBeInTheDocument')) {
          
          console.log(`  🔄 Replacing expect(${variableName}) assertion`);
          
          // Create within(objectName).queryByTestId('nav-badge')
          const withinCall = j.callExpression(
            j.identifier('within'),
            [j.identifier(objectName)]
          );
          
          const queryCall = j.callExpression(
            j.memberExpression(withinCall, j.identifier('queryByTestId')),
            [j.literal('nav-badge')]
          );
          
          // Replace the argument to expect()
          expectCall.arguments[0] = queryCall;
          needsWithinImport = true;
          hasChanges = true;
        }
      }
    });
    
    // Remove the variable declaration entirely
    console.log(`  🗑️  Removing variable declaration: ${variableName}`);
    j(path.parent).remove();
    hasChanges = true;
  });
  
  // Add within import if needed
  if (needsWithinImport) {
    // Check if within is already imported
    const testingLibraryImport = source.find(j.ImportDeclaration, {
      source: { value: '@testing-library/react' }
    });
    
    if (testingLibraryImport.length > 0) {
      const importSpecifiers = testingLibraryImport.find(j.ImportSpecifier);
      const hasWithin = importSpecifiers.some(spec => spec.value.imported.name === 'within');
      
      if (!hasWithin) {
        console.log(`  📦 Adding 'within' to existing import`);
        const existingSpecifiers = testingLibraryImport.get(0).value.specifiers;
        existingSpecifiers.push(j.importSpecifier(j.identifier('within')));
        hasChanges = true;
      }
    }
  }
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No nav-badge patterns found in ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};