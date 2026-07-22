import { resolveImage } from "@/sanity/lib/image";
import type { EventSummary, EventTicketTier } from "@/sanity/lib/types";

import type { EventItem } from "./EventsBrowser";

// Fallback poster gradients — used only when an event has no image yet. Cycled
// across the grid so an un-illustrated listing still reads like the design.
// Exported so engagement cards (which never carry an image) reuse the same
// palette and read as one grid with the event cards.
export const ACCENTS = [
  "bg-linear-to-br from-amber-400 to-rose-500",
  "bg-linear-to-br from-emerald-400 to-teal-600",
  "bg-linear-to-br from-orange-400 to-amber-600",
  "bg-linear-to-br from-emerald-700 to-primary-500",
  "bg-linear-to-br from-orange-500 to-rose-600",
  "bg-linear-to-br from-sky-400 to-blue-600",
  "bg-linear-to-br from-lime-400 to-green-600",
  "bg-linear-to-br from-indigo-500 to-violet-700",
  "bg-linear-to-br from-yellow-400 to-amber-600",
  "bg-linear-to-br from-blue-500 to-indigo-700",
  "bg-linear-to-br from-red-500 to-rose-700",
  "bg-linear-to-br from-cyan-500 to-blue-700",
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Format a start datetime in the event's timezone as e.g.
 * "THU, JUN 18 • 9:00 AM". Falls back to the local zone when none is given.
 */
export function formatEventDate(
  startAt: string,
  timezone?: string | null,
): string {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return "";
  const tz = timezone || undefined;
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  }).format(date);
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  }).format(date);
  return `${day} • ${time}`.toUpperCase();
}

/**
 * Bucket an event for the Today / This week / This Month filter chips.
 * Buckets are mutually exclusive; "month" is the catch-all for anything beyond
 * the next week (the "All" chip still shows everything).
 */
export function bucketWhen(startAt: string): EventItem["when"] {
  const start = new Date(startAt).getTime();
  const now = Date.now();
  if (Number.isNaN(start)) return "month";
  const diff = start - now;
  // Same calendar day (within ~today) counts as "today".
  const startDay = new Date(startAt);
  const today = new Date();
  const sameDay =
    startDay.getFullYear() === today.getFullYear() &&
    startDay.getMonth() === today.getMonth() &&
    startDay.getDate() === today.getDate();
  if (sameDay) return "today";
  if (diff >= 0 && diff <= 7 * DAY_MS) return "week";
  return "month";
}

/** Short availability/price label derived from the ticket tiers. */
export function deriveStatus(
  tickets?: EventTicketTier[] | null,
  currency?: string | null,
): string | undefined {
  if (!tickets || tickets.length === 0) return undefined;
  const paid = tickets.filter((t) => t.kind === "paid" && t.price != null);
  if (paid.length === 0) return "Free";
  const min = Math.min(...paid.map((t) => t.price as number));
  const cur = currency ? `${currency} ` : "";
  return `From ${cur}${min}`;
}

/** Map a Sanity event projection to the EventsBrowser card shape. */
export function toEventItem(ev: EventSummary, index: number): EventItem {
  return {
    id: ev._id,
    title: ev.title,
    date: formatEventDate(ev.startAt, ev.timezone),
    status: deriveStatus(ev.tickets, ev.currency),
    when: bucketWhen(ev.startAt),
    accent: ACCENTS[index % ACCENTS.length],
    // 1600 wide so the featured banner (rendered up to the wide `max-w-page`
    // container, aspect-21/9) isn't upscaled; next/image downsizes this master
    // for the 4-up grid cards.
    imageUrl: resolveImage(ev.image ?? null, { width: 1600 })?.src,
    eventbriteId: ev.eventbriteId ?? undefined,
    eventbriteUrl: ev.eventbriteUrl ?? undefined,
    href: ev.slug ? `/events/${ev.slug}` : undefined,
  };
}
