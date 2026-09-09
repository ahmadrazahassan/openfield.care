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
    `DTSTAMP:${stamp((/* @__PURE__ */ new Date()).toISOString())}`,
    `DTSTART:${stamp(p.starts_at)}`,
    `DTEND:${stamp(p.ends_at)}`,
    fold(`SUMMARY:${p.service} with ${p.therapist}`),
    fold(`DESCRIPTION:Openfield appointment ${p.reference}.`),
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
function base64(value) {
  return btoa(unescape(encodeURIComponent(value)));
}
function renderAppointmentEmail(job) {
  const p = job.payload;
  const timezone = p.timezone || "UTC";
  const date = formatDate(p.starts_at, timezone);
  const time = `${formatTime(p.starts_at, timezone)} \u2013 ${formatTime(p.ends_at, timezone)}`;
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
      intro: "Thanks for choosing Openfield. We have held this time while the practice confirms your appointment."
    },
    booking_confirmed: {
      subject: "Your Openfield appointment is confirmed",
      heading: "Your appointment is confirmed",
      intro: "Everything is set. We look forward to seeing you."
    },
    booking_rescheduled: {
      subject: "Your Openfield appointment was updated",
      heading: "Your appointment details changed",
      intro: "Here are the latest details for your Openfield appointment."
    },
    booking_cancelled: {
      subject: "Your Openfield appointment was cancelled",
      heading: "Your appointment was cancelled",
      intro: "The appointment below is no longer scheduled. Contact us if you need help arranging another time."
    }
  }[job.event_type];
  const rows = [
    ["When", `${date}, ${time}`],
    ["With", p.therapist],
    ["Service", p.service],
    ["Format", modality],
    ["Reference", reference]
  ];
  const htmlRows = rows.map(([label, value]) => `<tr><td style="padding:8px 0;color:#637083;width:110px">${escapeHtml(label)}</td><td style="padding:8px 0;color:#111827;font-weight:600">${escapeHtml(value)}</td></tr>`).join("");
  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const meeting = p.meeting_url ? `<p style="margin:24px 0"><a href="${escapeHtml(p.meeting_url)}" style="display:inline-block;background:#152238;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600">Open your session link</a></p>` : "";
  const manage = manageUrl ? `<p style="margin:24px 0"><a href="${escapeHtml(manageUrl)}" style="color:#152238">Manage this appointment</a></p>` : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f5f7f9;font-family:Arial,sans-serif;color:#111827"><div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e4e8ee;border-radius:18px;overflow:hidden"><div style="padding:28px 32px;background:#152238;color:#fff"><div style="font-size:15px;letter-spacing:.08em;text-transform:uppercase">Openfield</div></div><div style="padding:32px"><h1 style="font-size:28px;line-height:1.2;margin:0 0 12px">${escapeHtml(copy.heading)}</h1><p style="font-size:16px;line-height:1.6;margin:0 0 24px">Hi ${escapeHtml(p.name || "there")},</p><p style="font-size:16px;line-height:1.6;color:#465367">${escapeHtml(copy.intro)}</p><table style="width:100%;border-collapse:collapse;margin:24px 0;border-top:1px solid #e4e8ee;border-bottom:1px solid #e4e8ee">${htmlRows}</table>${meeting}${manage}<p style="font-size:13px;line-height:1.6;color:#637083;margin-top:32px">If you did not make this request, please reply to this email so we can check it.</p></div></div></body></html>`;
  const text = `Openfield

${copy.heading}

Hi ${p.name || "there"},

${copy.intro}

${textRows}
${p.meeting_url ? `
Session link: ${p.meeting_url}
` : ""}${manageUrl ? `
Manage appointment: ${manageUrl}
` : ""}
If you did not make this request, please reply to this email.`;
  const attachments = job.event_type === "booking_cancelled" ? [] : [{ filename: `openfield-${reference}.ics`, content: base64(buildIcs(job, siteUrl)) }];
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
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://openfield.care";
    let sent = 0;
    let failed = 0;
    for (let count = 0; count < 25; count += 1) {
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
