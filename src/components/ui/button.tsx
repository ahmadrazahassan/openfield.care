import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "@/components/icons";

/**
 * Buttons are pills. Labels are sentence case, DM Sans 500 — never ALL CAPS.
 * Green is a fill and never a text colour; text on green is always ink
 * (9.39:1). No shadows, no gradients, no scale-on-hover.
 */
const button = cva(
  [
    "relative inline-flex items-center justify-center gap-2 rounded-pill",
    "font-display font-medium tracking-[-0.005em] whitespace-nowrap",
    "transition-colors duration-fast ease-out-soft",
    "disabled:pointer-events-none disabled:opacity-45",
    "select-none",
  ],
  {
    variants: {
      variant: {
        primary: "bg-signal text-ink hover:bg-signal-hover",
        secondary: "bg-ink text-page hover:bg-[#26262c]",
        ghost:
          "bg-transparent text-ink border border-ink-12 hover:border-ink-40",
        onImage: "bg-paper text-ink hover:bg-page",
        onImageGhost:
          "bg-transparent text-on-image border border-page-25 hover:border-page-70",
        onDark: "bg-page text-ink hover:bg-white",
        destructive:
          "bg-transparent text-danger border border-danger/30 hover:bg-danger/[0.06]",
      },
      size: {
        sm: "h-10 px-[18px] text-sm",
        md: "h-12 px-6 text-[0.9375rem]",
        lg: "h-14 px-7 text-base",
      },
      /** Reserves room for the trailing circular arrow badge. */
      withArrow: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { withArrow: true, size: "sm", class: "pr-1.5" },
      { withArrow: true, size: "md", class: "pr-2" },
      { withArrow: true, size: "lg", class: "pr-2.5" },
    ],
    defaultVariants: { variant: "primary", size: "md", withArrow: false },
  },
);

const BADGE_SIZE = { sm: "h-7 w-7", md: "h-8 w-8", lg: "h-9 w-9" } as const;

/**
 * The circular arrow badge from the hero reference. This detail is the CTA's
 * signature — do not substitute a plain chevron.
 */
function ArrowBadge({
  size = "md",
  invert = false,
}: {
  size?: keyof typeof BADGE_SIZE;
  invert?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-pill",
        BADGE_SIZE[size],
        invert ? "bg-page text-ink" : "bg-ink text-page",
        "transition-transform duration-fast ease-out-soft",
        "group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
      )}
    >
      <ArrowUpRightIcon className="h-[0.875rem] w-[0.875rem]" />
    </span>
  );
}

type BaseProps = VariantProps<typeof button> & {
  className?: string;
  children: React.ReactNode;
  /** Show the trailing circular arrow badge. */
  arrow?: boolean;
};

export type ButtonProps = BaseProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  > & {
    asChild?: boolean;
  };

export function Button({
  variant,
  size = "md",
  className,
  children,
  arrow = false,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "group",
        button({ variant, size, withArrow: arrow }),
        className,
      )}
      {...props}
    >
      <>
        {children}
        {arrow && (
          <ArrowBadge
            size={size ?? "md"}
            invert={variant === "secondary" || variant === "onDark"}
          />
        )}
      </>
    </Comp>
  );
}

export type ButtonLinkProps = BaseProps &
  Omit<React.ComponentProps<typeof Link>, "className" | "children">;

export function ButtonLink({
  variant,
  size = "md",
  className,
  children,
  arrow = false,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "group",
        button({ variant, size, withArrow: arrow }),
        className,
      )}
      {...props}
    >
      {children}
      {arrow && (
        <ArrowBadge
          size={size ?? "md"}
          invert={variant === "secondary" || variant === "onDark"}
        />
      )}
    </Link>
  );
}
