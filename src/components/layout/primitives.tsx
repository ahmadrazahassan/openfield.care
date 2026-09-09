import { cn } from "@/lib/utils";

/* ── Container ────────────────────────────────────────────────────────── */

export function Container({
  children,
  className,
  wide = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
  as?: React.ElementType;
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12",
        wide ? "max-w-[1440px]" : "max-w-[1280px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ── Section ──────────────────────────────────────────────────────────── */

const SECTION_BG = {
  page: "bg-page text-ink",
  paper: "bg-paper text-ink",
  ink: "bg-ink text-page on-dark",
  sand: "bg-sand text-ink",
  none: "",
} as const;

const SECTION_SIZE = {
  sm: "py-14 md:py-20",
  md: "py-20 md:py-28 lg:py-32",
  lg: "py-24 md:py-32 lg:py-40",
} as const;

export function Section({
  children,
  className,
  bg = "page",
  size = "md",
  id,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  bg?: keyof typeof SECTION_BG;
  size?: keyof typeof SECTION_SIZE;
  id?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={cn(SECTION_BG[bg], SECTION_SIZE[size], className)}
      {...rest}
    >
      {children}
    </section>
  );
}

/* ── Hairline ─────────────────────────────────────────────────────────── */

/** The entire border system: 1px, ink at 12%. Nothing else. */
export function Hairline({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <div
      role="presentation"
      className={cn(
        "bg-ink-12",
        vertical ? "w-px self-stretch" : "h-px w-full",
        className,
      )}
    />
  );
}

/* ── Inset media frame ────────────────────────────────────────────────── */

/**
 * The site's signature structural move: full-bleed media held 16/24px off the
 * viewport edge with a 32px radius, so the off-white page always frames it.
 */
export function InsetMedia({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return (
    <div className="px-4 md:px-6">
      <Tag
        className={cn("relative isolate overflow-hidden rounded-xl", className)}
      >
        {children}
      </Tag>
    </div>
  );
}

/* ── Scrim ────────────────────────────────────────────────────────────── */

/**
 * Flat semi-transparent layer for text legibility over photography.
 * Explicitly NOT a gradient (build spec section 3.1). If an image needs more
 * than `strong`, replace the image.
 */
export function Scrim({ strong = false }: { strong?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 -z-10",
        strong ? "bg-scrim" : "bg-scrim-soft",
      )}
    />
  );
}
