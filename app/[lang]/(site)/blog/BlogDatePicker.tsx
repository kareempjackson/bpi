"use client";

import { useEffect, useMemo, useState } from "react";

export type DateRange = { start: Date | null; end: Date | null };

// ── Date helpers (local time) ────────────────────────────────────────────
function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
/** Monday-first start of the week containing `d`. */
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const offset = (x.getDay() + 6) % 7; // 0 = Monday
  return addDays(x, -offset);
}
function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
export function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function sameDay(a: Date, b: Date): boolean {
  return ymd(a) === ymd(b);
}
function fmtPill(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type PresetKey =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "allTime";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "thisWeek", label: "This week" },
  { key: "lastWeek", label: "Last week" },
  { key: "thisMonth", label: "This month" },
  { key: "lastMonth", label: "Last month" },
  { key: "thisYear", label: "This year" },
  { key: "lastYear", label: "Last year" },
  { key: "allTime", label: "All time" },
];

function presetRange(key: PresetKey, today: Date): DateRange {
  const t = startOfDay(today);
  switch (key) {
    case "today":
      return { start: t, end: t };
    case "yesterday": {
      const y = addDays(t, -1);
      return { start: y, end: y };
    }
    case "thisWeek": {
      const s = startOfWeek(t);
      return { start: s, end: addDays(s, 6) };
    }
    case "lastWeek": {
      const s = addDays(startOfWeek(t), -7);
      return { start: s, end: addDays(s, 6) };
    }
    case "thisMonth":
      return { start: startOfMonth(t), end: endOfMonth(t) };
    case "lastMonth": {
      const prev = addMonths(t, -1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
    case "thisYear":
      return {
        start: new Date(t.getFullYear(), 0, 1),
        end: new Date(t.getFullYear(), 11, 31),
      };
    case "lastYear":
      return {
        start: new Date(t.getFullYear() - 1, 0, 1),
        end: new Date(t.getFullYear() - 1, 11, 31),
      };
    case "allTime":
      return { start: null, end: null };
  }
}

type Props = {
  /** Set of `YYYY-MM-DD` strings that have at least one post (renders a dot). */
  postDates: Set<string>;
  value: DateRange;
  onApply: (range: DateRange) => void;
  onCancel: () => void;
};

export default function BlogDatePicker({
  postDates,
  value,
  onApply,
  onCancel,
}: Props) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [start, setStart] = useState<Date | null>(value.start);
  const [end, setEnd] = useState<Date | null>(value.end);
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);
  // Left calendar's month; right calendar is always the following month.
  const [leftMonth, setLeftMonth] = useState<Date>(() =>
    startOfMonth(value.start ?? today),
  );

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function pickDay(day: Date) {
    setActivePreset(null);
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
    } else if (day < start) {
      setStart(day);
    } else {
      setEnd(day);
    }
  }

  function applyPreset(key: PresetKey) {
    const r = presetRange(key, today);
    setStart(r.start);
    setEnd(r.end);
    setActivePreset(key);
    if (r.start) setLeftMonth(startOfMonth(r.start));
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a date range"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close date picker"
        onClick={onCancel}
        className="absolute inset-0 bg-primary-500/30 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(0,0,54,0.4)]">
        <div className="flex min-h-0 flex-1 overflow-y-auto">
          {/* Presets */}
          <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-primary-500/10 p-4 sm:flex">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => applyPreset(p.key)}
                className={`rounded-lg px-4 py-2.5 text-left text-sm transition-colors ${
                  activePreset === p.key
                    ? "bg-primary-500/5 font-semibold text-primary-500"
                    : "text-primary-500/80 hover:bg-primary-500/5"
                }`}
              >
                {p.label}
              </button>
            ))}
          </aside>

          {/* Two months */}
          <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-6 p-5 lg:grid-cols-2 lg:p-6">
            <MonthGrid
              month={leftMonth}
              start={start}
              end={end}
              today={today}
              postDates={postDates}
              onPick={pickDay}
              onPrev={() => setLeftMonth((m) => addMonths(m, -1))}
              onNext={() => setLeftMonth((m) => addMonths(m, 1))}
              showPrev
              showNext={false}
            />
            <MonthGrid
              month={addMonths(leftMonth, 1)}
              start={start}
              end={end}
              today={today}
              postDates={postDates}
              onPick={pickDay}
              onPrev={() => setLeftMonth((m) => addMonths(m, -1))}
              onNext={() => setLeftMonth((m) => addMonths(m, 1))}
              showPrev={false}
              showNext
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-primary-500/10 px-5 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex min-w-[8.5rem] items-center rounded-round border border-primary-500/25 px-4 py-2 text-sm font-medium text-primary-500">
              {fmtPill(start)}
            </span>
            <span className="text-primary-500/50">–</span>
            <span className="inline-flex min-w-[8.5rem] items-center rounded-round border border-primary-500/25 px-4 py-2 text-sm font-medium text-primary-500">
              {fmtPill(end ?? start)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-round border border-primary-500/30 px-6 py-2 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-500/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApply({ start, end: end ?? start })}
              className="rounded-round bg-error-500 px-7 py-2 text-sm font-bold text-primary-500 transition-colors hover:bg-error-400"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  start,
  end,
  today,
  postDates,
  onPick,
  onPrev,
  onNext,
  showPrev,
  showNext,
}: {
  month: Date;
  start: Date | null;
  end: Date | null;
  today: Date;
  postDates: Set<string>;
  onPick: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  showPrev: boolean;
  showNext: boolean;
}) {
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart);
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const rangeEnd = end ?? start;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous month"
          className={`grid size-8 place-items-center rounded-full text-primary-500/70 transition-colors hover:bg-primary-500/5 ${
            showPrev ? "" : "invisible"
          }`}
        >
          <Chevron dir="left" />
        </button>
        <div className="font-display text-base font-bold text-primary-500">
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next month"
          className={`grid size-8 place-items-center rounded-full text-primary-500/70 transition-colors hover:bg-primary-500/5 ${
            showNext ? "" : "invisible"
          }`}
        >
          <Chevron dir="right" />
        </button>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-2 text-center text-xs font-semibold text-primary-500"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = day.getMonth() === monthStart.getMonth();
          const isStart = start ? sameDay(day, start) : false;
          const isEnd = rangeEnd ? sameDay(day, rangeEnd) : false;
          const isEdge = isStart || isEnd;
          const inRange =
            start && rangeEnd
              ? day > startOfDay(start) && day < startOfDay(rangeEnd)
              : false;
          const isToday = sameDay(day, today);
          const hasPost = inMonth && postDates.has(ymd(day));
          const col = i % 7;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(day)}
              className="relative grid h-10 place-items-center text-sm focus-visible:outline-none"
            >
              {/* Range band */}
              {(inRange || (isEdge && start && end && !sameDay(start, end))) ? (
                <span
                  aria-hidden
                  className={`absolute inset-y-1 bg-primary-500/5 ${
                    isStart
                      ? "left-1/2 right-0"
                      : isEnd
                        ? "left-0 right-1/2"
                        : "inset-x-0"
                  } ${isStart || col === 0 ? "rounded-l-full" : ""} ${
                    isEnd || col === 6 ? "rounded-r-full" : ""
                  }`}
                />
              ) : null}

              {/* Selected circle */}
              {isEdge ? (
                <span
                  aria-hidden
                  className="absolute size-9 rounded-full bg-error-500"
                />
              ) : null}

              <span
                className={`relative z-10 ${
                  isEdge
                    ? "font-bold text-primary-500"
                    : inMonth
                      ? "text-primary-500"
                      : "text-primary-500/30"
                } ${isToday && !isEdge ? "font-bold" : ""}`}
              >
                {day.getDate()}
              </span>

              {/* Post dot */}
              {hasPost ? (
                <span
                  aria-hidden
                  className={`absolute bottom-1 size-1 rounded-full ${
                    isEdge ? "bg-primary-500" : "bg-error-600"
                  }`}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}
