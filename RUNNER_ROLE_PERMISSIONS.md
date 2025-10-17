# Runner Role Permissions

This document outlines the updated permissions for the **runner** role in the GTM AI Hub system.

## Overview

The **runner** role has been updated to be more permissive for content creation while maintaining appropriate restrictions for editing. Runners can now create and manage their own content but cannot edit content created by others.

## Updated Runner Role Permissions

### ✅ **What Runners CAN Do:**

#### **Content Creation**
- **Create templates** - Build new automation workflows
- **Create prompts** - Create AI prompt templates for different roles
- **Create GPT agents** - Set up custom GPT agents for specific tasks
- **Create playbooks** - Build multi-step automation workflows
- **Create intake requests** - Submit new automation requests

#### **Content Management (Own Content Only)**
- **Edit their own templates** - Modify templates they created
- **Edit their own prompts** - Update prompts they created
- **Edit their own GPT agents** - Configure GPT agents they created
- **Edit their own playbooks** - Update playbooks they own
- **Delete their own content** - Remove templates, prompts, agents, playbooks they created

#### **Content Interaction**
- **Read all content** - View all templates, prompts, GPT agents, playbooks
- **Execute templates** - Run automation workflows
- **Use GPT agents** - Access and use active GPT agents
- **Add comments** - Comment on any intake request or content
- **View all intake requests** - See all submitted requests for transparency

#### **Intake Request Management**
- **Create intake requests** - Submit new automation requests
- **Edit content fields** of their own intake requests (title, problem_statement, etc.)
- **Update their own requests** - Modify non-administrative fields

### ❌ **What Runners CANNOT Do:**

#### **Content Editing (Others' Content)**
- **Edit templates created by others** - Cannot modify templates they didn't create
- **Edit prompts created by others** - Cannot modify prompts they didn't create
- **Edit GPT agents created by others** - Cannot modify GPT agents they didn't create
- **Edit playbooks created by others** - Cannot modify playbooks they don't own

#### **Administrative Functions**
- **Modify administrative fields** - Cannot change status, priority, category of intake requests
- **Manage users** - Cannot create or modify other user accounts
- **Access admin features** - No administrative privileges
- **Delete others' content** - Cannot remove content created by other users

#### **System Management**
- **Bypass stage tracking** - Cannot modify intake request stages (only juliana.reyes@workleap.com can)
- **System configuration** - Cannot modify system-wide settings

## Permission Structure by Content Type

### **Templates**
```
CREATE: ✅ All authenticated users (runners included)
READ:   ✅ All authenticated users (enabled templates)
UPDATE: ✅ Only content creators (runners can edit their own)
DELETE: ✅ Only content creators (runners can delete their own)
```

### **Prompts**
```
CREATE: ✅ All authenticated users (runners included)
READ:   ✅ All authenticated users
UPDATE: ✅ Only content creators (runners can edit their own)
DELETE: ✅ Only content creators (runners can delete their own)
```

### **GPT Agents**
```
CREATE: ✅ All authenticated users (runners included)
READ:   ✅ All authenticated users (active agents)
UPDATE: ✅ Only content creators (runners can edit their own)
DELETE: ✅ Only content creators (runners can delete their own)
```

### **Playbooks**
```
CREATE: ✅ All authenticated users (runners included)
READ:   ✅ All authenticated users
UPDATE: ✅ Only owners (runners can edit their own)
DELETE: ✅ Only owners (runners can delete their own)
```

### **Intake Requests**
```
CREATE: ✅ All authenticated users (runners included)
READ:   ✅ All authenticated users
UPDATE: ✅ Content fields by requester, Admin fields by juliana.reyes@workleap.com only
DELETE: ❌ Not allowed (requests are permanent records)
```

### **Comments**
```
CREATE: ✅ All authenticated users (runners included)
READ:   ✅ All authenticated users
UPDATE: ✅ Only comment authors (runners can edit their own)
DELETE: ✅ Only comment authors (runners can delete their own)
```

