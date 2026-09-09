"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { IMAGE_QUALITY } from "@/content/assets";
import type { ImageAsset } from "@/content/assets";

/**
 * Cross-fades the tangled frame to the resolved one, once, on scroll-in.
 *
 * Reduced motion shows the resolved frame outright: the point of the pair is
 * the resolution, so that is the honest still state.
 */
export function KnotResolve({
  knot,
  resolved,
}: {
  knot: ImageAsset;
  resolved: ImageAsset;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();

  const showResolved = reduced || inView;

  return (
    <div
      ref={ref}
      className="relative aspect-square overflow-hidden rounded-lg"
    >
      <Image
        src={knot.src}
        alt={reduced ? "" : knot.alt}
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        quality={IMAGE_QUALITY.feature}
        placeholder={knot.blurDataURL ? "blur" : "empty"}
        blurDataURL={knot.blurDataURL}
        className="object-cover grayscale"
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: showResolved ? 1 : 0 }}
        transition={{
          duration: reduced ? 0 : 0.56,
          delay: reduced ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Image
          src={resolved.src}
          alt={resolved.alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          quality={IMAGE_QUALITY.feature}
          placeholder={resolved.blurDataURL ? "blur" : "empty"}
          blurDataURL={resolved.blurDataURL}
          className="object-cover grayscale"
        />
      </motion.div>
    </div>
  );
}
