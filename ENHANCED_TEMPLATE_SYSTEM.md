# Enhanced Template System with Parameterization & Credential Management

## Overview

This enhanced template system addresses your specific requirement to **parameterize hardcoded values** in n8n workflows and manage credentials securely. Instead of just detecting `{{ $json.variableName }}` patterns, the system now:

1. **Identifies hardcoded values** (like specific sheet names, table names, IDs, etc.)
2. **Replaces them with configurable variables** that users can set when executing templates
3. **Manages credentials** securely for external service integrations
4. **Reconstructs workflows** with user-provided values and credentials

## Key Features

### 🔧 **Workflow Parameterization**
- **Automatic Detection**: Scans n8n workflow JSON for hardcoded values
- **Smart Categorization**: Groups values by type (data, configuration, UI, credentials)
- **Node-Specific Analysis**: Understands different n8n node types (HubSpot, Google Sheets, Slack, etc.)
- **Variable Generation**: Creates meaningful variable names from hardcoded values

### 🔐 **Credential Management**
- **Secure Storage**: Encrypted storage of user credentials
- **Template-Based Forms**: Dynamic credential forms based on service type
- **User-Specific**: Each user manages their own credentials
- **Template Mapping**: Links credentials to specific workflow nodes

### 🎯 **Smart Variable Detection**

The system detects hardcoded values in various contexts:

#### **HubSpot Nodes**
- Segment IDs
- Object types (contact, company, deal)
- Property names
- Filter values

#### **Google Sheets Nodes**
- Spreadsheet IDs
- Sheet names
- Range specifications

#### **Slack Nodes**
- Channel names
- Message templates
- Bot configurations

#### **Email Nodes**
- Recipient addresses
- Subject lines
- SMTP settings

#### **HTTP Request Nodes**
- API endpoints
- Headers
- Authentication parameters

## Architecture

### **Core Components**

1. **N8N Workflow Parameterizer** (`lib/integrations/n8n-workflow-parameterizer.ts`)
   - Analyzes workflow JSON structure
   - Identifies hardcoded values by node type
   - Generates parameterized workflow with variables
   - Categorizes values by importance and type

2. **Credential Manager** (`lib/integrations/credential-manager.ts`)
   - Manages user credential storage
   - Provides credential templates for different services
   - Handles credential mapping to workflow nodes
   - Applies credentials to workflows during execution

3. **Enhanced Template Creation Form** (`components/template-creation-form.tsx`)
   - 5-step wizard for template creation
   - Workflow upload and analysis
   - Hardcoded value review and configuration
   - Credential requirement identification
   - Template metadata configuration
   - Review and creation

### **Database Schema**

#### **New Tables**

1. **`user_credentials`**
   - Stores encrypted user credentials
   - Links to specific credential types
   - User-specific access control

2. **`template_credential_mapping`**
   - Maps templates to required credentials
   - Links credentials to specific workflow nodes
   - Enables credential substitution during execution

3. **`credential_template`**
   - Defines credential form schemas
   - Service-specific field definitions
   - Validation rules and requirements

#### **Enhanced Template Table**
- `n8n_workflow_json`: Original workflow JSON
- `workflow_variables`: Detected variables and their configurations
- `execution_instructions`: User guidance for template execution
- `estimated_duration_minutes`: Time estimates
- `difficulty_level`: Complexity rating
- `systems_required`: Required external services
- `file_requirements`: File upload specifications

## Usage Flow

### **Template Creation**

1. **Upload Workflow**: User uploads n8n workflow JSON
2. **Analysis**: System detects hardcoded values and credentials
3. **Review**: User reviews detected variables and credentials
4. **Configuration**: User configures template metadata
5. **Creation**: Template is saved with parameterized workflow

### **Template Execution**

1. **Select Template**: User chooses a template
2. **Provide Variables**: User fills in required variables
3. **Configure Credentials**: User selects or creates credentials
4. **Execute**: System reconstructs workflow with user values
5. **Trigger**: Workflow is sent to n8n for execution

