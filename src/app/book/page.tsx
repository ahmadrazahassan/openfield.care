import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { createClient } from "@/lib/supabase/server";
import { getServices, getTherapists, getCurrentUser } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Book a session",
  description:
    "Choose a service, a therapist and a time. Most people are booked in about three minutes.",
  robots: { index: false, follow: true },
};

// Availability is live; nothing here may be cached.
export const dynamic = "force-dynamic";

export default async function BookPage() {
  const [services, therapists, session] = await Promise.all([
    getServices(),
    getTherapists(),
    getCurrentUser(),
  ]);

  // therapist id -> the services they offer, so the picker can filter.
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("therapist_services")
    .select("therapist_id, service_id");

  const offerings: Record<string, string[]> = {};
  for (const row of links ?? []) {
    (offerings[row.therapist_id] ??= []).push(row.service_id);
  }

  return (
    <BookingFlow
      services={services}
      therapists={therapists}
      offerings={offerings}
      prefill={
        session
          ? {
              fullName: session.profile.full_name ?? "",
              email: session.profile.email ?? "",
              phone: session.profile.phone ?? "",
            }
          : null
      }
    />
  );
}
