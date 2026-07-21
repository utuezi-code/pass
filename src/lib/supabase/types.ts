type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          whatsapp_number: string | null;
          whatsapp_verified: boolean;
          notification_channel: "email" | "whatsapp" | "push";
          consent_given_at: string | null;
          no_show_count: number;
          suspended: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          whatsapp_number?: string | null;
          whatsapp_verified?: boolean;
          notification_channel?: "email" | "whatsapp" | "push";
          consent_given_at?: string | null;
          no_show_count?: number;
          suspended?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: Relationship[];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          emoji: string;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: Relationship[];
      };
      themes: {
        Row: {
          id: string;
          category_id: string;
          creator_id: string;
          title: string;
          description: string;
          scheduled_at: string;
          capacity: number;
          status: "open" | "confirmed" | "cancelled" | "completed";
          recurring_slot_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          creator_id: string;
          title: string;
          description: string;
          scheduled_at: string;
          capacity?: number;
          status?: "open" | "confirmed" | "cancelled" | "completed";
          recurring_slot_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["themes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "themes_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "themes_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "themes_recurring_slot_id_fkey";
            columns: ["recurring_slot_id"];
            isOneToOne: false;
            referencedRelation: "recurring_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      circles: {
        Row: {
          id: string;
          theme_id: string;
          meeting_url: string;
          capacity: number;
          status: "scheduled" | "completed" | "cancelled";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["circles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["circles"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "circles_theme_id_fkey";
            columns: ["theme_id"];
            isOneToOne: false;
            referencedRelation: "themes";
            referencedColumns: ["id"];
          },
        ];
      };
      registrations: {
        Row: {
          id: string;
          user_id: string;
          theme_id: string;
          circle_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["registrations"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["registrations"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "registrations_theme_id_fkey";
            columns: ["theme_id"];
            isOneToOne: false;
            referencedRelation: "themes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      theme_counts: {
        Row: {
          theme_id: string;
          waiting_count: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["theme_counts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["theme_counts"]["Row"]>;
        Relationships: Relationship[];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          circle_id: string | null;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          circle_id?: string | null;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey";
            columns: ["reported_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
        ];
      };
      app_config: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["app_config"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["app_config"]["Row"]>;
        Relationships: Relationship[];
      };
      attendance: {
        Row: {
          id: string;
          circle_id: string;
          user_id: string;
          status: "pending" | "present" | "no_show";
          marked_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["attendance"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["attendance"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "attendance_circle_id_fkey";
            columns: ["circle_id"];
            isOneToOne: false;
            referencedRelation: "circles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      recurring_slots: {
        Row: {
          id: string;
          category_id: string;
          created_by: string;
          title: string;
          description: string;
          day_of_week: number;
          time_of_day: string;
          capacity: number | null;
          active: boolean;
          next_run_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["recurring_slots"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["recurring_slots"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "recurring_slots_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      invite_codes: {
        Row: {
          code: string;
          created_by: string | null;
          max_uses: number;
          uses_count: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invite_codes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["invite_codes"]["Row"]>;
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: {
      join_theme: {
        Args: { p_theme_id: string };
        Returns: {
          status: "waiting" | "matched";
          count?: number;
          capacity?: number;
          circle_id?: string;
          meeting_url?: string;
        };
      };
      mark_attendance: {
        Args: { p_circle_id: string };
        Returns: undefined;
      };
      consume_invite_code: {
        Args: { p_code: string };
        Returns: boolean;
      };
    };
  };
};
