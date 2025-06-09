export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      search_results: {
        Row: {
          id: string;
          title: string;
          description: string;
          url: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          url: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          url?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          conversation_id: string;
          title: string;
          encrypted_data: string;
          message_count: number;
          created_at: string;
          updated_at: string;
          synced_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          conversation_id: string;
          title: string;
          encrypted_data: string;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
          synced_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          conversation_id?: string;
          title?: string;
          encrypted_data?: string;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
          synced_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
