export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      app_user: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'editor' | 'runner'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'editor' | 'runner'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'editor' | 'runner'
          created_at?: string
        }
      }
      template: {
        Row: {
          id: string
          slug: string
          name: string
          category: 'content' | 'reporting' | 'intake' | 'governance' | null
          version: string
          description: string | null
          inputs: Json | null
          outputs: Json | null
          n8n_webhook_url: string
          enabled: boolean
          requires_approval: boolean
          created_by: string | null
          created_at: string
          n8n_workflow_json: Json | null
          workflow_variables: Json | null
          execution_instructions: string | null
          estimated_duration_minutes: number | null
          tags: string[] | null
          difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
          systems_required: string[] | null
          file_requirements: Json | null
          is_public: boolean
          last_modified_at: string
          how_to_use_video_url: string | null
          how_it_was_built_video_url: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category?: 'content' | 'reporting' | 'intake' | 'governance' | null
          version?: string
          description?: string | null
          inputs?: Json | null
          outputs?: Json | null
          n8n_webhook_url: string
          enabled?: boolean
          requires_approval?: boolean
          created_by?: string | null
          created_at?: string
          n8n_workflow_json?: Json | null
          workflow_variables?: Json | null
          execution_instructions?: string | null
          estimated_duration_minutes?: number | null
          tags?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          systems_required?: string[] | null
          file_requirements?: Json | null
          is_public?: boolean
          last_modified_at?: string
          how_to_use_video_url?: string | null
          how_it_was_built_video_url?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          category?: 'content' | 'reporting' | 'intake' | 'governance' | null
          version?: string
          description?: string | null
          inputs?: Json | null
          outputs?: Json | null
          n8n_webhook_url?: string
          enabled?: boolean
          requires_approval?: boolean
          created_by?: string | null
          created_at?: string
          n8n_workflow_json?: Json | null
          workflow_variables?: Json | null
          execution_instructions?: string | null
          estimated_duration_minutes?: number | null
          tags?: string[] | null
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | null
          systems_required?: string[] | null
          file_requirements?: Json | null
          is_public?: boolean
          last_modified_at?: string
          how_to_use_video_url?: string | null
          how_it_was_built_video_url?: string | null
        }
      }
      template_run: {
        Row: {
          id: string
          template_id: string
          triggered_by: string
          input_payload: Json | null
          status: 'queued' | 'running' | 'succeeded' | 'failed'
          started_at: string
          finished_at: string | null
          logs: string | null
          artifacts: Json | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          triggered_by: string
          input_payload?: Json | null
          status?: 'queued' | 'running' | 'succeeded' | 'failed'
          started_at?: string
          finished_at?: string | null
          logs?: string | null
          artifacts?: Json | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          triggered_by?: string
          input_payload?: Json | null
          status?: 'queued' | 'running' | 'succeeded' | 'failed'
          started_at?: string
          finished_at?: string | null
          logs?: string | null
          artifacts?: Json | null
          error_message?: string | null
          created_at?: string
        }
      }
      intake_request: {
        Row: {
          id: string
          jira_issue_key: string | null
          requester: string
          problem_statement: string | null
          automation_idea: string | null
          ethics_considerations: string | null
          status: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          title: string | null
          category: 'mkt_campaign_execution' | 'mkt_content_creation' | 'mkt_reporting_analytics' | 'mkt_paid_media' | 'mkt_seo_website' | 'mkt_social_community' | 'mkt_lead_nurturing' | 'mkt_events_webinars' | 'mkt_other' | 'sales_enablement' | 'sales_lead_qualification' | 'sales_pipeline_management' | 'sales_customer_outreach' | 'sales_forecasting_hygiene' | 'sales_other' | 'co_employee_engagement' | 'co_team_culture' | 'co_deib' | 'co_learning_development' | 'co_onboarding_experience' | 'co_performance_management' | 'co_recognition_rewards' | 'co_other' | 'cs_onboarding_adoption' | 'cs_health_scoring_alerts' | 'cs_qbr_ebr_prep' | 'cs_renewals_expansion' | 'cs_other' | 'pe_user_research' | 'pe_prds' | 'pe_qa_test_gen' | 'pe_release_docs' | 'pe_other' | 'data_dashboards_reporting' | 'data_etl_quality' | 'data_experimentation_ab' | 'data_other' | 'fin_ap_ar_invoicing' | 'fin_expense_procurement' | 'legal_contracts' | 'finlegal_other' | 'people_recruiting_onboarding' | 'it_provisioning_access' | 'sec_compliance' | 'ops_other' | 'xf_process_improvement' | 'xf_cross_team_collaboration' | 'xf_internal_tools' | 'xf_partnerships' | 'xf_enablement_training' | 'xf_other' | 'campaign_execution' | 'content_creation' | 'lead_management' | 'reporting' | 'other' | null
          current_process: string | null
          pain_points: string | null
          frequency: 'daily' | 'weekly' | 'monthly' | 'adhoc' | null
          time_friendly: string | null
          systems: string[] | null
          sensitivity: 'low' | 'med' | 'high' | null
          links: string | null
          slack_team_id: string | null
          slack_team_name: string | null
          slack_user_id: string | null
          slack_username: string | null
          request_type: 'real' | 'showcase' | 'demo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          jira_issue_key?: string | null
          requester: string
          problem_statement?: string | null
          automation_idea?: string | null
          ethics_considerations?: string | null
          status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          title?: string | null
          category?: 'mkt_campaign_execution' | 'mkt_content_creation' | 'mkt_reporting_analytics' | 'mkt_paid_media' | 'mkt_seo_website' | 'mkt_social_community' | 'mkt_lead_nurturing' | 'mkt_events_webinars' | 'mkt_other' | 'sales_enablement' | 'sales_lead_qualification' | 'sales_pipeline_management' | 'sales_customer_outreach' | 'sales_forecasting_hygiene' | 'sales_other' | 'co_employee_engagement' | 'co_team_culture' | 'co_deib' | 'co_learning_development' | 'co_onboarding_experience' | 'co_performance_management' | 'co_recognition_rewards' | 'co_other' | 'cs_onboarding_adoption' | 'cs_health_scoring_alerts' | 'cs_qbr_ebr_prep' | 'cs_renewals_expansion' | 'cs_other' | 'pe_user_research' | 'pe_prds' | 'pe_qa_test_gen' | 'pe_release_docs' | 'pe_other' | 'data_dashboards_reporting' | 'data_etl_quality' | 'data_experimentation_ab' | 'data_other' | 'fin_ap_ar_invoicing' | 'fin_expense_procurement' | 'legal_contracts' | 'finlegal_other' | 'people_recruiting_onboarding' | 'it_provisioning_access' | 'sec_compliance' | 'ops_other' | 'xf_process_improvement' | 'xf_cross_team_collaboration' | 'xf_internal_tools' | 'xf_partnerships' | 'xf_enablement_training' | 'xf_other' | 'campaign_execution' | 'content_creation' | 'lead_management' | 'reporting' | 'other' | null
          current_process?: string | null
          pain_points?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'adhoc' | null
          time_friendly?: string | null
          systems?: string[] | null
          sensitivity?: 'low' | 'med' | 'high' | null
          links?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_user_id?: string | null
          slack_username?: string | null
          request_type?: 'real' | 'showcase' | 'demo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          jira_issue_key?: string | null
          requester?: string
          problem_statement?: string | null
          automation_idea?: string | null
          ethics_considerations?: string | null
          status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          title?: string | null
          category?: 'mkt_campaign_execution' | 'mkt_content_creation' | 'mkt_reporting_analytics' | 'mkt_paid_media' | 'mkt_seo_website' | 'mkt_social_community' | 'mkt_lead_nurturing' | 'mkt_events_webinars' | 'mkt_other' | 'sales_enablement' | 'sales_lead_qualification' | 'sales_pipeline_management' | 'sales_customer_outreach' | 'sales_forecasting_hygiene' | 'sales_other' | 'co_employee_engagement' | 'co_team_culture' | 'co_deib' | 'co_learning_development' | 'co_onboarding_experience' | 'co_performance_management' | 'co_recognition_rewards' | 'co_other' | 'cs_onboarding_adoption' | 'cs_health_scoring_alerts' | 'cs_qbr_ebr_prep' | 'cs_renewals_expansion' | 'cs_other' | 'pe_user_research' | 'pe_prds' | 'pe_qa_test_gen' | 'pe_release_docs' | 'pe_other' | 'data_dashboards_reporting' | 'data_etl_quality' | 'data_experimentation_ab' | 'data_other' | 'fin_ap_ar_invoicing' | 'fin_expense_procurement' | 'legal_contracts' | 'finlegal_other' | 'people_recruiting_onboarding' | 'it_provisioning_access' | 'sec_compliance' | 'ops_other' | 'xf_process_improvement' | 'xf_cross_team_collaboration' | 'xf_internal_tools' | 'xf_partnerships' | 'xf_enablement_training' | 'xf_other' | 'campaign_execution' | 'content_creation' | 'lead_management' | 'reporting' | 'other' | null
          current_process?: string | null
          pain_points?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'adhoc' | null
          time_friendly?: string | null
          systems?: string[] | null
          sensitivity?: 'low' | 'med' | 'high' | null
          links?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_user_id?: string | null
          slack_username?: string | null
          request_type?: 'real' | 'showcase' | 'demo'
          created_at?: string
          updated_at?: string
        }
      }
      prompt: {
        Row: {
          id: string
          name: string
          role: 'writer' | 'editor' | 'classifier' | 'seo_researcher' | 'compliance' | null
          body: string
          version: string
          tags: string[] | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role?: 'writer' | 'editor' | 'classifier' | 'seo_researcher' | 'compliance' | null
          body: string
          version?: string
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'writer' | 'editor' | 'classifier' | 'seo_researcher' | 'compliance' | null
          body?: string
          version?: string
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
        }
      }
      playbook: {
        Row: {
          id: string
          name: string
          description: string | null
          templates_included: string[] | null
          human_steps: Json | null
          kpis: Json | null
          owner: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          templates_included?: string[] | null
          human_steps?: Json | null
          kpis?: Json | null
          owner?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          templates_included?: string[] | null
          human_steps?: Json | null
          kpis?: Json | null
          owner?: string | null
          created_at?: string
        }
      }
      intake_comment: {
        Row: {
          id: string
          intake_request_id: string
          author_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          intake_request_id: string
          author_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          intake_request_id?: string
          author_id?: string
          content?: string
          created_at?: string
        }
      }
      intake_activity_log: {
        Row: {
          id: string
          intake_request_id: string
          user_id: string | null
          action_type: 'status_changed' | 'priority_changed' | 'assigned' | 'unassigned' | 'comment_added' | 'file_attached' | 'tag_added' | 'tag_removed' | 'field_updated' | 'created' | 'viewed'
          old_value: string | null
          new_value: string | null
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          intake_request_id: string
          user_id?: string | null
          action_type: 'status_changed' | 'priority_changed' | 'assigned' | 'unassigned' | 'comment_added' | 'file_attached' | 'tag_added' | 'tag_removed' | 'field_updated' | 'created' | 'viewed'
          old_value?: string | null
          new_value?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          intake_request_id?: string
          user_id?: string | null
          action_type?: 'status_changed' | 'priority_changed' | 'assigned' | 'unassigned' | 'comment_added' | 'file_attached' | 'tag_added' | 'tag_removed' | 'field_updated' | 'created' | 'viewed'
          old_value?: string | null
          new_value?: string | null
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      intake_assignment: {
        Row: {
          id: string
          intake_request_id: string
          assigned_to: string
          assigned_by: string
          assigned_at: string
          unassigned_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          intake_request_id: string
          assigned_to: string
          assigned_by: string
          assigned_at?: string
          unassigned_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          intake_request_id?: string
          assigned_to?: string
          assigned_by?: string
          assigned_at?: string
          unassigned_at?: string | null
          notes?: string | null
        }
      }
      intake_attachment: {
        Row: {
          id: string
          intake_request_id: string
          uploaded_by: string
          file_name: string
          file_url: string | null
          file_type: string | null
          file_size: number | null
          attachment_type: 'file' | 'link' | 'image' | 'document'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          intake_request_id: string
          uploaded_by: string
          file_name: string
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          attachment_type?: 'file' | 'link' | 'image' | 'document'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          intake_request_id?: string
          uploaded_by?: string
          file_name?: string
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          attachment_type?: 'file' | 'link' | 'image' | 'document'
          description?: string | null
          created_at?: string
        }
      }
      intake_tag: {
        Row: {
          id: string
          name: string
          color: string
          description: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          description?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      intake_request_tag: {
        Row: {
          intake_request_id: string
          tag_id: string
          added_by: string
          added_at: string
        }
        Insert: {
          intake_request_id: string
          tag_id: string
          added_by: string
          added_at?: string
        }
        Update: {
          intake_request_id?: string
          tag_id?: string
          added_by?: string
          added_at?: string
        }
      }
      intake_watcher: {
        Row: {
          intake_request_id: string
          user_id: string
          added_at: string
        }
        Insert: {
          intake_request_id: string
          user_id: string
          added_at?: string
        }
        Update: {
          intake_request_id?: string
          user_id?: string
          added_at?: string
        }
      }
      intake_status_history: {
        Row: {
          id: string
          intake_request_id: string
          from_status: 'new' | 'triaged' | 'building' | 'shipped' | 'declined' | null
          to_status: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          changed_by: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          intake_request_id: string
          from_status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined' | null
          to_status: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          intake_request_id?: string
          from_status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined' | null
          to_status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
      }
      hr_module: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          status: 'draft' | 'published' | 'archived'
          ethics_required: boolean
          estimated_hours: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          status?: 'draft' | 'published' | 'archived'
          ethics_required?: boolean
          estimated_hours?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'archived'
          ethics_required?: boolean
          estimated_hours?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
          created_by?: string | null
        }
      }
      hr_lesson: {
        Row: {
          id: string
          module_id: string
          slug: string
          title: string
          content_md: string | null
          video_url: string | null
          quiz: Json | null
          order_num: number | null
          estimated_minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          slug: string
          title: string
          content_md?: string | null
          video_url?: string | null
          quiz?: Json | null
          order_num?: number | null
          estimated_minutes?: number
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          slug?: string
          title?: string
          content_md?: string | null
          video_url?: string | null
          quiz?: Json | null
          order_num?: number | null
          estimated_minutes?: number
          created_at?: string
        }
      }
      hr_progress: {
        Row: {
          user_id: string
          lesson_id: string
          completed: boolean
          score: number | null
          completed_at: string | null
        }
        Insert: {
          user_id: string
          lesson_id: string
          completed?: boolean
          score?: number | null
          completed_at?: string | null
        }
        Update: {
          user_id?: string
          lesson_id?: string
          completed?: boolean
          score?: number | null
          completed_at?: string | null
        }
      }
      hr_feedback: {
        Row: {
          id: string
          user_id: string
          module_id: string
          rating: number | null
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          rating?: number | null
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          rating?: number | null
          comments?: string | null
          created_at?: string
        }
      }
      hr_intake_request: {
        Row: {
          id: string
          user_id: string
          jtbd: string
          desired_module: string | null
          notes: string | null
          status: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          slack_team_id: string | null
          slack_team_name: string | null
          slack_user_id: string | null
          slack_username: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          jtbd: string
          desired_module?: string | null
          notes?: string | null
          status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_user_id?: string | null
          slack_username?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          jtbd?: string
          desired_module?: string | null
          notes?: string | null
          status?: 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_user_id?: string | null
          slack_username?: string | null
          created_at?: string
        }
      }
      hr_badge: {
        Row: {
          id: string
          user_id: string
          module_id: string
          badge_type: 'completion' | 'excellence' | 'ethics' | 'pioneer'
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          badge_type?: 'completion' | 'excellence' | 'ethics' | 'pioneer'
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          badge_type?: 'completion' | 'excellence' | 'ethics' | 'pioneer'
          earned_at?: string
        }
      }
      template_variable: {
        Row: {
          id: string
          template_id: string
          name: string
          type: 'string' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect' | 'date' | 'email' | 'url'
          required: boolean
          description: string | null
          default_value: Json | null
          validation_rules: Json | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          type: 'string' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect' | 'date' | 'email' | 'url'
          required?: boolean
          description?: string | null
          default_value?: Json | null
          validation_rules?: Json | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          type?: 'string' | 'number' | 'boolean' | 'file' | 'select' | 'multiselect' | 'date' | 'email' | 'url'
          required?: boolean
          description?: string | null
          default_value?: Json | null
          validation_rules?: Json | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      template_execution_context: {
        Row: {
          id: string
          template_run_id: string
          variable_name: string
          variable_value: Json
          created_at: string
        }
        Insert: {
          id?: string
          template_run_id: string
          variable_name: string
          variable_value: Json
          created_at?: string
        }
        Update: {
          id?: string
          template_run_id?: string
          variable_name?: string
          variable_value?: Json
          created_at?: string
        }
      }
      template_favorite: {
        Row: {
          id: string
          template_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          user_id?: string
          created_at?: string
        }
      }
      template_rating: {
        Row: {
          id: string
          template_id: string
          user_id: string
          rating: number | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          user_id: string
          rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          user_id?: string
          rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      template_version: {
        Row: {
          id: string
          template_id: string
          version_number: string
          n8n_workflow_json: Json
          workflow_variables: Json | null
          changelog: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          version_number: string
          n8n_workflow_json: Json
          workflow_variables?: Json | null
          changelog?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          version_number?: string
          n8n_workflow_json?: Json
          workflow_variables?: Json | null
          changelog?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
