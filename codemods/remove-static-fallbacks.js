/**
 * Codemod to remove static fallback methods that use GLOBAL_CROP_DATABASE
 * This completes the removal of all static database references
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  let hasChanges = false;
  
  console.log(`\n🔍 Analyzing: ${fileInfo.path}`);
  
  // 1. Remove getStaticCropDatabase method and its calls
  source.find(j.MethodDefinition)
    .filter(path => path.value.key.name === 'getStaticCropDatabase')
    .forEach(path => {
      console.log(`  🗑️  Removing getStaticCropDatabase method`);
      j(path).remove();
      hasChanges = true;
    });
  
  // 2. Remove getStaticPlantVarieties method and its calls  
  source.find(j.MethodDefinition)
    .filter(path => path.value.key.name === 'getStaticPlantVarieties')
    .forEach(path => {
      console.log(`  🗑️  Removing getStaticPlantVarieties method`);
      j(path).remove();
      hasChanges = true;
    });
  
  // 3. Replace calls to getStaticCropDatabase with error throwing
  source.find(j.CallExpression)
    .filter(path => 
      path.value.callee.type === 'MemberExpression' &&
      path.value.callee.property.name === 'getStaticCropDatabase'
    )
    .forEach(path => {
      console.log(`  🔄 Replacing getStaticCropDatabase call with error`);
      const errorCall = j.throwStatement(
        j.newExpression(
          j.identifier('Error'),
          [j.literal('Static crop database removed - database must be initialized')]
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
  
  // 4. Replace calls to getStaticPlantVarieties with error throwing
  source.find(j.CallExpression)
    .filter(path => 
      path.value.callee.type === 'MemberExpression' &&
      path.value.callee.property.name === 'getStaticPlantVarieties'
    )
    .forEach(path => {
      console.log(`  🔄 Replacing getStaticPlantVarieties call with error`);
      const errorCall = j.throwStatement(
        j.newExpression(
          j.identifier('Error'),
          [j.literal('Static plant varieties removed - database must be initialized')]
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
  
  // 5. Remove any remaining GLOBAL_CROP_DATABASE require() calls
  source.find(j.VariableDeclarator)
    .filter(path => 
      path.value.init &&
      path.value.init.type === 'CallExpression' &&
      path.value.init.callee.name === 'require' &&
      path.value.init.arguments[0] &&
      path.value.init.arguments[0].value === '../config.js' &&
      path.value.id.type === 'ObjectPattern' &&
      path.value.id.properties.some(prop => 
        prop.key && prop.key.name === 'GLOBAL_CROP_DATABASE'
      )
    )
    .forEach(path => {
      console.log(`  🗑️  Removing GLOBAL_CROP_DATABASE require`);
      j(path.parent).remove();
      hasChanges = true;
    });
  
  // 6. Remove any for loops that iterate over GLOBAL_CROP_DATABASE
  source.find(j.ForOfStatement)
    .filter(path =>
      path.value.right.type === 'CallExpression' &&
      path.value.right.callee.type === 'MemberExpression' &&
      path.value.right.callee.object.type === 'CallExpression' &&
      path.value.right.callee.object.callee.type === 'MemberExpression' &&
      path.value.right.callee.object.callee.object.name === 'Object' &&
      path.value.right.callee.object.callee.property.name === 'entries' &&
      path.value.right.callee.object.arguments[0] &&
      path.value.right.callee.object.arguments[0].name === 'GLOBAL_CROP_DATABASE'
    )
    .forEach(path => {
      console.log(`  🗑️  Removing for loop over GLOBAL_CROP_DATABASE`);
      j(path).remove();
      hasChanges = true;
    });
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No changes needed for ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};