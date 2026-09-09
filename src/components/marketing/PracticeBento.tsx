import Image from "next/image";
import { Container, Section } from "@/components/layout/primitives";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./typography";
import { ButtonLink } from "@/components/ui/button";
import {
  SessionVideoIcon,
  SessionInPersonIcon,
  SessionPhoneIcon,
  CalendarIcon,
} from "@/components/icons";
import { portraitFor, PRACTICE_CARDS, IMAGE_QUALITY } from "@/content/assets";
import { cn } from "@/lib/utils";
import type { ServiceRow, TherapistRow } from "@/types/database.types";
import { BlurText } from "./BlurText";

export type WeekOpening = {
  /** ISO date — the React key. Narrow weekday labels repeat (T, T, S, S). */
  key: string;
  label: string;
  count: number;
  isToday: boolean;
};

type Props = {
  services: ServiceRow[];
  therapists: TherapistRow[];
  week: WeekOpening[];
};

const MODALITY_META = [
  { key: "video", label: "Video", Icon: SessionVideoIcon },
  { key: "in_person", label: "In person", Icon: SessionInPersonIcon },
  { key: "phone", label: "Phone", Icon: SessionPhoneIcon },
] as const;

/* ── Feature card: large artwork, then the point ──────────────────────── */

function FeatureCard({
  art,
  alt,
  eyebrow,
  title,
  body,
  tone = "page",
}: {
  art: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  tone?: "page" | "forest";
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-ink-12 bg-paper">
      {/* Fixed-ratio stage so all three cards align regardless of artwork. */}
      <div
        className={cn(
          "relative aspect-[4/3] w-full",
          tone === "forest" ? "bg-forest" : "bg-page",
        )}
      >
        <Image
          src={art}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          quality={IMAGE_QUALITY.feature}
          className="object-contain p-6"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <Eyebrow className="text-ink-55">{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-d4">{title}</h3>
        <p className="mt-3 flex-1 text-ink-70">{body}</p>
      </div>
    </article>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────── */

function StatCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border border-ink-12 bg-paper p-6 md:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

function StatHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-ink-12 text-ink">
        {icon}
      </span>
      <span className="text-sm font-medium text-ink">{title}</span>
    </div>
  );
}

export function PracticeBento({ services, therapists, week }: Props) {
  const totalOpen = week.reduce((n, d) => n + d.count, 0);
  const peak = Math.max(1, ...week.map((d) => d.count));

  const modalityCounts = MODALITY_META.map((m) => ({
    ...m,
    count: services.filter((s) => (s.modalities as string[]).includes(m.key))
      .length,
  }));

  const people = therapists.slice(0, 6);
  const acceptingNew = therapists.filter((t) => t.accepts_new).length;

  return (
    <Section bg="page" id="practice">
      <Container>
        <Reveal className="flex flex-col items-center text-center">
          <Eyebrow className="text-ink-55">The practice, in numbers</Eyebrow>
          <BlurText as="h2" className="mt-5 max-w-[18ch] text-d2">
            Everything here is live, not marketing.
          </BlurText>
          <p className="mt-5 measure-lead text-lead text-ink-70">
            These figures come straight from the booking system. If a slot shows
            as open, it is open right now.
          </p>
        </Reveal>

        {/* Three feature cards */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_CARDS.map((card, i) => (
            <Reveal key={card.art} delay={Math.min(i, 5) * 0.06}>
              <FeatureCard
                art={card.art}
                alt={card.alt}
                eyebrow={card.eyebrow}
                title={card.title}
                body={card.body}
                tone={card.tone}
              />
            </Reveal>
          ))}
        </div>

        {/* Live figures */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Reveal>
            <StatCard>
              <StatHead
                icon={<CalendarIcon className="h-4 w-4" />}
                title="Open this week"
              />
              <p className="mt-6 font-display text-d2 leading-none">
                {totalOpen}
              </p>
              <p className="mt-2 text-sm text-ink-55">
                appointments still unbooked
              </p>

              <ul
                className="mt-auto flex items-end gap-1.5 pt-8"
                aria-hidden="true"
              >
                {week.map((d) => (
                  <li
                    key={d.key}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "w-full rounded-sm",
                        d.isToday ? "bg-signal" : "bg-ink-12",
                      )}
                      style={{
                        height: `${Math.max(4, (d.count / peak) * 64)}px`,
                      }}
                    />
                    <span className="eyebrow text-ink-40">{d.label}</span>
                  </li>
                ))}
              </ul>
              <p className="sr-only">
                {week
                  .map(
                    (d) =>
                      `${new Date(d.key).toLocaleDateString("en-GB", {
                        weekday: "long",
                      })}: ${d.count} open`,
                  )
                  .join(", ")}
              </p>
            </StatCard>
          </Reveal>

          <Reveal delay={0.06}>
            <StatCard>
              <StatHead
                icon={<SessionVideoIcon className="h-4 w-4" />}
                title="Ways to meet"
              />
              <ul className="mt-6 flex flex-1 flex-col justify-center gap-4">
                {modalityCounts.map((m) => (
                  <li key={m.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex items-center gap-2 text-ink">
                        <m.Icon className="h-4 w-4 text-ink-55" />
                        {m.label}
                      </span>
                      <span className="text-sm text-ink-55">
                        {m.count}/{services.length}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-pill bg-ink-06">
                      <div
                        className="h-full rounded-pill bg-ink"
                        style={{
                          width: `${(m.count / Math.max(1, services.length)) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </StatCard>
          </Reveal>

          <Reveal delay={0.12}>
            <StatCard className="on-dark border-ink bg-ink text-page">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border border-page-25 text-page">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-page">
                  Practitioners
                </span>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2">
                {people.map((t) => {
                  const portrait = portraitFor(t.photo_url);
                  return (
                    <li
                      key={t.id}
                      className="relative h-11 w-11 overflow-hidden rounded-pill bg-sand"
                      title={t.display_name}
                    >
                      {portrait ? (
                        <Image
                          src={portrait.src}
                          alt=""
                          fill
                          sizes="44px"
                          placeholder={portrait.blurDataURL ? "blur" : "empty"}
                          blurDataURL={portrait.blurDataURL}
                          className="object-cover"
                          quality={IMAGE_QUALITY.feature}
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center font-display text-xs text-ink/70">
                          {t.initials}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <p className="mt-6 flex-1 text-page-70">
                {acceptingNew} of {therapists.length} are taking new clients
                today. You keep the same one week to week.
              </p>

              <div className="mt-7">
                <ButtonLink href="/book" variant="primary" arrow>
                  Book a session
                </ButtonLink>
              </div>
            </StatCard>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
