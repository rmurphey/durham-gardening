/**
 * Codemod to remove remaining static fallback methods in databaseService
 * that still reference GLOBAL_CROP_DATABASE
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  let hasChanges = false;
  
  console.log(`\n🔍 Analyzing: ${fileInfo.path}`);
  
  // 1. Remove getStaticPlantData method
  source.find(j.MethodDefinition)
    .filter(path => path.value.key.name === 'getStaticPlantData')
    .forEach(path => {
      console.log(`  🗑️  Removing getStaticPlantData method`);
      j(path).remove();
      hasChanges = true;
    });
  
  // 2. Remove getStaticPlantsByZone method
  source.find(j.MethodDefinition)
    .filter(path => path.value.key.name === 'getStaticPlantsByZone')
    .forEach(path => {
      console.log(`  🗑️  Removing getStaticPlantsByZone method`);
      j(path).remove();
      hasChanges = true;
    });
  
  // 3. Remove any fallback calls to these methods
  source.find(j.CallExpression)
    .filter(path => 
      path.value.callee.type === 'MemberExpression' &&
      (path.value.callee.property.name === 'getStaticPlantData' ||
       path.value.callee.property.name === 'getStaticPlantsByZone')
    )
    .forEach(path => {
      const methodName = path.value.callee.property.name;
      console.log(`  🔄 Replacing ${methodName} call with error`);
      
      const errorCall = j.throwStatement(
        j.newExpression(
          j.identifier('Error'),
          [j.literal(`Static ${methodName} removed - database must be initialized`)]
        )
      );
      
      // If it's a return statement, replace the whole return
      const parent = path.parent.value;
      if (parent.type === 'ReturnStatement') {
        j(path.parent).replaceWith(errorCall);
      } else {
        j(path).replaceWith(errorCall);
      }
      hasChanges = true;
    });
  
  // 4. Remove any remaining references to GLOBAL_CROP_DATABASE variable
  source.find(j.Identifier)
    .filter(path => path.value.name === 'GLOBAL_CROP_DATABASE')
    .forEach(path => {
      // Find the containing statement and remove it
      let current = path;
      while (current && !j.Statement.check(current.value)) {
        current = current.parent;
      }
      
      if (current) {
        console.log(`  🗑️  Removing statement containing GLOBAL_CROP_DATABASE`);
        j(current).remove();
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