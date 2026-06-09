import type { Metadata } from "next";

import EventsBrowser, {
  EventCard,
  type EventItem,
} from "./EventsBrowser";

export const metadata: Metadata = {
  title: "Events — BPI",
  description:
    "Workshops, conferences, and gatherings hosted by Barbados Pharmaceuticals Inc.",
};

// Placeholder poster gradients — stand in for event artwork until the
// Events content type is wired to Sanity. Cycled across the grid so the
// layout reads like the design.
const ACCENTS = [
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

const WHENS: EventItem["when"][] = ["today", "week", "month"];

const EVENT_TITLE =
  "How to create a passive income online (step by step workshop)";

// Twelve placeholder events. Swap this for a Sanity `event` query when the
// content type exists.
const EVENTS: EventItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `event-${i + 1}`,
  title: EVENT_TITLE,
  date: "THU, JUN 18 • 9:00 AM",
  status: "Almost Full",
  when: WHENS[i % WHENS.length],
  accent: ACCENTS[i % ACCENTS.length],
}));

const FEATURED: EventItem = {
  id: "featured",
  title: EVENT_TITLE,
  date: "THU, JUN 18 • 9:00 AM",
  status: "Almost Full",
  when: "today",
  accent: "bg-linear-to-br from-emerald-800 via-amber-700 to-emerald-900",
};

export default function EventsPage() {
  return (
    <main
      data-nav-theme="light"
      className="relative bg-error-25 overflow-hidden"
    >
      <section className="px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-28 pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-page">
          {/* Page title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
            Events at BPI
          </h1>

          {/* Featured event — spans the full content width */}
          <div className="mt-8 md:mt-10 lg:mt-12">
            <EventCard event={FEATURED} featured />
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

            <EventsBrowser events={EVENTS} />
          </div>
        </div>
      </section>
    </main>
  );
}
