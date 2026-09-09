"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";

/**
 * Filters live in the URL so a filtered view is shareable, survives refresh,
 * and works with the back button.
 */
export function TherapistFilters({
  specialties,
  languages,
  total,
}: {
  specialties: string[];
  languages: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = {
    specialty: searchParams.get("specialty"),
    language: searchParams.get("language"),
    available: searchParams.get("available"),
  };

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const hasFilters = Boolean(
    current.specialty || current.language || current.available,
  );

  return (
    <div className="flex flex-col gap-6">
      <FilterRow label="Concern">
        {specialties.map((s) => (
          <FilterPill
            key={s}
            active={current.specialty === s}
            onClick={() => setParam("specialty", s)}
          >
            {s}
          </FilterPill>
        ))}
      </FilterRow>

      <FilterRow label="Language">
        {languages.map((l) => (
          <FilterPill
            key={l}
            active={current.language === l}
            onClick={() => setParam("language", l)}
          >
            {l}
          </FilterPill>
        ))}
      </FilterRow>

      <FilterRow label="Availability">
        <FilterPill
          active={current.available === "yes"}
          onClick={() => setParam("available", "yes")}
        >
          Accepting new clients
        </FilterPill>
      </FilterRow>

      <div className="flex items-center gap-4 border-t border-ink-12 pt-5">
        <p aria-live="polite" className="text-sm text-ink-55">
          {total} {total === 1 ? "practitioner" : "practitioners"}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="inline-flex items-center gap-1.5 text-sm text-ink underline underline-offset-4 hover:opacity-70"
          >
            <CloseIcon className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <legend className="eyebrow float-left text-ink-55 sm:w-28 sm:shrink-0">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 text-sm transition-colors duration-fast",
        active
          ? "border-ink bg-ink text-page"
          : "border-ink-12 text-ink-70 hover:border-ink-40",
      )}
    >
      {children}
    </button>
  );
}
