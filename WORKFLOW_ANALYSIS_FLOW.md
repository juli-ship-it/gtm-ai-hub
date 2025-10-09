# AI Workflow Analysis Flow

## 1. Template Creation (AI Analysis Trigger)

```
User uploads n8n workflow JSON
    ↓
AI analyzes workflow (ONCE)
    ↓
Variables stored in template_variable table
    ↓
Template created with AI-generated variables
```

## 2. Template Cloning (No AI Analysis)

```
User clicks "Clone" on template
    ↓
Load variables from template_variable table
    ↓
User fills out their values
    ↓
Variables injected into n8n JSON
    ↓
User downloads customized workflow
```

## 3. Database Storage

### Template Table
- `n8n_workflow_json` - Original workflow JSON
- `workflow_analysis` - AI analysis metadata

### Template Variable Table
- `template_id` - Links to template
- `name` - Variable name (e.g., "hubspotListId")
- `type` - Variable type (string, select, etc.)
- `required` - Is it required?
- `description` - What it does
- `default_value` - Default value
- `category` - schedule, data_source, etc.
- `business_context` - Why user needs this
- `ai_reasoning` - Why AI identified this

## 4. AI Prompt Structure

```
System: "You are an expert workflow analyst..."

User Prompt:
- Workflow name and node count
- Each node's name, type, and parameters
- Connection structure
- Request for business-relevant variables only

Response Format:
- JSON with variables array
- Each variable has name, type, description, etc.
- Business context and AI reasoning
```

## 5. Cost & Cadence

### AI Analysis Cost
- **Trigger**: Only during template creation
- **Frequency**: Once per template (not per clone)
- **Cost**: ~$0.03 per analysis (OpenAI GPT-4)
- **Caching**: Results stored in database

### No Repeated AI Calls
- Template creation: AI analysis (1x)
- Template cloning: No AI calls (uses stored variables)
- Template editing: No AI calls (uses stored variables)

## 6. Variable Injection Process

```
User fills out variables:
- scheduleInterval: "Daily"
- hubspotListId: "12345"
- excelFilePath: "/exports/contacts.xlsx"

System injects into n8n JSON:
- Replaces {{ $json.scheduleInterval }} with "Daily"
- Replaces {{ $json.hubspotListId }} with "12345"
- Replaces {{ $json.excelFilePath }} with "/exports/contacts.xlsx"

User downloads customized workflow
```

## 7. Data Persistence

### Template Creation
1. AI analyzes workflow → Variables extracted
2. Variables saved to `template_variable` table
3. Template created with variables

### Template Cloning
1. Load variables from `template_variable` table
2. User fills out their values
3. Values injected into workflow JSON
4. User downloads customized workflow

### No Re-analysis
- Variables are stored permanently
- No need to re-analyze workflow
- Fast cloning process
