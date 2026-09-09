import Image from "next/image";
import Link from "next/link";
import { Chip } from "./typography";
import { cn } from "@/lib/utils";
import { portraitFor, IMAGE_QUALITY } from "@/content/assets";
import type { TherapistRow } from "@/types/database.types";

/**
 * Portraits come from therapists.photo_url and are resolved through the
 * generated image manifest. They are AI-generated stand-ins; their alt text
 * says so, and the build check blocks a production build while any active
 * practitioner is still flagged as a placeholder.
 *
 * Falls back to a monogram tile if a row has no photo.
 */
export function TherapistCard({
  therapist,
  className,
}: {
  therapist: TherapistRow;
  className?: string;
}) {
  const portrait = portraitFor(therapist.photo_url);

  return (
    <article className={cn("h-full", className)}>
      <Link
        href={`/therapists/${therapist.slug}`}
        className="flex h-full flex-col rounded-lg border border-ink-12 p-4 transition-colors duration-fast hover:border-ink-40"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-sand">
          {portrait ? (
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 76vw"
              quality={IMAGE_QUALITY.feature}
              placeholder={portrait.blurDataURL ? "blur" : "empty"}
              blurDataURL={portrait.blurDataURL}
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-display text-[clamp(2.5rem,6vw,3.5rem)] font-medium tracking-[-0.03em] text-ink/80">
              {therapist.initials}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-2 pb-1 pt-5">
          <h3 className="text-d4">{therapist.display_name}</h3>
          <p className="mt-1 text-sm text-ink-55">{therapist.title}</p>

          <ul className="mt-4 flex flex-wrap gap-1.5">
            {therapist.specialties.slice(0, 3).map((s) => (
              <li key={s}>
                <Chip>{s}</Chip>
              </li>
            ))}
          </ul>

          <p className="mt-5 flex items-center gap-2 text-sm text-ink-70">
            <span
              aria-hidden="true"
              className={cn(
                "h-1.5 w-1.5 rounded-pill",
                therapist.accepts_new ? "bg-signal" : "bg-ink-25",
              )}
            />
            {therapist.accepts_new
              ? "Accepting new clients"
              : "Waiting list only"}
          </p>
        </div>
      </Link>
    </article>
  );
}
