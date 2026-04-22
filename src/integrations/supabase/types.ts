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
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_notes: string | null
          car_id: string | null
          car_name: string
          car_slug: string | null
          created_at: string
          end_date: string
          id: string
          num_days: number
          payment_method: string | null
          payment_ref: string | null
          pickup_location: string | null
          price_per_day: number
          return_condition: string | null
          return_notes: string | null
          returned_at: string | null
          start_date: string
          status: string
          total_price: number
          updated_at: string
          user_email: string
          user_id: string
          user_id_image_url: string | null
          user_id_number: string | null
          user_license_image_url: string | null
          user_license_number: string | null
          user_name: string
          user_phone: string | null
          verification_notes: string | null
          verification_status: string
        }
        Insert: {
          admin_notes?: string | null
          car_id?: string | null
          car_name: string
          car_slug?: string | null
          created_at?: string
          end_date: string
          id?: string
          num_days: number
          payment_method?: string | null
          payment_ref?: string | null
          pickup_location?: string | null
          price_per_day: number
          return_condition?: string | null
          return_notes?: string | null
          returned_at?: string | null
          start_date: string
          status?: string
          total_price: number
          updated_at?: string
          user_email: string
          user_id: string
          user_id_image_url?: string | null
          user_id_number?: string | null
          user_license_image_url?: string | null
          user_license_number?: string | null
          user_name: string
          user_phone?: string | null
          verification_notes?: string | null
          verification_status?: string
        }
        Update: {
          admin_notes?: string | null
          car_id?: string | null
          car_name?: string
          car_slug?: string | null
          created_at?: string
          end_date?: string
          id?: string
          num_days?: number
          payment_method?: string | null
          payment_ref?: string | null
          pickup_location?: string | null
          price_per_day?: number
          return_condition?: string | null
          return_notes?: string | null
          returned_at?: string | null
          start_date?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_email?: string
          user_id?: string
          user_id_image_url?: string | null
          user_id_number?: string | null
          user_license_image_url?: string | null
          user_license_number?: string | null
          user_name?: string
          user_phone?: string | null
          verification_notes?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "fleet_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_cars: {
        Row: {
          available: boolean
          category: string
          created_at: string
          description: string | null
          features: string[]
          id: string
          image_url: string | null
          name: string
          price_per_day: number
          series: string | null
          slug: string
          spec_hp: string | null
          spec_top: string | null
          spec_zero: string | null
          updated_at: string
        }
        Insert: {
          available?: boolean
          category: string
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          image_url?: string | null
          name: string
          price_per_day: number
          series?: string | null
          slug: string
          spec_hp?: string | null
          spec_top?: string | null
          spec_zero?: string | null
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: string
          created_at?: string
          description?: string | null
          features?: string[]
          id?: string
          image_url?: string | null
          name?: string
          price_per_day?: number
          series?: string | null
          slug?: string
          spec_hp?: string | null
          spec_top?: string | null
          spec_zero?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          admin_notes: string | null
          asking_price: number
          created_at: string
          description: string | null
          id: string
          image_urls: string[]
          make: string
          mileage: string | null
          model: string
          seller_email: string
          seller_id: string | null
          seller_name: string
          seller_phone: string
          status: string
          updated_at: string
          year: string
        }
        Insert: {
          admin_notes?: string | null
          asking_price: number
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          make: string
          mileage?: string | null
          model: string
          seller_email: string
          seller_id?: string | null
          seller_name: string
          seller_phone: string
          status?: string
          updated_at?: string
          year: string
        }
        Update: {
          admin_notes?: string | null
          asking_price?: number
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[]
          make?: string
          mileage?: string | null
          model?: string
          seller_email?: string
          seller_id?: string | null
          seller_name?: string
          seller_phone?: string
          status?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          booking_id: string
          created_at: string
          id: string
          read_by_recipient: boolean
          sender_id: string
          sender_role: string
        }
        Insert: {
          body: string
          booking_id: string
          created_at?: string
          id?: string
          read_by_recipient?: boolean
          sender_id: string
          sender_role: string
        }
        Update: {
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          read_by_recipient?: boolean
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          id_image_url: string | null
          id_number: string | null
          license_image_url: string | null
          license_number: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          id_image_url?: string | null
          id_number?: string | null
          license_image_url?: string | null
          license_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          id_image_url?: string | null
          id_number?: string | null
          license_image_url?: string | null
          license_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_records: {
        Row: {
          car_id: string
          id: string
          last_service_date: string | null
          next_service_date: string | null
          service_notes: string | null
          updated_at: string
        }
        Insert: {
          car_id: string
          id?: string
          last_service_date?: string | null
          next_service_date?: string | null
          service_notes?: string | null
          updated_at?: string
        }
        Update: {
          car_id?: string
          id?: string
          last_service_date?: string | null
          next_service_date?: string | null
          service_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_records_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: true
            referencedRelation: "fleet_cars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      app_role: "admin" | "client"
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
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const
