import type { Metadata } from "next";

import { loadQuery, TAG } from "@/sanity/lib/fetch";
import {
  EVENTS_QUERY,
  ENGAGEMENTS_QUERY,
  EVENTS_PAGE_QUERY,
  HOME_PAGE_QUERY,
} from "@/sanity/lib/queries";
import type {
  EngagementSummary,
  EventSummary,
  EventsPage,
  HomePage,
  ResolvedMedia,
} from "@/sanity/lib/types";
import { resolveMedia } from "@/sanity/lib/image";

import BuildingSection from "@/app/components/BuildingSection";
import CareersSection from "@/app/components/CareersSection";
import PortableTextBody from "@/app/components/PortableTextBody";
import { localizedHref } from "@/app/lib/locale";

import EngagementSections from "./EngagementSections";
import EventsBrowser, { EventCard, type EventItem } from "./EventsBrowser";
import { toEventItem } from "./mapEvents";

/** Poster/still for a resolved media object (image src, or a video's poster). */
function mediaImageSrc(m: ResolvedMedia | null): string | undefined {
  if (!m) return undefined;
  return m.kind === "image" ? m.src : m.poster;
}

const INTRO_PARAGRAPH_CLASS =
  "text-sm lg:text-base text-primary-500/55 leading-relaxed";

export const revalidate = 3600;

// Fallback copy — used until the eventsPage singleton is populated. Kept in one
// place so the page reads cleanly and Studio edits override each field.
const COPY = {
  title: "Events at BPI",
  upcomingHeading: "Upcoming BPI events",
  upcomingIntro:
    "Workshops, conferences, and gatherings we’re hosting. Reserve your place — registration runs through Eventbrite.",
  attendingHeading: "Events we’re attending next",
  attendingIntro:
    "Where to find the BPI team out in the world — the conferences, missions, and workshops we’re heading to next.",
  attendingEmptyState: "Stay tuned — we’ll share where to meet BPI next.",
  pastHeading: "Where we’ve been",
  pastIntro:
    "A look back at the gatherings BPI has joined — the rooms where partnerships, policy, and progress take shape.",
} as const;

async function getEventsPage(lang: string): Promise<EventsPage | null> {
  return loadQuery<EventsPage | null>(EVENTS_PAGE_QUERY, {
    params: { lang },
    tags: [TAG.eventsPage],
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const data = await getEventsPage(lang);
  return {
    title: data?.seoTitle ?? "Events — BPI",
    description:
      data?.seoDescription ??
      "Workshops, conferences, and gatherings hosted by Barbados Pharmaceuticals Inc.",
  };
}

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
  const [events, engagements, page, home] = await Promise.all([
    loadQuery<EventSummary[]>(EVENTS_QUERY, {
      params: { lang },
      tags: [TAG.event],
    }),
    loadQuery<EngagementSummary[]>(ENGAGEMENTS_QUERY, {
      params: { lang },
      tags: [TAG.engagement],
    }),
    getEventsPage(lang),
    loadQuery<HomePage | null>(HOME_PAGE_QUERY, {
      params: { lang },
      tags: [TAG.homePage],
    }),
  ]);

  // Bottom closers reuse the Home document's Careers + CTA copy/photos, so the
  // events page ends the same way as the other marketing pages.
  const careersMedia = resolveMedia(home?.careersImage, { width: 1200 });
  const buildingMedia = resolveMedia(home?.buildingImage, { width: 1600 });

  // Split boundary for the engagement sections. Computed in the venue-neutral
  // "en-CA" locale so it comes out as an ISO "YYYY-MM-DD" that sorts against
  // each engagement's `date` string.
  const todayISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Barbados",
  }).format(new Date());

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
      <section className="px-6 md:px-10 lg:px-14 pt-24 md:pt-28 lg:pt-28 pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto w-full max-w-page">
          {/* Page title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-500 leading-tight tracking-[-0.02em]">
            {page?.title ?? COPY.title}
          </h1>

          {/* Featured event — spans the full content width */}
          <div className="mt-8 md:mt-10 lg:mt-12">
            <EventCard event={featured} featured />
          </div>

          {/* Upcoming BPI Events — hosted, ticketed events (Eventbrite) */}
          <div className="mt-16 md:mt-20 lg:mt-24">
            <div className="flex flex-col gap-2 max-w-xl">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-500 leading-tight tracking-[-0.01em]">
                {page?.upcomingHeading ?? COPY.upcomingHeading}
              </h2>
              <PortableTextBody
                value={page?.upcomingIntro ?? COPY.upcomingIntro}
                compact
                paragraphClassName={INTRO_PARAGRAPH_CLASS}
              />
            </div>

            <EventsBrowser events={gridItems} />
          </div>

          {/* Events we're attending next + Where we've been (Sanity-only) */}
          <EngagementSections
            engagements={engagements}
            todayISO={todayISO}
            copy={{
              attendingHeading:
                page?.attendingHeading ?? COPY.attendingHeading,
              attendingIntro: page?.attendingIntro ?? COPY.attendingIntro,
              attendingEmptyState:
                page?.attendingEmptyState ?? COPY.attendingEmptyState,
              pastHeading: page?.pastHeading ?? COPY.pastHeading,
              pastIntro: page?.pastIntro ?? COPY.pastIntro,
            }}
          />
        </div>
      </section>

      {/* Careers + call-to-action closers — reuse the Home document's copy. */}
      <CareersSection
        tone="mint"
        eyebrow={home?.careersEyebrow ?? undefined}
        heading={home?.careersHeading ?? undefined}
        lead={home?.careersLead ?? undefined}
        body={home?.careersBody ?? undefined}
        imageSrc={mediaImageSrc(careersMedia) ?? mediaImageSrc(buildingMedia)}
        imageAlt={careersMedia?.alt ?? buildingMedia?.alt}
        primaryLabel={home?.careersPrimaryCta?.label ?? undefined}
        primaryHref={
          home?.careersPrimaryCta?.href
            ? localizedHref(lang, home.careersPrimaryCta.href)
            : undefined
        }
        secondaryLabel={home?.careersSecondaryCta?.label ?? undefined}
        secondaryHref={
          home?.careersSecondaryCta?.href
            ? localizedHref(lang, home.careersSecondaryCta.href)
            : undefined
        }
      />
      <BuildingSection
        imageSrc={mediaImageSrc(buildingMedia)}
        imageAlt={buildingMedia?.alt}
        headlineLine1={home?.buildingHeadlineLine1}
        headlineLine2={home?.buildingHeadlineLine2}
        primaryLabel={home?.buildingPrimaryCta?.label ?? undefined}
        primaryHref={home?.buildingPrimaryCta?.href ?? undefined}
        secondaryLabel={home?.buildingSecondaryCta?.label ?? undefined}
        secondaryHref={home?.buildingSecondaryCta?.href ?? undefined}
      />
    </main>
  );
}
