// Generated from src/lib/email/edge-entry.ts. Do not edit directly.

// src/lib/email/edge-entry.ts
import { createClient } from "@supabase/supabase-js";

// src/lib/email/core.ts
var modalityLabels = {
  video: "Video call",
  in_person: "In person",
  phone: "Phone call"
};
function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function formatDate(iso, timezone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(iso));
}
function formatTime(iso, timezone) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(iso));
}
function buildIcs(job, siteUrl) {
  const p = job.payload;
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const fold = (line) => line.length <= 75 ? line : (line.match(/.{1,73}/g) ?? [line]).join("\r\n ");
  const host = (() => {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      return "openuproom.com";
    }
  })();
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Open Up Room//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${p.reference}@${host}`,
    `DTSTAMP:${stamp((/* @__PURE__ */ new Date()).toISOString())}`,
    `DTSTART:${stamp(p.starts_at)}`,
    `DTEND:${stamp(p.ends_at)}`,
    fold(`SUMMARY:${p.service} with ${p.therapist}`),
    fold(`DESCRIPTION:Open Up Room appointment ${p.reference}.`),
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
function base64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}
var BRAND = {
  name: "Open Up Room",
  ink: "#131316",
  page: "#f1f1f1",
  paper: "#ffffff",
  signal: "#00d54b",
  muted: "#6b6b73",
  line: "#e3e3e3",
  font: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
  micro: "'Montserrat Alternates','DM Sans',Helvetica,Arial,sans-serif"
};
var COPY = {
  booking_received: {
    subject: "We received your appointment request",
    eyebrow: "Request received",
    heading: "We have your request",
    intro: "Your time is held. We will confirm it shortly.",
    preheader: "Your time is held while we confirm it."
  },
  booking_confirmed: {
    subject: "Your Open Up Room appointment is confirmed",
    eyebrow: "Confirmed",
    heading: "You are booked in",
    intro: "Your session is confirmed. The details are below, and a calendar file is attached.",
    preheader: "Your session is confirmed. Details inside."
  },
  booking_rescheduled: {
    subject: "Your Open Up Room appointment was updated",
    eyebrow: "Updated",
    heading: "Your session has moved",
    intro: "Here are the new details. The attached calendar file replaces the old one.",
    preheader: "Your session has a new time."
  },
  reminder_24h: {
    subject: "Reminder: your Open Up Room session is tomorrow",
    eyebrow: "Tomorrow",
    heading: "See you tomorrow",
    intro: "A quick reminder of your session. If you can no longer make it, reply to this email so the time can go to someone else.",
    preheader: "A quick reminder of your session tomorrow."
  },
  reminder_1h: {
    subject: "Starting soon: your Open Up Room session",
    eyebrow: "Starting soon",
    heading: "Your session starts in an hour",
    intro: "Find somewhere quiet and private. Everything you need is below.",
    preheader: "Your session starts in about an hour."
  },
  booking_cancelled: {
    subject: "Your Open Up Room appointment was cancelled",
    eyebrow: "Cancelled",
    heading: "Your session was cancelled",
    intro: "This appointment is no longer scheduled. Book another time whenever you are ready.",
    preheader: "This appointment is no longer scheduled."
  }
};
var CANONICAL_ORIGIN = "https://www.openuproom.com";
function canonicalSiteUrl(value) {
  try {
    const url = new URL(value || CANONICAL_ORIGIN);
    if (url.hostname === "openuproom.com") url.hostname = "www.openuproom.com";
    return url.origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
}
function absoluteUrl(path, siteUrl) {
  try {
    return new URL(path, siteUrl).toString();
  } catch {
    return "";
  }
}
function firstName(name) {
  return (name ?? "").trim().split(/\s+/)[0] || "there";
}
function layout(input) {
  const b = BRAND;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(b.name)}</title>
<style>
  body{margin:0;padding:0;background:${b.page};-webkit-text-size-adjust:100%}
  @media (max-width:620px){
    .shell{padding:28px 12px !important}
    .card{padding:32px 24px !important}
    .h1{font-size:24px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${b.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${b.page}">${escapeHtml(input.preheader)}${"&#8199;&#65279;&#847;".repeat(24)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${b.page}" style="background:${b.page}">
<tr><td align="center" class="shell" style="padding:48px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
    <tr><td style="padding:0 4px 28px">
      <a href="${escapeHtml(input.homeUrl)}" style="text-decoration:none"><img src="${escapeHtml(input.logoUrl)}" width="148" height="21" alt="${escapeHtml(b.name)}" style="display:block;border:0;outline:none;width:148px;height:21px;font-family:${b.font};font-size:18px;font-weight:600;color:${b.ink}"></a>
    </td></tr>
    <tr><td class="card" bgcolor="${b.paper}" style="background:${b.paper};border-radius:20px;padding:44px 40px;font-family:${b.font};color:${b.ink}">
${input.body}
    </td></tr>
    <tr><td style="padding:28px 4px 0;font-family:${b.font};font-size:12px;line-height:1.7;color:${b.muted}">
${input.footer}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
function button(label, href) {
  const b = BRAND;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0"><tr><td bgcolor="${b.signal}" style="background:${b.signal};border-radius:999px"><a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 28px;font-family:${b.font};font-size:15px;font-weight:600;line-height:1;color:${b.ink};text-decoration:none;border-radius:999px">${escapeHtml(label)}</a></td></tr></table>`;
}
function renderAppointmentEmail(job) {
  const p = job.payload;
  const b = BRAND;
  const copy = COPY[job.event_type];
  const cancelled = job.event_type === "booking_cancelled";
  const timezone = p.timezone || "UTC";
  const date = formatDate(p.starts_at, timezone);
  const startTime = formatTime(p.starts_at, timezone).replace(/\s+\S+$/, "");
  const time = `${startTime} \u2013 ${formatTime(p.ends_at, timezone)}`;
  const modality = modalityLabels[p.modality] || p.modality;
  const reference = p.reference;
  const siteUrl = canonicalSiteUrl(p.site_url);
  const homeUrl = absoluteUrl("/", siteUrl);
  const logoUrl = `${CANONICAL_ORIGIN}/brand/email-wordmark.png`;
  const manageUrl = absoluteUrl("/account/appointments", siteUrl);
  const bookUrl = absoluteUrl("/book", siteUrl);
  const crisisUrl = absoluteUrl("/crisis-support", siteUrl);
  const name = firstName(p.name);
  const action = cancelled ? { label: "Book another time", href: bookUrl } : p.meeting_url && job.event_type !== "booking_received" ? { label: "Join your session", href: p.meeting_url } : { label: "View appointment", href: manageUrl };
  const rows = [
    ["With", p.therapist],
    ["Session", p.service],
    ["Format", p.location_note ? `${modality}, ${p.location_note}` : modality],
    ["Reference", reference]
  ];
  const cell = (index) => `padding:12px 0;${index ? `border-top:1px solid ${b.line};` : ""}`;
  const detailRows = rows.map(
    ([label, value], index) => `<tr><td style="${cell(index)}font-size:13px;color:${b.muted};width:96px;vertical-align:top">${escapeHtml(label)}</td><td style="${cell(index)}font-size:14px;font-weight:500;color:${b.ink}">${escapeHtml(value)}</td></tr>`
  ).join("");
  const dot = cancelled ? "#a1a1a8" : b.signal;
  const body = `      <p style="margin:0;font-family:${b.micro};font-size:11px;line-height:16px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${b.muted}"><span style="display:inline-block;width:7px;height:7px;margin:0 9px 1px 0;background:${dot};border-radius:7px;vertical-align:middle"></span>${escapeHtml(copy.eyebrow)}</p>
      <h1 class="h1" style="margin:20px 0 0;font-family:${b.font};font-size:28px;line-height:1.2;font-weight:600;letter-spacing:-.02em;color:${b.ink}">${escapeHtml(copy.heading)}</h1>
      <p style="margin:18px 0 0;font-size:15px;line-height:1.65;color:${b.ink}">Hi ${escapeHtml(name)},</p>
      <p style="margin:6px 0 0;font-size:15px;line-height:1.65;color:${b.muted}">${escapeHtml(copy.intro)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${b.page}" style="margin:32px 0 0;background:${b.page};border-radius:14px"><tr><td style="padding:24px 24px 10px">
        <p style="margin:0;font-size:17px;line-height:1.35;font-weight:600;letter-spacing:-.01em;color:${b.ink}${cancelled ? ";text-decoration:line-through" : ""}">${escapeHtml(date)}</p>
        <p style="margin:4px 0 14px;font-size:15px;line-height:1.5;color:${b.muted}">${escapeHtml(time)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${b.line}">${detailRows}</table>
      </td></tr></table>
      ${action.href ? button(action.label, action.href) : ""}`;
  const footer = `      <p style="margin:0">Questions? Reply to this email and a person will get back to you.</p>
      <p style="margin:12px 0 0">${escapeHtml(b.name)} is not an emergency service. If you need help right now, see <a href="${escapeHtml(crisisUrl)}" style="color:${b.muted};text-decoration:underline">crisis support</a>.</p>
      <p style="margin:12px 0 0"><a href="${escapeHtml(homeUrl)}" style="color:${b.muted};text-decoration:none">openuproom.com</a></p>`;
  const html = layout({ preheader: copy.preheader, logoUrl, homeUrl, body, footer });
  const text = [
    b.name,
    "",
    copy.heading,
    "",
    `Hi ${name},`,
    "",
    copy.intro,
    "",
    date,
    time,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    action.href ? `${action.label}: ${action.href}` : "",
    "",
    "Questions? Reply to this email.",
    `${b.name} is not an emergency service. If you need help right now: ${crisisUrl}`
  ].join("\n").replace(/\n{3,}/g, "\n\n");
  const attachments = cancelled ? [] : [{ filename: `openuproom-${reference}.ics`, content: base64(buildIcs(job, siteUrl)) }];
  return { subject: copy.subject, html, text, attachments };
}

// src/lib/email/edge-entry.ts
function required(name) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
function authorized(request, secret) {
  const expected = `Bearer ${secret}`;
  const received = request.headers.get("authorization") ?? "";
  if (expected.length !== received.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  }
  return difference === 0;
}
async function sendWithResend(apiKey, from, job) {
  const rendered = renderAppointmentEmail(job);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // If the response is lost after Resend accepted the request, a retry
      // reuses the same provider-side idempotency key instead of duplicating it.
      "Idempotency-Key": job.outbox_id
    },
    body: JSON.stringify({
      from,
      to: [job.recipient_email],
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      ...rendered.attachments.length ? { attachments: rendered.attachments } : {}
    })
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`resend_${response.status}: ${detail}`);
  }
}
Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || secret.length < 32) return new Response("Not configured", { status: 503 });
  if (!authorized(request, secret)) return new Response("Unauthorized", { status: 401 });
  try {
    const supabaseUrl = required("SUPABASE_URL");
    const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = required("RESEND_API_KEY");
    const from = required("RESEND_FROM_EMAIL");
    const db = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://www.openuproom.com";
    let sent = 0;
    let failed = 0;
    const deadline = Date.now() + 4e4;
    for (let count = 0; count < 500 && Date.now() < deadline; count += 1) {
      const { data, error } = await db.rpc("claim_appointment_email", {});
      if (error) throw new Error("Email queue unavailable");
      const raw = data?.[0];
      if (!raw) break;
      const job = {
        ...raw,
        event_type: raw.event_type,
        payload: { ...raw.payload, site_url: raw.payload.site_url || siteUrl }
      };
      try {
        await sendWithResend(resendKey, from, job);
        const { error: finishError } = await db.rpc("finish_appointment_email", {
          p_outbox_id: job.outbox_id,
          p_lease_token: job.lease_token,
          p_error: null
        });
        if (finishError) throw new Error("Email acknowledgement failed");
        sent += 1;
      } catch (error2) {
        failed += 1;
        const message = error2 instanceof Error ? error2.message : "Email delivery failed";
        await db.rpc("finish_appointment_email", {
          p_outbox_id: job.outbox_id,
          p_lease_token: job.lease_token,
          p_error: message
        });
      }
    }
    return Response.json({ sent, failed });
  } catch (error) {
    console.error("Appointment email worker failed", error instanceof Error ? error.message : error);
    return Response.json({ error: "Email delivery is temporarily unavailable" }, { status: 503 });
  }
});
