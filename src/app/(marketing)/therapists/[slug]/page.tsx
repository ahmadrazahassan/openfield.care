import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { Chip, Eyebrow } from "@/components/marketing/typography";
import { CtaBand } from "@/components/marketing/sections";
import { ButtonLink } from "@/components/ui/button";
import { getTherapist, getServicesForTherapist } from "@/lib/queries";
import { getStaticSlugs } from "@/lib/supabase/static";
import { portraitFor, IMAGE_QUALITY } from "@/content/assets";
import { formatDuration } from "@/lib/utils";
import { PriceTag } from "@/components/marketing/PriceTag";
import { SITE } from "@/content/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getStaticSlugs("therapists");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTherapist(slug);
  if (!t) return { title: "Not found" };
  return {
    title: `${t.display_name}, ${t.title}`,
    description: t.short_bio,
    alternates: { canonical: `/therapists/${t.slug}` },
  };
}

export default async function TherapistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const therapist = await getTherapist(slug);
  if (!therapist) notFound();

  const services = await getServicesForTherapist(therapist.id);
  const portrait = portraitFor(therapist.photo_url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: therapist.display_name,
    jobTitle: therapist.title,
    description: therapist.short_bio,
    knowsLanguage: therapist.languages,
    worksFor: { "@type": "MedicalBusiness", name: SITE.name, url: SITE.url },
    url: `${SITE.url}/therapists/${therapist.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section bg="page" size="sm">
        <Container>
          <Link
            href="/therapists"
            className="text-sm text-ink-55 underline underline-offset-4 hover:text-ink"
          >
            All therapists
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Sticky identity column */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="relative aspect-[4/5] max-w-[340px] overflow-hidden rounded-lg bg-sand">
                  {portrait ? (
                    <Image
                      src={portrait.src}
                      alt={portrait.alt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 340px, 100vw"
                      placeholder={portrait.blurDataURL ? "blur" : "empty"}
                      blurDataURL={portrait.blurDataURL}
                      quality={IMAGE_QUALITY.feature}
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center font-display text-[clamp(3rem,7vw,4.5rem)] font-medium tracking-[-0.03em] text-ink/80">
                      {therapist.initials}
                    </span>
                  )}
                </div>

                <dl className="mt-8 flex flex-col">
                  <div className="border-t border-ink-12 py-4">
                    <dt className="eyebrow text-ink-55">Registration</dt>
                    <dd className="mt-1.5 text-sm text-ink-70">
                      {therapist.credentials.join(" · ")}
                    </dd>
                  </div>
                  <div className="border-t border-ink-12 py-4">
                    <dt className="eyebrow text-ink-55">Languages</dt>
                    <dd className="mt-1.5 text-sm text-ink-70">
                      {therapist.languages.join(", ")}
                    </dd>
                  </div>
                  {therapist.years_experience !== null && (
                    <div className="border-t border-ink-12 py-4">
                      <dt className="eyebrow text-ink-55">Experience</dt>
                      <dd className="mt-1.5 text-sm text-ink-70">
                        {therapist.years_experience} years in practice
                      </dd>
                    </div>
                  )}
                  <div className="border-y border-ink-12 py-4">
                    <dt className="eyebrow text-ink-55">Availability</dt>
                    <dd className="mt-1.5 flex items-center gap-2 text-sm text-ink-70">
                      <span
                        aria-hidden="true"
                        className={
                          therapist.accepts_new
                            ? "h-1.5 w-1.5 rounded-pill bg-signal"
                            : "h-1.5 w-1.5 rounded-pill bg-ink-25"
                        }
                      />
                      {therapist.accepts_new
                        ? "Accepting new clients"
                        : "Waiting list only"}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>

            {/* Body */}
            <div className="lg:col-span-7 lg:col-start-6">
              <Eyebrow className="text-ink-55">{therapist.title}</Eyebrow>
              <h1 className="mt-4 text-d1">{therapist.display_name}</h1>
              <p className="mt-6 measure text-lead text-ink-70">
                {therapist.short_bio}
              </p>

              <ul className="mt-8 flex flex-wrap gap-1.5">
                {therapist.specialties.map((s) => (
                  <li key={s}>
                    <Chip>{s}</Chip>
                  </li>
                ))}
              </ul>

              {therapist.long_bio && therapist.long_bio.length > 0 && (
                <div className="mt-14">
                  <h2 className="text-d3">How I work</h2>
                  <div className="mt-6 flex flex-col gap-5">
                    {therapist.long_bio.map((para, i) => (
                      <p key={i} className="measure text-ink-70">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {services.length > 0 && (
                <div className="mt-14">
                  <h2 className="text-d3">What you can book</h2>
                  <ul className="mt-6 flex flex-col">
                    {services.map((s) => (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-12 py-5 first:border-t"
                      >
                        <div>
                          <Link
                            href={`/services/${s.slug}`}
                            className="text-d4 text-ink underline decoration-ink-12 underline-offset-4 hover:decoration-ink"
                          >
                            {s.name}
                          </Link>
                          <p className="mt-2 flex items-center gap-2.5">
                            <PriceTag
                              cents={s.price_cents}
                              currency={s.currency}
                              size="sm"
                              freeLabel="No cost"
                            />
                            <span className="text-sm text-ink-55">
                              {formatDuration(s.duration_min)}
                            </span>
                          </p>
                        </div>
                        <ButtonLink
                          href={`/book?service=${s.slug}&therapist=${therapist.slug}`}
                          variant="ghost"
                          size="sm"
                        >
                          Book
                        </ButtonLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {therapist.accepts_new && (
                <div className="mt-12">
                  <ButtonLink
                    href={`/book?therapist=${therapist.slug}`}
                    size="lg"
                    arrow
                  >
                    Book with {therapist.display_name}
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
