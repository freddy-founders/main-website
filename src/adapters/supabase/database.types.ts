export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      companies: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          location_label: string | null;
          name: string;
          publication_status: Database['public']['Enums']['publication_status'];
          slug: string;
          stage: string | null;
          tagline: string | null;
          updated_at: string;
          visibility: Database['public']['Enums']['public_visibility'];
          website_url: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          location_label?: string | null;
          name: string;
          publication_status?: Database['public']['Enums']['publication_status'];
          slug: string;
          stage?: string | null;
          tagline?: string | null;
          updated_at?: string;
          visibility?: Database['public']['Enums']['public_visibility'];
          website_url?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          location_label?: string | null;
          name?: string;
          publication_status?: Database['public']['Enums']['publication_status'];
          slug?: string;
          stage?: string | null;
          tagline?: string | null;
          updated_at?: string;
          visibility?: Database['public']['Enums']['public_visibility'];
          website_url?: string | null;
        };
        Relationships: [];
      };
      event_company_links: {
        Row: {
          company_id: string;
          created_at: string;
          event_id: string;
          relationship_label: string | null;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          event_id: string;
          relationship_label?: string | null;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          event_id?: string;
          relationship_label?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'event_company_links_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_company_links_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      event_person_links: {
        Row: {
          created_at: string;
          event_id: string;
          person_id: string;
          relationship_label: string | null;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          person_id: string;
          relationship_label?: string | null;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          person_id?: string;
          relationship_label?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'event_person_links_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_person_links_person_id_fkey';
            columns: ['person_id'];
            isOneToOne: false;
            referencedRelation: 'people';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          capacity_status: Database['public']['Enums']['event_capacity_status'];
          created_at: string;
          ends_at: string | null;
          id: string;
          location_label: string | null;
          publication_status: Database['public']['Enums']['publication_status'];
          registration_label: string | null;
          registration_mode: Database['public']['Enums']['event_registration_mode'];
          registration_url: string | null;
          slug: string;
          starts_at: string;
          summary: string | null;
          title: string;
          updated_at: string;
          visibility: Database['public']['Enums']['public_visibility'];
        };
        Insert: {
          capacity_status?: Database['public']['Enums']['event_capacity_status'];
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          location_label?: string | null;
          publication_status?: Database['public']['Enums']['publication_status'];
          registration_label?: string | null;
          registration_mode?: Database['public']['Enums']['event_registration_mode'];
          registration_url?: string | null;
          slug: string;
          starts_at: string;
          summary?: string | null;
          title: string;
          updated_at?: string;
          visibility?: Database['public']['Enums']['public_visibility'];
        };
        Update: {
          capacity_status?: Database['public']['Enums']['event_capacity_status'];
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          location_label?: string | null;
          publication_status?: Database['public']['Enums']['publication_status'];
          registration_label?: string | null;
          registration_mode?: Database['public']['Enums']['event_registration_mode'];
          registration_url?: string | null;
          slug?: string;
          starts_at?: string;
          summary?: string | null;
          title?: string;
          updated_at?: string;
          visibility?: Database['public']['Enums']['public_visibility'];
        };
        Relationships: [];
      };
      people: {
        Row: {
          company_id: string | null;
          company_name: string | null;
          created_at: string;
          founder_context: string | null;
          id: string;
          location_label: string | null;
          name: string;
          profile_id: string | null;
          public_directory_consent: boolean;
          publication_status: Database['public']['Enums']['publication_status'];
          role: string | null;
          slug: string;
          topics: string[];
          updated_at: string;
          visibility: Database['public']['Enums']['public_visibility'];
        };
        Insert: {
          company_id?: string | null;
          company_name?: string | null;
          created_at?: string;
          founder_context?: string | null;
          id?: string;
          location_label?: string | null;
          name: string;
          profile_id?: string | null;
          public_directory_consent?: boolean;
          publication_status?: Database['public']['Enums']['publication_status'];
          role?: string | null;
          slug: string;
          topics?: string[];
          updated_at?: string;
          visibility?: Database['public']['Enums']['public_visibility'];
        };
        Update: {
          company_id?: string | null;
          company_name?: string | null;
          created_at?: string;
          founder_context?: string | null;
          id?: string;
          location_label?: string | null;
          name?: string;
          profile_id?: string | null;
          public_directory_consent?: boolean;
          publication_status?: Database['public']['Enums']['publication_status'];
          role?: string | null;
          slug?: string;
          topics?: string[];
          updated_at?: string;
          visibility?: Database['public']['Enums']['public_visibility'];
        };
        Relationships: [
          {
            foreignKeyName: 'people_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'people_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
          public_directory_consent: boolean;
          role: Database['public']['Enums']['account_role'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          name: string;
          public_directory_consent?: boolean;
          role?: Database['public']['Enums']['account_role'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          public_directory_consent?: boolean;
          role?: Database['public']['Enums']['account_role'];
          updated_at?: string;
        };
        Relationships: [];
      };
      registration_requests: {
        Row: {
          company_name: string | null;
          created_at: string;
          email: string;
          founder_context: string | null;
          id: string;
          name: string;
          public_directory_consent: boolean;
          reviewed_at: string | null;
          reviewed_by: string | null;
          role: string | null;
          status: Database['public']['Enums']['registration_request_status'];
          topics: string[];
        };
        Insert: {
          company_name?: string | null;
          created_at?: string;
          email: string;
          founder_context?: string | null;
          id?: string;
          name: string;
          public_directory_consent?: boolean;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          role?: string | null;
          status?: Database['public']['Enums']['registration_request_status'];
          topics?: string[];
        };
        Update: {
          company_name?: string | null;
          created_at?: string;
          email?: string;
          founder_context?: string | null;
          id?: string;
          name?: string;
          public_directory_consent?: boolean;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          role?: string | null;
          status?: Database['public']['Enums']['registration_request_status'];
          topics?: string[];
        };
        Relationships: [
          {
            foreignKeyName: 'registration_requests_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin_or_organizer: { Args: never; Returns: boolean };
    };
    Enums: {
      account_role: 'visitor' | 'member' | 'organizer' | 'admin';
      event_capacity_status: 'open' | 'limited' | 'full' | 'waitlist' | 'unknown';
      event_registration_mode: 'external' | 'disabled' | 'internal';
      public_visibility: 'public' | 'members' | 'private';
      publication_status: 'draft' | 'pending_review' | 'published' | 'archived';
      registration_request_status: 'pending' | 'approved' | 'rejected';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_role: ['visitor', 'member', 'organizer', 'admin'],
      event_capacity_status: ['open', 'limited', 'full', 'waitlist', 'unknown'],
      event_registration_mode: ['external', 'disabled', 'internal'],
      public_visibility: ['public', 'members', 'private'],
      publication_status: ['draft', 'pending_review', 'published', 'archived'],
      registration_request_status: ['pending', 'approved', 'rejected'],
    },
  },
} as const;
