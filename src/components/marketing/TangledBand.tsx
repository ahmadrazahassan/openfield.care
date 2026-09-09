import { Container, Section } from "@/components/layout/primitives";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { KnotResolve } from "./KnotResolve";
import { HOME } from "@/content/copy";
import { PHOTO, TEXTURE } from "@/content/assets";

/**
 * The brand moment: the only dark section, the only monochrome image, the only
 * place the page stops selling. Its scarcity is what makes it work.
 *
 * C1 (the knot) cross-fades to C2 (the same frame, resolved) on scroll-in.
 * The two frames share wardrobe, pose, backdrop and lighting, so only the
 * wire appears to change.
 */
export function TangledBand() {
  return (
    <Section bg="ink" size="lg" className="relative isolate overflow-hidden">
      {/* Halftone at 6%: the brief allows it in one dark band and nowhere
          else. Any higher and it stops being texture and starts being noise. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: `url(${TEXTURE.halftone})`,
          backgroundSize: "220px 220px",
          backgroundRepeat: "repeat",
        }}
      />
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <KnotResolve knot={PHOTO.tangled} resolved={PHOTO.looseThread} />
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <h2 className="text-d2 max-w-[16ch] text-page">
                {HOME.tangled.heading}
              </h2>
              <p className="mt-7 measure text-lead text-page-70">
                {HOME.tangled.body}
              </p>
              <div className="mt-10">
                <ButtonLink
                  href={HOME.tangled.cta.href}
                  variant="onImageGhost"
                  size="lg"
                >
                  {HOME.tangled.cta.label}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
