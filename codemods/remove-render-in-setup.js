/**
 * JSCodeshift codemod to fix testing-library/no-render-in-setup violations
 * 
 * Transforms beforeEach blocks that contain render() calls into individual test setup
 * 
 * Before:
 * describe('Test Suite', () => {
 *   beforeEach(() => {
 *     render(<Component {...props} />);
 *     // setup actions
 *   });
 *   
 *   test('should do something', () => {
 *     // test body
 *   });
 * });
 * 
 * After:
 * describe('Test Suite', () => {   
 *   test('should do something', () => {
 *     render(<Component {...props} />);
 *     // setup actions
 *     // test body
 *   });
 * });
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  let hasChanges = false;

  // Find describe blocks that contain beforeEach with render
  root.find(j.CallExpression, {
    callee: { name: 'describe' }
  }).forEach(describePath => {
    const describeBody = describePath.value.arguments[1]?.body?.body;
    if (!describeBody) return;

    // Find beforeEach blocks in this describe
    let beforeEachSetup = null;
    let beforeEachIndex = -1;
    
    describeBody.forEach((statement, index) => {
      if (statement.type === 'ExpressionStatement' &&
          statement.expression.type === 'CallExpression' &&
          statement.expression.callee.name === 'beforeEach') {
        
        const beforeEachBody = statement.expression.arguments[0]?.body?.body;
        if (beforeEachBody) {
          // Check if this beforeEach contains render()
          const hasRender = beforeEachBody.some(stmt => {
            return stmt.type === 'ExpressionStatement' &&
                   stmt.expression.type === 'CallExpression' &&
                   stmt.expression.callee.name === 'render';
          });
          
          if (hasRender) {
            beforeEachSetup = beforeEachBody;
            beforeEachIndex = index;
          }
        }
      }
    });

    if (beforeEachSetup && beforeEachIndex >= 0) {
      // Find all test blocks in this describe
      const testBlocks = [];
      describeBody.forEach((statement, index) => {
        if (statement.type === 'ExpressionStatement' &&
            statement.expression.type === 'CallExpression' &&
            (statement.expression.callee.name === 'test' || statement.expression.callee.name === 'it')) {
          testBlocks.push({ statement, index });
        }
      });

      // Transform each test block
      testBlocks.forEach(({ statement }) => {
        const testBody = statement.expression.arguments[1]?.body?.body;
        if (testBody) {
          // Prepend beforeEach setup to test body
          const setupStatements = [...beforeEachSetup];
          testBody.unshift(...setupStatements);
          hasChanges = true;
        }
      });

      // Remove the beforeEach block
      if (testBlocks.length > 0) {
        describeBody.splice(beforeEachIndex, 1);
      }
    }
  });

  return hasChanges ? root.toSource({ quote: 'single' }) : null;
};