import Image from "next/image";
import { InsetMedia, Scrim } from "@/components/layout/primitives";
import { ScrollMedia } from "./ScrollMedia";
import { HOME } from "@/content/copy";
import { PHOTO, IMAGE_QUALITY } from "@/content/assets";

/**
 * A breath. One photograph, one word, four micro-caps labels. No button, no
 * body copy, nothing to do. The word is a real heading, not a background
 * image, so it is available to assistive tech and to search.
 */
export function BigTypeBand() {
  const photo = PHOTO.bigTypeField;
  const { bigType } = HOME;

  return (
    <section className="py-4 md:py-6" aria-labelledby="bigtype-heading">
      <InsetMedia className="min-h-[70vh]">
        <ScrollMedia travel={7}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={"(min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)"}
            quality={IMAGE_QUALITY.hero}
            placeholder={photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={photo.blurDataURL}
            className="-z-20 object-cover object-center"
          />
        </ScrollMedia>
        <Scrim />

        <div className="on-dark relative flex min-h-[70vh] flex-col justify-between px-5 py-10 sm:px-8 md:py-14 lg:px-12">
          {/* Kicker */}
          <div className="text-center">
            {bigType.kicker.map((line) => (
              <p key={line} className="eyebrow text-on-image/80">
                {line}
              </p>
            ))}
          </div>

          {/* The word */}
          <h2
            id="bigtype-heading"
            className="text-mega text-center font-display text-on-image"
          >
            {bigType.word}
            <span className="text-signal">.</span>
          </h2>

          {/* Corner labels */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="eyebrow text-on-image/80">{bigType.left}</p>
            <p className="eyebrow text-on-image/80 sm:text-right">
              {bigType.right}
            </p>
          </div>
        </div>
      </InsetMedia>
    </section>
  );
}
