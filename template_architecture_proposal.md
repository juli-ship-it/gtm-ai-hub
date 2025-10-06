# Template System Architecture Proposal

## Overview
This document outlines the enhanced template system architecture that enables reusable n8n workflow templates with automatic variable detection and execution.

## Core Concepts

### 1. Template as a Wrapper
A template is a reusable wrapper around an n8n workflow that:
- Defines input variables and their validation rules
- Provides a user-friendly interface for execution
- Tracks execution history and results
- Enables sharing and discovery

### 2. n8n Workflow Integration
- **Upload n8n workflow JSON** during template creation
- **Parse workflow** to automatically detect variables
- **Store workflow metadata** for transparency and learning
- **Trigger execution** via webhook with variable substitution

## Enhanced Database Schema

### Template Table Enhancements
```sql
-- Add new columns to existing template table
ALTER TABLE template ADD COLUMN n8n_workflow_json jsonb;
ALTER TABLE template ADD COLUMN workflow_variables jsonb; -- Auto-detected variables
ALTER TABLE template ADD COLUMN execution_instructions text;
ALTER TABLE template ADD COLUMN estimated_duration_minutes integer;
ALTER TABLE template ADD COLUMN tags text[];
ALTER TABLE template ADD COLUMN difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE template ADD COLUMN systems_required text[]; -- e.g., ['hubspot', 'slack', 'excel']
ALTER TABLE template ADD COLUMN file_requirements jsonb; -- File upload requirements
```

### New Tables

#### Template Variable Definitions
```sql
CREATE TABLE template_variable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('string', 'number', 'boolean', 'file', 'select', 'multiselect', 'date', 'email')),
  required boolean DEFAULT false,
  description text,
  default_value jsonb,
  validation_rules jsonb, -- {min, max, pattern, options, etc.}
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

#### Template Execution Context
```sql
CREATE TABLE template_execution_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_run_id uuid REFERENCES template_run(id) ON DELETE CASCADE,
  variable_name text NOT NULL,
  variable_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

## n8n Workflow Analysis

### Variable Detection Algorithm
1. **Parse n8n workflow JSON**
2. **Identify webhook nodes** (entry points)
3. **Extract input parameters** from webhook configuration
4. **Scan for variable references** in node expressions ({{ $json.variableName }})
5. **Analyze node types** to determine variable types:
   - File upload nodes → `file` type
   - Select nodes → `select` type
   - Text inputs → `string` type
   - Number inputs → `number` type

### Example n8n Workflow Analysis
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "hubspot-segment-update"
      }
    },
    {
      "name": "HubSpot Get Segment",
      "type": "n8n-nodes-base.hubspot",
      "parameters": {
        "resource": "segment",
        "operation": "get",
        "segmentId": "={{ $json.segment_id }}"
      }
    }
  ]
}
```

**Detected Variables:**
- `segment_id` (string, required) - from HubSpot node expression
- `email_notification` (boolean, optional) - if email node exists
- `slack_channel` (string, optional) - if Slack node exists

## Template Creation Flow

### 1. Upload n8n Workflow
- User uploads n8n workflow JSON file
- System validates JSON structure
- Extract basic metadata (name, description, nodes)

### 2. Variable Detection & Configuration
- Auto-detect variables from workflow
- Present detected variables to user for review
- Allow user to:
  - Add missing variables
  - Modify variable types and validation
  - Set default values
  - Add descriptions

### 3. Template Configuration
- Set template metadata (category, tags, difficulty)
- Configure execution settings (approval required, etc.)
- Add execution instructions for users

### 4. Testing & Validation
- Test template with sample data
- Validate n8n webhook connectivity
- Ensure proper variable substitution

## Template Execution Flow

### 1. User Input Collection
- Dynamic form generation based on template variables
- Real-time validation
- File upload handling
- Progress indication

### 2. Variable Substitution
- Replace n8n workflow variables with user inputs
- Handle different variable types appropriately
- Validate required variables are provided

### 3. n8n Workflow Trigger
- Send webhook request to n8n with substituted variables
- Track execution ID
- Monitor execution status

### 4. Result Processing
- Capture execution results
- Store artifacts (file URLs, IDs, etc.)
- Update template run status
- Notify user of completion

## UI/UX Considerations

### Template Creation Page
- **Step 1**: Upload n8n workflow
- **Step 2**: Review detected variables
- **Step 3**: Configure template metadata
- **Step 4**: Test and publish

### Template Execution Page
- **Dynamic form** based on template variables
- **Real-time validation** with helpful error messages
- **File upload** with progress indication
- **Execution tracking** with live status updates

### Template Discovery
- **Search and filter** by category, tags, systems
- **Difficulty indicators** for learning purposes
- **Usage statistics** and success rates
- **Template preview** showing required variables

## Security & Governance

### Access Control
- **Template visibility** based on user roles
- **Execution permissions** per template
- **Approval workflows** for sensitive templates

### Data Handling
- **Variable encryption** for sensitive data
- **Audit logging** for all executions
- **Data retention** policies

### n8n Security
- **Webhook authentication** with tokens
- **Rate limiting** to prevent abuse
- **Input sanitization** before sending to n8n

## Implementation Phases

### Phase 1: Core Infrastructure
- Enhanced database schema
- n8n workflow parser
- Basic template creation flow

### Phase 2: Variable Detection
- Advanced variable detection algorithm
- Dynamic form generation
- Template execution engine

### Phase 3: Advanced Features
- Template versioning
- Approval workflows
- Advanced analytics
- Template marketplace

### Phase 4: Enterprise Features
- Multi-tenant support
- Advanced security
- Custom integrations
- White-label options

## Example Use Cases

### 1. HubSpot Segment to Excel
**Variables:**
- `segment_id` (string, required)
- `excel_file_name` (string, optional)
- `email_notification` (boolean, optional)
- `slack_channel` (string, optional)

**Workflow:**
1. Fetch HubSpot segment contacts
2. Export to Excel format
3. Upload to cloud storage
4. Send notification (email/Slack)

### 2. Content Calendar Automation
**Variables:**
- `content_type` (select: blog, social, email)
- `target_audience` (string, required)
- `keywords` (array, required)
- `publish_date` (date, required)
- `brand_guidelines` (file, optional)

**Workflow:**
1. Generate content ideas
2. Create content outline
3. Generate content using AI
4. Schedule in content calendar
5. Notify team

### 3. Lead Scoring Automation
**Variables:**
- `lead_source` (select, required)
- `scoring_criteria` (json, required)
- `notification_threshold` (number, required)
- `crm_integration` (select, required)

**Workflow:**
1. Fetch leads from source
2. Apply scoring algorithm
3. Update CRM with scores
4. Trigger notifications for high scores
5. Generate report

## Benefits

### For Template Creators
- **Reusable automations** without rebuilding
- **Transparent sharing** of workflow logic
- **Version control** and updates
- **Usage analytics** and feedback

### For Template Users
- **No-code execution** of complex workflows
- **Learning opportunity** through workflow transparency
- **Consistent results** with validated inputs
- **Time savings** on repetitive tasks

### For the Organization
- **Standardized processes** across teams
- **Knowledge sharing** and best practices
- **Reduced development time** for new automations
- **Better governance** and compliance
