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
    name: "A <Client>",
    email: "client@example.com",
    therapist: "A. Mensah",
    service: "Anxiety & panic",
    starts_at: "2026-09-09T09:00:00.000Z",
    ends_at: "2026-09-09T09:50:00.000Z",
    modality: "video",
    status: "confirmed",
    timezone: "Asia/Karachi",
    site_url: "https://openfield.care",
  },
});

test("confirmation email is branded, escaped, and calendar-ready", () => {
  const rendered = renderAppointmentEmail(job("booking_confirmed"));
  assert.equal(rendered.subject, "Your Openfield appointment is confirmed");
  assert.match(rendered.html, /A &lt;Client&gt;/);
  assert.doesNotMatch(rendered.html, /A <Client>/);
  assert.equal(rendered.attachments[0]?.filename, "openfield-ABCD1234.ics");
  assert.match(rendered.attachments[0]?.content ?? "", /^[A-Za-z0-9+/]+=*$/);
  assert.match(rendered.text, /GMT\+5/);
});

test("cancellation email does not leave a stale calendar attachment", () => {
  const rendered = renderAppointmentEmail(job("booking_cancelled"));
  assert.equal(rendered.subject, "Your Openfield appointment was cancelled");
  assert.equal(rendered.attachments.length, 0);
});
