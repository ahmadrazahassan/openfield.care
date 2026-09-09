"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { dateKey, groupSlotsByDay, formatSlotTime } from "@/lib/booking";
import { refreshSlots } from "@/lib/actions/booking";
import type { Slot } from "@/types/database.types";

/**
 * Month calendar plus a time panel.
 *
 * Deliberately not a horizontal date rail: the whole month is visible at once,
 * so choosing a date is one glance and one click rather than a scrub. Days
 * without openings are dimmed and unclickable; days with them carry a green
 * dot. Times are grouped by part of day, which is how people actually decide.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_HORIZON_DAYS = 90;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Monday-first grid covering the whole month, padded to full weeks. */
function monthGrid(cursor: Date): (Date | null)[] {
  const first = startOfMonth(cursor);
  const daysInMonth = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
  ).getDate();
  // JS: 0 = Sunday. Shift so Monday is 0.
  const lead = (first.getDay() + 6) % 7;

  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function partOfDay(iso: string, timeZone: string): "Morning" | "Afternoon" | "Evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      hour12: false,
    }).format(new Date(iso)),
  );
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export function BookingCalendar({
  therapistId,
  serviceId,
  timezone,
  selected,
  onPick,
}: {
  therapistId: string;
  serviceId: string;
  timezone: string;
  selected: string | null;
  onPick: (slot: Slot) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const horizon = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + MAX_HORIZON_DAYS);
    return d;
  }, [today]);

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  // Results carry the request they answer, so loading is derived rather than
  // set inside an effect.
  const requestKey = `${therapistId}|${serviceId}|${cursor.getFullYear()}-${cursor.getMonth()}`;
  const [result, setResult] = useState<{ key: string; slots: Slot[] } | null>(
    null,
  );

  const range = useMemo(() => {
    const from = sameMonth(cursor, today) ? today : startOfMonth(cursor);
    const monthEnd = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
      23,
      59,
    );
    return { from, to: monthEnd > horizon ? horizon : monthEnd };
  }, [cursor, today, horizon]);

  useEffect(() => {
    let cancelled = false;
    const key = requestKey;
    refreshSlots(
      therapistId,
      serviceId,
      range.from.toISOString(),
      range.to.toISOString(),
    )
      .then((slots) => {
        if (!cancelled) setResult({ key, slots });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, slots: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [therapistId, serviceId, range, requestKey]);

  const loading = result?.key !== requestKey;
  const byDay = useMemo(
    () => groupSlotsByDay(result?.slots ?? [], timezone),
    [result, timezone],
  );

  const cells = useMemo(() => monthGrid(cursor), [cursor]);

  // Chosen day is a user override; otherwise the first day with openings.
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const firstOpen =
    cells.find((d) => d && (byDay.get(dateKey(d, timezone))?.length ?? 0) > 0) ??
    null;
  const firstOpenKey = firstOpen ? dateKey(firstOpen, timezone) : null;
  const activeDay =
    chosenDay && (byDay.get(chosenDay)?.length ?? 0) > 0
      ? chosenDay
      : firstOpenKey;

  const grouped = useMemo(() => {
    const daySlots = activeDay ? (byDay.get(activeDay) ?? []) : [];
    const buckets: Record<string, Slot[]> = {
      Morning: [],
      Afternoon: [],
      Evening: [],
    };
    for (const s of daySlots) buckets[partOfDay(s.slot_start, timezone)].push(s);
    return Object.entries(buckets).filter(([, v]) => v.length > 0);
  }, [activeDay, byDay, timezone]);

  const canGoBack = !sameMonth(cursor, today);
  const canGoForward = startOfMonth(horizon) > cursor;

  const monthLabel = cursor.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid gap-8 rounded-lg border border-ink-12 bg-paper p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] lg:gap-10">
      {/* ── Month ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-d4" aria-live="polite">
            {monthLabel}
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => canGoBack && setCursor(addMonths(cursor, -1))}
              disabled={!canGoBack}
              aria-label="Previous month"
              className="grid h-9 w-9 place-items-center rounded-pill text-ink transition-colors duration-fast hover:bg-ink-06 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => canGoForward && setCursor(addMonths(cursor, 1))}
              disabled={!canGoForward}
              aria-label="Next month"
              className="grid h-9 w-9 place-items-center rounded-pill text-ink transition-colors duration-fast hover:bg-ink-06 disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-y-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-2 text-center">
              <span className="eyebrow text-ink-40">{w.slice(0, 1)}</span>
              <span className="sr-only">{w}</span>
            </div>
          ))}

          {cells.map((d, i) => {
            if (!d) return <div key={`pad-${i}`} />;
            const key = dateKey(d, timezone);
            const count = byDay.get(key)?.length ?? 0;
            const isActive = activeDay === key;
            const isToday = dateKey(today, timezone) === key;
            const open = count > 0;

            return (
              <div key={key} className="flex justify-center py-0.5">
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => setChosenDay(key)}
                  aria-pressed={isActive}
                  aria-label={`${d.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}${open ? `, ${count} times available` : ", no availability"}`}
                  className={cn(
                    "relative grid h-10 w-10 place-items-center rounded-pill text-sm transition-colors duration-fast",
                    isActive
                      ? "bg-ink font-medium text-page"
                      : open
                        ? "text-ink hover:bg-ink-06"
                        : "text-ink-25",
                    isToday && !isActive && "ring-1 ring-inset ring-ink-25",
                  )}
                >
                  {d.getDate()}
                  {open && !isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 h-1 w-1 rounded-pill bg-signal"
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {loading && (
          <p className="mt-5 text-sm text-ink-55">Checking availability…</p>
        )}
        {!loading && byDay.size === 0 && (
          <p className="mt-5 text-sm text-ink-55">
            Nothing open in {monthLabel}. Try the next month.
          </p>
        )}
      </div>

      {/* ── Times ─────────────────────────────────────────────────────── */}
      <div className="lg:border-l lg:border-ink-12 lg:pl-8">
        {activeDay ? (
          <>
            <p className="eyebrow text-ink-55">
              {new Date(activeDay).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>

            <div className="mt-5 flex flex-col gap-6">
              {grouped.map(([part, slots]) => (
                <div key={part}>
                  <p className="text-sm font-medium text-ink">{part}</p>
                  <ul className="mt-3 grid grid-cols-3 gap-2 lg:grid-cols-2">
                    {slots.map((s) => {
                      const isSelected = selected === s.slot_start;
                      return (
                        <li key={s.slot_start}>
                          <button
                            type="button"
                            onClick={() => onPick(s)}
                            aria-pressed={isSelected}
                            className={cn(
                              "w-full rounded-md border py-2.5 text-sm transition-colors duration-fast",
                              isSelected
                                ? "border-signal bg-signal font-medium text-ink"
                                : "border-ink-12 text-ink hover:border-ink-40",
                            )}
                          >
                            {formatSlotTime(s.slot_start, timezone)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading && (
            <p className="text-sm text-ink-55">
              Pick a day with a green dot to see times.
            </p>
          )
        )}
      </div>
    </div>
  );
}
