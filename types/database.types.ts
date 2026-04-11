export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          agent_id: string | null
          created_at: string
          id: string
          project_item_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          agent_id?: string | null
          created_at?: string
          id?: string
          project_item_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          agent_id?: string | null
          created_at?: string
          id?: string
          project_item_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_project_item_id_fkey"
            columns: ["project_item_id"]
            isOneToOne: false
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_collections: {
        Row: {
          agent_id: string
          created_at: string | null
          custom_config: Json | null
          id: string
          is_favorite: boolean | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_favorite?: boolean | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          custom_config?: Json | null
          id?: string
          is_favorite?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_collections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_downloads: {
        Row: {
          agent_id: string
          download_date: string | null
          downloaded_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          agent_id: string
          download_date?: string | null
          downloaded_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          download_date?: string | null
          downloaded_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_downloads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_executions: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          input_context: Json
          output_result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_context: Json
          output_result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          input_context?: Json
          output_result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_ratings: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_ratings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_template_embeddings: {
        Row: {
          agent_id: string
          content_hash: string
          embedding: string | null
          embedding_vector: string | null
          id: string
          indexed_at: string | null
          metadata: Json | null
        }
        Insert: {
          agent_id: string
          content_hash: string
          embedding?: string | null
          embedding_vector?: string | null
          id?: string
          indexed_at?: string | null
          metadata?: Json | null
        }
        Update: {
          agent_id?: string
          content_hash?: string
          embedding?: string | null
          embedding_vector?: string | null
          id?: string
          indexed_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_template_embeddings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_template_tags: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          tag_name: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          tag_name: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          tag_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_template_tags_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          deleted_at: string | null
          dependencies: Json | null
          description: string | null
          download_count: number | null
          id: string
          name: string
          published_at: string | null
          rating_average: number | null
          rating_count: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          version: string
          visibility: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          deleted_at?: string | null
          dependencies?: Json | null
          description?: string | null
          download_count?: number | null
          id?: string
          name: string
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          version?: string
          visibility?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          dependencies?: Json | null
          description?: string | null
          download_count?: number | null
          id?: string
          name?: string
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          version?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_templates_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          cost_usd: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          model_used: string | null
          role: string
          session_id: string
          tokens_input: number | null
          tokens_output: number | null
        }
        Insert: {
          content: string
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role: string
          session_id: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Update: {
          content?: string
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role?: string
          session_id?: string
          tokens_input?: number | null
          tokens_output?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_search_results: {
        Row: {
          created_at: string | null
          id: string
          matched_fields: Json | null
          message_id: string
          relevance_score: number | null
          resource_id: string
          resource_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          matched_fields?: Json | null
          message_id: string
          relevance_score?: number | null
          resource_id: string
          resource_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          matched_fields?: Json | null
          message_id?: string
          relevance_score?: number | null
          resource_id?: string
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_search_results_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_type: string | null
          created_at: string | null
          id: string
          last_activity_at: string | null
          metadata: Json | null
          related_resource_ids: string[] | null
          selected_model: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_type?: string | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          related_resource_ids?: string[] | null
          selected_model?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_type?: string | null
          created_at?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          related_resource_ids?: string[] | null
          selected_model?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deleted_agent_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          deleted_at: string
          dependencies: Json | null
          description: string | null
          download_count: number | null
          id: string
          name: string
          original_agent_id: string
          published_at: string | null
          rating_average: number | null
          rating_count: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
          version: string
          visibility: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          deleted_at?: string
          dependencies?: Json | null
          description?: string | null
          download_count?: number | null
          id?: string
          name: string
          original_agent_id: string
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
          version?: string
          visibility?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          deleted_at?: string
          dependencies?: Json | null
          description?: string | null
          download_count?: number | null
          id?: string
          name?: string
          original_agent_id?: string
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
          version?: string
          visibility?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_cleared_at: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          full_name: string | null
          github_username: string | null
          id: string
          job_title: string | null
          linkedin_url: string | null
          location: string | null
          twitter_username: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          activity_cleared_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          github_username?: string | null
          id: string
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          twitter_username?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          activity_cleared_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          github_username?: string | null
          id?: string
          job_title?: string | null
          linkedin_url?: string | null
          location?: string | null
          twitter_username?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      project_file_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          project_item_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          project_item_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          project_item_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_file_attachments_project_item_id_fkey"
            columns: ["project_item_id"]
            isOneToOne: false
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
        ]
      }
      project_items: {
        Row: {
          content: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          embedding_updated_at: string | null
          embedding_vector: string | null
          id: string
          is_favorite: boolean | null
          language_tags: string[] | null
          name: string
          notes: string | null
          parent_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          embedding_updated_at?: string | null
          embedding_vector?: string | null
          id?: string
          is_favorite?: boolean | null
          language_tags?: string[] | null
          name: string
          notes?: string | null
          parent_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          embedding_updated_at?: string | null
          embedding_vector?: string | null
          id?: string
          is_favorite?: boolean | null
          language_tags?: string[] | null
          name?: string
          notes?: string | null
          parent_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_connections: {
        Row: {
          connected_user_id: string
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_model_preferences: {
        Row: {
          created_at: string | null
          default_model: string
          favorite_models: string[] | null
          id: string
          model_usage_stats: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_model?: string
          favorite_models?: string[] | null
          id?: string
          model_usage_stats?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_model?: string
          favorite_models?: string[] | null
          id?: string
          model_usage_stats?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_update_embeddings: {
        Args: { p_embeddings: Json }
        Returns: {
          error_count: number
          success_count: number
        }[]
      }
      cleanup_deleted_templates: { Args: never; Returns: number }
      generate_template_content_hash: {
        Args: { p_agent_id: string }
        Returns: string
      }
      get_chat_messages_paginated: {
        Args: { p_before_id?: string; p_limit?: number; p_session_id: string }
        Returns: {
          content: string
          cost_usd: number
          created_at: string
          has_more: boolean
          id: string
          metadata: Json
          model_used: string
          role: string
          session_id: string
          tokens_input: number
          tokens_output: number
        }[]
      }
      get_item_path: {
        Args: { item_id: string }
        Returns: {
          id: string
          name: string
          type: string
        }[]
      }
      get_items_needing_embeddings: {
        Args: { p_limit?: number; p_type?: string }
        Returns: {
          content: string
          description: string
          id: string
          name: string
          tags: string[]
          type: string
        }[]
      }
      get_marketplace_stats: {
        Args: never
        Returns: {
          average_rating: number
          total_agents: number
          total_creators: number
          total_downloads: number
          total_executions: number
        }[]
      }
      get_recent_chat_context: {
        Args: { p_limit?: number; p_session_id: string }
        Returns: {
          content: string
          created_at: string
          role: string
        }[]
      }
      get_tag_usage_count: {
        Args: { tag_name: string; user_uuid: string }
        Returns: number
      }
      get_templates_needing_indexing: {
        Args: { p_limit?: number }
        Returns: {
          agent_id: string
          content: string
          current_hash: string
          description: string
          name: string
          tags: string[]
        }[]
      }
      get_user_agent_stats: {
        Args: { p_user_id: string }
        Returns: {
          average_rating: number
          total_agents: number
          total_downloads: number
          total_executions: number
          total_reviews: number
        }[]
      }
      search_agents: {
        Args: {
          category_filter?: string
          limit_count?: number
          min_rating?: number
          offset_count?: number
          search_query?: string
        }
        Returns: {
          author_name: string
          category: string
          created_at: string
          description: string
          download_count: number
          id: string
          name: string
          rating_average: number
          rating_count: number
          tags: string[]
        }[]
      }
      search_resources: {
        Args: {
          p_include_marketplace?: boolean
          p_limit?: number
          p_query: string
          p_user_id: string
        }
        Returns: {
          content_preview: string
          description: string
          name: string
          relevance_score: number
          resource_id: string
          resource_type: string
          tags: string[]
        }[]
      }
      search_resources_hybrid: {
        Args: {
          p_include_marketplace?: boolean
          p_limit?: number
          p_query_embedding: string
          p_query_text: string
          p_user_id: string
        }
        Returns: {
          content_preview: string
          description: string
          name: string
          relevance_score: number
          resource_id: string
          resource_type: string
          similarity_score: number
          tags: string[]
        }[]
      }
      search_templates_with_priority: {
        Args: {
          p_limit?: number
          p_query_embedding: string
          p_query_text?: string
          p_user_id: string
        }
        Returns: {
          agent_id: string
          category: string
          content: string
          description: string
          download_count: number
          final_score: number
          is_connection_template: boolean
          is_favorite: boolean
          is_own_template: boolean
          match_reason: string
          name: string
          priority_score: number
          quality_score: number
          rating_average: number
          semantic_similarity: number
          tags: string[]
          user_id: string
        }[]
      }
      template_needs_reindexing: {
        Args: { p_agent_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
