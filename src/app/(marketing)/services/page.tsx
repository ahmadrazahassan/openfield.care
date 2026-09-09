import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import { PageHero } from "@/components/marketing/PageHero";
import { Chip } from "@/components/marketing/typography";
import { PriceTag } from "@/components/marketing/PriceTag";
import { Reveal } from "@/components/marketing/Reveal";
import { CtaBand } from "@/components/marketing/sections";
import { IconFor, type IconKey, ICONS } from "@/components/icons";
import { getServices } from "@/lib/queries";
import { PHOTO } from "@/content/assets";
import { formatDuration } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Individual therapy, couples therapy, anxiety, burnout, grief and work with young people. Fifty-minute sessions, video, phone or in person.",
  alternates: { canonical: "/services" },
};

export const revalidate = 3600;

const MODALITY_LABEL = {
  video: "Video",
  in_person: "In person",
  phone: "Phone",
} as const;

function iconKeyOf(key: string): IconKey {
  return (key in ICONS ? key : "notes") as IconKey;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="What we offer, and what each one costs."
        lead="Every service is delivered by a registered practitioner. The first consultation is free, and nothing renews automatically."
      />

      <Container wide className="pt-10">
        <div className="relative aspect-[21/9] overflow-hidden rounded-xl">
          <Image
            src={PHOTO.consultRoom.src}
            alt={PHOTO.consultRoom.alt}
            fill
            priority
            sizes="(min-width: 1440px) 1440px, 100vw"
            quality={82}
            placeholder={PHOTO.consultRoom.blurDataURL ? "blur" : "empty"}
            blurDataURL={PHOTO.consultRoom.blurDataURL}
            className="object-cover"
          />
        </div>
      </Container>

      <Section bg="paper">
        <Container>
          <ul className="grid gap-4 lg:grid-cols-2">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={Math.min(i, 5) * 0.06}>
                <Link
                  href={`/services/${s.slug}`}
                  className="flex h-full flex-col rounded-lg border border-ink-12 p-8 transition-colors duration-fast hover:border-ink-40 md:p-10"
                >
                  <div className="flex items-start justify-between gap-6">
                    <IconFor
                      name={iconKeyOf(s.icon_key)}
                      className="h-8 w-8 text-ink"
                    />
                    <PriceTag
                      cents={s.price_cents}
                      currency={s.currency}
                      freeLabel="No cost"
                    />
                  </div>

                  <h2 className="mt-8 text-d3">{s.name}</h2>
                  <p className="mt-3 flex-1 measure text-ink-70">
                    {s.short_desc}
                  </p>

                  <ul className="mt-7 flex flex-wrap gap-1.5">
                    <li>
                      <Chip>{formatDuration(s.duration_min)}</Chip>
                    </li>
                    {s.modalities.map((m) => (
                      <li key={m}>
                        <Chip>{MODALITY_LABEL[m]}</Chip>
                      </li>
                    ))}
                  </ul>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
