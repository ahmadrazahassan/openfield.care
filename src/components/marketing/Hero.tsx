import Image from "next/image";
import Link from "next/link";
import { InsetMedia, Scrim } from "@/components/layout/primitives";
import { ArrowUpRightIcon } from "@/components/icons";
import { HOME } from "@/content/copy";
import { PHOTO } from "@/content/assets";

const INSET_SIZES = "(min-width: 768px) calc(100vw - 48px), calc(100vw - 32px)";

/**
 * Home hero.
 *
 * Layout follows the reference exactly: a full-bleed photograph inside the
 * inset rounded card, with the floating pill nav above it, two micro blocks in
 * the top corners, one oversized centred headline, an arrow link under it on
 * the right, then a statement block bottom-left and a stat column bottom-right.
 *
 * The aerial subject sits dead centre and low, so the headline is placed in the
 * upper third where the grass is uniform, leaving the figure clear beneath it.
 */
export function Hero() {
  const { hero } = HOME;
  const photo = PHOTO.heroAerial;
  const mobile = PHOTO.heroAerialMobile;

  return (
    <section className="pt-2 md:pt-3" aria-labelledby="hero-heading">
      <InsetMedia className="min-h-[min(84vh,820px)]">
        {/* Landscape */}
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes={INSET_SIZES}
          quality={82}
          placeholder={photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={photo.blurDataURL}
          className="-z-20 hidden object-cover object-center sm:block"
        />
        {/* Portrait crop, centred on the figure */}
        <Image
          src={mobile.src}
          alt={mobile.alt}
          fill
          priority
          sizes={INSET_SIZES}
          quality={82}
          placeholder={mobile.blurDataURL ? "blur" : "empty"}
          blurDataURL={mobile.blurDataURL}
          className="-z-20 object-cover object-center sm:hidden"
        />
        {/* Flat layer, never a gradient. Grass is mid-tone, so white type
            needs help to clear AA contrast. */}
        <Scrim strong />

        <div className="on-dark relative flex min-h-[min(84vh,820px)] flex-col px-5 pb-8 pt-10 sm:px-8 md:pb-12 md:pt-12 lg:px-12">
          {/* ── Corner micro blocks ─────────────────────────────────── */}
          <div className="flex items-start justify-between gap-6">
            <p className="eyebrow text-on-image/85">
              {hero.microLeft.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="eyebrow text-right text-on-image/85">
              {hero.microRight.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          {/* ── The headline ────────────────────────────────────────── */}
          <div className="mt-8 md:mt-10">
            <h1
              id="hero-heading"
              className="text-center font-display text-mega text-on-image"
            >
              {hero.headline}
            </h1>

            {/* Arrow link, right-aligned under the headline */}
            <div className="mt-4 flex justify-center md:mt-5 md:justify-end md:pr-[6%]">
              <Link
                href={hero.inlineLink.href}
                className="group inline-flex items-center gap-2 text-sm text-on-image/90 transition-opacity duration-fast hover:opacity-70"
              >
                {hero.inlineLink.label}
                <ArrowUpRightIcon className="h-4 w-4 rotate-90 transition-transform duration-fast group-hover:translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* ── Statement left, stats right ─────────────────────────── */}
          <div className="mt-auto grid gap-10 pt-20 sm:grid-cols-2 sm:gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="max-w-[34ch] font-display text-[1.0625rem] font-medium leading-snug text-on-image md:text-lg">
                {hero.statement}
              </p>
              <p className="mt-3 max-w-[38ch] text-sm text-on-image/70">
                {hero.statementSub}
              </p>
            </div>

            <dl className="flex flex-col gap-4 sm:items-end lg:col-span-4 lg:col-start-9">
              {hero.stats.map((s) => (
                <div key={s.label} className="sm:text-right">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-xl font-medium leading-none text-on-image md:text-2xl">
                      {s.value}
                    </span>
                    <span className="eyebrow mt-1 block text-on-image/70">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </InsetMedia>
    </section>
  );
}
