# Testing Variable Injection

## Overview
This guide helps you verify that the variable injection system is working correctly by comparing the original uploaded workflow with the cloned workflow that has variables injected.

## How to Test

### Method 1: Using the Built-in Compare Button

1. **Create a template** with an n8n workflow that has variables
2. **Go to the template library** and click "Clone" on your template
3. **Fill out the variables** in the clone form (e.g., `hubspotListId: "12345"`)
4. **Click "Clone to n8n"** to generate the cloned workflow
5. **Click the "🔍 Compare" button** in the clone result section
6. **Check the browser console** (F12) for detailed comparison results
7. **Look for the alert** that tells you if variable injection is working

### Method 2: Using the Node.js Comparison Tool

1. **Download both workflows**:
   - Original: From when you created the template
   - Cloned: From the clone result download

2. **Run the comparison tool**:
   ```bash
   node compare-workflows.js original-workflow.json cloned-workflow.json
   ```

3. **Review the detailed report** showing all differences

### Method 3: Using the Browser Console Tool

1. **Open browser console** (F12)
2. **Copy and paste** the code from `browser-workflow-comparison.js`
3. **Run the comparison**:
   ```javascript
   compareWorkflows(originalWorkflow, clonedWorkflow)
   ```

## What to Look For

### ✅ Success Indicators

**Variable Injections Detected:**
```
✅ rule.interval: "Days" → "Days" (Variable: Trigger Interval)
✅ listId: "12345" → "{{ $json.hubspotListId }}" (Variable: hubspotListId)
✅ fileName: "/path/to/file.xlsx" → "{{ $json.excelFilePath }}" (Variable: excelFilePath)
```

**Console Output:**
```
📊 SUMMARY:
Total parameter changes: 3
Variable injections: 3
✅ Variable injection is working!
```

### ❌ Failure Indicators

**No Variable Injections:**
```
⚠️  WARNING: No variable injections detected!
Total parameter changes: 0
Variable injections: 0
```

**Console Output:**
```
⚠️  WARNING: No variable injections detected!
This suggests the variable injection system may not be working properly.
```

## Expected Variable Mappings

### Schedule Trigger Variables
- `Trigger Interval` → `params.rule.interval`
- `Days Between Triggers` → `params.rule.intervalValue`
- `Trigger at Hour` → `params.rule.hour`
- `Trigger at Minute` → `params.rule.minute`

### HubSpot Variables
- `hubspotListId` → `params.listId`

### Excel Variables
- `excelFilePath` → `params.fileName` and `params.filePath`
- `excelSheetName` → `params.sheetName`

### Email Variables
- `notificationEmail` → `params.toEmail`

## Debugging Steps

### If No Variables Are Injected:

1. **Check console logs** for injection process:
   ```
   Injecting variables into node: Schedule Trigger (n8n-nodes-base.scheduleTrigger)
   Available variables: ["Trigger Interval", "hubspotListId", ...]
   ```

2. **Verify variable names** match between form and database

3. **Check node types** in the workflow JSON

4. **Verify parameter structure** matches expected n8n format

### If Wrong Variables Are Injected:

1. **Check the variable mapping** in `n8n-workflow-cloner.ts`

2. **Verify the node type detection** is working correctly

3. **Check the parameter structure** of your specific n8n nodes

## Common Issues

### Issue: Variables not showing in clone form
**Solution:** Run the SQL script `fix_template_variables.sql` to add missing database columns

### Issue: Empty dropdowns in clone form
**Solution:** Check that `n8n_enum` values are properly stored in the database

### Issue: Variables injected but wrong values
**Solution:** Check the variable mapping logic in the injection methods

### Issue: No variables detected at all
**Solution:** Check that the AI analysis is working and variables are being saved to the database

## Files to Check

- `lib/integrations/n8n-workflow-cloner.ts` - Main injection logic
- `components/template-clone-form.tsx` - Clone form and comparison
- `compare-workflows.js` - Node.js comparison tool
- `browser-workflow-comparison.js` - Browser console tool

## Test Workflow

1. Upload a workflow with schedule trigger, HubSpot, and Excel nodes
2. Create template with AI analysis
3. Clone template and fill variables
4. Use compare button to verify injection
5. Check console for detailed results
6. Download both workflows and compare manually if needed
