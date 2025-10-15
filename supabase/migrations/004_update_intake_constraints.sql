-- Migration: Update intake_request constraints to match new Slack modal values
-- This migration updates the check constraints to support the new category system

-- Drop existing constraints
ALTER TABLE intake_request DROP CONSTRAINT IF EXISTS intake_request_category_check;
ALTER TABLE intake_request DROP CONSTRAINT IF EXISTS intake_request_frequency_check;
ALTER TABLE intake_request DROP CONSTRAINT IF EXISTS intake_request_sensitivity_check;

-- Add new category constraint with all the new values from Slack modal
ALTER TABLE intake_request 
ADD CONSTRAINT intake_request_category_check 
CHECK (category IN (
  -- Marketing categories
  'mkt_campaign_execution',
  'mkt_content_creation', 
  'mkt_reporting_analytics',
  'mkt_paid_media',
  'mkt_seo_website',
  'mkt_social_community',
  'mkt_lead_nurturing',
  'mkt_events_webinars',
  'mkt_other',
  -- Sales categories
  'sales_enablement',
  'sales_lead_qualification',
  'sales_pipeline_management',
  'sales_customer_outreach',
  'sales_forecasting_hygiene',
  'sales_other',
  -- Culture & Organization categories
  'co_employee_engagement',
  'co_team_culture',
  'co_deib',
  'co_learning_development',
  'co_onboarding_experience',
  'co_performance_management',
  'co_recognition_rewards',
  'co_other',
  -- Customer Success categories
  'cs_onboarding_adoption',
  'cs_health_scoring_alerts',
  'cs_qbr_ebr_prep',
  'cs_renewals_expansion',
  'cs_other',
  -- Product & Engineering categories
  'pe_user_research',
  'pe_prds',
  'pe_qa_test_gen',
  'pe_release_docs',
  'pe_other',
  -- Data & Analytics categories
  'data_dashboards_reporting',
  'data_etl_quality',
  'data_experimentation_ab',
  'data_other',
  -- Finance & Legal categories
  'fin_ap_ar_invoicing',
  'fin_expense_procurement',
  'legal_contracts',
  'finlegal_other',
  -- People, IT & Security categories
  'people_recruiting_onboarding',
  'it_provisioning_access',
  'sec_compliance',
  'ops_other',
  -- Cross-functional categories
  'xf_process_improvement',
  'xf_cross_team_collaboration',
  'xf_internal_tools',
  'xf_partnerships',
  'xf_enablement_training',
  'xf_other',
  -- Legacy categories (for backward compatibility)
  'campaign_execution',
  'content_creation',
  'lead_management',
  'reporting',
  'other'
));

-- Add new frequency constraint to match Slack modal
ALTER TABLE intake_request 
ADD CONSTRAINT intake_request_frequency_check 
CHECK (frequency IN ('daily', 'weekly', 'monthly', 'adhoc'));

-- Add new sensitivity constraint to match Slack modal
ALTER TABLE intake_request 
ADD CONSTRAINT intake_request_sensitivity_check 
CHECK (sensitivity IN ('low', 'med', 'high'));

-- Add comment explaining the new category system
COMMENT ON COLUMN intake_request.category IS 'Category using new namespaced system: mkt_*, sales_*, co_*, cs_*, pe_*, data_*, fin_*, ops_*, xf_* plus legacy values';
COMMENT ON COLUMN intake_request.frequency IS 'Frequency: daily, weekly, monthly, adhoc';
COMMENT ON COLUMN intake_request.sensitivity IS 'Data sensitivity: low, med, high';
