import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/content/site";

/**
 * The mark: one continuous line entering as a tangled knot and leaving as a
 * flat horizon. Path is the generated vector from public/brand/openfield-mark.svg,
 * inlined so it inherits currentColor from whatever surface it sits on.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M2 13C8 4 9 18 4 15C0 12 9 6 9 11C9 17 2 9 6 8C10 6 9 15 12 13C14 10 15 12 16 12H22" />
    </svg>
  );
}

type LogoProps = {
  light?: boolean;
  className?: string;
  markOnly?: boolean;
};

export function Logo({ light = false, className, markOnly = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} home`}
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity duration-fast hover:opacity-70",
        light ? "text-page" : "text-ink",
        className,
      )}
    >
      <Mark className="h-7 w-7 shrink-0" />
      {!markOnly && (
        <span className="font-alt text-[1.0625rem] font-semibold leading-none tracking-[-0.02em]">
          {SITE.wordmark}
          {/* The green full stop is the only colour in the mark. */}
          <span className="text-signal">.</span>
        </span>
      )}
    </Link>
  );
}
