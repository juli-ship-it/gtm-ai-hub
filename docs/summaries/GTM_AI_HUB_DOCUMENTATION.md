# GTM AI Hub & GTM Intake Documentation

## Table of Contents
1. [Overview](#overview)
2. [GTM AI Hub Features](#gtm-ai-hub-features)
3. [GTM Intake System](#gtm-intake-system)
4. [Template System](#template-system)
5. [Slack Integration](#slack-integration)
6. [User Guide](#user-guide)
7. [Technical Architecture](#technical-architecture)
8. [Best Practices](#best-practices)

---

## Overview

The GTM AI Hub is a comprehensive platform that centralizes AI templates, GTM playbooks, intake management, and automation workflows. Built with Next.js 14, TypeScript, and Supabase, it provides a modern, Workleap-inspired interface for managing go-to-market operations.

### Key Components
- **Template System**: Create, manage, and clone n8n workflow templates
- **GTM Intake**: Streamlined request collection and processing
- **Slack Integration**: Seamless intake submission through Slack modals
- **GPT Agents**: Integration with custom OpenAI GPT agents
- **HR University**: AI-powered learning modules for HR teams

---

## GTM AI Hub Features

### 🎯 Core Functionality

#### 1. Template Management
- **Create Templates**: Upload n8n workflow JSON files and automatically analyze them
- **AI-Powered Analysis**: Intelligent variable detection and workflow optimization
- **Template Cloning**: One-click cloning with variable injection
- **Category Organization**: Content, Reporting, Intake, and Governance categories
- **Public/Private Templates**: Control template visibility and access

#### 2. Workflow Analysis
- **Automatic Variable Detection**: AI identifies configurable parameters
- **System Integration Detection**: Recognizes HubSpot, Slack, Google Sheets, etc.
- **Complexity Assessment**: Evaluates workflow difficulty and duration
- **Smart Defaults**: Provides sensible default values for variables

#### 3. GPT Agents Integration
- **Card-Based Navigation**: Beautiful agent cards with one-click access
- **No API Keys Required**: Users access agents through their own ChatGPT accounts
- **Automatic Agent Creation**: From Slack intake submissions
- **Category Organization**: Content, Analysis, Automation, and Support categories

#### 4. HR University
- **Self-Paced Learning**: AI applications in HR training modules
- **Progress Tracking**: Completion certificates and learning analytics
- **Interactive Lessons**: Quizzes and hands-on exercises
- **Intake System**: Request new modules through Slack integration

---

## GTM Intake System

### 📋 Intake Flow Overview

The GTM Intake system streamlines the collection and processing of automation requests through multiple channels:

```
Slack Modal → n8n Workflow → Supabase Edge Function → Database
```

### 🎯 Intake Types

#### 1. Real Requests
- **Purpose**: Submit actual automation requests for your team
- **Processing**: Full workflow from submission to implementation
- **Tracking**: Complete lifecycle management with status updates

#### 2. Showcase Examples
- **Purpose**: Create demo examples to showcase the intake system
- **Processing**: Simplified workflow for demonstration purposes
- **Use Case**: Training, demos, and system validation

### 📊 Intake Categories

| Category | Description | Icon |
|----------|-------------|------|
| **Campaign Execution** | Marketing campaign automation | 🎯 |
| **Content Creation** | Content generation and management | 📄 |
| **Lead Management** | Lead scoring and nurturing | 👥 |
| **Reporting** | Analytics and reporting automation | 📊 |
| **Other** | Miscellaneous automation requests | ⚡ |

### 🔄 Intake Process

1. **Submission**: User submits request via Slack modal or web form
2. **Validation**: System validates required fields and data integrity
3. **Processing**: Edge function processes and stores request
4. **GPT Agent Detection**: Automatically creates GPT agents if URLs provided
5. **Notification**: Team receives notification of new request
6. **Tracking**: Full audit trail and status management

---

## Template System

### 🛠️ Template Creation

#### Step 1: Upload Workflow
- Upload n8n workflow JSON file
- System automatically parses and analyzes the workflow
- AI identifies variables and system integrations

#### Step 2: AI Analysis
- **Variable Detection**: Identifies configurable parameters
- **System Recognition**: Detects HubSpot, Slack, Google Sheets, etc.
- **Complexity Assessment**: Evaluates difficulty and estimated duration
- **Smart Suggestions**: Recommends improvements and optimizations

#### Step 3: Template Configuration
- **Basic Information**: Name, description, category, tags
- **Difficulty Level**: Beginner, Intermediate, or Advanced
- **Execution Instructions**: Step-by-step usage guide
- **Video Integration**: How-to-use and how-it-was-built videos
- **Visibility Settings**: Public/private and approval requirements

#### Step 4: Variable Management
- **Auto-Detected Variables**: AI-identified configurable parameters
- **Custom Variables**: User-defined additional parameters
- **Validation Rules**: Input validation and constraints
- **Default Values**: Sensible defaults for easy setup

### 🔄 Template Cloning

#### Clone Process
1. **Select Template**: Choose from available templates
2. **Configure Variables**: Fill in your specific values
3. **Generate Workflow**: System injects variables into n8n JSON
4. **Import to n8n**: One-click import with pre-configured variables

#### Variable Injection
- **Smart Defaults**: Pre-filled with sensible values
- **Type Validation**: Ensures correct data types
- **Business Context**: Clear descriptions of what each variable does
- **Validation Rules**: Prevents invalid configurations

### 📁 Template Categories

| Category | Description | Use Cases |
|----------|-------------|-----------|
| **Content** | Content creation and management | Blog posts, social media, email campaigns |
| **Reporting** | Analytics and reporting | Dashboards, KPI tracking, data exports |
| **Intake** | Request processing | Form submissions, lead capture, feedback |
| **Governance** | Compliance and security | Data validation, approval workflows, audits |

---

## Slack Integration

### 💬 Slack Intake Modal

The Slack integration provides a seamless way for team members to submit automation requests directly from Slack.

#### Modal Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| **Title** | Text | Short summary of the request | ✅ |
| **Job to be Done** | Textarea | Detailed description of the problem | ✅ |
| **Category** | Select | Type of automation needed | ✅ |
| **Current Process** | Textarea | How it's currently done manually | ✅ |
| **Pain Points** | Textarea | Specific challenges and frustrations | ✅ |
| **Frequency** | Select | How often this task is performed | ✅ |
| **Time Estimate** | Text | How long it currently takes | ✅ |
| **Systems Used** | Multi-select | Tools and platforms involved | ✅ |
| **Data Sensitivity** | Select | Level of data sensitivity | ✅ |
| **Priority** | Select | Urgency level (P0-P3) | ✅ |
| **Links** | Text | Relevant URLs and resources | ❌ |
| **GPT Agent URL** | Text | ChatGPT agent URL (optional) | ❌ |

#### Request Types

##### Real Request
- **Purpose**: Submit actual automation request
- **Processing**: Full workflow with team assignment
- **Tracking**: Complete lifecycle management
- **Notification**: Team receives notification

##### Showcase Example
- **Purpose**: Create demo for system validation
- **Processing**: Simplified workflow
- **Use Case**: Training, demos, testing

### 🤖 GPT Agent Integration

#### Automatic Agent Creation
When users include GPT Agent URLs in their intake submissions:

1. **URL Detection**: System scans for ChatGPT URLs
2. **Agent Extraction**: Extracts agent ID and information
3. **Automatic Creation**: Creates GPT Agent entry in database
4. **Category Mapping**: Maps intake category to agent category
5. **Linking**: Links agent to original intake request

#### Category Mapping
| Intake Category | GPT Agent Category |
|----------------|-------------------|
| Content | Content |
| Reporting | Analysis |
| Intake | Support |
| Governance | Support |
| Automation | Automation |
| Other | Support |

---

## User Guide

### 🚀 Getting Started

#### 1. Access the Platform
- Navigate to the GTM AI Hub URL
- Sign in with your credentials
- Explore the dashboard and available templates

#### 2. Submit an Intake Request

##### Via Slack (Recommended)
1. Open Slack and navigate to your team's channel
2. Use the slash command or click the intake button
3. Fill out the modal form with your request details
4. Submit and wait for team notification

##### Via Web Form
1. Navigate to the Intake page
2. Click "Submit Request"
3. Fill out the form with required information
4. Submit and track your request

#### 3. Create a Template

##### From Existing Workflow
1. Go to Templates page
2. Click "Create Template"
3. Upload your n8n workflow JSON file
4. Review AI analysis and detected variables
5. Configure template settings and metadata
6. Save and publish your template

##### From Scratch
1. Use the template creation form
2. Define your workflow structure
3. Add custom variables and validation rules
4. Configure execution instructions
5. Save as draft or publish

#### 4. Clone a Template

##### Quick Clone
1. Browse available templates
2. Click "Clone" on desired template
3. Fill in your specific variable values
4. Generate customized workflow
5. Import to n8n or download JSON

##### Advanced Clone
1. Select template with complex variables
2. Review all variable descriptions
3. Configure validation rules
4. Test with sample data
5. Deploy to production

### 📊 Managing Requests

#### Viewing Requests
- **Dashboard**: Overview of all requests
- **Filtering**: By status, category, priority, or assignee
- **Search**: Find specific requests by title or description
- **Sorting**: By date, priority, or status

#### Updating Status
- **New**: Initial submission
- **In Review**: Being evaluated by team
- **In Progress**: Currently being worked on
- **Completed**: Successfully implemented
- **On Hold**: Paused for external reasons
- **Cancelled**: No longer needed

#### Adding Comments
- **Progress Updates**: Regular status updates
- **Questions**: Clarifications and requirements
- **Decisions**: Important decisions and changes
- **Completion Notes**: Final implementation details

---

## Technical Architecture

### 🏗️ System Components

#### Frontend (Next.js 14)
- **Framework**: Next.js with App Router and React Server Components
- **UI Library**: TailwindCSS + shadcn/ui + Lucide React
- **State Management**: Server Actions + React Query
- **Authentication**: Supabase Auth with Row Level Security

#### Backend (Supabase)
- **Database**: PostgreSQL with real-time subscriptions
- **Authentication**: Built-in auth with social providers
- **Storage**: File storage for workflow JSONs and videos
- **Edge Functions**: Serverless functions for processing

#### Integrations
- **n8n**: Workflow orchestration and automation
- **Slack**: Intake submission and notifications
- **OpenAI**: AI analysis and GPT agent integration
- **Loom**: Video integration for tutorials

### 🔄 Data Flow

#### Template Creation Flow
```
User Upload → AI Analysis → Variable Detection → Template Storage → Database
```

#### Intake Processing Flow
```
Slack Modal → n8n Webhook → Edge Function → Database → Notification
```

#### Template Cloning Flow
```
Template Selection → Variable Configuration → JSON Generation → n8n Import
```

### 🗄️ Database Schema

#### Core Tables
- **template**: Template metadata and configuration
- **template_variable**: Configurable parameters for templates
- **template_run**: Execution history and results
- **intake_request**: Automation requests and requirements
- **gpt_agent**: GPT agent configurations and metadata
- **app_user**: User profiles and permissions

#### Relationships
- Templates have many variables and runs
- Intake requests can create GPT agents
- Users own templates and requests
- Runs track template execution history

---

## Best Practices

### 📝 Template Creation

#### 1. Workflow Design
- **Keep it Simple**: Start with basic workflows and add complexity gradually
- **Clear Naming**: Use descriptive names for nodes and variables
- **Error Handling**: Include proper error handling and fallbacks
- **Documentation**: Add clear comments and descriptions

#### 2. Variable Configuration
- **Meaningful Names**: Use clear, descriptive variable names
- **Sensible Defaults**: Provide helpful default values
- **Validation Rules**: Include proper input validation
- **Business Context**: Explain why each variable is needed

#### 3. Template Metadata
- **Clear Descriptions**: Write comprehensive template descriptions
- **Accurate Categories**: Choose appropriate categories and tags
- **Difficulty Assessment**: Be honest about complexity levels
- **Execution Instructions**: Provide step-by-step usage guides

### 🎯 Intake Management

#### 1. Request Quality
- **Clear Problem Statement**: Describe the problem clearly and concisely
- **Current Process**: Explain how it's currently done manually
- **Pain Points**: Identify specific challenges and frustrations
- **Success Criteria**: Define what success looks like

#### 2. Priority Management
- **P0 (Critical)**: System down, blocking critical business functions
- **P1 (High)**: Important business impact, should be addressed soon
- **P2 (Medium)**: Moderate business value, can wait for next sprint
- **P3 (Low)**: Nice to have, low business impact

#### 3. Communication
- **Regular Updates**: Provide status updates throughout the process
- **Clear Questions**: Ask specific, actionable questions
- **Documentation**: Document decisions and changes
- **Feedback**: Provide feedback on completed requests

### 🔧 System Maintenance

#### 1. Template Updates
- **Version Control**: Keep track of template versions and changes
- **Testing**: Test templates before publishing updates
- **Backward Compatibility**: Consider impact on existing clones
- **Documentation**: Update documentation with changes

#### 2. Performance Optimization
- **Query Optimization**: Optimize database queries for better performance
- **Caching**: Implement appropriate caching strategies
- **Monitoring**: Monitor system performance and usage
- **Scaling**: Plan for increased usage and load

#### 3. Security
- **Access Control**: Implement proper user permissions and roles
- **Data Validation**: Validate all user inputs and data
- **Audit Logging**: Log important actions and changes
- **Regular Updates**: Keep dependencies and systems updated

---

## Conclusion

The GTM AI Hub and GTM Intake system provide a comprehensive platform for managing go-to-market operations with AI-powered automation. By following the guidelines and best practices outlined in this documentation, teams can effectively leverage the platform to streamline their workflows, improve efficiency, and scale their operations.

For additional support or questions, please refer to the technical documentation or contact the development team.

---

*Last updated: December 2024*
*Version: 1.0*
