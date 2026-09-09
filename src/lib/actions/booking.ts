"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/queries";

/**
 * Booking mutations.
 *
 * No account is required. Everything goes through the `book_appointment`
 * database function, which:
 *   - reads price and duration from the catalogue rather than trusting the
 *     client,
 *   - re-validates the slot against working hours, time off and lead time,
 *   - relies on the exclusion constraint to make double-booking impossible,
 *   - attaches the caller's id automatically when they happen to be signed in.
 */

const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  therapistId: z.string().uuid(),
  startsAt: z.string().datetime({ offset: true }),
  modality: z.enum(["video", "in_person", "phone"]),
  fullName: z.string().trim().min(2, "Please give a name we can use.").max(120),
  email: z.string().trim().email("That email does not look right."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  timezone: z.string().min(1).max(64),
  consentNotEmergency: z.boolean().refine((v) => v === true, {
    message: "Please confirm you understand this is not a crisis service.",
  }),
  consentTerms: z.boolean().refine((v) => v === true, {
    message: "Please accept the terms and privacy notice.",
  }),
});

export type BookingInput = z.input<typeof bookingSchema>;

export type BookingResult =
  | { ok: true; reference: string; startsAt: string; endsAt: string }
  | { ok: false; error: string; code?: "conflict" | "validation" };

export async function createBooking(
  input: BookingInput,
): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "validation",
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const { data: rows, error } = await supabase.rpc("book_appointment", {
    p_service_id: data.serviceId,
    p_therapist_id: data.therapistId,
    p_starts_at: new Date(data.startsAt).toISOString(),
    p_modality: data.modality,
    p_name: data.fullName,
    p_email: data.email,
    p_phone: data.phone || null,
    p_note: data.note || null,
    p_timezone: data.timezone,
  });

  if (error) {
    // 23P01: the slot was taken between rendering and submitting.
    if (error.code === "23P01" || /not available/i.test(error.message)) {
      return {
        ok: false,
        code: "conflict",
        error: "That time was taken a moment ago.",
      };
    }
    // 22023: a validation guard inside the function rejected the request.
    if (error.code === "22023") {
      return { ok: false, code: "validation", error: error.message };
    }
    if (error.code === "54000") {
      return {
        ok: false,
        error:
          "That is several bookings from one address today. Please contact us instead.",
      };
    }
    return { ok: false, error: "We could not save that booking. Try again." };
  }

  const booking = rows?.[0];
  if (!booking) {
    return { ok: false, error: "We could not save that booking. Try again." };
  }

  // Read-your-writes for anyone signed in, and refresh the slot grid.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) updateTag(`appointments:${user.id}`);
  updateTag(`slots:${data.therapistId}`);

  return {
    ok: true,
    reference: booking.reference,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
  };
}

/** Re-fetch open slots, used after a conflict so the grid can refresh. */
export async function refreshSlots(
  therapistId: string,
  serviceId: string,
  fromIso: string,
  toIso: string,
) {
  return getAvailableSlots(
    therapistId,
    serviceId,
    new Date(fromIso),
    new Date(toIso),
  );
}

const cancelSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function cancelAppointment(
  input: z.input<typeof cancelSchema>,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const { error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancellation_reason: parsed.data.reason || null,
    })
    .eq("id", parsed.data.appointmentId);

  if (error) return { ok: false, error: "Could not cancel that session." };

  updateTag(`appointments:${user.id}`);
  return { ok: true };
}
