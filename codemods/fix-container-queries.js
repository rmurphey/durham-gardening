/**
 * AST Codemod: Fix container.querySelector patterns
 * 
 * Transforms:
 * container.querySelector('.some-class')
 * Into:
 * screen.getByRole('...') // with TODO comment for manual review
 * 
 * Note: This codemod adds TODO comments since container queries usually need
 * semantic review to determine the appropriate Testing Library query.
 * 
 * USAGE HISTORY:
 * - 2025-06-28: Tested on gardenCalendarIndoorStart.test.js
 *   - Result: FAILED - Comment insertion error ("Comments may appear as statements in otherwise empty statement lists")
 *   - Files processed: 1
 *   - Changes made: 0 (transformation error)
 *   - Time: 0.316s
 *   - Issue: AST comment insertion in complex expressions causes recast printing errors
 *   - Resolution: Used manual approach instead - successfully fixed 5 container.querySelector patterns
 *   - Learning: Container queries need semantic understanding; manual approach more reliable
 *   - Associated commit: "Improve git hooks: Move zero-tolerance to pre-push, allow warnings in commits" (33ba1c1)
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
  
  // Find container.querySelector calls
  source.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'container' },
      property: { name: 'querySelector' }
    }
  }).forEach(path => {
    const callExpression = path.value;
    const selector = callExpression.arguments[0];
    
    if (selector && selector.type === 'Literal') {
      console.log(`  📝 Found container.querySelector('${selector.value}') - adding TODO comment`);
      
      // Add TODO comment before the statement
      const comment = j.commentLine(` TODO: Replace container.querySelector('${selector.value}') with appropriate screen query`);
      
      try {
        // Find the statement containing this expression
        let statement = path;
        while (statement && statement.value.type !== 'ExpressionStatement' && 
               statement.value.type !== 'VariableDeclaration') {
          statement = statement.parent;
        }
        
        if (statement) {
          statement.insertBefore(comment);
          hasChanges = true;
        }
      } catch (e) {
        console.log(`  ⚠️  Could not add comment: ${e.message}`);
      }
    }
  });
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No container.querySelector patterns found in ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};