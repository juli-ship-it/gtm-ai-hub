#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to clean (test and debug files)
const filesToClean = [
  'test-supabase-connection.js',
  'test-ai-analysis.js', 
  'test-api-route.js',
  'test-variable-injection.js',
  'test-customers-count.js',
  'test-snowflake-mcp-simple.js',
  'test-mixpanel-simple.js',
  'test-mixpanel-mcp.js',
  'test-n8n-clone.js',
  'test-snowflake-mcp.js',
  'test-slack-intake.js',
  'debug-template-creation.js',
  'quick_fix_template.js',
  'fix_existing_template.js',
  'debug_clone_form.js',
  'debug_templates.js',
  'debug_template_variables.js'
];

function removeConsoleLogs(content) {
  // Remove console.log, console.error, console.warn, console.info, console.debug statements
  // But keep the code structure intact
  return content
    .replace(/^\s*console\.(log|error|warn|info|debug)\([^)]*\);\s*$/gm, '')
    .replace(/^\s*console\.(log|error|warn|info|debug)\([^)]*\)\s*$/gm, '')
    .replace(/\s*console\.(log|error|warn|info|debug)\([^)]*\);\s*/g, '')
    .replace(/\s*console\.(log|error|warn|info|debug)\([^)]*\)\s*/g, '')
    // Clean up empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Clean up trailing whitespace
    .replace(/[ \t]+$/gm, '');
}

function cleanFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeConsoleLogs(content);
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ Cleaned: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

// Clean all files
console.log('🧹 Removing console logs from test and debug files...\n');

filesToClean.forEach(file => {
  cleanFile(file);
});

console.log('\n✨ Console log removal complete!');
