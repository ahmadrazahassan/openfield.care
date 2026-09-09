/**
 * Every string on the marketing pages. One place, so the tone stays consistent
 * and nothing drifts into hype. See docs/02-WEBSITE-BUILD-PROMPT.md section 16.
 */

export const HOME = {
  hero: {
    eyebrow: "Therapy & consultation",
    /** Top-left micro block. */
    microLeft: ["Licensed therapists,", "booked in minutes."],
    /** Top-right micro block. */
    microRight: ["Confidential by default.", "No referral needed."],
    /** The oversized headline. Rendered as one line on wide screens. */
    headline: "Room to Think",
    /** Small arrow link sitting under the headline, right side. */
    inlineLink: { label: "See how it works", href: "#how-it-works" },
    /** Left statement block: a firm line, then a lighter one. */
    statement:
      "We do not change who you are. We help you hear yourself think.",
    statementSub:
      "Openfield matches you with a licensed therapist, usually within three minutes. Video, phone, or in a room.",
    primaryCta: { label: "Book a session", href: "/book" },
    /** Right-hand stat column. */
    stats: [
      { value: "12,400+", label: "sessions held" },
      { value: "3 min", label: "average match time" },
      { value: "24 hr", label: "free cancellation" },
    ],
  },

  trust: [
    "Confidential by default",
    "Registered clinicians",
    "50-minute sessions",
    "Sliding scale available",
  ],

  concerns: {
    eyebrow: "What we help with",
    heading: "Start wherever it hurts most.",
    lead: "You do not need a diagnosis, a plan, or the right words. Pick the thing that is loudest today.",
  },

  tangled: {
    heading: "Thoughts knot up. We help you find the loose end.",
    body: "You do not need the right words to start, and you do not need to have worked out what it is about. Bring the mess. The ordering happens together — fifty minutes at a time, with the same person each week.",
    cta: { label: "Meet the therapists", href: "/therapists" },
  },

  startingLine: {
    eyebrow: "Personal, not standardised",
    heading: "Nobody starts from the same line.",
    body: "Some people arrive with a diagnosis and a plan. Some arrive because a friend made the call for them. Your first session is about finding out which kind of start this is — nothing more.",
    stats: [
      { value: "3 min", label: "Average match time" },
      { value: "24 hr", label: "Free cancellation" },
      { value: "1 : 1", label: "Same therapist, every session" },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    heading: "Three steps, and none of them are hard.",
    steps: [
      {
        number: "01",
        title: "Tell us what is going on",
        body: "A short intake, in your own words. Five minutes, no forms about your childhood.",
      },
      {
        number: "02",
        title: "Meet your match",
        body: "We pair you with a therapist by concern, approach and availability. If it is not right, we re-match at no cost.",
      },
      {
        number: "03",
        title: "Keep the thread",
        body: "Same time, same person, week to week. Reschedule from your account whenever you need to.",
      },
    ],
  },

  forTeams: {
    eyebrow: "Openfield for teams",
    heading: "Mental health cover your team will actually use.",
    body: "Most workplace schemes go unused because nobody wants to ring a hotline and explain themselves. Openfield gives your people a named therapist and a booking link — the same product we sell to everyone else.",
    cta: { label: "See team plans", href: "/for-teams" },
    points: [
      "Sessions booked directly, no referral gate",
      "Anonymous usage reporting only",
      "Fixed per-seat cost, no per-session billing",
    ],
  },

  therapists: {
    eyebrow: "Our practitioners",
    heading: "The people you would be talking to.",
    link: { label: "View all therapists", href: "/therapists" },
  },

  bigType: {
    kicker: ["Surely, without a doubt", "it passes. It always has."],
    word: "openfield",
    left: "Est. 2026 — Licensed care",
    right: "Room to think",
  },

  testimonials: {
    eyebrow: "In their words",
    heading: "What people say afterwards.",
    empty:
      "We publish client words only with written consent, and we have none to show yet. When we do, they will appear here, unedited.",
  },

  faq: {
    eyebrow: "Questions",
    heading: "The things people ask first.",
    cta: { label: "Still unsure? Talk to us", href: "/contact" },
  },

  cta: {
    heading: "Fifty minutes is a good place to start.",
    body: "No card needed to book a first consultation.",
    button: { label: "Book a session", href: "/book" },
  },
} as const;

export const BOOKING_COPY = {
  steps: ["Service", "Therapist", "Time", "Details", "Confirm"],
  emptySlots:
    "Nothing open this week. Try the next one, or pick another therapist.",
  conflict: "That time was taken a moment ago. Here is what is still open.",
  holding: "Holding your slot",
  success: "You are booked. We have emailed the details and a calendar file.",
  cancellationPolicy:
    "Move or cancel free up to 24 hours before. After that we ask that you let your therapist know.",
  consents: {
    notEmergency:
      "I understand that Openfield is not an emergency or crisis service.",
    terms: "I agree to the Terms and the Privacy Notice.",
    marketing: "Send me occasional writing from the Openfield journal.",
  },
} as const;

export const EMPTY_STATES = {
  noAppointments: {
    heading: "Nothing in the diary yet.",
    body: "When you book a session it will show up here, with everything you need to join it.",
  },
  noTherapists: {
    heading: "No one matches all of those.",
    body: "Try loosening one filter.",
  },
  notFound: {
    heading: "That page has moved on.",
    body: "The link may be old, or the page may have been renamed. You can head back, or tell us what you were looking for.",
  },
} as const;
