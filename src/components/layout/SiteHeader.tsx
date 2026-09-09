"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Logo";
import { Container } from "./primitives";
import { MenuIcon, CloseIcon, ArrowUpRightIcon } from "@/components/icons";
import { NAV_PRIMARY, SITE } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Type-led header. No container, no fill, no rule beneath it -- the mark and
 * the links sit directly on the page, and the only shape is the booking
 * action. Static rather than sticky, so it never passes over the hero.
 */
export function SiteHeader({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();

  // The sheet records the route it opened on, so navigating closes it.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenedOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="relative z-40 bg-page">
      <Container className="flex h-20 items-center justify-between gap-8 md:h-24">
        {/* Mark sits bare on the page -- no tile, no fill. */}
        <Link
          href="/"
          aria-label={`${SITE.name} home`}
          className="flex shrink-0 items-center gap-2.5 text-ink transition-opacity duration-fast hover:opacity-60"
        >
          <Mark className="h-6 w-6 shrink-0" />
          <span className="font-alt text-[1.0625rem] font-semibold leading-none tracking-[-0.02em]">
            {SITE.wordmark}
            <span className="text-signal">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-10">
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV_PRIMARY.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative py-1 text-sm transition-colors duration-fast",
                        active ? "text-ink" : "text-ink-55 hover:text-ink",
                      )}
                    >
                      {item.label}
                      {/* A single green rule marks the current page. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-signal transition-transform duration-base ease-out-soft",
                          active ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href={signedIn ? "/account" : "/login"}
            className="hidden text-sm text-ink-55 transition-colors duration-fast hover:text-ink lg:block"
          >
            {signedIn ? "Your sessions" : "Sign in"}
          </Link>

          <Link
            href="/book"
            className="group hidden shrink-0 items-center gap-2.5 rounded-pill bg-signal py-1.5 pl-5 pr-1.5 font-display text-[0.9375rem] font-medium text-ink transition-colors duration-fast hover:bg-signal-hover sm:flex"
          >
            Book a session
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-pill bg-ink text-page transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpenedOn(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 grid h-11 w-11 place-items-center text-ink transition-opacity duration-fast hover:opacity-60 lg:hidden"
          >
            {open ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-20 z-50 flex flex-col bg-page md:top-24 lg:hidden"
      >
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto">
          <Container className="py-2">
            <ul className="flex flex-col">
              {NAV_PRIMARY.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block py-4 text-d3 transition-colors",
                      isActive(item.href) ? "text-ink" : "text-ink-55",
                    )}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
        <Container className="py-8">
          <Link
            href="/book"
            className="group flex h-14 w-full items-center justify-center gap-3 rounded-pill bg-signal font-display font-medium text-ink"
          >
            Book a session
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-pill bg-ink text-page"
            >
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </span>
          </Link>
          <p className="mt-5 text-center text-sm text-ink-55">
            <Link
              href={signedIn ? "/account" : "/login"}
              className="text-ink underline underline-offset-4"
            >
              {signedIn ? "Your sessions" : "Sign in"}
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-ink-55">
            {SITE.name} is not an emergency service.{" "}
            <Link
              href="/crisis-support"
              className="text-ink underline underline-offset-4"
            >
              Crisis support
            </Link>
          </p>
        </Container>
      </div>
    </header>
  );
}
