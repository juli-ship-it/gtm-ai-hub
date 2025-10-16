// Workflow Comparison Tool
// Compares original uploaded workflow vs cloned workflow with injected variables

const fs = require('fs');
const path = require('path');

function loadWorkflow(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

function compareNodes(originalNodes, clonedNodes) {
  const differences = [];
  
  originalNodes.forEach((originalNode, index) => {
    const clonedNode = clonedNodes[index];
    if (!clonedNode) {
      differences.push({
        type: 'missing_node',
        nodeName: originalNode.name,
        index: index
      });
      return;
    }

    // Compare node parameters
    const paramDiffs = compareParameters(originalNode.parameters, clonedNode.parameters, originalNode.name);
    if (paramDiffs.length > 0) {
      differences.push({
        type: 'parameter_changes',
        nodeName: originalNode.name,
        nodeType: originalNode.type,
        changes: paramDiffs
      });
    }
  });

  return differences;
}

function compareParameters(originalParams, clonedParams, nodeName) {
  const changes = [];
  
  if (!originalParams || !clonedParams) {
    return changes;
  }

  // Recursively compare all parameters
  function compareObject(orig, cloned, path = '') {
    if (typeof orig !== typeof cloned) {
      changes.push({
        path: path,
        type: 'type_change',
        original: typeof orig,
        cloned: typeof cloned
      });
      return;
    }

    if (typeof orig === 'object' && orig !== null) {
      if (Array.isArray(orig)) {
        orig.forEach((item, index) => {
          compareObject(item, cloned[index], `${path}[${index}]`);
        });
      } else {
        Object.keys(orig).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          if (cloned.hasOwnProperty(key)) {
            compareObject(orig[key], cloned[key], newPath);
          } else {
            changes.push({
              path: newPath,
              type: 'missing_property',
              original: orig[key],
              cloned: 'undefined'
            });
          }
        });
      }
    } else if (orig !== cloned) {
      // Check if it's a variable injection
      if (typeof cloned === 'string' && cloned.includes('{{ $json.')) {
        changes.push({
          path: path,
          type: 'variable_injection',
          original: orig,
          cloned: cloned,
          variableName: extractVariableName(cloned)
        });
      } else {
        changes.push({
          path: path,
          type: 'value_change',
          original: orig,
          cloned: cloned
        });
      }
    }
  }

  compareObject(originalParams, clonedParams);
  return changes;
}

function extractVariableName(expression) {
  const match = expression.match(/\{\{\s*\$json\.(\w+)\s*\}\}/);
  return match ? match[1] : null;
}

function generateReport(original, cloned, differences) {
  console.log('='.repeat(80));
  console.log('WORKFLOW COMPARISON REPORT');
  console.log('='.repeat(80));
  
  console.log('\n📊 SUMMARY:');
  console.log(`Original workflow: ${original.name || 'Unnamed'}`);
  console.log(`Cloned workflow: ${cloned.name || 'Unnamed'}`);
  console.log(`Original nodes: ${original.nodes?.length || 0}`);
  console.log(`Cloned nodes: ${cloned.nodes?.length || 0}`);
  console.log(`Total differences found: ${differences.length}`);

  console.log('\n🔍 DETAILED ANALYSIS:');
  
  differences.forEach((diff, index) => {
    console.log(`\n${index + 1}. ${diff.type.toUpperCase()}`);
    console.log(`   Node: ${diff.nodeName} (${diff.nodeType || 'N/A'})`);
    
    if (diff.type === 'parameter_changes') {
      diff.changes.forEach(change => {
        console.log(`   📝 ${change.path}:`);
        console.log(`      Original: ${JSON.stringify(change.original)}`);
        console.log(`      Cloned:   ${JSON.stringify(change.cloned)}`);
        
        if (change.type === 'variable_injection') {
          console.log(`      ✅ Variable injected: ${change.variableName}`);
        } else if (change.type === 'value_change') {
          console.log(`      ⚠️  Value changed`);
        } else if (change.type === 'missing_property') {
          console.log(`      ❌ Property missing in cloned version`);
        }
      });
    } else if (diff.type === 'missing_node') {
      console.log(`   ❌ Node missing in cloned version`);
    }
  });

  // Count variable injections
  const variableInjections = differences
    .filter(d => d.type === 'parameter_changes')
    .flatMap(d => d.changes)
    .filter(c => c.type === 'variable_injection');

  console.log('\n✅ VARIABLE INJECTION SUMMARY:');
  console.log(`Total variable injections: ${variableInjections.length}`);
  
  if (variableInjections.length > 0) {
    console.log('\nInjected variables:');
    variableInjections.forEach(vi => {
      console.log(`  - ${vi.variableName}: ${vi.original} → ${vi.cloned}`);
    });
  } else {
    console.log('\n⚠️  No variable injections detected!');
    console.log('This might indicate an issue with the variable injection system.');
  }

  console.log('\n' + '='.repeat(80));
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node compare-workflows.js <original-workflow.json> <cloned-workflow.json>');
    console.log('\nExample:');
    console.log('  node compare-workflows.js original.json cloned.json');
    process.exit(1);
  }

  const originalPath = args[0];
  const clonedPath = args[1];

  console.log('Loading workflows...');
  const original = loadWorkflow(originalPath);
  const cloned = loadWorkflow(clonedPath);

  if (!original || !cloned) {
    console.error('Failed to load one or both workflow files');
    process.exit(1);
  }

  console.log('Comparing workflows...');
  const differences = compareNodes(original.nodes || [], cloned.nodes || []);
  
  generateReport(original, cloned, differences);
}

// Run the comparison
main();
