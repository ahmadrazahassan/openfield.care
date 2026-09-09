/**
 * GENERATED — do not hand-edit.
 *
 * Regenerate after any migration:
 *   npx supabase gen types typescript --project-id uxjfzgkllqjqsdhnmiwa > src/types/database.types.ts
 *
 * (The unused generic helpers from the generator are omitted; the narrow
 * aliases at the bottom of this file are what the app consumes.)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      appointments: {
        Row: {
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          client_id: string | null;
          client_note: string | null;
          created_at: string;
          currency: string;
          ends_at: string;
          guest_email: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          id: string;
          intake: Json;
          location_note: string | null;
          meeting_url: string | null;
          modality: Database["public"]["Enums"]["session_modality"];
          price_cents: number;
          reference: string;
          reminder_sent_at: string | null;
          service_id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          therapist_id: string;
          updated_at: string;
        };
        Insert: {
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          client_note?: string | null;
          client_id?: string | null;
          created_at?: string;
          currency?: string;
          ends_at: string;
          guest_email?: string | null;
          guest_name?: string | null;
          guest_phone?: string | null;
          id?: string;
          intake?: Json;
          location_note?: string | null;
          meeting_url?: string | null;
          modality?: Database["public"]["Enums"]["session_modality"];
          price_cents: number;
          reference?: string;
          reminder_sent_at?: string | null;
          service_id: string;
          starts_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          therapist_id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      availability_rules: {
        Row: {
          created_at: string;
          effective_from: string | null;
          effective_to: string | null;
          end_time: string;
          id: string;
          start_time: string;
          therapist_id: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          effective_from?: string | null;
          effective_to?: string | null;
          end_time: string;
          id?: string;
          start_time: string;
          therapist_id: string;
          weekday: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["availability_rules"]["Insert"]
        >;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          handled: boolean;
          id: string;
          message: string;
          name: string;
          topic: Database["public"]["Enums"]["contact_topic"];
        };
        Insert: {
          created_at?: string;
          email: string;
          handled?: boolean;
          id?: string;
          message: string;
          name: string;
          topic?: Database["public"]["Enums"]["contact_topic"];
        };
        Update: Partial<
          Database["public"]["Tables"]["contact_messages"]["Insert"]
        >;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null;
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          confirmed_at?: string | null;
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]
        >;
        Relationships: [];
      };
      posts: {
        Row: {
          author_id: string | null;
          body: string[];
          cover_url: string | null;
          created_at: string;
          excerpt: string;
          id: string;
          published_at: string | null;
          reading_min: number | null;
          slug: string;
          tags: string[];
          title: string;
        };
        Insert: {
          author_id?: string | null;
          body?: string[];
          cover_url?: string | null;
          created_at?: string;
          excerpt: string;
          id?: string;
          published_at?: string | null;
          reading_min?: number | null;
          slug: string;
          tags?: string[];
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          marketing_opt_in: boolean;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          timezone: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          marketing_opt_in?: boolean;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          timezone?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          buffer_min: number;
          created_at: string;
          currency: string;
          description: string | null;
          duration_min: number;
          icon_key: string;
          id: string;
          is_active: boolean;
          modalities: Database["public"]["Enums"]["session_modality"][];
          name: string;
          price_cents: number;
          short_desc: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          buffer_min?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          duration_min?: number;
          icon_key: string;
          id?: string;
          is_active?: boolean;
          modalities?: Database["public"]["Enums"]["session_modality"][];
          name: string;
          price_cents: number;
          short_desc: string;
          slug: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      session_notes: {
        Row: {
          appointment_id: string;
          body: string;
          created_at: string;
          id: string;
          therapist_id: string;
          updated_at: string;
        };
        Insert: {
          appointment_id: string;
          body: string;
          created_at?: string;
          id?: string;
          therapist_id: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_notes"]["Insert"]>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          attribution: string;
          created_at: string;
          id: string;
          is_placeholder: boolean;
          is_published: boolean;
          quote: string;
          service_id: string | null;
          sort_order: number;
        };
        Insert: {
          attribution: string;
          created_at?: string;
          id?: string;
          is_placeholder?: boolean;
          is_published?: boolean;
          quote: string;
          service_id?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
        Relationships: [];
      };
      therapist_services: {
        Row: { service_id: string; therapist_id: string };
        Insert: { service_id: string; therapist_id: string };
        Update: Partial<{ service_id: string; therapist_id: string }>;
        Relationships: [];
      };
      therapists: {
        Row: {
          accepts_new: boolean;
          created_at: string;
          credentials: string[];
          display_name: string;
          id: string;
          initials: string;
          is_active: boolean;
          is_placeholder: boolean;
          languages: string[];
          long_bio: string[] | null;
          photo_url: string | null;
          profile_id: string | null;
          registration_no: string | null;
          short_bio: string;
          slug: string;
          sort_order: number;
          specialties: string[];
          timezone: string;
          title: string;
          years_experience: number | null;
        };
        Insert: {
          accepts_new?: boolean;
          created_at?: string;
          credentials?: string[];
          display_name: string;
          id?: string;
          initials: string;
          is_active?: boolean;
          is_placeholder?: boolean;
          languages?: string[];
          long_bio?: string[] | null;
          photo_url?: string | null;
          profile_id?: string | null;
          registration_no?: string | null;
          short_bio: string;
          slug: string;
          sort_order?: number;
          specialties?: string[];
          timezone?: string;
          title: string;
          years_experience?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["therapists"]["Insert"]>;
        Relationships: [];
      };
      time_off: {
        Row: {
          created_at: string;
          ends_at: string;
          id: string;
          reason: string | null;
          starts_at: string;
          therapist_id: string;
        };
        Insert: {
          created_at?: string;
          ends_at: string;
          id?: string;
          reason?: string | null;
          starts_at: string;
          therapist_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["time_off"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      current_role_is: {
        Args: { r: Database["public"]["Enums"]["user_role"] };
        Returns: boolean;
      };
      current_therapist_id: { Args: never; Returns: string };
      book_appointment: {
        Args: {
          p_service_id: string;
          p_therapist_id: string;
          p_starts_at: string;
          p_modality: Database["public"]["Enums"]["session_modality"];
          p_name: string;
          p_email: string;
          p_phone?: string | null;
          p_note?: string | null;
          p_timezone?: string;
        };
        Returns: {
          reference: string;
          appointment_id: string;
          starts_at: string;
          ends_at: string;
        }[];
      };
      get_available_slots: {
        Args: {
          p_from: string;
          p_service_id: string;
          p_therapist_id: string;
          p_to: string;
        };
        Returns: { slot_end: string; slot_start: string }[];
      };
    };
    Enums: {
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show";
      contact_topic: "general" | "booking" | "billing" | "partnership" | "press";
      session_modality: "video" | "in_person" | "phone";
      user_role: "client" | "therapist" | "admin";
    };
    CompositeTypes: Record<never, never>;
  };
};

/* ── Narrow aliases the app actually consumes ─────────────────────────── */

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

export type ProfileRow = Tables<"profiles">;
export type ServiceRow = Tables<"services">;
export type TherapistRow = Tables<"therapists">;
export type AppointmentRow = Tables<"appointments">;
export type PostRow = Tables<"posts">;
export type TestimonialRow = Tables<"testimonials">;
export type AvailabilityRuleRow = Tables<"availability_rules">;

export type UserRole = Enums<"user_role">;
export type AppointmentStatus = Enums<"appointment_status">;
export type SessionModality = Enums<"session_modality">;
export type ContactTopic = Enums<"contact_topic">;

export type Slot = { slot_start: string; slot_end: string };
