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
