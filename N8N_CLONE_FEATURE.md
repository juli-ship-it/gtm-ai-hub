# n8n Workflow Cloning Feature

## Overview

This feature allows users to clone n8n workflow templates directly to n8n with pre-injected variables. When a user uploads an n8n workflow JSON file in the template creation form, they can now click a "Clone in n8n" button that generates a URL to import the workflow into n8n with variables already configured.

## How It Works

### 1. Workflow Analysis
- When a user uploads an n8n workflow JSON file, the system automatically analyzes it
- Detects variables and hardcoded values that should be parameterized
- Identifies systems used (HubSpot, Slack, Google Sheets, etc.)

### 2. Variable Injection
- The system replaces hardcoded values with n8n expressions like `{{ $json.variableName }}`
- Pre-configures variables with sensible default values
- Maintains the workflow structure while making it parameterized

### 3. n8n Import URL Generation
- Creates a Base64-encoded URL that n8n can import directly
- Format: `https://n8n.io/workflows/new?import={{base64EncodedWorkflow}}`
- Users can click the URL to open n8n with the workflow ready to use

## Implementation Details

### New Files Created

1. **`lib/integrations/n8n-workflow-cloner.ts`**
   - Main cloning logic
   - Variable injection algorithms
   - URL generation for n8n import

2. **Updated `components/template-creation-form.tsx`**
   - Added "Clone in n8n" button
   - Added clone result display
   - Integrated with existing workflow analysis

### Key Features

#### Variable Detection & Injection
- **HubSpot Variables**: Segment IDs, contact properties, object types
- **Slack Variables**: Channel names, message content
- **Google Sheets Variables**: Spreadsheet IDs, sheet names, ranges
- **Excel Variables**: File names, sheet names
- **Email Variables**: Recipients, subjects, body content
- **HTTP Request Variables**: URLs, headers
- **Webhook Variables**: Path parameters

#### Smart Defaults
- String variables: `"Your variable_name"`
- Email variables: `"your-email@example.com"`
- URL variables: `"https://example.com"`
- Number variables: `1`
- Boolean variables: `false`

#### Safety Features
- Workflows start as **inactive** for safety
- Variables are clearly marked with default values
- Users can modify values after importing
- Original workflow structure is preserved

## Usage

### For Template Creators

1. **Upload Workflow**: Upload your n8n workflow JSON file
2. **Review Variables**: Check detected variables and add custom ones
3. **Clone to n8n**: Click "Clone in n8n" button
4. **Share URL**: Copy the generated import URL to share with users

### For Template Users

1. **Get Import URL**: Receive the n8n import URL from template creator
2. **Open in n8n**: Click the URL to open n8n with the workflow
3. **Configure Variables**: Update the pre-filled variable values
4. **Activate Workflow**: Enable the workflow when ready

## Technical Implementation

### Variable Injection Process

```typescript
// Example: HubSpot segment ID injection
if (variables.hubspot_segment_id && params.segmentId) {
  params.segmentId = `{{ $json.hubspot_segment_id }}`
}
```

### URL Generation

```typescript
const encodedWorkflow = btoa(JSON.stringify(workflow))
const importUrl = `https://n8n.io/workflows/new?import=${encodedWorkflow}`
```

### Workflow Metadata Updates

```typescript
workflow.meta = {
  templateCloned: true,
  clonedAt: new Date().toISOString(),
  variablesInjected: Object.keys(variables).length
}
```

## Benefits

### For Template Creators
- **Easy Sharing**: Generate import URLs instantly
- **Variable Management**: Automatically detect and parameterize variables
- **User Experience**: Users get pre-configured workflows

### For Template Users
- **One-Click Import**: No manual workflow setup required
- **Pre-configured**: Variables already set with sensible defaults
- **Customizable**: Easy to modify values in n8n interface
- **Safe**: Workflows start inactive to prevent accidental execution

## Supported n8n Node Types

- ✅ **HubSpot**: Contacts, companies, deals, segments
- ✅ **Slack**: Messages, channels, notifications
- ✅ **Google Sheets**: Spreadsheets, ranges, sheets
- ✅ **Excel**: Files, sheets, data export
- ✅ **Email**: SMTP, notifications, alerts
- ✅ **HTTP Request**: APIs, webhooks, integrations
- ✅ **Webhook**: Entry points, triggers
- ✅ **Generic**: Any node with parameterized values

## Future Enhancements

### Planned Features
1. **Custom n8n Instance URLs**: Support for self-hosted n8n instances
2. **Variable Validation**: Check required variables before cloning
3. **Workflow Preview**: Show how the cloned workflow will look
4. **Batch Cloning**: Clone multiple workflows at once
5. **Template Marketplace**: Share cloned workflows publicly

### Advanced Features
1. **Credential Mapping**: Map template credentials to user credentials
2. **Workflow Optimization**: Suggest improvements during cloning
3. **Version Control**: Track changes to cloned workflows
4. **Collaboration**: Multiple users working on same workflow

## Testing

Run the test script to verify functionality:

```bash
node test-n8n-clone.js
```

This will test the cloning process with a sample HubSpot to Excel workflow.

## Security Considerations

- **No Credentials**: Only workflow structure and variables are cloned
- **Safe Defaults**: All variables use safe default values
- **Inactive Start**: Workflows start disabled to prevent accidental execution
- **User Control**: Users must explicitly activate workflows in n8n

## Troubleshooting

### Common Issues

1. **Import URL Not Working**
   - Check if n8n instance is accessible
   - Verify the encoded workflow is valid
   - Try copying the URL manually

2. **Variables Not Injected**
   - Ensure variable names match detected patterns
   - Check if workflow has the expected node types
   - Verify variable injection logic

3. **Workflow Import Fails**
   - Check n8n version compatibility
   - Verify workflow JSON structure
   - Ensure all required fields are present

### Debug Steps

1. **Check Console**: Look for error messages in browser console
2. **Validate JSON**: Ensure workflow JSON is valid
3. **Test Variables**: Verify variable injection is working
4. **Check URL**: Test the import URL manually in n8n

## API Reference

### `cloneWorkflowToN8N(workflowJson, variables, n8nInstanceUrl?)`

**Parameters:**
- `workflowJson`: The n8n workflow JSON object
- `variables`: Object with variable names and default values
- `n8nInstanceUrl`: Optional custom n8n instance URL

**Returns:**
- `importUrl`: URL to import the workflow in n8n
- `workflowName`: Name of the cloned workflow
- `variablesInjected`: Number of variables successfully injected

### `generateN8NImportUrl(workflowJson, variables)`

**Parameters:**
- `workflowJson`: The n8n workflow JSON object
- `variables`: Object with variable names and default values

**Returns:**
- String URL for importing the workflow in n8n

## Conclusion

The n8n workflow cloning feature provides a seamless way to share and deploy n8n workflows with pre-configured variables. This significantly improves the user experience for both template creators and users, making it easy to get started with complex workflows while maintaining flexibility for customization.