## Example: HubSpot to Google Sheets Template

### **Original Workflow**
```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.hubspot",
      "parameters": {
        "segmentId": "12345678",
        "resource": "contact",
        "filters": {
          "property": [
            {"property": "email", "value": "test@example.com"}
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "spreadsheetId": "1ABC123DEF456",
        "sheetName": "Contacts",
        "range": "A1:Z1000"
      }
    }
  ]
}
```

### **Parameterized Workflow**
```json
{
  "nodes": [
    {
      "type": "n8n-nodes-base.hubspot",
      "parameters": {
        "segmentId": "{{ $json.hubspot_segment_id }}",
        "resource": "{{ $json.hubspot_object_type }}",
        "filters": {
          "property": [
            {"property": "{{ $json.hubspot_property_1 }}", "value": "{{ $json.hubspot_filter_value }}"}
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.googleSheets",
      "parameters": {
        "spreadsheetId": "{{ $json.google_sheets_id }}",
        "sheetName": "{{ $json.google_sheets_sheet_name }}",
        "range": "{{ $json.google_sheets_range }}"
      }
    }
  ]
}
```

### **Detected Variables**
- `hubspot_segment_id`: "12345678" → Required, String
- `hubspot_object_type`: "contact" → Required, Select (contact, company, deal)
- `hubspot_property_1`: "email" → Optional, String
- `hubspot_filter_value`: "test@example.com" → Optional, String
- `google_sheets_id`: "1ABC123DEF456" → Required, String
- `google_sheets_sheet_name`: "Contacts" → Required, String
- `google_sheets_range`: "A1:Z1000" → Optional, String

### **Required Credentials**
- HubSpot API credentials
- Google Sheets OAuth2 credentials

## Security Features

### **Credential Protection**
- **Encryption**: All credential values are encrypted at rest
- **User Isolation**: Users can only access their own credentials
- **Template Mapping**: Credentials are mapped to specific template nodes
- **No Exposure**: Credentials are never exposed in the UI

### **Access Control**
- **Row Level Security**: Database-level access control
- **User-Specific**: Templates and credentials are user-scoped
- **Admin Controls**: Admins can manage credential templates
- **Audit Trail**: All credential usage is logged

## Benefits

### **For Template Creators**
- **Automatic Detection**: No manual variable identification
- **Smart Categorization**: Values are automatically categorized
- **Credential Management**: Built-in credential requirement detection
- **Reusability**: Templates work for any user with proper credentials

### **For Template Users**
- **Easy Configuration**: Simple forms for variable input
- **Credential Reuse**: Use existing credentials across templates
- **Clear Requirements**: Know exactly what's needed before execution
- **Secure Execution**: Credentials are handled securely

### **For the Platform**
- **Scalability**: Templates work across different user environments
- **Security**: Centralized credential management
- **Flexibility**: Easy to add new node types and credential types
- **Maintainability**: Clear separation of concerns

## Next Steps

1. **Test the System**: Upload sample n8n workflows to test parameterization
2. **Add More Node Types**: Extend support for additional n8n nodes
3. **Credential Validation**: Add real-time credential validation
4. **Template Marketplace**: Allow sharing of public templates
5. **Execution Monitoring**: Track template execution success/failure
6. **Variable Suggestions**: AI-powered variable name suggestions

## Files Created/Modified

### **New Files**
- `lib/integrations/n8n-workflow-parameterizer.ts` - Workflow parameterization logic
- `lib/integrations/credential-manager.ts` - Credential management system
- `supabase/migrations/018_credential_management_only.sql` - Database schema

### **Modified Files**
- `components/template-creation-form.tsx` - Enhanced with parameterization and credentials
- `types/database.ts` - Added credential table types
- `app/templates/page.tsx` - Updated to handle new template features

This enhanced system now properly addresses your requirement to parameterize hardcoded values in n8n workflows while maintaining security and usability. Users can upload their n8n workflows, and the system will automatically identify what needs to be made configurable, making templates truly reusable across different environments and use cases.
