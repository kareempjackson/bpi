import type { Metadata } from "next";

import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { EVENTS_QUERY } from "@/sanity/lib/queries";
import type { EventSummary } from "@/sanity/lib/types";

import EventsBrowser, { EventCard, type EventItem } from "./EventsBrowser";
import { toEventItem } from "./mapEvents";

export const metadata: Metadata = {
  title: "Events — BPI",
  description:
    "Workshops, conferences, and gatherings hosted by Barbados Pharmaceuticals Inc.",
};

const EVENT_TITLE =
  "How to create a passive income online (step by step workshop)";

// Placeholder events shown only before any `event` exists in Sanity (e.g. on a
// fresh deploy). The moment editors publish real events — which sync to
// Eventbrite — these disappear and the live listing takes over.
const PLACEHOLDER_EVENTS: EventItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `placeholder-${i + 1}`,
  title: EVENT_TITLE,
  date: "THU, JUN 18 • 9:00 AM",
  status: "Coming soon",
  when: (["today", "week", "month"] as const)[i % 3],
  accent: [
    "bg-linear-to-br from-amber-400 to-rose-500",
    "bg-linear-to-br from-emerald-400 to-teal-600",
    "bg-linear-to-br from-sky-400 to-blue-600",
    "bg-linear-to-br from-indigo-500 to-violet-700",
  ][i % 4],
}));

const PLACEHOLDER_FEATURED: EventItem = {
  id: "placeholder-featured",
  title: EVENT_TITLE,
  date: "THU, JUN 18 • 9:00 AM",
  status: "Coming soon",
  when: "today",
  accent: "bg-linear-to-br from-emerald-800 via-amber-700 to-emerald-900",
};

export default async function EventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const events = await loadQuery<EventSummary[]>(EVENTS_QUERY, {
    params: { lang },
    tags: [TAG.event],
  });

  // Featured = the event flagged `featured`, else the soonest. The rest fill
  // the grid. Falls back to the placeholder demo when there are no events yet.
  const hasEvents = events.length > 0;
  const featuredSource = events.find((e) => e.featured) ?? events[0];

  const featured: EventItem = hasEvents
    ? toEventItem(featuredSource, 0)
    : PLACEHOLDER_FEATURED;

  const gridItems: EventItem[] = hasEvents
    ? events
        .filter((e) => e._id !== featuredSource._id)
        .map((e, i) => toEventItem(e, i))
    : PLACEHOLDER_EVENTS;

  return (
    <main data-nav-theme="light" className="relative bg-error-25 overflow-hidden">
      <section className="px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-28 pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-page">
          {/* Page title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
            Events at BPI
          </h1>

          {/* Featured event — spans the full content width */}
          <div className="mt-8 md:mt-10 lg:mt-12">
            <EventCard event={featured} featured />
          </div>

          {/* Upcoming events */}
          <div className="mt-16 md:mt-20 lg:mt-24">
            <div className="flex flex-col gap-2 max-w-xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
                Upcoming events
              </h2>
              <p className="text-sm lg:text-base text-primary-500/55 leading-relaxed">
                Our approach to innovation and growth is guided by clear
                priorities that shape impact and direction. Built to strengthen
                systems, people, and long-term success.
              </p>
            </div>

            <EventsBrowser events={gridItems} />
          </div>
        </div>
      </section>
    </main>
  );
}
