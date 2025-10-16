// Browser-based Workflow Comparison Tool
// Run this in the browser console to compare workflows

function compareWorkflows(original, cloned) {
  console.log('🔍 WORKFLOW COMPARISON ANALYSIS');
  console.log('================================');
  
  // Basic info
  console.log(`Original: ${original.name || 'Unnamed'}`);
  console.log(`Cloned: ${cloned.name || 'Unnamed'}`);
  console.log(`Original nodes: ${original.nodes?.length || 0}`);
  console.log(`Cloned nodes: ${cloned.nodes?.length || 0}`);
  
  let totalInjections = 0;
  let totalChanges = 0;
  
  // Compare each node
  original.nodes?.forEach((originalNode, index) => {
    const clonedNode = cloned.nodes?.[index];
    if (!clonedNode) {
      console.log(`❌ Node ${index} (${originalNode.name}) missing in cloned version`);
      return;
    }
    
    console.log(`\n📋 Node: ${originalNode.name} (${originalNode.type})`);
    
    // Compare parameters
    const paramChanges = compareNodeParameters(originalNode.parameters, clonedNode.parameters);
    if (paramChanges.length > 0) {
      totalChanges += paramChanges.length;
      paramChanges.forEach(change => {
        if (change.type === 'variable_injection') {
          totalInjections++;
          console.log(`  ✅ ${change.path}: "${change.original}" → "${change.cloned}" (Variable: ${change.variableName})`);
        } else {
          console.log(`  ⚠️  ${change.path}: "${change.original}" → "${change.cloned}"`);
        }
      });
    } else {
      console.log(`  ✅ No parameter changes`);
    }
  });
  
  console.log('\n📊 SUMMARY:');
  console.log(`Total parameter changes: ${totalChanges}`);
  console.log(`Variable injections: ${totalInjections}`);
  
  if (totalInjections === 0) {
    console.log('\n⚠️  WARNING: No variable injections detected!');
    console.log('This suggests the variable injection system may not be working properly.');
  } else {
    console.log('\n✅ Variable injection is working!');
  }
  
  return { totalChanges, totalInjections };
}

function compareNodeParameters(original, cloned, path = '') {
  const changes = [];
  
  if (!original || !cloned) return changes;
  
  function compareValue(orig, cloned, currentPath) {
    if (typeof orig !== typeof cloned) {
      changes.push({
        path: currentPath,
        type: 'type_change',
        original: orig,
        cloned: cloned
      });
      return;
    }
    
    if (typeof orig === 'object' && orig !== null) {
      if (Array.isArray(orig)) {
        orig.forEach((item, index) => {
          compareValue(item, cloned[index], `${currentPath}[${index}]`);
        });
      } else {
        Object.keys(orig).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          if (cloned.hasOwnProperty(key)) {
            compareValue(orig[key], cloned[key], newPath);
          }
        });
      }
    } else if (orig !== cloned) {
      if (typeof cloned === 'string' && cloned.includes('{{ $json.')) {
        const variableName = cloned.match(/\{\{\s*\$json\.(\w+)\s*\}\}/)?.[1];
        changes.push({
          path: currentPath,
          type: 'variable_injection',
          original: orig,
          cloned: cloned,
          variableName: variableName
        });
      } else {
        changes.push({
          path: currentPath,
          type: 'value_change',
          original: orig,
          cloned: cloned
        });
      }
    }
  }
  
  compareValue(original, cloned, path);
  return changes;
}

// Usage instructions
console.log(`
🔧 WORKFLOW COMPARISON TOOL
==========================

To use this tool:

1. Open browser console (F12)
2. Copy and paste this entire script
3. Run: compareWorkflows(originalWorkflow, clonedWorkflow)

Example:
  // Get original workflow from template creation
  const original = JSON.parse(uploadedFileContent);
  
  // Get cloned workflow from clone result
  const cloned = JSON.parse(cloneResult.workflowJson);
  
  // Compare them
  compareWorkflows(original, cloned);
`);

// Make it available globally
window.compareWorkflows = compareWorkflows;
