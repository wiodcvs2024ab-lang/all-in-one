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
      booking_items: {
        Row: {
          booking_id: string
          id: string
          price: number
          qty: number
          service_id: string
          service_name: string
        }
        Insert: {
          booking_id: string
          id?: string
          price: number
          qty: number
          service_id: string
          service_name: string
        }
        Update: {
          booking_id?: string
          id?: string
          price?: number
          qty?: number
          service_id?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          city: string
          created_at: string
          duration_min: number
          id: string
          notes: string | null
          payment_ref: string | null
          payment_status: string
          pro_id: string | null
          slot_at: string
          status: string
          subtotal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          duration_min?: number
          id?: string
          notes?: string | null
          payment_ref?: string | null
          payment_status?: string
          pro_id?: string | null
          slot_at: string
          status?: string
          subtotal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          duration_min?: number
          id?: string
          notes?: string | null
          payment_ref?: string | null
          payment_status?: string
          pro_id?: string | null
          slot_at?: string
          status?: string
          subtotal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pros"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          qty: number
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          qty?: number
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          qty?: number
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort: number
        }
        Insert: {
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort?: number
        }
        Update: {
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          booking_id: string | null
          id: string
          kind: string
          recipient: string
          sent_at: string
        }
        Insert: {
          booking_id?: string | null
          id?: string
          kind: string
          recipient: string
          sent_at?: string
        }
        Update: {
          booking_id?: string | null
          id?: string
          kind?: string
          recipient?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_applications: {
        Row: {
          city: string
          created_at: string
          email: string
          experience_years: number
          id: string
          name: string
          phone: string
          skills: string
          status: string
        }
        Insert: {
          city: string
          created_at?: string
          email: string
          experience_years?: number
          id?: string
          name: string
          phone: string
          skills: string
          status?: string
        }
        Update: {
          city?: string
          created_at?: string
          email?: string
          experience_years?: number
          id?: string
          name?: string
          phone?: string
          skills?: string
          status?: string
        }
        Relationships: []
      }
      pro_availability: {
        Row: {
          created_at: string
          end_min: number
          id: string
          pro_id: string
          start_min: number
          weekday: number
        }
        Insert: {
          created_at?: string
          end_min: number
          id?: string
          pro_id: string
          start_min: number
          weekday: number
        }
        Update: {
          created_at?: string
          end_min?: number
          id?: string
          pro_id?: string
          start_min?: number
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "pro_availability_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pros"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_categories: {
        Row: {
          category_id: string
          id: string
          pro_id: string
        }
        Insert: {
          category_id: string
          id?: string
          pro_id: string
        }
        Update: {
          category_id?: string
          id?: string
          pro_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_categories_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pros"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_time_off: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          pro_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          pro_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          pro_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_time_off_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pros"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      pros: {
        Row: {
          active: boolean
          bio: string | null
          city: string
          created_at: string
          email: string
          experience_years: number
          id: string
          name: string
          phone: string | null
          rating: number
          skills: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          bio?: string | null
          city: string
          created_at?: string
          email: string
          experience_years?: number
          id?: string
          name: string
          phone?: string | null
          rating?: number
          skills?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          bio?: string | null
          city?: string
          created_at?: string
          email?: string
          experience_years?: number
          id?: string
          name?: string
          phone?: string | null
          rating?: number
          skills?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string | null
          booking_id: string | null
          comment: string | null
          created_at: string
          hidden: boolean
          id: string
          pro_id: string | null
          rating: number
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          pro_id?: string | null
          rating: number
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          hidden?: boolean
          id?: string
          pro_id?: string | null
          rating?: number
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_pro_id_fkey"
            columns: ["pro_id"]
            isOneToOne: false
            referencedRelation: "pros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          description: string | null
          duration_min: number
          id: string
          image_url: string | null
          name: string
          original_price: number | null
          price: number
          rating: number
          reviews_count: number
          slug: string
          tag: string | null
        }
        Insert: {
          category_id: string
          description?: string | null
          duration_min?: number
          id?: string
          image_url?: string | null
          name: string
          original_price?: number | null
          price: number
          rating?: number
          reviews_count?: number
          slug: string
          tag?: string | null
        }
        Update: {
          category_id?: string
          description?: string | null
          duration_min?: number
          id?: string
          image_url?: string | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number
          reviews_count?: number
          slug?: string
          tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "pro" | "admin"
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
      app_role: ["customer", "pro", "admin"],
    },
  },
} as const
