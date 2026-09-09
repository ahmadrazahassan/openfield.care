import type { ServiceRow, TherapistRow, Slot } from "@/types/database.types";

/** Minimum notice before a session can be booked. Mirrored in SQL. */
export const MIN_LEAD_HOURS = 4;

/** How far ahead the calendar will look. Mirrored in SQL. */
export const MAX_HORIZON_DAYS = 90;

export const STEPS = [
  { key: "service", label: "Service" },
  { key: "therapist", label: "Therapist" },
  { key: "time", label: "Time" },
  { key: "details", label: "Details" },
  { key: "confirm", label: "Confirm" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export const MODALITY_LABEL: Record<string, string> = {
  video: "Video call",
  in_person: "In person",
  phone: "Phone call",
};

/** The viewer's IANA zone, with a safe fallback. */
export function resolveTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
  } catch {
    return "Europe/London";
  }
}

export function formatSlotTime(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

export function formatSlotDate(iso: string, timeZone: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone,
  });
}

export function formatSlotFull(iso: string, timeZone: string): string {
  return `${formatSlotDate(iso, timeZone)} at ${formatSlotTime(iso, timeZone)}`;
}

/** YYYY-MM-DD in a given zone (not UTC — the calendar is local to the viewer). */
export function dateKey(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Group open slots by local calendar day. */
export function groupSlotsByDay(
  slots: Slot[],
  timeZone: string,
): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = dateKey(new Date(slot.slot_start), timeZone);
    const bucket = map.get(key);
    if (bucket) bucket.push(slot);
    else map.set(key, [slot]);
  }
  return map;
}

/** A rolling strip of days starting today, in the viewer's zone. */
export function dayStrip(from: Date, count: number, timeZone: string) {
  const out: { key: string; date: Date; weekday: string; day: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    out.push({
      key: dateKey(d, timeZone),
      date: d,
      weekday: d.toLocaleDateString("en-GB", { weekday: "short", timeZone }),
      day: d.toLocaleDateString("en-GB", { day: "numeric", timeZone }),
    });
  }
  return out;
}

export type BookingSelection = {
  service?: ServiceRow;
  therapist?: TherapistRow;
  slot?: Slot;
  modality?: string;
};

/** Which step the flow should be on, given what has been chosen. */
export function currentStep(sel: BookingSelection): StepKey {
  if (!sel.service) return "service";
  if (!sel.therapist) return "therapist";
  if (!sel.slot) return "time";
  return "details";
}

/** Builds an .ics file for the confirmed appointment. */
export function buildIcs({
  reference,
  startsAt,
  endsAt,
  serviceName,
  therapistName,
  siteName,
  siteUrl,
}: {
  reference: string;
  startsAt: string;
  endsAt: string;
  serviceName: string;
  therapistName: string;
  siteName: string;
  siteUrl: string;
}): string {
  const stamp = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  // Long lines must be folded at 75 octets per RFC 5545.
  const fold = (line: string) =>
    line.length <= 75
      ? line
      : line.match(/.{1,73}/g)!.join("\r\n ");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${siteName}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${reference}@${new URL(siteUrl).hostname}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(startsAt)}`,
    `DTEND:${stamp(endsAt)}`,
    fold(`SUMMARY:${serviceName} with ${therapistName}`),
    fold(
      `DESCRIPTION:Your ${siteName} session. Reference ${reference}. Manage it at ${siteUrl}/account/appointments`,
    ),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
