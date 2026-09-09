export type AppointmentEmailEvent =
  | "booking_received"
  | "booking_confirmed"
  | "booking_rescheduled"
  | "booking_cancelled";

export type AppointmentEmailJob = {
  outbox_id: string;
  appointment_id: string;
  event_type: AppointmentEmailEvent;
  recipient_email: string;
  lease_token: string;
  payload: {
    id: string;
    reference: string;
    name: string;
    email: string;
    therapist: string;
    service: string;
    starts_at: string;
    ends_at: string;
    modality: string;
    status: string;
    price_cents?: number;
    currency?: string;
    meeting_url?: string | null;
    location_note?: string | null;
    timezone?: string | null;
    site_url?: string | null;
  };
};

export type RenderedAppointmentEmail = {
  subject: string;
  html: string;
  text: string;
  attachments: { filename: string; content: string }[];
};

const modalityLabels: Record<string, string> = {
  video: "Video call",
  in_person: "In person",
  phone: "Phone call",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTime(iso: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function buildIcs(job: AppointmentEmailJob, siteUrl: string): string {
  const p = job.payload;
  const stamp = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const fold = (line: string) =>
    line.length <= 75 ? line : (line.match(/.{1,73}/g) ?? [line]).join("\r\n ");
  const host = (() => {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      return "openfield.care";
    }
  })();
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Openfield//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${p.reference}@${host}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(p.starts_at)}`,
    `DTEND:${stamp(p.ends_at)}`,
    fold(`SUMMARY:${p.service} with ${p.therapist}`),
    fold(`DESCRIPTION:Openfield appointment ${p.reference}.`),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function base64(value: string): string {
  // btoa is available in both browsers and Supabase Edge Functions.
  return btoa(unescape(encodeURIComponent(value)));
}

export function renderAppointmentEmail(job: AppointmentEmailJob): RenderedAppointmentEmail {
  const p = job.payload;
  const timezone = p.timezone || "UTC";
  const date = formatDate(p.starts_at, timezone);
  const time = `${formatTime(p.starts_at, timezone)} – ${formatTime(p.ends_at, timezone)}`;
  const modality = modalityLabels[p.modality] || p.modality;
  const reference = p.reference;
  const siteUrl = p.site_url || "https://openfield.care";
  const manageUrl = (() => {
    try {
      return new URL("/account/appointments", siteUrl).toString();
    } catch {
      return "";
    }
  })();

  const copy = {
    booking_received: {
      subject: "We received your appointment request",
      heading: "Your appointment request is in",
      intro: "Thanks for choosing Openfield. We have held this time while the practice confirms your appointment.",
    },
    booking_confirmed: {
      subject: "Your Openfield appointment is confirmed",
      heading: "Your appointment is confirmed",
      intro: "Everything is set. We look forward to seeing you.",
    },
    booking_rescheduled: {
      subject: "Your Openfield appointment was updated",
      heading: "Your appointment details changed",
      intro: "Here are the latest details for your Openfield appointment.",
    },
    booking_cancelled: {
      subject: "Your Openfield appointment was cancelled",
      heading: "Your appointment was cancelled",
      intro: "The appointment below is no longer scheduled. Contact us if you need help arranging another time.",
    },
  }[job.event_type];

  const rows = [
    ["When", `${date}, ${time}`],
    ["With", p.therapist],
    ["Service", p.service],
    ["Format", modality],
    ["Reference", reference],
  ];
  const htmlRows = rows
    .map(([label, value]) => `<tr><td style="padding:8px 0;color:#637083;width:110px">${escapeHtml(label)}</td><td style="padding:8px 0;color:#111827;font-weight:600">${escapeHtml(value)}</td></tr>`)
    .join("");
  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const meeting = p.meeting_url
    ? `<p style="margin:24px 0"><a href="${escapeHtml(p.meeting_url)}" style="display:inline-block;background:#152238;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">Open your session link</a></p>`
    : "";
  const manage = manageUrl
    ? `<p style="margin:24px 0"><a href="${escapeHtml(manageUrl)}" style="color:#152238">Manage this appointment</a></p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f5f7f9;font-family:Arial,sans-serif;color:#111827"><div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e4e8ee;border-radius:18px;overflow:hidden"><div style="padding:28px 32px;background:#152238;color:#fff"><div style="font-size:15px;letter-spacing:.08em;text-transform:uppercase">Openfield</div></div><div style="padding:32px"><h1 style="font-size:28px;line-height:1.2;margin:0 0 12px">${escapeHtml(copy.heading)}</h1><p style="font-size:16px;line-height:1.6;margin:0 0 24px">Hi ${escapeHtml(p.name || "there")},</p><p style="font-size:16px;line-height:1.6;color:#465367">${escapeHtml(copy.intro)}</p><table style="width:100%;border-collapse:collapse;margin:24px 0;border-top:1px solid #e4e8ee;border-bottom:1px solid #e4e8ee">${htmlRows}</table>${meeting}${manage}<p style="font-size:13px;line-height:1.6;color:#637083;margin-top:32px">If you did not make this request, please reply to this email so we can check it.</p></div></div></body></html>`;
  const text = `Openfield\n\n${copy.heading}\n\nHi ${p.name || "there"},\n\n${copy.intro}\n\n${textRows}\n${p.meeting_url ? `\nSession link: ${p.meeting_url}\n` : ""}${manageUrl ? `\nManage appointment: ${manageUrl}\n` : ""}\nIf you did not make this request, please reply to this email.`;
  const attachments = job.event_type === "booking_cancelled"
    ? []
    : [{ filename: `openfield-${reference}.ics`, content: base64(buildIcs(job, siteUrl)) }];

  return { subject: copy.subject, html, text, attachments };
}
