export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type GenerationStatus = 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      generated_user_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          start_date: string;
          end_date: string;
          people_count: number;
          note: string | null;
          travel_preferences: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          start_date: string;
          end_date: string;
          people_count: number;
          note?: string | null;
          travel_preferences?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          people_count?: number;
          note?: string | null;
          travel_preferences?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      places: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          start_date: string;
          end_date: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          name: string;
          start_date: string;
          end_date: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          name?: string;
          start_date?: string;
          end_date?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_ai_plans: {
        Row: {
          id: string;
          plan_id: string;
          content: Json;
          status: GenerationStatus;
          estimated_time_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          content: Json;
          status?: GenerationStatus;
          estimated_time_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          content?: Json;
          status?: GenerationStatus;
          estimated_time_remaining?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      plan_status: 'draft' | 'generated';
    };
  };
}

