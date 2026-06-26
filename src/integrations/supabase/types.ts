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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cms_admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token_hash?: string
        }
        Relationships: []
      }
      cms_hero_slides: {
        Row: {
          created_at: string
          eyebrow: string
          id: string
          image: string
          is_active: boolean
          sort_order: number
          sub: string
          title: string
          updated_at: string
          video: string | null
        }
        Insert: {
          created_at?: string
          eyebrow?: string
          id: string
          image?: string
          is_active?: boolean
          sort_order?: number
          sub?: string
          title: string
          updated_at?: string
          video?: string | null
        }
        Update: {
          created_at?: string
          eyebrow?: string
          id?: string
          image?: string
          is_active?: boolean
          sort_order?: number
          sub?: string
          title?: string
          updated_at?: string
          video?: string | null
        }
        Relationships: []
      }
      cms_products: {
        Row: {
          category: string
          created_at: string
          description: string
          flavors: string[]
          image: string
          ingredients: string
          is_active: boolean
          name: string
          price: number
          sizes: string[]
          slug: string
          sort_order: number
          tag: string | null
          updated_at: string
          video: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          flavors?: string[]
          image: string
          ingredients?: string
          is_active?: boolean
          name: string
          price: number
          sizes?: string[]
          slug: string
          sort_order?: number
          tag?: string | null
          updated_at?: string
          video?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          flavors?: string[]
          image?: string
          ingredients?: string
          is_active?: boolean
          name?: string
          price?: number
          sizes?: string[]
          slug?: string
          sort_order?: number
          tag?: string | null
          updated_at?: string
          video?: string | null
        }
        Relationships: []
      }
      cms_site_settings: {
        Row: {
          announcements: string[]
          contact: Json
          created_at: string
          footer_tagline: string
          key: string
          socials: Json
          updated_at: string
        }
        Insert: {
          announcements?: string[]
          contact?: Json
          created_at?: string
          footer_tagline?: string
          key?: string
          socials?: Json
          updated_at?: string
        }
        Update: {
          announcements?: string[]
          contact?: Json
          created_at?: string
          footer_tagline?: string
          key?: string
          socials?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ecommerce_orders: {
        Row: {
          address: string
          area: string
          city: string
          created_at: string
          customer_name: string
          delivery: number
          email: string
          id: string
          items: Json
          notes: string
          payment: string
          phone: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address: string
          area?: string
          city?: string
          created_at?: string
          customer_name: string
          delivery?: number
          email?: string
          id: string
          items?: Json
          notes?: string
          payment?: string
          phone: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          address?: string
          area?: string
          city?: string
          created_at?: string
          customer_name?: string
          delivery?: number
          email?: string
          id?: string
          items?: Json
          notes?: string
          payment?: string
          phone?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
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
