/**
 * AST Codemod: Remove unnecessary act() wrappers
 * 
 * Transforms:
 * await act(async () => {
 *   render(<Component />);
 * });
 * 
 * Into:
 * render(<Component />);
 * 
 * Also handles:
 * act(() => { Testing Library calls })
 * 
 * USAGE HISTORY:
 * - 2025-06-28: Applied to GardenRoute.test.js (Commit: 2483ae0)
 *   - Result: SUCCESS - Removed 5 unnecessary act() wrappers around render() calls
 *   - Files processed: 1
 *   - Changes made: 5 transformations
 *   - Time: 0.218s
 *   - Validation: AST approach works perfectly for simple act() removal patterns
 *   - Note: Required minor manual cleanup of double semicolons from transformation
 *   - Associated commit: "AST codemod success: Fix unnecessary act() wrappers (59→54 warnings, -8%)"
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  let hasChanges = false;
  
  console.log(`\n🔍 Processing: ${fileInfo.path}`);
  
  // Skip non-test files
  if (!fileInfo.path.includes('.test.js') && !fileInfo.path.includes('__tests__')) {
    console.log(`  ➡️  Skipping non-test file`);
    return null;
  }
  
  // Find act() calls
  source.find(j.CallExpression, {
    callee: { name: 'act' }
  }).forEach(path => {
    const actCall = path.value;
    if (actCall.arguments.length === 1) {
      const callback = actCall.arguments[0];
      
      // Check if it's an arrow function or function expression
      if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
        const body = callback.body;
        
        // Convert to source to check for Testing Library calls
        const bodySource = j(body).toSource();
        if (bodySource.includes('render') || 
            bodySource.includes('fireEvent') || 
            bodySource.includes('userEvent') ||
            bodySource.includes('screen.')) {
          
          console.log(`  🔄 Removing unnecessary act() wrapper around Testing Library calls`);
          
          if (body.type === 'BlockStatement') {
            // Check if parent is an await expression
            const parentPath = path.parent;
            if (parentPath.value.type === 'AwaitExpression') {
              // Replace await act(() => { statements }) with just the statements
              const statements = body.body;
              if (statements.length === 1) {
                // Single statement - replace with the statement
                j(parentPath).replaceWith(statements[0]);
              } else {
                // Multiple statements - this is more complex, add TODO comment
                console.log(`  📝 Multiple statements in act() - adding TODO comment`);
                const comment = j.commentLine(' TODO: Manual review needed - multiple statements in act()');
                path.insertBefore(comment);
                return;
              }
            } else {
              // Not awaited - replace with statements
              const statements = body.body;
              if (statements.length === 1) {
                j(path).replaceWith(statements[0]);
              } else {
                console.log(`  📝 Multiple statements in act() - adding TODO comment`);
                const comment = j.commentLine(' TODO: Manual review needed - multiple statements in act()');
                path.insertBefore(comment);
                return;
              }
            }
          } else {
            // Single expression - replace the act call with the expression
            const parentPath = path.parent;
            if (parentPath.value.type === 'AwaitExpression') {
              j(parentPath).replaceWith(j.awaitExpression(body));
            } else {
              j(path).replaceWith(body);
            }
          }
          hasChanges = true;
        }
      }
    }
  });
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No unnecessary act() patterns found in ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};