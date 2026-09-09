import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Crisis support",
  description:
    "Openfield is not an emergency service. If you need help right now, these are faster routes to it.",
  alternates: { canonical: "/crisis-support" },
  robots: { index: true, follow: true },
};

/**
 * Deliberately the plainest page on the site: no photography, no illustration,
 * no animation, no client JavaScript. It must render fast and work with JS
 * disabled, because of who reaches it and when.
 *
 * TODO(region): the routes below are placeholders. Before launch, replace them
 * with verified lines for every market the site serves, checked against the
 * providers' own published contact details. Do not invent or guess a number.
 */
const ROUTES = [
  {
    label: "TODO(region) — Emergency services",
    detail:
      "If there is an immediate risk to life, contact your local emergency number.",
    action: null,
  },
  {
    label: "TODO(region) — 24-hour crisis line",
    detail:
      "Free, confidential, staffed around the clock. Add the verified number for each market before launch.",
    action: null,
  },
  {
    label: "TODO(region) — Text-based crisis service",
    detail:
      "For people who cannot or would rather not speak on the phone.",
    action: null,
  },
  {
    label: "Your GP or local urgent mental health team",
    detail:
      "If you are already under the care of a service, they usually have an out-of-hours route. It is on your care plan or their website.",
    action: null,
  },
];

export default function CrisisSupportPage() {
  return (
    <Section bg="page" size="sm">
      <Container>
        <div className="max-w-[62ch]">
          <h1 className="text-d2">If you need help right now</h1>

          <p className="mt-8 text-lead text-ink">
            {SITE.name} is not a crisis service. We book appointments, usually
            days ahead, and nobody monitors this site around the clock. If you
            need someone now, the routes below are faster.
          </p>

          <ul className="mt-14 flex flex-col">
            {ROUTES.map((route) => (
              <li
                key={route.label}
                className="border-b border-ink-12 py-7 first:border-t"
              >
                <h2 className="text-d4 text-ink">{route.label}</h2>
                <p className="mt-2 measure text-ink-70">{route.detail}</p>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-lg border border-ink-12 p-7">
            <h2 className="text-d4">If you are not in crisis but not ok</h2>
            <p className="mt-3 text-ink-70">
              That is what the rest of this site is for. A first consultation
              costs nothing and takes twenty-five minutes.
            </p>
            <p className="mt-5">
              <Link
                href="/book"
                className="text-ink underline underline-offset-4 hover:opacity-70"
              >
                Book a first consultation
              </Link>
            </p>
          </div>

          <p className="mt-12 text-sm text-ink-55">
            If you are worried about someone else, you can contact any of the
            services above on their behalf and ask what to do.
          </p>
        </div>
      </Container>
    </Section>
  );
}
