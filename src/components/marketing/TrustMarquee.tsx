import Image from "next/image";
import { IMAGE_QUALITY } from "@/content/assets";
import { cn } from "@/lib/utils";
import { PARTNERS } from "@/content/partners";
import { Container } from "@/components/layout/primitives";

/** A quiet, stationary logo strip matching the supplied reference. */
export function TrustMarquee({
  label = "Working with",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <section
      aria-label="Partner logos"
      className={cn("bg-page py-10 md:py-12", className)}
    >
      <Container>
        <p className="mb-8 text-center text-xs text-ink-55">{label}</p>
        <ul className="grid grid-cols-3 items-center justify-items-center gap-x-8 gap-y-8 md:grid-cols-6 md:gap-x-12">
          {PARTNERS.map((partner, i) => (
            <li
              key={partner.name + i}
              className="flex h-9 items-center justify-center"
              data-placeholder={partner.isPlaceholder}
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={partner.width}
                height={partner.height}
                quality={IMAGE_QUALITY.thumb}
                className="h-[22px] w-auto max-w-[112px] object-contain"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
