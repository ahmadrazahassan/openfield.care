import { createClient } from "@supabase/supabase-js";
import { renderAppointmentEmail, type AppointmentEmailJob } from "./core";

// Built into a standalone Supabase Edge Function by build-email-edge.mjs.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Promise<Response>): void;
};

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function authorized(request: Request, secret: string): boolean {
  const expected = `Bearer ${secret}`;
  const received = request.headers.get("authorization") ?? "";
  if (expected.length !== received.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  }
  return difference === 0;
}

async function sendWithResend(
  apiKey: string,
  from: string,
  job: AppointmentEmailJob,
): Promise<void> {
  const rendered = renderAppointmentEmail(job);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // If the response is lost after Resend accepted the request, a retry
      // reuses the same provider-side idempotency key instead of duplicating it.
      "Idempotency-Key": job.outbox_id,
    },
    body: JSON.stringify({
      from,
      to: [job.recipient_email],
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      ...(rendered.attachments.length ? { attachments: rendered.attachments } : {}),
    }),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`resend_${response.status}: ${detail}`);
  }
}

Deno.serve(async request => {
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
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://openfield.care";
    let sent = 0;
    let failed = 0;
    for (let count = 0; count < 25; count += 1) {
      const { data, error } = await db.rpc("claim_appointment_email", {});
      if (error) throw new Error("Email queue unavailable");
      const raw = data?.[0] as AppointmentEmailJob | undefined;
      if (!raw) break;
      const job: AppointmentEmailJob = {
        ...raw,
        event_type: raw.event_type,
        payload: { ...raw.payload, site_url: raw.payload.site_url || siteUrl },
      };
      try {
        await sendWithResend(resendKey, from, job);
        const { error: finishError } = await db.rpc("finish_appointment_email", {
          p_outbox_id: job.outbox_id,
          p_lease_token: job.lease_token,
          p_error: null,
        });
        if (finishError) throw new Error("Email acknowledgement failed");
        sent += 1;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Email delivery failed";
        await db.rpc("finish_appointment_email", {
          p_outbox_id: job.outbox_id,
          p_lease_token: job.lease_token,
          p_error: message,
        });
      }
    }
    return Response.json({ sent, failed });
  } catch (error) {
    console.error("Appointment email worker failed", error instanceof Error ? error.message : error);
    return Response.json({ error: "Email delivery is temporarily unavailable" }, { status: 503 });
  }
});
