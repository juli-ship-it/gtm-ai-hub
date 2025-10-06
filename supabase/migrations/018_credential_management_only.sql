-- Credential Management System (Safe Version)
-- This migration only creates the credential management tables

-- User credentials table
CREATE TABLE IF NOT EXISTS user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_user(id) ON DELETE CASCADE,
  credential_type text NOT NULL,
  name text NOT NULL,
  values jsonb NOT NULL, -- Encrypted credential values
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, credential_type, name)
);

-- Template credential mapping table
CREATE TABLE IF NOT EXISTS template_credential_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES template(id) ON DELETE CASCADE,
  user_credential_id uuid REFERENCES user_credentials(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  parameter_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, node_id, parameter_name)
);

-- Credential templates table (for UI generation)
CREATE TABLE IF NOT EXISTS credential_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_type text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  fields jsonb NOT NULL, -- Array of field definitions
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_type ON user_credentials(credential_type);
CREATE INDEX IF NOT EXISTS idx_user_credentials_active ON user_credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_template_credential_mapping_template_id ON template_credential_mapping(template_id);
CREATE INDEX IF NOT EXISTS idx_template_credential_mapping_user_credential_id ON template_credential_mapping(user_credential_id);
CREATE INDEX IF NOT EXISTS idx_credential_template_type ON credential_template(credential_type);
CREATE INDEX IF NOT EXISTS idx_credential_template_active ON credential_template(is_active);

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_credential_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_template ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_credentials
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can view their own credentials') THEN
        CREATE POLICY "Users can view their own credentials" ON user_credentials
          FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can create their own credentials') THEN
        CREATE POLICY "Users can create their own credentials" ON user_credentials
          FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can update their own credentials') THEN
        CREATE POLICY "Users can update their own credentials" ON user_credentials
          FOR UPDATE USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_credentials' AND policyname = 'Users can delete their own credentials') THEN
        CREATE POLICY "Users can delete their own credentials" ON user_credentials
          FOR DELETE USING (user_id = auth.uid());
    END IF;
END $$;

-- RLS Policies for template_credential_mapping
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_credential_mapping' AND policyname = 'Users can view mappings for their templates') THEN
        CREATE POLICY "Users can view mappings for their templates" ON template_credential_mapping
          FOR SELECT USING (
            template_id IN (
              SELECT id FROM template WHERE created_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_credential_mapping' AND policyname = 'Users can create mappings for their templates') THEN
        CREATE POLICY "Users can create mappings for their templates" ON template_credential_mapping
          FOR INSERT WITH CHECK (
            template_id IN (
              SELECT id FROM template WHERE created_by = auth.uid()
            ) AND
            user_credential_id IN (
              SELECT id FROM user_credentials WHERE user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_credential_mapping' AND policyname = 'Users can update mappings for their templates') THEN
        CREATE POLICY "Users can update mappings for their templates" ON template_credential_mapping
          FOR UPDATE USING (
            template_id IN (
              SELECT id FROM template WHERE created_by = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'template_credential_mapping' AND policyname = 'Users can delete mappings for their templates') THEN
        CREATE POLICY "Users can delete mappings for their templates" ON template_credential_mapping
          FOR DELETE USING (
            template_id IN (
              SELECT id FROM template WHERE created_by = auth.uid()
            )
          );
    END IF;
END $$;

-- RLS Policies for credential_template
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credential_template' AND policyname = 'All authenticated users can view credential templates') THEN
        CREATE POLICY "All authenticated users can view credential templates" ON credential_template
          FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credential_template' AND policyname = 'Admins can manage credential templates') THEN
        CREATE POLICY "Admins can manage credential templates" ON credential_template
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM app_user 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;

-- Insert default credential templates
INSERT INTO credential_template (credential_type, name, description, fields) VALUES
('hubspotApi', 'HubSpot API', 'HubSpot API credentials for accessing contacts, companies, and deals', 
 '[
   {
     "name": "apiKey",
     "type": "password",
     "label": "API Key",
     "description": "Your HubSpot API key",
     "required": true,
     "validation": {
       "minLength": 10,
       "pattern": "^[a-f0-9-]{36}$"
     }
   }
 ]'::jsonb),

('slackApi', 'Slack API', 'Slack API credentials for sending messages and notifications',
 '[
   {
     "name": "accessToken",
     "type": "password",
     "label": "Bot Token",
     "description": "Slack bot token (starts with xoxb-)",
     "required": true,
     "validation": {
       "pattern": "^xoxb-"
     }
   }
 ]'::jsonb),

('googleSheetsOAuth2Api', 'Google Sheets OAuth2', 'Google Sheets OAuth2 credentials for accessing spreadsheets',
 '[
   {
     "name": "clientId",
     "type": "text",
     "label": "Client ID",
     "description": "Google OAuth2 client ID",
     "required": true
   },
   {
     "name": "clientSecret",
     "type": "password",
     "label": "Client Secret",
     "description": "Google OAuth2 client secret",
     "required": true
   },
   {
     "name": "refreshToken",
     "type": "password",
     "label": "Refresh Token",
     "description": "OAuth2 refresh token",
     "required": true
   }
 ]'::jsonb),

('emailSend', 'Email Service', 'Email service credentials for sending notifications',
 '[
   {
     "name": "host",
     "type": "text",
     "label": "SMTP Host",
     "description": "SMTP server hostname",
     "required": true,
     "validation": {
       "pattern": "^[a-zA-Z0-9.-]+$"
     }
   },
   {
     "name": "port",
     "type": "text",
     "label": "SMTP Port",
     "description": "SMTP server port (usually 587 or 465)",
     "required": true,
     "validation": {
       "pattern": "^[0-9]+$"
     }
   },
   {
     "name": "username",
     "type": "text",
     "label": "Username",
     "description": "SMTP username",
     "required": true
   },
   {
     "name": "password",
     "type": "password",
     "label": "Password",
     "description": "SMTP password",
     "required": true
   },
   {
     "name": "secure",
     "type": "boolean",
     "label": "Use SSL/TLS",
     "description": "Enable secure connection",
     "required": false
   }
 ]'::jsonb),

('httpBasicAuth', 'HTTP Basic Auth', 'HTTP Basic Authentication credentials',
 '[
   {
     "name": "username",
     "type": "text",
     "label": "Username",
     "description": "HTTP Basic Auth username",
     "required": true
   },
   {
     "name": "password",
     "type": "password",
     "label": "Password",
     "description": "HTTP Basic Auth password",
     "required": true
   }
 ]'::jsonb),

('httpHeaderAuth', 'HTTP Header Auth', 'HTTP Header Authentication credentials',
 '[
   {
     "name": "headerName",
     "type": "text",
     "label": "Header Name",
     "description": "Name of the authentication header",
     "required": true
   },
   {
     "name": "headerValue",
     "type": "password",
     "label": "Header Value",
     "description": "Value of the authentication header",
     "required": true
   }
 ]'::jsonb)
ON CONFLICT (credential_type) DO NOTHING;
