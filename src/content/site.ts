export const SITE = {
  name: "Openfield",
  wordmark: "openfield",
  legalName: "Openfield Care Ltd.",
  tagline: "Room to think.",
  description:
    "Licensed therapists, booked in minutes. Video, phone, or in person. Fifty-minute sessions, the same therapist each week, free cancellation up to 24 hours.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://openfield.care",
  email: "hello@openfield.care",
  phone: "+442079460112",
  phoneDisplay: "020 7946 0112",
  address: {
    line1: "2nd Floor, 14 Bramber Street",
    city: "London",
    postcode: "N1 8QT",
    country: "United Kingdom",
  },
  hours: "Monday to Friday, 8am to 8pm. Saturday, 9am to 2pm.",
  responseTime: "We reply to everything within one working day.",
  foundedYear: 2026,
} as const;

export const NAV_PRIMARY = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Therapists", href: "/therapists" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_NAV = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "For teams", href: "/for-teams" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Care",
    links: [
      { label: "Individual therapy", href: "/services/individual-therapy" },
      { label: "Couples therapy", href: "/services/couples-therapy" },
      { label: "Young people", href: "/services/young-people" },
      { label: "First consultation", href: "/services/first-consultation" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Journal", href: "/journal" },
      { label: "FAQ", href: "/faq" },
      { label: "Therapists", href: "/therapists" },
      { label: "Crisis support", href: "/crisis-support" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
] as const;

export const SAFETY_NOTICE =
  "Openfield is not an emergency service. If you need help right now, see crisis support.";

export const SAFETY_NOTICE_LONG =
  "Openfield is not an emergency or crisis service. If you are in immediate danger, or you are thinking about harming yourself, please use crisis support or contact your local emergency number.";
