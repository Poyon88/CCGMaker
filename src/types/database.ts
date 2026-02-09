export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attributes: {
        Row: {
          default_value: string
          id: string
          max_value: number | null
          min_value: number | null
          name: string
          project_id: string
          sort_order: number
          value_type: string
        }
        Insert: {
          default_value?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          name: string
          project_id: string
          sort_order?: number
          value_type?: string
        }
        Update: {
          default_value?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          name?: string
          project_id?: string
          sort_order?: number
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "attributes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      card_powers: {
        Row: {
          card_id: string
          power_id: string
        }
        Insert: {
          card_id: string
          power_id: string
        }
        Update: {
          card_id?: string
          power_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_powers_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_powers_power_id_fkey"
            columns: ["power_id"]
            isOneToOne: false
            referencedRelation: "powers"
            referencedColumns: ["id"]
          },
        ]
      }
      card_types: {
        Row: {
          description: string
          id: string
          name: string
          project_id: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          name: string
          project_id: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_types_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          card_type_id: string | null
          created_at: string
          field_values: Json
          id: string
          illustration_url: string | null
          is_ai_generated: boolean
          name: string
          project_id: string | null
          rarity_id: string | null
          template_id: string | null
          thumbnail_url: string | null
          tribe_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_type_id?: string | null
          created_at?: string
          field_values?: Json
          id?: string
          illustration_url?: string | null
          is_ai_generated?: boolean
          name: string
          project_id?: string | null
          rarity_id?: string | null
          template_id?: string | null
          thumbnail_url?: string | null
          tribe_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_type_id?: string | null
          created_at?: string
          field_values?: Json
          id?: string
          illustration_url?: string | null
          is_ai_generated?: boolean
          name?: string
          project_id?: string | null
          rarity_id?: string | null
          template_id?: string | null
          thumbnail_url?: string | null
          tribe_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_card_type_id_fkey"
            columns: ["card_type_id"]
            isOneToOne: false
            referencedRelation: "card_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_rarity_id_fkey"
            columns: ["rarity_id"]
            isOneToOne: false
            referencedRelation: "rarities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_tribe_id_fkey"
            columns: ["tribe_id"]
            isOneToOne: false
            referencedRelation: "tribes"
            referencedColumns: ["id"]
          },
        ]
      }
      powers: {
        Row: {
          description: string
          id: string
          name: string
          project_id: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          name: string
          project_id: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "powers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rarities: {
        Row: {
          color: string
          icon_url: string | null
          id: string
          name: string
          project_id: string
          sort_order: number
        }
        Insert: {
          color?: string
          icon_url?: string | null
          id?: string
          name: string
          project_id: string
          sort_order?: number
        }
        Update: {
          color?: string
          icon_url?: string | null
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "rarities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          definition: Json
          description: string
          id: string
          name: string
          project_id: string
          style: Json
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          definition?: Json
          description?: string
          id?: string
          name: string
          project_id: string
          style?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          definition?: Json
          description?: string
          id?: string
          name?: string
          project_id?: string
          style?: Json
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tribes: {
        Row: {
          description: string
          id: string
          name: string
          project_id: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          name: string
          project_id: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "tribes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
