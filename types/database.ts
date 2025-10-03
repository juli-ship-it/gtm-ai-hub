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
          category: 'campaign_execution' | 'content_creation' | 'lead_management' | 'reporting' | 'other' | null
          current_process: string | null
          pain_points: string | null
          frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc' | null
          time_friendly: string | null
          systems: string[] | null
          sensitivity: 'low' | 'medium' | 'high' | 'confidential' | null
          links: string | null
          slack_team_id: string | null
          slack_team_name: string | null
          slack_user_id: string | null
          slack_username: string | null
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
          category?: 'campaign_execution' | 'content_creation' | 'lead_management' | 'reporting' | 'other' | null
          current_process?: string | null
          pain_points?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc' | null
          time_friendly?: string | null
          systems?: string[] | null
          sensitivity?: 'low' | 'medium' | 'high' | 'confidential' | null
          links?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_user_id?: string | null
          slack_username?: string | null
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
          category?: 'campaign_execution' | 'content_creation' | 'lead_management' | 'reporting' | 'other' | null
          current_process?: string | null
          pain_points?: string | null
          frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc' | null
          time_friendly?: string | null
          systems?: string[] | null
          sensitivity?: 'low' | 'medium' | 'high' | 'confidential' | null
          links?: string | null
          slack_team_id?: string | null
          slack_team_name?: string | null
          slack_user_id?: string | null
          slack_username?: string | null
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
