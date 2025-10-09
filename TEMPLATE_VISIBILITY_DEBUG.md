# Template Visibility Debug Guide

## 🔍 **Why Templates Aren't Showing Up**

### **Common Causes:**

#### **1. Templates are Disabled**
- **Issue**: Templates exist but `enabled = false`
- **Fix**: Check template status in database
- **Query**: `SELECT id, name, enabled FROM template;`

#### **2. Missing Database Columns**
- **Issue**: New columns (`n8n_enum`, `excel_config`, etc.) don't exist
- **Fix**: Run the SQL script to add missing columns
- **Query**: Check `information_schema.columns` for `template_variable` table

#### **3. Query Error**
- **Issue**: Database query fails due to missing columns
- **Fix**: Temporarily remove new columns from query
- **Debug**: Check browser console for errors

#### **4. Authentication Issues**
- **Issue**: User not authenticated or permissions
- **Fix**: Check user authentication status
- **Debug**: Check if user is logged in

## 🛠️ **Debugging Steps**

### **Step 1: Check Database Status**
Run this SQL in your Supabase SQL editor:

```sql
-- Check template status
SELECT 
  COUNT(*) as total_templates,
  COUNT(CASE WHEN enabled = true THEN 1 END) as enabled_templates,
  COUNT(CASE WHEN enabled = false THEN 1 END) as disabled_templates
FROM template;

-- Show all templates
SELECT id, name, enabled, created_at FROM template ORDER BY created_at DESC;
```

### **Step 2: Check Template Variables**
```sql
-- Check if template_variable table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'template_variable' 
AND table_schema = 'public'
ORDER BY column_name;
```

### **Step 3: Add Missing Columns (if needed)**
```sql
-- Add missing columns to template_variable table
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS n8n_enum text[];
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS excel_config jsonb;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS business_context text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS ai_reasoning text;
ALTER TABLE template_variable ADD COLUMN IF NOT EXISTS validation jsonb;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_template_variable_category ON template_variable(category);
CREATE INDEX IF NOT EXISTS idx_template_variable_type ON template_variable(type);

-- Set default category
UPDATE template_variable SET category = 'configuration' WHERE category IS NULL;
```

### **Step 4: Enable Templates (if needed)**
```sql
-- Enable all templates
UPDATE template SET enabled = true WHERE enabled = false;

-- Or enable specific templates
UPDATE template SET enabled = true WHERE name = 'Your Template Name';
```

### **Step 5: Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

## 🔧 **Temporary Fixes Applied**

### **1. Removed Enabled Filter**
- Temporarily removed `.eq('enabled', true)` to show all templates
- This will show disabled templates too

### **2. Simplified Query**
- Removed new columns from query to avoid errors
- Using basic fields only: `id, name, type, required, description, default_value, validation_rules, order_index`

### **3. Added Debug Logging**
- Added console logs to see how many templates are fetched
- Added error logging to identify query issues

## 📊 **Expected Results**

### **If Templates Show Up:**
- ✅ Templates are visible in the library
- ✅ Basic functionality works
- ✅ Need to add missing database columns for full functionality

### **If Templates Still Don't Show:**
- ❌ Check browser console for errors
- ❌ Check database connection
- ❌ Check authentication status
- ❌ Verify templates exist in database

## 🚀 **Next Steps**

### **1. Immediate Fix**
- Templates should now be visible (with simplified query)
- Check browser console for any remaining errors

### **2. Add Missing Columns**
- Run the SQL script to add new columns
- Restore the full query with all fields
- Re-enable the `enabled = true` filter

### **3. Test Full Functionality**
- Test template cloning with n8n enums
- Test template editing with enhanced fields
- Verify all features work correctly

## 🐛 **Common Error Messages**

### **"Column does not exist"**
- **Cause**: Missing database columns
- **Fix**: Run the SQL script to add columns

### **"Permission denied"**
- **Cause**: Authentication or RLS issues
- **Fix**: Check user authentication and RLS policies

### **"No templates found"**
- **Cause**: All templates disabled or query filter
- **Fix**: Check template status and remove filters

The templates should now be visible! Check the browser console for any error messages and let me know what you see. 🎉
