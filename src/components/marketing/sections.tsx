import Image from "next/image";
import {
  Container,
  Section,
  Hairline,
  InsetMedia,
  Scrim,
} from "@/components/layout/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, SectionHeading } from "./typography";
import { Reveal } from "./Reveal";
import { HOME } from "@/content/copy";
import { getTestimonials } from "@/lib/queries";
import { ILLUSTRATION, PHOTO, IMAGE_QUALITY } from "@/content/assets";

/* ── 05 Nobody starts from the same line ──────────────────────────────── */

export function StartingLine() {
  const { startingLine } = HOME;
  return (
    <Section bg="page">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <Image
              src={ILLUSTRATION.startingLine}
              alt="Three runners crouched at the starting blocks of a track, each in a different lane."
              width={520}
              height={520}
              quality={IMAGE_QUALITY.feature}
              className="w-full max-w-[520px]"
            />
          </Reveal>

          <div className="lg:col-span-6">
            <Reveal>
              <SectionHeading eyebrow={startingLine.eyebrow}>
                {startingLine.heading}
              </SectionHeading>
              <p className="mt-6 measure text-lead text-ink-70">
                {startingLine.body}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <dl className="mt-12 grid grid-cols-1 sm:grid-cols-3">
                {startingLine.stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={
                      i === 0
                        ? "py-5 sm:py-0 sm:pr-6"
                        : "border-t border-ink-12 py-5 sm:border-l sm:border-t-0 sm:px-6 sm:py-0"
                    }
                  >
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="block font-display text-d3 font-medium text-ink">
                        {s.value}
                      </span>
                      <span className="eyebrow mt-1.5 block text-ink-55">
                        {s.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ── 06 How it works ──────────────────────────────────────────────────── */

const STEP_ART = [
  ILLUSTRATION.step01,
  ILLUSTRATION.step02,
  ILLUSTRATION.step03,
] as const;

const STEP_ALT = [
  "Two people seated facing each other, one listening, one talking.",
  "Two puzzle pieces almost interlocking, watched by a small figure.",
  "A tangled line unwinding into a straight path with a figure walking it.",
] as const;

export function HowItWorks() {
  const { howItWorks } = HOME;
  return (
    <Section bg="paper" id="how-it-works">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={howItWorks.eyebrow}>
            {howItWorks.heading}
          </SectionHeading>
        </Reveal>

        <ol className="mt-16 grid gap-y-12 lg:grid-cols-3 lg:gap-x-0">
          {howItWorks.steps.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 0.06}>
              <div
                className={
                  i === 0
                    ? "lg:pr-10"
                    : "border-t border-ink-12 pt-12 lg:border-l lg:border-t-0 lg:px-10 lg:pt-0"
                }
              >
                <Eyebrow className="text-ink-55">{step.number}</Eyebrow>
                <Image
                  src={STEP_ART[i]}
                  alt={STEP_ALT[i]}
                  width={200}
                  height={200}
                  quality={IMAGE_QUALITY.feature}
                  className="mt-6 h-[200px] w-[200px]"
                />
                <h3 className="mt-6 text-d3">{step.title}</h3>
                <p className="mt-3 max-w-[38ch] text-ink-70">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* ── 10 Testimonials ──────────────────────────────────────────────────── */

export async function Testimonials() {
  const published = await getTestimonials();

  return (
    <Section bg="paper">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={HOME.testimonials.eyebrow}>
            {HOME.testimonials.heading}
          </SectionHeading>
        </Reveal>

        {published.length === 0 ? (
          <Reveal delay={0.06}>
            <div className="mt-10 max-w-[52ch] rounded-lg border border-ink-12 p-8">
              <p className="text-lead text-ink-70">{HOME.testimonials.empty}</p>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {published.map((t, i) => (
              <Reveal as="li" key={t.id} delay={i * 0.06}>
                <figure className="flex h-full flex-col rounded-lg border border-ink-12 p-8">
                  <blockquote className="flex-1">
                    <p className="font-display text-d4 leading-snug text-ink">
                      <span aria-hidden="true" className="text-ink-12">
                        &ldquo;
                      </span>
                      {t.quote}
                    </p>
                  </blockquote>
                  <figcaption className="eyebrow mt-8 text-ink-55">
                    {t.attribution}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}

/* ── 12 CTA band ──────────────────────────────────────────────────────── */

export function CtaBand() {
  const photo = PHOTO.twoChairs;
  return (
    <section className="py-4 md:py-6">
      <InsetMedia className="min-h-[420px]">
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="(min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"
          quality={82}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          className="-z-20 object-cover object-center"
        />
        <Scrim strong />
        <div className="on-dark relative flex min-h-[420px] items-center justify-center py-20 md:py-28">
          <Container className="flex flex-col items-center text-center">
            <Reveal className="flex flex-col items-center">
              <h2 className="text-d2 max-w-[16ch] text-on-image">
                {HOME.cta.heading}
              </h2>
              <div className="mt-9">
                <ButtonLink
                  href={HOME.cta.button.href}
                  variant="primary"
                  size="lg"
                  arrow
                >
                  {HOME.cta.button.label}
                </ButtonLink>
              </div>
              <p className="mt-5 text-sm text-on-image/70">{HOME.cta.body}</p>
            </Reveal>
          </Container>
        </div>
      </InsetMedia>
    </section>
  );
}

export { Hairline };
