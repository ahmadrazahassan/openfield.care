import Image from "next/image";
import { Container } from "@/components/layout/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "./typography";
import { Reveal } from "./Reveal";
import { CheckIcon } from "@/components/icons";
import { HOME } from "@/content/copy";
import { ILLUSTRATION } from "@/content/assets";

/**
 * The diagonal split.
 *
 * The sand wedge sits ABOVE all the copy rather than across it. Previously the
 * seam ran through the paragraph and the button, leaving dark ink stranded on
 * dark green; now every word is on forest and can be page-coloured throughout.
 * The edge is a hard clip-path — no gradient, no SVG wedge.
 */
export function ForTeamsDiagonal() {
  const { forTeams } = HOME;

  return (
    <section className="on-dark relative isolate overflow-hidden bg-forest">
      {/* Sand wedge: angled bottom edge, clear of the content below it. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[150px] bg-sand [clip-path:polygon(0_0,100%_0,100%_45%,0_100%)] md:h-[230px] lg:h-[280px]"
      />

      <Container className="relative pb-20 pt-[170px] md:pb-28 md:pt-[260px] lg:pb-36 lg:pt-[320px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow className="text-page/60">{forTeams.eyebrow}</Eyebrow>
              <h2 className="mt-4 max-w-[16ch] text-d2 text-page">
                {forTeams.heading}
              </h2>
              <p className="mt-6 measure text-lead text-page/75">
                {forTeams.body}
              </p>
              <div className="mt-9">
                <ButtonLink href={forTeams.cta.href} variant="onDark" size="lg" arrow>
                  {forTeams.cta.label}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:pt-4">
            <Reveal delay={0.08}>
              <ul className="flex flex-col gap-5">
                {forTeams.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                    <span className="text-page/90">{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* The rider glides along the seam. Decorative; hidden on small screens
          where the wedge is too shallow for it to read. */}
      <Image
        src={ILLUSTRATION.diagonalRider}
        alt=""
        aria-hidden="true"
        width={420}
        height={300}
        className="pointer-events-none absolute right-[6%] top-[90px] hidden w-[240px] lg:block xl:w-[300px]"
      />
    </section>
  );
}
