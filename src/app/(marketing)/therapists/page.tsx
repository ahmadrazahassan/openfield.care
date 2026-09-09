import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section } from "@/components/layout/primitives";
import { PageHero } from "@/components/marketing/PageHero";
import { TherapistCard } from "@/components/marketing/TherapistCard";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/sections";
import { TherapistFilters } from "@/components/marketing/TherapistFilters";
import { getTherapists } from "@/lib/queries";
import { EMPTY_STATES } from "@/content/copy";
import { ILLUSTRATION } from "@/content/assets";

export const metadata: Metadata = {
  title: "Therapists",
  description:
    "Registered psychologists, psychotherapists and CBT practitioners. Filter by concern, language and availability.",
  alternates: { canonical: "/therapists" },
};

export const revalidate = 3600;

type SearchParams = Promise<{
  specialty?: string;
  language?: string;
  available?: string;
}>;

export default async function TherapistsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const all = await getTherapists();

  const specialties = [...new Set(all.flatMap((t) => t.specialties))].sort();
  const languages = [...new Set(all.flatMap((t) => t.languages))].sort();

  const filtered = all.filter((t) => {
    if (params.specialty && !t.specialties.includes(params.specialty))
      return false;
    if (params.language && !t.languages.includes(params.language)) return false;
    if (params.available === "yes" && !t.accepts_new) return false;
    return true;
  });

  return (
    <>
      <PageHero
        eyebrow="Practitioners"
        title="The people you would be talking to."
        lead="Everyone here is registered, insured and supervised. If the first match is not right, we will re-match you at no cost."
      />

      <Section bg="paper">
        <Container>
          <TherapistFilters
            specialties={specialties}
            languages={languages}
            total={filtered.length}
          />

          {filtered.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <Image
                src={ILLUSTRATION.emptyAppointments}
                alt=""
                aria-hidden="true"
                width={240}
                height={240}
              />
              <h2 className="mt-6 text-d3">
                {EMPTY_STATES.noTherapists.heading}
              </h2>
              <p className="mt-3 text-ink-70">
                {EMPTY_STATES.noTherapists.body}
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, i) => (
                <Reveal as="li" key={t.id} delay={Math.min(i, 5) * 0.06}>
                  <TherapistCard therapist={t} />
                </Reveal>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
