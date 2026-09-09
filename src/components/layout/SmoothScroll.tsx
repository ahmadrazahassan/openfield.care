"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling.
 *
 * Lenis interpolates the real document scroll position — it does not fake it —
 * so `window.scrollY`, IntersectionObserver and motion's `useScroll` all keep
 * working, and the parallax stays locked to the page.
 *
 * Deliberate constraints, because smooth scroll is easy to get wrong:
 *   - `prefers-reduced-motion` skips initialisation entirely. Native scroll,
 *     no interpolation, no hijack.
 *   - Touch devices keep native scrolling. Momentum on top of momentum feels
 *     broken on a phone, and it costs battery for nothing.
 *   - In-page anchors are routed through Lenis so `#how-it-works` still lands
 *     in the right place instead of jumping past it.
 *   - Exposes stop/start so the mobile menu can lock the page behind it —
 *     `overflow: hidden` alone does not stop Lenis.
 */

let lenis: Lenis | null = null;

/** Pause interpolation, e.g. while a full-screen sheet is open. */
export function stopSmoothScroll() {
  lenis?.stop();
}

/** Resume interpolation. */
export function startSmoothScroll() {
  lenis?.start();
}

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const instance = new Lenis({
      // Long enough to feel eased, short enough that the page still answers
      // immediately to a flick. Past ~1.4 it starts feeling like lag.
      duration: 1.1,
      // Gentle exponential ease-out.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Native scrolling on touch: momentum on momentum feels broken.
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 1,
    });

    lenis = instance;

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Route in-page anchors through Lenis, otherwise the browser jumps and
    // Lenis immediately fights it back.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      instance.scrollTo(target as HTMLElement, { offset: -24 });
      // Keep the URL honest so the link is still shareable.
      history.pushState(null, "", href);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
