"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The ONLY scroll animation in the system: opacity 0 to 1 with a 12px rise,
 * 560ms, once, at 15% of viewport. No parallax, no scale, no blur.
 * Reduced motion collapses to the final state with no transition.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds. Stagger siblings by 0.06 each, max 6 items. */
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduced = useReducedMotion();
  const Cmp = motion[as];

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Cmp
      className={cn(className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.56,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Cmp>
  );
}
