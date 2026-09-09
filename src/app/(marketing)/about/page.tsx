import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section } from "@/components/layout/primitives";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeading } from "@/components/marketing/typography";
import { Reveal } from "@/components/marketing/Reveal";
import { TherapistCard } from "@/components/marketing/TherapistCard";
import { CtaBand } from "@/components/marketing/sections";
import { getTherapists } from "@/lib/queries";
import { PHOTO } from "@/content/assets";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Openfield is a mental health consultancy. Registered practitioners, fifty-minute sessions, and a booking process that does not make you explain yourself twice.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    number: "01",
    title: "The same person, every week",
    body: "Continuity is most of what makes therapy work. We do not rotate practitioners, and we do not route you through a triage team who then hands you on.",
  },
  {
    number: "02",
    title: "No subscription, no lock-in",
    body: "You book sessions one at a time. Nothing renews automatically, and stopping requires no phone call and no explanation.",
  },
  {
    number: "03",
    title: "Plain pricing, and a real sliding scale",
    body: "One published fee. A number of reduced-rate places are held at any time, and you will not be asked to evidence your circumstances to use one.",
  },
  {
    number: "04",
    title: "We are not a crisis service, and we say so",
    body: "There are things this format cannot do. Pretending otherwise would put people at risk, so we point to faster routes on every page.",
  },
];

export default async function AboutPage() {
  const therapists = await getTherapists();
  const photo = PHOTO.windowLight;

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A consultancy, not a platform."
        lead="Openfield exists because getting to a good therapist is harder than it should be, and most of the difficulty is administrative rather than clinical."
      />

      <Section bg="paper">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  placeholder={photo.blurDataURL ? "blur" : "empty"}
                  blurDataURL={photo.blurDataURL}
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="lg:col-span-6 lg:col-start-7">
              <Reveal>
                <SectionHeading eyebrow="Why we started">
                  Most people give up during the admin.
                </SectionHeading>
                <div className="mt-7 flex flex-col gap-5 measure text-ink-70">
                  <p>
                    The clinical part of therapy is well understood. The part
                    that fails people is everything around it: the waiting list
                    with no visible end, the intake form that asks for a
                    diagnosis you do not have, the practitioner who is not
                    taking anyone until spring.
                  </p>
                  <p>
                    By the time somebody has explained their situation to three
                    different receptionists, a good number have decided it was
                    not that bad after all. That is the failure we built{" "}
                    {SITE.name} to remove.
                  </p>
                  <p>
                    What is left is deliberately unremarkable: registered
                    practitioners, live availability, one published fee, and a
                    booking that takes about three minutes.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section bg="page">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="How we practise">
              Four commitments, and what they cost us.
            </SectionHeading>
          </Reveal>

          <ul className="mt-14 flex flex-col">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.number} delay={Math.min(i, 5) * 0.06}>
                <div className="grid gap-4 border-b border-ink-12 py-9 first:border-t md:grid-cols-12 md:gap-8">
                  <p className="eyebrow text-ink-55 md:col-span-2">
                    {p.number}
                  </p>
                  <h3 className="text-d4 md:col-span-4">{p.title}</h3>
                  <p className="text-ink-70 md:col-span-6">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {therapists.length > 0 && (
        <Section bg="paper">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="The practice">
                Who you would be working with.
              </SectionHeading>
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {therapists.map((t, i) => (
                <Reveal as="li" key={t.id} delay={Math.min(i, 5) * 0.06}>
                  <TherapistCard therapist={t} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