## Role Hierarchy

The updated role structure is:

1. **`runner`** (Default) - Create and manage own content, execute tools
2. **`editor`** - Everything runners can do + edit others' content
3. **`admin`** - Full system access + user management

## Implementation Details

### **Database Policies**
The system uses Row Level Security (RLS) policies to enforce these permissions:

```sql
-- Example: Template creation policy
CREATE POLICY "All authenticated users can create templates" ON template
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND created_by = auth.uid()
  );

-- Example: Template update policy
CREATE POLICY "Users can update their own templates" ON template
  FOR UPDATE USING (created_by = auth.uid());
```

### **Field-Level Restrictions**
For intake requests, field-level restrictions are enforced via database triggers:

- **Content fields** (editable by requester): title, problem_statement, automation_idea, etc.
- **Administrative fields** (editable by juliana.reyes@workleap.com only): status, priority, category, frequency, sensitivity

## Use Cases for Runner Role

The updated runner role is perfect for:

### **Content Creators**
- **Marketing team members** who want to create their own automation templates
- **Sales reps** who need to build custom prompts for their workflows
- **Customer success** who want to create GPT agents for their use cases

### **Power Users**
- **Team leads** who want to create and manage their team's automation tools
- **Process owners** who need to build and maintain their own workflows
- **Subject matter experts** who want to create specialized content

### **Collaborative Teams**
- **Cross-functional teams** where members create content for their domains
- **Distributed teams** where local experts create region-specific tools
- **Growing organizations** where more people need creation capabilities

## Migration from Previous Runner Role

### **What Changed**
- **Before**: Runners could only execute templates and view content
- **After**: Runners can create and manage their own content

### **Backward Compatibility**
- **Existing runners** automatically get the new permissions
- **No data migration** required
- **Existing content** remains unchanged

### **User Experience**
- **More autonomy** for runners to create their own tools
- **Better collaboration** through comments on others' content
- **Clear ownership** of created content

## Testing

Use the provided test script to verify runner permissions:

```bash
node test_runner_permissions.js
```

The test script verifies:
1. ✅ Runners can create templates
2. ✅ Runners can create prompts
3. ✅ Runners can create GPT agents
4. ✅ Runners can create playbooks
5. ✅ Runners can update their own content
6. ✅ Runners can create comments

## Security Considerations

### **Content Ownership**
- **Clear ownership** is enforced at the database level
- **Users can only edit** content they created
- **Audit trail** tracks who created and modified content

### **Administrative Controls**
- **Stage tracking** remains restricted to juliana.reyes@workleap.com
- **User management** remains admin-only
- **System configuration** remains admin-only

### **Data Integrity**
- **RLS policies** prevent unauthorized access
- **Database triggers** enforce field-level restrictions
- **Audit logging** tracks all changes

## Troubleshooting

### **Common Issues**

1. **"Permission denied" when creating content**:
   - Ensure user is authenticated
   - Verify user exists in app_user table
   - Check that RLS policies are properly applied

2. **"Cannot edit content created by others"**:
   - This is expected behavior
   - Use comments to suggest changes
   - Contact the content creator for modifications

3. **"Cannot modify administrative fields"**:
   - Only juliana.reyes@workleap.com can modify status, priority, category
   - Contact juliana.reyes@workleap.com for administrative changes

### **Debug Queries**

```sql
-- Check current RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('template', 'prompt', 'gpt_agent', 'playbook')
ORDER BY tablename, policyname;

-- Check user roles
SELECT id, email, role FROM app_user WHERE role = 'runner';

-- Check content ownership
SELECT id, name, created_by FROM template WHERE created_by = auth.uid();
```

## Future Enhancements

1. **Collaborative editing** - Allow multiple users to edit shared content
2. **Content sharing** - Allow users to share their content with specific teams
3. **Approval workflows** - Add approval processes for content changes
4. **Content templates** - Provide templates for common content types
5. **Usage analytics** - Track which content is most used by runners
