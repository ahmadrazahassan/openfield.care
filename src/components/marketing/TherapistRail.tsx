import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { Eyebrow } from "./typography";
import { Reveal } from "./Reveal";
import { TherapistCard } from "./TherapistCard";
import { ArrowRightIcon } from "@/components/icons";
import { HOME } from "@/content/copy";
import { getTherapists } from "@/lib/queries";
import { BlurText } from "./BlurText";

export async function TherapistRail() {
  const people = (await getTherapists()).slice(0, 4);
  if (people.length === 0) return null;

  return (
    <Section bg="page">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow className="text-ink-55">
                {HOME.therapists.eyebrow}
              </Eyebrow>
              <BlurText as="h2" className="mt-4 text-d2 max-w-[18ch]">
                {HOME.therapists.heading}
              </BlurText>
            </div>
            <Link
              href={HOME.therapists.link.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-ink-25 underline-offset-4 transition-colors hover:decoration-ink"
            >
              {HOME.therapists.link.label}
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        {/* Snap rail on small screens, grid from sm up. */}
        <ul className="mt-12 -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {people.map((t, i) => (
            <Reveal
              as="li"
              key={t.id}
              delay={i * 0.06}
              className="w-[76vw] shrink-0 snap-start sm:w-auto"
            >
              <TherapistCard therapist={t} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
