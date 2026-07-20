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
          whatsapp_number: string;
          whatsapp_verified: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          whatsapp_number: string;
          whatsapp_verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: Relationship[];
      };
      themes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          emoji: string;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["themes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["themes"]["Row"]>;
        Relationships: Relationship[];
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
    };
  };
};
