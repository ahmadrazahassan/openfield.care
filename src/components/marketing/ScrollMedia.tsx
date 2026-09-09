"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked parallax for full-bleed photography.
 *
 * The image is rendered oversized and drifts against the scroll direction, so
 * the frame feels like a window rather than a pasted rectangle. Deliberately
 * restrained — a few percent of travel, no scale pumping, and it never
 * detaches from the scroll position, so it cannot feel like scroll-jacking.
 *
 * `overflow-hidden` on the parent clips the overscan; the child is 118% tall so
 * no edge is ever exposed at either end of the range.
 */
export function ScrollMedia({
  children,
  className,
  /** Percentage of the container height to travel across the full range. */
  travel = 8,
}: {
  children: React.ReactNode;
  className?: string;
  travel?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // From the moment the block's top reaches the bottom of the viewport,
    // until its bottom leaves the top.
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${travel}%`, `${travel}%`],
  );

  if (reduced) {
    return <div className={cn("absolute inset-0", className)}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <motion.div
        style={{ y }}
        className="absolute inset-x-0 -top-[9%] h-[118%] w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
