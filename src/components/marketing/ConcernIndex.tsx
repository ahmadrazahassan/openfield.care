import Link from "next/link";
import Image from "next/image";
import { Container, Section } from "@/components/layout/primitives";
import { Eyebrow } from "./typography";
import { Reveal } from "./Reveal";
import { IconFor, ArrowUpRightIcon } from "@/components/icons";
import { HOME } from "@/content/copy";
import { CONCERNS } from "@/content/data";
import { ILLUSTRATION, IMAGE_QUALITY } from "@/content/assets";
import { BlurText } from "./BlurText";

/**
 * What we help with.
 *
 * An index rather than a card grid: the heading and illustration hold the left
 * column, and every concern is one large type row on the right. Rows carry a
 * two-digit numeral, the monoline icon, the name, and a line that only appears
 * on hover or focus -- so at rest the section reads as a quiet list, and detail
 * arrives when you reach for it.
 */
export function ConcernIndex() {
  return (
    <Section bg="paper" id="concerns">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left: heading and artwork */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-16">
              <Reveal>
                <Eyebrow className="text-ink-55">
                  {HOME.concerns.eyebrow}
                </Eyebrow>
                <BlurText as="h2" className="mt-5 max-w-[14ch] text-d2">
                  {HOME.concerns.heading}
                </BlurText>
                <p className="mt-6 max-w-[38ch] text-ink-70">
                  {HOME.concerns.lead}
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <Image
                  src={ILLUSTRATION.overwhelm}
                  alt="A figure holding their head, surrounded by small doodles of tangled thoughts."
                  width={340}
                  height={340}
                  quality={IMAGE_QUALITY.feature}
                  className="mt-12 hidden w-full max-w-[300px] lg:block"
                />
              </Reveal>
            </div>
          </div>

          {/* Right: the index */}
          <div className="lg:col-span-7 lg:col-start-6">
            <ul>
              {CONCERNS.map((c, i) => (
                <Reveal as="li" key={c.slug} delay={Math.min(i, 5) * 0.04}>
                  <Link
                    href={`/services/${c.serviceSlug}`}
                    className="group block border-b border-ink-12 py-6 first:border-t md:py-7"
                  >
                    <div className="flex items-center gap-5 md:gap-7">
                      <span className="eyebrow w-6 shrink-0 text-ink-25 transition-colors duration-fast group-hover:text-signal">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <IconFor
                        name={c.iconKey}
                        className="h-6 w-6 shrink-0 text-ink-55 transition-colors duration-fast group-hover:text-ink"
                      />

                      <h3 className="flex-1 text-d3 text-ink">{c.name}</h3>

                      <span
                        aria-hidden="true"
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-pill text-ink-25 transition-all duration-base ease-out-soft group-hover:bg-ink group-hover:text-page"
                      >
                        <ArrowUpRightIcon className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Revealed on hover and on keyboard focus. Height, not
                        display, so it can animate and stays in the a11y tree. */}
                    <p className="grid grid-rows-[0fr] overflow-hidden pl-11 text-ink-70 transition-[grid-template-rows] duration-base ease-out-soft group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] md:pl-[3.25rem]">
                      <span className="min-h-0">
                        <span className="block pt-3 max-w-[46ch]">
                          {c.line}
                        </span>
                      </span>
                    </p>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
