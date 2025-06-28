/**
 * AST Codemod: Fix textContent patterns
 * 
 * Transforms:
 * btn.textContent === 'text'
 * Into:
 * btn.textContent === 'text'  // This is actually okay for .find() callbacks
 * 
 * But transforms:
 * element.textContent
 * Into:
 * element.textContent  // Add comment for manual review
 * 
 * USAGE HISTORY:
 * - 2025-06-28: Tested on AnnualSeedPlanPanel.test.js (Commit: 161e146)
 *   - Result: SUCCESS - Correctly identified comparison patterns as safe, skipped them
 *   - Files processed: 1
 *   - Changes made: 0 (no unsafe patterns found)
 *   - Time: 0.334s
 *   - Validation: AST approach works well for identifying safe vs unsafe textContent usage
 *   - Associated commit: "Continue systematic Testing Library cleanup: 97→77 warnings (-21%)"
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
  
  // Find direct textContent access that's not in comparisons
  source.find(j.MemberExpression, {
    property: { name: 'textContent' }
  }).forEach(path => {
    const parent = path.parent.value;
    
    // Skip if it's part of a comparison (like btn.textContent === 'text')
    if (parent.type === 'BinaryExpression' && 
        (parent.operator === '===' || parent.operator === '==' || 
         parent.operator === '!==' || parent.operator === '!=')) {
      console.log(`  ⏭️  Skipping textContent in comparison`);
      return;
    }
    
    // Add TODO comment for manual review
    console.log(`  📝 Adding TODO for textContent access`);
    const comment = j.commentLine(' TODO: Replace .textContent with Testing Library text assertion');
    
    try {
      path.insertBefore(comment);
      hasChanges = true;
    } catch (e) {
      console.log(`  ⚠️  Could not add comment: ${e.message}`);
    }
  });
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No textContent patterns needing fixes in ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};