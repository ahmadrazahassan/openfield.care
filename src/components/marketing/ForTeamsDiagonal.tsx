import Image from "next/image";
import { Container } from "@/components/layout/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "./typography";
import { Reveal } from "./Reveal";
import { CheckIcon } from "@/components/icons";
import { HOME } from "@/content/copy";
import { ILLUSTRATION } from "@/content/assets";

/**
 * The diagonal split. Sand above, forest below, divided by a hard CSS
 * clip-path edge — no gradient, no SVG wedge. The rider sits on the seam.
 */
export function ForTeamsDiagonal() {
  const { forTeams } = HOME;

  return (
    <section className="relative isolate overflow-hidden bg-sand">
      {/* Forest wedge, cut by clip-path so the edge stays perfectly hard. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-forest [clip-path:polygon(0_62%,100%_34%,100%_100%,0_100%)] md:[clip-path:polygon(0_58%,100%_28%,100%_100%,0_100%)]"
      />

      <Container className="relative py-20 md:py-28 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          {/* Sand side */}
          <div className="lg:col-span-6">
            <Reveal>
              <Eyebrow className="text-ink-55">{forTeams.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-d2 max-w-[16ch] text-ink">
                {forTeams.heading}
              </h2>
              <p className="mt-6 measure text-lead text-ink-70">
                {forTeams.body}
              </p>
              <div className="mt-9">
                <ButtonLink
                  href={forTeams.cta.href}
                  variant="ghost"
                  size="lg"
                  className="border-ink-25 hover:border-ink"
                >
                  {forTeams.cta.label}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* Forest side */}
          <div className="on-dark lg:col-span-5 lg:col-start-8 lg:pt-40">
            <Reveal delay={0.08}>
              <ul className="flex flex-col gap-5">
                {forTeams.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-page" />
                    <span className="text-page/90">{point}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* The rider glides along the seam. Decorative, hidden on small screens
          where the diagonal is too steep for it to read. */}
      <Image
        src={ILLUSTRATION.diagonalRider}
        alt=""
        aria-hidden="true"
        width={420}
        height={300}
        className="pointer-events-none absolute right-[6%] top-[46%] hidden w-[260px] lg:block xl:w-[320px]"
      />
    </section>
  );
}
