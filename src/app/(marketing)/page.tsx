import type { Metadata } from "next";
import { Container, Section } from "@/components/layout/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Hero } from "@/components/marketing/Hero";
import {
  StartingLine,
  HowItWorks,
  Testimonials,
  CtaBand,
} from "@/components/marketing/sections";
import { TrustMarquee } from "@/components/marketing/TrustMarquee";
import { ConcernIndex } from "@/components/marketing/ConcernIndex";
import { PracticeBento } from "@/components/marketing/PracticeBento";
import { TangledBand } from "@/components/marketing/TangledBand";
import { ForTeamsDiagonal } from "@/components/marketing/ForTeamsDiagonal";
import { BigTypeBand } from "@/components/marketing/BigTypeBand";
import { TherapistRail } from "@/components/marketing/TherapistRail";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { SectionHeading } from "@/components/marketing/typography";
import { Reveal } from "@/components/marketing/Reveal";
import { HOME } from "@/content/copy";
import { FAQ } from "@/content/data";
import {
  getServices,
  getTherapists,
  getWeekOpenings,
} from "@/lib/queries";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — ${SITE.tagline}` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

function FaqSection() {
  return (
    <Section bg="page">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <SectionHeading eyebrow={HOME.faq.eyebrow}>
                  {HOME.faq.heading}
                </SectionHeading>
                <div className="mt-8">
                  <ButtonLink href={HOME.faq.cta.href} variant="ghost">
                    {HOME.faq.cta.label}
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Reveal>
              <FaqAccordion items={FAQ} />
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** FAQPage structured data, generated from the same source as the accordion. */
function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: SITE.name,
    legalName: SITE.legalName,
    description: SITE.description,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address.line1,
      addressLocality: SITE.address.city,
      postalCode: SITE.address.postcode,
      addressCountry: "GB",
    },
    medicalSpecialty: "Psychiatric",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function HomePage() {
  const [services, therapists, week] = await Promise.all([
    getServices(),
    getTherapists(),
    getWeekOpenings(),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <FaqJsonLd />

      <Hero />
      <TrustMarquee />
      <ConcernIndex />
      <PracticeBento
        services={services}
        therapists={therapists}
        week={week}
      />
      <TangledBand />
      <StartingLine />
      <HowItWorks />
      <ForTeamsDiagonal />
      <TherapistRail />
      <BigTypeBand />
      <Testimonials />
      <FaqSection />
      <CtaBand />
    </>
  );
}
