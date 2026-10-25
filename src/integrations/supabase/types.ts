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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_prompts: {
        Row: {
          feature: string
          id: string
          model: string | null
          name: string
          system_prompt: string
          temperature: number
          updated_at: string
        }
        Insert: {
          feature: string
          id?: string
          model?: string | null
          name: string
          system_prompt: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          feature?: string
          id?: string
          model?: string | null
          name?: string
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          category_id: string | null
          content: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          focus_keyword: string | null
          id: string
          keywords: string[]
          og_image: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          keywords?: string[]
          og_image?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category_id?: string | null
          content?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          focus_keyword?: string | null
          id?: string
          keywords?: string[]
          og_image?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_rate_limits: {
        Row: {
          blocked_until: string | null
          count: number
          subject: string
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          count?: number
          subject: string
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          count?: number
          subject?: string
          window_start?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          keywords: string[]
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          keywords?: string[]
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          buyer_email: string | null
          buyer_id: string | null
          buyer_name: string | null
          buyer_wa: string | null
          contract_total: number | null
          created_at: string
          dp_amount: number
          due_date: string | null
          id: string
          invoice_number: string | null
          items: Json
          order_id: string | null
          paid_at: string | null
          parent_invoice_id: string | null
          payment_stage: string
          public_token: string
          status: Database["public"]["Enums"]["invoice_status"]
        }
        Insert: {
          amount?: number
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_wa?: string | null
          contract_total?: number | null
          created_at?: string
          dp_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          items?: Json
          order_id?: string | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          payment_stage?: string
          public_token?: string
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Update: {
          amount?: number
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_wa?: string | null
          contract_total?: number | null
          created_at?: string
          dp_amount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          items?: Json
          order_id?: string | null
          paid_at?: string | null
          parent_invoice_id?: string | null
          payment_stage?: string
          public_token?: string
          status?: Database["public"]["Enums"]["invoice_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoices_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_parent_invoice_id_fkey"
            columns: ["parent_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      order_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          order_id: string
          progress: number | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id: string
          progress?: number | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          order_id?: string
          progress?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          brief: string | null
          buyer_email: string | null
          buyer_id: string | null
          buyer_name: string | null
          buyer_wa: string | null
          created_at: string
          id: string
          notes: string | null
          order_number: string | null
          package_name: string | null
          payment_stage: string
          product_id: string | null
          progress: number
          seller_id: string | null
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          amount?: number
          brief?: string | null
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_wa?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_number?: string | null
          package_name?: string | null
          payment_stage?: string
          product_id?: string | null
          progress?: number
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          amount?: number
          brief?: string | null
          buyer_email?: string | null
          buyer_id?: string | null
          buyer_name?: string | null
          buyer_wa?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_number?: string | null
          package_name?: string | null
          payment_stage?: string
          product_id?: string | null
          progress?: number
          seller_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          benefits: Json
          category_id: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          features: Json
          gallery: Json
          id: string
          is_featured: boolean
          keywords: string[]
          packages: Json
          price: number
          seller_id: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          slug_path: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title: string
          updated_at: string
          whatsapp_cta: string | null
        }
        Insert: {
          benefits?: Json
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          features?: Json
          gallery?: Json
          id?: string
          is_featured?: boolean
          keywords?: string[]
          packages?: Json
          price?: number
          seller_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          slug_path?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title: string
          updated_at?: string
          whatsapp_cta?: string | null
        }
        Update: {
          benefits?: Json
          category_id?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          features?: Json
          gallery?: Json
          id?: string
          is_featured?: boolean
          keywords?: string[]
          packages?: Json
          price?: number
          seller_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          slug_path?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          whatsapp_cta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          slug: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          slug: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          id: string
          is_active: boolean
          name: string
          photo_url: string | null
          rating: number
          sort_order: number
          title: string | null
        }
        Insert: {
          content: string
          id?: string
          is_active?: boolean
          name: string
          photo_url?: string | null
          rating?: number
          sort_order?: number
          title?: string | null
        }
        Update: {
          content?: string
          id?: string
          is_active?: boolean
          name?: string
          photo_url?: string | null
          rating?: number
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assistant_quota_status: { Args: { _subject: string }; Returns: Json }
      consume_assistant_request: {
        Args: { _block?: boolean; _subject: string }
        Returns: Json
      }
      get_invoice_by_token: {
        Args: { _token: string }
        Returns: {
          amount: number
          buyer_email: string
          buyer_name: string
          buyer_wa: string
          created_at: string
          due_date: string
          invoice_number: string
          items: Json
          paid_at: string
          status: Database["public"]["Enums"]["invoice_status"]
        }[]
      }
      get_invoice_by_token_v2: {
        Args: { _token: string }
        Returns: {
          amount: number
          buyer_email: string
          buyer_name: string
          buyer_wa: string
          contract_total: number
          created_at: string
          dp_amount: number
          due_date: string
          invoice_number: string
          items: Json
          paid_at: string
          parent_invoice_number: string
          payment_stage: string
          status: Database["public"]["Enums"]["invoice_status"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "buyer"
      content_status: "draft" | "published"
      invoice_status: "draft" | "sent" | "paid" | "cancelled"
      order_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "awaiting_payment"
        | "paid"
        | "revision"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "buyer"],
      content_status: ["draft", "published"],
      invoice_status: ["draft", "sent", "paid", "cancelled"],
      order_status: [
        "new",
        "contacted",
        "in_progress",
        "completed",
        "cancelled",
        "awaiting_payment",
        "paid",
        "revision",
      ],
    },
  },
} as const
