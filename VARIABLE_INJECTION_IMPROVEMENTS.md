# Variable Injection Improvements

## Problem
The n8n workflow cloning feature was not properly injecting user-provided variable values into the workflow JSON. When users filled out variables in the clone form, those values weren't being replaced in the actual workflow JSON that gets cloned.

## Solution
Updated the `n8n-workflow-cloner.ts` to properly handle template variable names and inject them into the correct n8n workflow parameters.

## Key Changes

### 1. Added Schedule Trigger Variable Injection
- Added `injectScheduleTriggerVariables()` method
- Handles variables like:
  - `Trigger Interval` → `params.rule.interval`
  - `Days Between Triggers` → `params.rule.intervalValue`
  - `Trigger at Hour` → `params.rule.hour`
  - `Trigger at Minute` → `params.rule.minute`

### 2. Updated HubSpot Variable Injection
- Updated `injectHubSpotVariables()` method
- Now handles `hubspotListId` → `params.listId`
- Maintains backward compatibility with legacy variable names

### 3. Updated Excel Variable Injection
- Updated `injectExcelVariables()` method
- Now handles:
  - `excelFilePath` → `params.fileName` and `params.filePath`
  - `excelSheetName` → `params.sheetName`

### 4. Updated Email Variable Injection
- Updated `injectEmailVariables()` method
- Now handles `notificationEmail` → `params.toEmail`

### 5. Enhanced Generic Variable Injection
- Improved `injectGenericVariables()` method with better logging
- Enhanced `findAndReplaceInObject()` with more intelligent pattern matching
- Improved `shouldReplaceWithVariable()` with better heuristics

### 6. Added Comprehensive Logging
- Added console.log statements throughout the injection process
- Logs show which variables are being processed
- Logs show which parameters are being updated
- Helps debug variable injection issues

## How It Works

1. **User fills out variables** in the clone form (e.g., `hubspotListId: "12345"`)
2. **Variables are passed** to `cloneWorkflowToN8N(workflowJson, userVariables)`
3. **Workflow is cloned** with `JSON.parse(JSON.stringify(workflowJson))`
4. **Variables are injected** by calling `injectVariables(clonedWorkflow, variables)`
5. **Each node is processed** by `injectVariablesIntoNode(node, variables)`
6. **Node-specific injection** happens based on node type (schedule, hubspot, excel, etc.)
7. **Generic injection** handles any remaining variables
8. **Modified workflow** is returned with injected variables

## Testing

To test the variable injection:

1. **Open browser console** when using the clone form
2. **Fill out variables** in the clone form
3. **Click "Clone to n8n"**
4. **Check console logs** to see:
   - Which variables are being processed
   - Which parameters are being updated
   - How many variables were injected

## Expected Behavior

When you fill out variables like:
- `hubspotListId: "12345"`
- `excelFilePath: "/path/to/file.xlsx"`
- `Trigger Interval: "Days"`

The workflow JSON should be updated with:
- `params.listId = "{{ $json.hubspotListId }}"`
- `params.fileName = "{{ $json.excelFilePath }}"`
- `params.rule.interval = "Days"`

## Debugging

If variables aren't being injected:

1. **Check browser console** for injection logs
2. **Verify variable names** match between form and database
3. **Check node types** in the workflow JSON
4. **Verify parameter structure** matches expected n8n format

## Files Modified

- `lib/integrations/n8n-workflow-cloner.ts` - Main injection logic
- `components/template-clone-form.tsx` - Added debugging logs
- `test-variable-injection.js` - Test script for verification
