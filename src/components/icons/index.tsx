import type { SVGProps } from "react";
import { GENERATED_ICONS } from "./generated";

/**
 * OPENFIELD ICON SYSTEM
 * ---------------------------------------------------------------------------
 * The 24 concept and product icons come from the generated vector set
 * (public/icons/*.svg -> ./generated.tsx). Do not hand-edit those; edit the
 * SVGs and re-run `node scripts/build-icons.mjs`.
 *
 * Only UI chrome is authored here — plain geometry the icon set does not cover
 * (arrows, chevrons, close, check, menu, plus, minus). Banned throughout, per
 * the build spec: sparkle, star, lightning/zap, wand, bot, brain-with-circuits.
 */

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Svg({
  children,
  title,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/* ── Concept & product icons (generated) ──────────────────────────────── */

export * from "./generated";

/* ── UI chrome (authored) ─────────────────────────────────────────────── */

export const ArrowUpRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17 17 7" />
    <path d="M8.5 7H17v8.5" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9l7 7 7-7" />
  </Svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7.5h17M3.5 16.5h17" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MinusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);

/* ── Registry ─────────────────────────────────────────────────────────── */

export const ICONS = GENERATED_ICONS;

export type IconKey = keyof typeof ICONS;

export function IconFor({ name, ...props }: IconProps & { name: IconKey }) {
  const Cmp = ICONS[name];
  return <Cmp {...props} />;
}
