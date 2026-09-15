import test from "node:test";
import assert from "node:assert/strict";
import { renderAppointmentEmail, type AppointmentEmailJob } from "../src/lib/email/core";

const job = (event_type: AppointmentEmailJob["event_type"]): AppointmentEmailJob => ({
  outbox_id: "00000000-0000-0000-0000-000000000001",
  appointment_id: "00000000-0000-0000-0000-000000000002",
  event_type,
  recipient_email: "client@example.com",
  lease_token: "00000000-0000-0000-0000-000000000003",
  payload: {
    id: "00000000-0000-0000-0000-000000000002",
    reference: "ABCD1234",
    name: "<Sam> Client",
    email: "client@example.com",
    therapist: "A. Mensah",
    service: "Anxiety & panic",
    starts_at: "2026-09-09T09:00:00.000Z",
    ends_at: "2026-09-09T09:50:00.000Z",
    modality: "video",
    status: "confirmed",
    timezone: "Asia/Karachi",
    site_url: "https://openuproom.com",
  },
});

test("confirmation email is branded, escaped, and calendar-ready", () => {
  const rendered = renderAppointmentEmail(job("booking_confirmed"));
  assert.equal(rendered.subject, "Your Open Up Room appointment is confirmed");
  assert.match(rendered.html, /Hi &lt;Sam&gt;,/);
  assert.doesNotMatch(rendered.html, /<Sam>/);
  assert.equal(rendered.attachments[0]?.filename, "openuproom-ABCD1234.ics");
  assert.match(rendered.attachments[0]?.content ?? "", /^[A-Za-z0-9+/]+=*$/);
  assert.match(rendered.text, /GMT\+5/);
  assert.match(rendered.html, /https:\/\/www\.openuproom\.com\/brand\/email-wordmark\.png/);
});

test("cancellation email does not leave a stale calendar attachment", () => {
  const rendered = renderAppointmentEmail(job("booking_cancelled"));
  assert.equal(rendered.subject, "Your Open Up Room appointment was cancelled");
  assert.equal(rendered.attachments.length, 0);
});

test("reminders render with their own copy and keep the calendar file", () => {
  for (const [event, subject] of [
    ["reminder_24h", "Reminder: your Open Up Room session is tomorrow"],
    ["reminder_1h", "Starting soon: your Open Up Room session"],
  ] as const) {
    const rendered = renderAppointmentEmail(job(event));
    assert.equal(rendered.subject, subject);
    assert.equal(rendered.attachments.length, 1);
  }
});
