import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container, Section } from "@/components/layout/primitives";
import { ButtonLink, Button } from "@/components/ui/button";
import { Chip } from "@/components/marketing/typography";
import { PriceTag } from "@/components/marketing/PriceTag";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/queries";
import { signOut } from "@/lib/actions/auth";
import { MODALITY_LABEL, formatSlotFull } from "@/lib/booking";
import { ILLUSTRATION } from "@/content/assets";
import { EMPTY_STATES } from "@/content/copy";

export const metadata: Metadata = {
  title: "Your sessions",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login?next=%2Faccount");

  // Partitioned in SQL rather than in the component: the database owns "now",
  // and only the rows actually rendered come back.
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const select = "*, services(name, slug), therapists(display_name, slug)";

  const [{ data: upcomingRows }, { data: pastRows }] = await Promise.all([
    supabase
      .from("appointments")
      .select(select)
      .gte("starts_at", nowIso)
      .in("status", ["pending", "confirmed"])
      .order("starts_at", { ascending: true }),
    supabase
      .from("appointments")
      .select(select)
      .or(`starts_at.lt.${nowIso},status.in.(completed,cancelled,no_show)`)
      .order("starts_at", { ascending: false })
      .limit(20),
  ]);

  const upcoming = upcomingRows ?? [];
  const past = pastRows ?? [];

  const timezone = session.profile.timezone || "Europe/London";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader signedIn />
      <main id="main" className="flex-1">
        <Section bg="page" size="sm">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-ink-55">Your account</p>
                <h1 className="mt-4 text-d1">
                  {session.profile.full_name.split(" ")[0]}
                </h1>
                <p className="mt-3 text-ink-55">{session.profile.email}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="ghost">
                  Sign out
                </Button>
              </form>
            </div>

            <h2 className="mt-16 text-d3">Upcoming</h2>
            {upcoming.length === 0 ? (
              <div className="mt-8 flex flex-col items-start rounded-lg border border-ink-12 p-8">
                <Image
                  src={ILLUSTRATION.emptyAppointments}
                  alt=""
                  aria-hidden="true"
                  width={180}
                  height={180}
                />
                <h3 className="mt-6 text-d4">
                  {EMPTY_STATES.noAppointments.heading}
                </h3>
                <p className="mt-2 max-w-[44ch] text-ink-70">
                  {EMPTY_STATES.noAppointments.body}
                </p>
                <ButtonLink href="/book" arrow className="mt-7">
                  Book a session
                </ButtonLink>
              </div>
            ) : (
              <ul className="mt-8 flex flex-col gap-3">
                {upcoming.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-start justify-between gap-6 rounded-lg border border-ink-12 p-6"
                  >
                    <div>
                      <p className="text-d4">
                        {(a.services as { name?: string } | null)?.name ??
                          "Session"}
                      </p>
                      <p className="mt-1.5 text-ink-70">
                        {formatSlotFull(a.starts_at, timezone)}
                      </p>
                      <p className="mt-1 text-sm text-ink-55">
                        with{" "}
                        {(a.therapists as { display_name?: string } | null)
                          ?.display_name ?? "your therapist"}{" "}
                        · {MODALITY_LABEL[a.modality] ?? a.modality}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Chip>{a.status}</Chip>
                        <Chip>Ref {a.reference}</Chip>
                      </div>
                    </div>
                    <PriceTag
                      cents={a.price_cents}
                      currency={a.currency}
                      size="sm"
                      freeLabel="No cost"
                    />
                  </li>
                ))}
              </ul>
            )}

            {past.length > 0 && (
              <>
                <h2 className="mt-16 text-d3">Past</h2>
                <ul className="mt-8 flex flex-col">
                  {past.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-12 py-5 first:border-t"
                    >
                      <div>
                        <p className="text-ink">
                          {(a.services as { name?: string } | null)?.name ??
                            "Session"}
                        </p>
                        <p className="mt-1 text-sm text-ink-55">
                          {formatSlotFull(a.starts_at, timezone)}
                        </p>
                      </div>
                      <Chip>{a.status}</Chip>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="mt-14 text-sm text-ink-55">
              Need to move or cancel something?{" "}
              <Link
                href="/contact"
                className="text-ink underline underline-offset-4"
              >
                Contact us
              </Link>{" "}
              with the reference.
            </p>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
