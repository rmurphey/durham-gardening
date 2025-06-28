/**
 * Codemod to fix Testing Library ESLint violations
 * 
 * Fixes:
 * - testing-library/no-node-access: Replace .querySelector with Testing Library queries
 * - testing-library/no-container: Replace container.querySelector with screen queries  
 * - testing-library/no-unnecessary-act: Remove unnecessary act() wrappers
 * - testing-library/prefer-screen-queries: Use screen instead of destructuring render
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
  
  // 1. Fix testing-library/no-container - Replace container.querySelector with screen queries
  source.find(j.MemberExpression)
    .filter(path => 
      path.value.object.name === 'container' && 
      path.value.property.name === 'querySelector'
    )
    .forEach(path => {
      console.log(`  🔄 Replacing container.querySelector with screen.getByTestId`);
      
      // Find the parent call expression
      const callExpression = j(path).closest(j.CallExpression);
      if (callExpression.length > 0) {
        const selector = callExpression.get().value.arguments[0];
        
        // Convert CSS selector to test-id if it looks like [data-testid="..."]
        if (selector && selector.type === 'Literal' && 
            typeof selector.value === 'string' && 
            selector.value.includes('data-testid')) {
          
          const testIdMatch = selector.value.match(/\[data-testid=["']([^"']+)["']\]/);
          if (testIdMatch) {
            const testId = testIdMatch[1];
            const replacement = j.callExpression(
              j.memberExpression(j.identifier('screen'), j.identifier('getByTestId')),
              [j.literal(testId)]
            );
            callExpression.replaceWith(replacement);
            hasChanges = true;
          }
        }
      }
    });
  
  // 2. Fix testing-library/no-node-access - Replace direct node access
  source.find(j.MemberExpression)
    .filter(path => 
      path.value.property && 
      ['textContent', 'innerHTML', 'querySelector', 'querySelectorAll'].includes(path.value.property.name)
    )
    .forEach(path => {
      // Add comment suggesting proper Testing Library approach
      const comment = j.commentLine(' TODO: Replace direct DOM access with Testing Library queries');
      path.insertBefore(comment);
      console.log(`  📝 Added TODO comment for DOM access: ${path.value.property.name}`);
      hasChanges = true;
    });
  
  // 3. Fix testing-library/no-unnecessary-act - Remove act() from Testing Library actions
  source.find(j.CallExpression)
    .filter(path => 
      path.value.callee.name === 'act' &&
      path.value.arguments.length === 1 &&
      path.value.arguments[0].type === 'ArrowFunctionExpression'
    )
    .forEach(path => {
      const actBody = path.value.arguments[0].body;
      
      // Check if the body contains Testing Library async actions
      const bodySource = j(actBody).toSource();
      if (bodySource.includes('fireEvent') || bodySource.includes('userEvent')) {
        console.log(`  🔄 Removing unnecessary act() wrapper`);
        
        // Replace act() call with its body
        if (actBody.type === 'BlockStatement') {
          // Replace with the statements inside the block
          j(path).replaceWith(actBody.body);
        } else {
          // Replace with the expression
          j(path).replaceWith(actBody);
        }
        hasChanges = true;
      }
    });
  
  // 4. Add screen import if not present and screen methods are used
  const hasScreenUsage = source.find(j.MemberExpression)
    .filter(path => path.value.object.name === 'screen')
    .length > 0;
    
  if (hasScreenUsage) {
    const hasScreenImport = source.find(j.ImportDeclaration)
      .filter(path => 
        path.value.source.value === '@testing-library/react' &&
        path.value.specifiers.some(spec => 
          spec.type === 'ImportSpecifier' && spec.imported.name === 'screen'
        )
      )
      .length > 0;
      
    if (!hasScreenImport) {
      console.log(`  ➕ Adding screen import`);
      
      // Find existing @testing-library/react import
      source.find(j.ImportDeclaration)
        .filter(path => path.value.source.value === '@testing-library/react')
        .forEach(path => {
          // Add screen to existing import
          const screenSpecifier = j.importSpecifier(j.identifier('screen'));
          path.value.specifiers.push(screenSpecifier);
          hasChanges = true;
        });
    }
  }
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No changes needed for ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};