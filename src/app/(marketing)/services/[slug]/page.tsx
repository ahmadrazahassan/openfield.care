import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { PageHero } from "@/components/marketing/PageHero";
import { Chip, SectionHeading } from "@/components/marketing/typography";
import { PriceTag } from "@/components/marketing/PriceTag";
import { Reveal } from "@/components/marketing/Reveal";
import { TherapistCard } from "@/components/marketing/TherapistCard";
import { CtaBand } from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { IconFor, type IconKey, ICONS } from "@/components/icons";
import { getService, getTherapistsForService } from "@/lib/queries";
import { getStaticSlugs } from "@/lib/supabase/static";
import { formatDuration } from "@/lib/utils";
import { SITE } from "@/content/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getStaticSlugs("services");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Not found" };
  return {
    title: service.name,
    description: service.short_desc,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

const MODALITY_LABEL = {
  video: "Video",
  in_person: "In person",
  phone: "Phone",
} as const;

function iconKeyOf(key: string): IconKey {
  return (key in ICONS ? key : "notes") as IconKey;
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  const therapists = await getTherapistsForService(service.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description ?? service.short_desc,
    provider: { "@type": "MedicalBusiness", name: SITE.name, url: SITE.url },
    areaServed: "GB",
    offers: {
      "@type": "Offer",
      price: (service.price_cents / 100).toFixed(2),
      priceCurrency: service.currency,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero eyebrow="Service" title={service.name} lead={service.short_desc}>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={`/book?service=${service.slug}`} arrow>
            Book this
          </ButtonLink>
          <ButtonLink href="/services" variant="ghost">
            All services
          </ButtonLink>
        </div>
      </PageHero>

      <Section bg="paper">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <IconFor
                name={iconKeyOf(service.icon_key)}
                className="h-10 w-10 text-ink"
              />
              <h2 className="mt-8 text-d3">What this looks like</h2>
              <p className="mt-5 measure text-lead text-ink-70">
                {service.description ?? service.short_desc}
              </p>

              <h3 className="mt-14 text-d4">How sessions run</h3>
              <ul className="mt-5 flex flex-col">
                {[
                  `Sessions last ${formatDuration(service.duration_min)}, and start on time.`,
                  "You see the same practitioner each time unless you ask to change.",
                  "Move or cancel free up to 24 hours before.",
                  "Nothing renews automatically. You book each session yourself.",
                ].map((line) => (
                  <li
                    key={line}
                    className="border-b border-ink-12 py-4 text-ink-70 first:border-t"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price card */}
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-lg border border-ink-12 p-8 lg:sticky lg:top-32">
                <p className="eyebrow text-ink-55">Fee</p>
                <p className="mt-4">
                  <PriceTag
                    cents={service.price_cents}
                    currency={service.currency}
                    size="lg"
                    freeLabel="No cost"
                  />
                </p>
                <p className="mt-2 text-sm text-ink-55">
                  per {formatDuration(service.duration_min)} session
                </p>

                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {service.modalities.map((m) => (
                    <li key={m}>
                      <Chip>{MODALITY_LABEL[m]}</Chip>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <ButtonLink
                    href={`/book?service=${service.slug}`}
                    arrow
                    className="w-full"
                  >
                    Book this
                  </ButtonLink>
                </div>

                <p className="mt-6 text-sm text-ink-55">
                  Reduced-rate places are available.{" "}
                  <Link
                    href="/pricing"
                    className="text-ink underline underline-offset-4"
                  >
                    How pricing works
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {therapists.length > 0 && (
        <Section bg="page">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="Who you would see">
                Practitioners offering this.
              </SectionHeading>
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
