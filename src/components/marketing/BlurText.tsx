"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered blur reveal.
 *
 * Words start blurred, dim and slightly low, then resolve in sequence as the
 * block enters the viewport. Fires once — re-blurring on the way back up reads
 * as a glitch rather than an effect.
 *
 * Accessibility:
 *   - The whole string is exposed via aria-label and the word spans are
 *     aria-hidden, so a screen reader reads one sentence rather than a stream
 *     of fragments.
 *   - prefers-reduced-motion renders plain static text with no filter at all.
 *   - The text is real DOM content, so it is present and readable even if the
 *     animation never runs.
 *
 * Performance: `filter` is not compositor-friendly. These reveals are one-shot
 * and short, and no will-change hint is left behind — a permanent hint on every
 * word across a long page costs more than it saves.
 */

type Props = {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. Lower for long strings. */
  stagger?: number;
  /** Starting blur radius in px. */
  blur?: number;
  id?: string;
};

export function BlurText({
  children,
  className,
  as = "p",
  delay = 0,
  stagger = 0.042,
  blur = 12,
  id,
}: Props) {
  const reduced = useReducedMotion();
  const Tag = motion[as];
  const words = children.split(" ");

  if (reduced) {
    const Plain = as;
    return (
      <Plain id={id} className={className}>
        {children}
      </Plain>
    );
  }

  return (
    <Tag
      id={id}
      className={className}
      aria-label={children}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          variants={{
            hidden: { filter: `blur(${blur}px)`, opacity: 0, y: "0.25em" },
            shown: { filter: "blur(0px)", opacity: 1, y: 0 },
          }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}

/**
 * Same reveal for a block that is not a single string — an illustration, a
 * card, a stat row. No word splitting, one soft resolve.
 */
export function BlurIn({
  children,
  className,
  delay = 0,
  blur = 8,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  blur?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Tag
      className={cn(className)}
      initial={{ filter: `blur(${blur}px)`, opacity: 0, y: 16 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
