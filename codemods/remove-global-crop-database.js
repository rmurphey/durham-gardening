/**
 * Codemod to remove GLOBAL_CROP_DATABASE usage and replace with database service calls
 * 
 * This transformation:
 * 1. Finds all imports of GLOBAL_CROP_DATABASE
 * 2. Identifies functions that use it
 * 3. Removes static fallback functions
 * 4. Updates imports to use database service instead
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const source = j(fileInfo.source);
  
  // Track what changes we make
  let hasChanges = false;
  
  console.log(`\n🔍 Analyzing: ${fileInfo.path}`);
  
  // 1. Find and remove imports of GLOBAL_CROP_DATABASE
  const globalCropImports = source.find(j.ImportDeclaration)
    .filter(path => {
      const specifiers = path.value.specifiers || [];
      return specifiers.some(spec => 
        spec.type === 'ImportSpecifier' && 
        spec.imported.name === 'GLOBAL_CROP_DATABASE'
      );
    });
    
  if (globalCropImports.length > 0) {
    console.log(`  📥 Found GLOBAL_CROP_DATABASE import`);
    
    globalCropImports.forEach(path => {
      const specifiers = path.value.specifiers.filter(spec => 
        !(spec.type === 'ImportSpecifier' && spec.imported.name === 'GLOBAL_CROP_DATABASE')
      );
      
      if (specifiers.length === 0) {
        // Remove entire import if only importing GLOBAL_CROP_DATABASE
        j(path).remove();
        console.log(`  ❌ Removed entire import statement`);
      } else {
        // Remove just the GLOBAL_CROP_DATABASE specifier
        path.value.specifiers = specifiers;
        console.log(`  ❌ Removed GLOBAL_CROP_DATABASE from import`);
      }
      hasChanges = true;
    });
  }
  
  // 2. Find and analyze usage of GLOBAL_CROP_DATABASE
  const usages = source.find(j.Identifier, { name: 'GLOBAL_CROP_DATABASE' });
  
  if (usages.length > 0) {
    console.log(`  🔍 Found ${usages.length} usages of GLOBAL_CROP_DATABASE`);
    
    usages.forEach(path => {
      const parent = path.parent.value;
      console.log(`    - Usage type: ${parent.type} at line ${path.value.loc?.start.line}`);
      
      // If it's a member expression (GLOBAL_CROP_DATABASE.something)
      if (parent.type === 'MemberExpression' && parent.object === path.value) {
        console.log(`      Property access: ${parent.property.name}`);
      }
      
      // If it's in a function that should be removed
      const functionNode = findParentFunction(path);
      if (functionNode) {
        console.log(`      Inside function: ${getFunctionName(functionNode)}`);
      }
    });
  }
  
  // 3. Find and remove functions that use GLOBAL_CROP_DATABASE
  const functionsToRemove = [];
  
  // Look for function declarations
  source.find(j.FunctionDeclaration).forEach(path => {
    const hasGlobalCropUsage = j(path).find(j.Identifier, { name: 'GLOBAL_CROP_DATABASE' }).length > 0;
    if (hasGlobalCropUsage) {
      functionsToRemove.push({
        type: 'FunctionDeclaration',
        name: path.value.id.name,
        path: path
      });
    }
  });
  
  // Look for function expressions and arrow functions in variable declarations
  source.find(j.VariableDeclarator).forEach(path => {
    if (path.value.init && 
        (path.value.init.type === 'FunctionExpression' || path.value.init.type === 'ArrowFunctionExpression')) {
      const hasGlobalCropUsage = j(path).find(j.Identifier, { name: 'GLOBAL_CROP_DATABASE' }).length > 0;
      if (hasGlobalCropUsage) {
        functionsToRemove.push({
          type: 'VariableDeclarator',
          name: path.value.id.name,
          path: path.parent // Remove the entire variable declaration
        });
      }
    }
  });
  
  // Look for exported function expressions
  source.find(j.ExportNamedDeclaration).forEach(path => {
    if (path.value.declaration) {
      const hasGlobalCropUsage = j(path).find(j.Identifier, { name: 'GLOBAL_CROP_DATABASE' }).length > 0;
      if (hasGlobalCropUsage) {
        const name = path.value.declaration.id?.name || 
                    path.value.declaration.declarations?.[0]?.id?.name ||
                    'unknown';
        functionsToRemove.push({
          type: 'ExportNamedDeclaration', 
          name: name,
          path: path
        });
      }
    }
  });
  
  if (functionsToRemove.length > 0) {
    console.log(`  🗑️  Functions to remove:`);
    functionsToRemove.forEach(func => {
      console.log(`    - ${func.name} (${func.type})`);
      
      // Add comment explaining removal
      const comment = j.commentBlock(`\n * Function '${func.name}' removed - was using static GLOBAL_CROP_DATABASE\n * Use database service methods instead\n `, true, false);
      func.path.value.comments = [comment];
      
      // Replace with a comment or remove entirely
      if (func.type === 'ExportNamedDeclaration') {
        // For exports, replace with a comment export
        const replacement = j.exportNamedDeclaration(
          j.variableDeclaration('const', [
            j.variableDeclarator(
              j.identifier(func.name), 
              j.callExpression(
                j.arrowFunctionExpression(
                  [], 
                  j.blockStatement([
                    j.throwStatement(
                      j.newExpression(
                        j.identifier('Error'), 
                        [j.literal(`Function '${func.name}' removed - use database service instead`)]
                      )
                    )
                  ])
                ), 
                []
              )
            )
          ])
        );
        j(func.path).replaceWith(replacement);
      } else {
        // For other function types, remove entirely
        j(func.path).remove();
      }
      
      hasChanges = true;
    });
  }
  
  // 4. Add database service import if we removed GLOBAL_CROP_DATABASE usage
  if (hasChanges && usages.length > 0) {
    // Check if databaseService is already imported
    const hasDbServiceImport = source.find(j.ImportDeclaration)
      .filter(path => path.value.source.value.includes('databaseService'))
      .length > 0;
      
    if (!hasDbServiceImport) {
      console.log(`  ➕ Adding databaseService import`);
      
      // Add import at the top
      const dbImport = j.importDeclaration(
        [j.importDefaultSpecifier(j.identifier('databaseService'))],
        j.literal('./databaseService.js')
      );
      
      // Find first import or add at beginning
      const firstImport = source.find(j.ImportDeclaration).at(0);
      if (firstImport.length > 0) {
        firstImport.insertBefore(dbImport);
      } else {
        source.find(j.Program).get('body', 0).insertBefore(dbImport);
      }
    }
  }
  
  if (hasChanges) {
    console.log(`  ✅ Made changes to ${fileInfo.path}`);
  } else {
    console.log(`  ➡️  No changes needed for ${fileInfo.path}`);
  }
  
  return hasChanges ? source.toSource({ quote: 'single' }) : null;
};

// Helper functions
function findParentFunction(path) {
  let current = path.parent;
  while (current) {
    const node = current.value;
    if (node.type === 'FunctionDeclaration' || 
        node.type === 'FunctionExpression' || 
        node.type === 'ArrowFunctionExpression') {
      return node;
    }
    current = current.parent;
  }
  return null;
}

function getFunctionName(functionNode) {
  if (functionNode.id) {
    return functionNode.id.name;
  }
  if (functionNode.type === 'ArrowFunctionExpression') {
    return 'arrow function';
  }
  return 'anonymous function';
}