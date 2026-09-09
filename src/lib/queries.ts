import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  ServiceRow,
  TherapistRow,
  PostRow,
  TestimonialRow,
  Slot,
} from "@/types/database.types";

/**
 * Read-side data access. Every function here runs through the anon/session
 * client, so the public-read RLS policies are what decide visibility — there is
 * no "trust me" path around them.
 *
 * `cache()` dedupes within a single render pass.
 */

export const getServices = cache(async (): Promise<ServiceRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getService = cache(
  async (slug: string): Promise<ServiceRow | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data ?? null;
  },
);

export const getTherapists = cache(async (): Promise<TherapistRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getTherapist = cache(
  async (slug: string): Promise<TherapistRow | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("therapists")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return data ?? null;
  },
);

/** Therapists who offer a given service. */
export const getTherapistsForService = cache(
  async (serviceId: string): Promise<TherapistRow[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("therapist_services")
      .select("therapists!inner(*)")
      .eq("service_id", serviceId);

    return (data ?? [])
      .map((r) => r.therapists as unknown as TherapistRow)
      .filter((t) => t?.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  },
);

/** Services a given therapist offers. */
export const getServicesForTherapist = cache(
  async (therapistId: string): Promise<ServiceRow[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("therapist_services")
      .select("services!inner(*)")
      .eq("therapist_id", therapistId);

    return (data ?? [])
      .map((r) => r.services as unknown as ServiceRow)
      .filter((s) => s?.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  },
);

export const getPosts = cache(async (): Promise<PostRow[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getPost = cache(async (slug: string): Promise<PostRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  return data ?? null;
});

export const getTestimonials = cache(async (): Promise<TestimonialRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  return data ?? [];
});

/**
 * Open slots for one therapist and service. The window is capped server-side
 * in get_available_slots, so a wide range cannot be used to burn CPU.
 */
export async function getAvailableSlots(
  therapistId: string,
  serviceId: string,
  from: Date,
  to: Date,
): Promise<Slot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_therapist_id: therapistId,
    p_service_id: serviceId,
    p_from: toDateString(from),
    p_to: toDateString(to),
  });
  if (error) throw error;
  return data ?? [];
}

/** The soonest open slot across every therapist offering a service. */
export async function getNextAvailable(
  therapistId: string,
  serviceId: string,
): Promise<string | null> {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 21);
  const slots = await getAvailableSlots(therapistId, serviceId, from, to);
  return slots[0]?.slot_start ?? null;
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/* ── Session ──────────────────────────────────────────────────────────── */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile ? { user, profile } : null;
});

/**
 * Real open-slot counts for the next seven days, summed across every active
 * practitioner for the first-consultation service. This is what the bento
 * section reports, so the figure on the page is the figure in the database.
 */
export const getWeekOpenings = cache(
  async (): Promise<
    { key: string; label: string; count: number; isToday: boolean }[]
  > => {
    const from = new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + 7);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(from);
      d.setDate(d.getDate() + i);
      return {
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-GB", { weekday: "narrow" }),
        isToday: i === 0,
        count: 0,
      };
    });

    const [services, therapists] = await Promise.all([
      getServices(),
      getTherapists(),
    ]);
    const service =
      services.find((s) => s.slug === "first-consultation") ?? services[0];
    if (!service) return days;

    const results = await Promise.all(
      therapists.map((t) =>
        getAvailableSlots(t.id, service.id, from, to).catch(() => []),
      ),
    );

    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const slots of results) {
      for (const slot of slots) {
        const key = slot.slot_start.slice(0, 10);
        const day = byKey.get(key);
        if (day) day.count += 1;
      }
    }

    return days;
  },
);
