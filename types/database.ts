import type { DataOrigin, ForecastPosition, ProfileStatus, ResolutionStatus, VerificationStatus } from "@/types";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          data_origin: DataOrigin;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          data_origin?: DataOrigin;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      protocols: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          description: string | null;
          data_origin: DataOrigin;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          description?: string | null;
          data_origin?: DataOrigin;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["protocols"]["Insert"]>;
        Relationships: [];
      };
      forecasters: {
        Row: {
          id: string;
          slug: string;
          display_name: string;
          wallet_address: string | null;
          x_handle: string | null;
          avatar_url: string | null;
          bio: string | null;
          joined_at: string;
          is_verified: boolean;
          data_origin: DataOrigin;
          verification_status: VerificationStatus;
          profile_status: ProfileStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          display_name: string;
          wallet_address?: string | null;
          x_handle?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          joined_at?: string;
          is_verified?: boolean;
          data_origin?: DataOrigin;
          verification_status?: VerificationStatus;
          profile_status?: ProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["forecasters"]["Insert"]>;
        Relationships: [];
      };
      markets: {
        Row: {
          id: string;
          protocol_id: string | null;
          category_id: string | null;
          slug: string;
          question: string;
          description: string | null;
          source_url: string | null;
          current_probability: number | string;
          previous_probability: number | string;
          volume: number | string;
          participant_count: number;
          resolution_date: string | null;
          resolution_status: ResolutionStatus;
          resolution_outcome: "yes" | "no" | null;
          resolution_rules: string | null;
          data_origin: DataOrigin;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          protocol_id?: string | null;
          category_id?: string | null;
          slug: string;
          question: string;
          description?: string | null;
          source_url?: string | null;
          current_probability: number;
          previous_probability: number;
          volume?: number;
          participant_count?: number;
          resolution_date?: string | null;
          resolution_status?: ResolutionStatus;
          resolution_outcome?: "yes" | "no" | null;
          resolution_rules?: string | null;
          data_origin?: DataOrigin;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["markets"]["Insert"]>;
        Relationships: [];
      };
      forecasts: {
        Row: {
          id: string;
          forecaster_id: string;
          market_id: string;
          predicted_probability: number | string;
          confidence: number | string;
          position: ForecastPosition;
          reasoning: string | null;
          forecasted_at: string;
          is_resolved: boolean;
          was_correct: boolean | null;
          score_impact: number | string;
          data_origin: DataOrigin;
          verification_status: VerificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          forecaster_id: string;
          market_id: string;
          predicted_probability: number;
          confidence: number;
          position: ForecastPosition;
          reasoning?: string | null;
          forecasted_at?: string;
          is_resolved?: boolean;
          was_correct?: boolean | null;
          score_impact?: number;
          data_origin?: DataOrigin;
          verification_status?: VerificationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["forecasts"]["Insert"]>;
        Relationships: [];
      };
      market_probability_history: {
        Row: {
          id: string;
          market_id: string;
          probability: number | string;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          market_id: string;
          probability: number;
          recorded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["market_probability_history"]["Insert"]>;
        Relationships: [];
      };
      insights: {
        Row: {
          id: string;
          title: string;
          body: string;
          category: string | null;
          is_featured: boolean;
          data_origin: DataOrigin;
          verification_status: VerificationStatus;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          body: string;
          category?: string | null;
          is_featured?: boolean;
          data_origin?: DataOrigin;
          verification_status?: VerificationStatus;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["insights"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      resolution_status: ResolutionStatus;
      forecast_position: ForecastPosition;
      data_origin: DataOrigin;
      verification_status: VerificationStatus;
      profile_status: ProfileStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
