import { cn, formatPrice } from "@/lib/utils";

/**
 * Price tag.
 *
 * Green is a fill here, never the text colour: #00d54b type on the page
 * background is about 1.7:1 and unreadable, while ink on green is 9.39:1.
 * So the price reads as green while staying well past AA.
 */
export function PriceTag({
  cents,
  currency = "GBP",
  size = "md",
  freeLabel = "Free",
  className,
}: {
  cents: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  freeLabel?: string;
  className?: string;
}) {
  const label = cents === 0 ? freeLabel : formatPrice(cents, currency);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill bg-signal font-display font-medium text-ink",
        size === "sm" && "px-2.5 py-1 text-sm",
        size === "md" && "px-3.5 py-1.5 text-base",
        size === "lg" && "px-5 py-2.5 text-d3",
        className,
      )}
    >
      {label}
    </span>
  );
}
