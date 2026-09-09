import { imageMetadata } from "@generated/image-metadata";
import { localImageMetadata } from "@generated/local-image-metadata";

/**
 * ASSET REGISTRY
 * ---------------------------------------------------------------------------
 * Every image on the site is a locally generated asset under /public. There is
 * no remote image source — next.config.ts declares no remotePatterns, so an
 * external URL would fail to load rather than slip in unnoticed.
 *
 * Dimensions, alt text and blur placeholders come from the generator's own
 * manifest (content/image-metadata.ts), so they cannot drift from the files.
 * Regenerate with output/imagegen/export-assets.cjs.
 */

type Meta = {
  path: string;
  width: number;
  height: number;
  alt: string;
  placeholder: boolean;
  blurDataURL?: string;
};

// Pipeline assets plus anything imported separately (scripts/add-hero-image.mjs).
const META = {
  ...(imageMetadata as unknown as Record<string, Meta>),
  ...(localImageMetadata as unknown as Record<string, Meta>),
};

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
  /** True for AI-generated stand-in people. Must be replaced before launch. */
  isPlaceholder: boolean;
};

/**
 * Resolve a /public path through the generated manifest. Throws at build time
 * if the path is not in the manifest, so a typo or a deleted export fails
 * loudly instead of rendering a broken image.
 */
export function asset(path: string, altOverride?: string): ImageAsset {
  const m = META[path];
  if (!m) {
    throw new Error(
      `Unknown image asset: ${path}\n` +
        `It is not in content/image-metadata.ts. Re-run the export in ` +
        `output/imagegen, or correct the path.`,
    );
  }
  return {
    src: m.path,
    alt: altOverride ?? m.alt,
    width: m.width,
    height: m.height,
    blurDataURL: m.blurDataURL,
    isPlaceholder: m.placeholder,
  };
}

/* ── Photography ──────────────────────────────────────────────────────── */

export const PHOTO = {
  /** The aerial field — the home hero. */
  heroAerial: asset("/images/hero/hero-field-aerial.jpg"),
  heroAerialMobile: asset("/images/hero/hero-field-aerial-mobile.jpg"),
  heroField: asset("/images/hero/hero-open-field.jpg"),
  heroFieldMobile: asset("/images/hero/hero-open-field-mobile.jpg"),
  consultRoom: asset("/images/hero/hero-consult-room.jpg"),
  /** C1 — the knot. */
  tangled: asset("/images/editorial/editorial-tangled-thoughts.jpg"),
  /** C2 — the same frame with the knot resolved. Used for the cross-fade. */
  looseThread: asset("/images/editorial/editorial-loose-thread.jpg"),
  bigTypeField: asset("/images/editorial/editorial-bigtype-field.jpg"),
  footerField: asset("/images/editorial/editorial-footer-field.jpg"),
  windowLight: asset("/images/editorial/editorial-window-light.jpg"),
  twoChairs: asset("/images/editorial/editorial-two-chairs.jpg"),
} as const;

/* ── Journal covers, in publication order ─────────────────────────────── */

export const JOURNAL_COVERS: ImageAsset[] = [
  asset("/images/journal/journal-01.jpg"),
  asset("/images/journal/journal-02.jpg"),
  asset("/images/journal/journal-03.jpg"),
  asset("/images/journal/journal-04.jpg"),
  asset("/images/journal/journal-05.jpg"),
  asset("/images/journal/journal-06.jpg"),
];

/* ── People ───────────────────────────────────────────────────────────── */

/** Portraits, indexed by therapist sort_order. All placeholders. */
export const PORTRAITS: ImageAsset[] = [
  asset("/images/team/therapist-01.jpg"),
  asset("/images/team/therapist-02.jpg"),
  asset("/images/team/therapist-03.jpg"),
  asset("/images/team/therapist-04.jpg"),
  asset("/images/team/therapist-05.jpg"),
  asset("/images/team/therapist-06.jpg"),
];

/** Square crops for the hero stat stack. */
export const AVATARS: ImageAsset[] = [
  asset("/images/team/avatar-01.jpg"),
  asset("/images/team/avatar-02.jpg"),
  asset("/images/team/avatar-03.jpg"),
  asset("/images/team/avatar-04.jpg"),
  asset("/images/team/avatar-05.jpg"),
];

/** Look up a portrait by the path stored on the therapist row. */
export function portraitFor(photoUrl: string | null): ImageAsset | null {
  if (!photoUrl) return null;
  return META[photoUrl] ? asset(photoUrl) : null;
}

/* ── Authored vector artwork ──────────────────────────────────────────── */

export const ILLUSTRATION = {
  overwhelm: "/images/illustration/illo-overwhelm.svg",
  startingLine: "/images/illustration/illo-starting-line.svg",
  diagonalRider: "/images/illustration/illo-diagonal-rider.svg",
  step01: "/images/illustration/illo-step-01-listen.svg",
  step02: "/images/illustration/illo-step-02-match.svg",
  step03: "/images/illustration/illo-step-03-continue.svg",
  emptyAppointments: "/images/illustration/illo-empty-appointments.svg",
  notFound: "/images/illustration/illo-404.svg",
} as const;

/**
 * Generated practice artwork, served as optimized transparent WebP images.
 * Original PNG exports are stored beside the web assets.
 */
export const PRACTICE_CARDS = [
  {
    art: "/images/practice/mental-health-calm-loop.webp",
    alt: "A flowing mint glass loop, representing calm and continuity.",
    tone: "forest",
    eyebrow: "Continuity",
    title: "The same person, week after week",
    body: "You are not passed between practitioners, and you never start the story again from the beginning.",
  },
  {
    art: "/images/practice/mental-health-thought-clarity.webp",
    alt: "A paper head with tangled thoughts unwinding into a green leaf.",
    tone: "page",
    eyebrow: "The work",
    title: "Bring the mess, not a summary",
    body: "You do not need the right words to start. The ordering happens together, fifty minutes at a time.",
  },
  {
    art: "/images/practice/mental-health-support-conversation.webp",
    alt: "Two people sitting in armchairs, sharing a supportive conversation.",
    tone: "page",
    eyebrow: "A session",
    title: "Fifty minutes, and no script",
    body: "Video, phone, or a room. Your therapist follows what you bring rather than a worksheet.",
  },
] as const;

export const TEXTURE = {
  tornEdge: "/images/texture/texture-torn-edge.png",
  halftone: "/images/texture/texture-halftone-dots.png",
} as const;

export const BRAND = {
  mark: "/brand/openfield-mark.svg",
  markLight: "/brand/openfield-mark-light.svg",
  wordmark: "/brand/openfield-wordmark.svg",
  wordmarkLight: "/brand/openfield-wordmark-light.svg",
  ogDefault: "/brand/og-default.jpg",
  icon512: "/brand/icon-512.png",
  appleTouchIcon: "/brand/apple-touch-icon-180.png",
} as const;
