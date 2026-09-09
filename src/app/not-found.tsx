import Image from "next/image";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container, Section } from "@/components/layout/primitives";
import { ButtonLink } from "@/components/ui/button";
import { ILLUSTRATION, IMAGE_QUALITY } from "@/content/assets";
import { EMPTY_STATES } from "@/content/copy";
import { altText } from "@generated/alt-text";

export default function NotFound() {
  const alt = (altText as Record<string, string>)[ILLUSTRATION.notFound] ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Section bg="page" size="lg">
          <Container className="flex flex-col items-center text-center">
            <Image
              src={ILLUSTRATION.notFound}
              alt={alt}
              width={280}
              height={280}
              quality={IMAGE_QUALITY.thumb}
              className="h-[220px] w-[220px] md:h-[280px] md:w-[280px]"
            />
            <h1 className="mt-10 text-d2 max-w-[16ch]">
              {EMPTY_STATES.notFound.heading}
            </h1>
            <p className="mt-5 measure-lead text-lead text-ink-70">
              {EMPTY_STATES.notFound.body}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/" arrow>
                Back to the start
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Tell us what you needed
              </ButtonLink>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
