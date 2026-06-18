import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getEventbriteAvailability } from "@/app/lib/eventbrite";
import { client } from "@/sanity/lib/client";
import { loadQuery, TAG } from "@/sanity/lib/fetch";
import { resolveImage } from "@/sanity/lib/image";
import {
  ALL_EVENT_SLUGS_QUERY,
  EVENT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import type { EventDetail } from "@/sanity/lib/types";

import EventReserveButton from "../EventReserveButton";
import { deriveStatus, formatEventDate } from "../mapEvents";

type RouteProps = {
  params: Promise<{ lang: string; slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const data = await client.fetch<{ slug: string }[] | null>(
    ALL_EVENT_SLUGS_QUERY,
    {},
    { next: { tags: [TAG.event] } },
  );
  return (data ?? []).map((d) => ({ slug: d.slug }));
}

async function getEvent(
  lang: string,
  slug: string,
): Promise<EventDetail | null> {
  return loadQuery<EventDetail | null>(EVENT_BY_SLUG_QUERY, {
    params: { lang, slug },
    tags: [TAG.event],
  });
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const event = await getEvent(lang, slug);
  if (!event) return { title: "Events — BPI" };
  return {
    title: `${event.title} — BPI Events`,
    description: event.summary ?? undefined,
  };
}

const bodyComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary-500 leading-[1.15] tracking-[-0.02em] mt-8 lg:mt-12 mb-1 balance-text">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl md:text-2xl font-semibold text-primary-500 leading-snug tracking-[-0.015em] mt-6 lg:mt-8 mb-0.5 balance-text">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 lg:my-6 border-l-2 border-primary-500/30 pl-6 lg:pl-8 font-display text-xl md:text-2xl text-primary-500 leading-[1.35] italic tracking-[-0.01em] balance-text">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2.5 list-disc list-outside pl-6 marker:text-primary-500/50 text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2.5 list-decimal list-outside pl-6 marker:text-primary-500/50 marker:font-semibold text-base lg:text-lg text-primary-500/85 leading-[1.75]">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-primary-500">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:/i.test(href);
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="hov-underline text-primary-500 decoration-primary-500/30 underline underline-offset-[6px]"
        >
          {children}
        </a>
      );
    },
  },
};

// Small inline icons matching the listing's stroke style.
function MetaIcon({ kind }: { kind: "seats" | "date" | "location" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "w-4 h-4 shrink-0 text-primary-500/55",
    "aria-hidden": true,
  };
  if (kind === "date")
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  if (kind === "location")
    return (
      <svg {...common}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M3 12h18M5 12V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 12v6M19 12v6" />
    </svg>
  );
}

export default async function EventDetailPage({ params }: RouteProps) {
  const { lang, slug } = await params;
  const event = await getEvent(lang, slug);
  if (!event) notFound();

  const cover = resolveImage(event.image, { width: 2000 });
  const dateLabel = formatEventDate(event.startAt, event.timezone);
  const locationLabel =
    event.locationType === "venue"
      ? event.venueName || "In person"
      : "Online Event";

  // Live availability (best-effort) — only used to surface "Sold Out". The
  // price/Free chip comes from Sanity (Eventbrite's free display is "0.00 USD").
  const availability = await getEventbriteAvailability(event.eventbriteId);
  const soldOut = availability?.soldOut ?? false;
  const statusLabel = soldOut
    ? "Sold Out"
    : deriveStatus(event.tickets, event.currency);

  const totalCapacity = (event.tickets ?? []).reduce(
    (sum, t) => sum + (t.quantityTotal ?? 0),
    0,
  );

  const hasBody = !!event.description && event.description.length > 0;

  const metaRow = (
    <div className="flex flex-col gap-2.5">
      {totalCapacity > 0 ? (
        <div className="flex items-center gap-2 text-xs lg:text-sm uppercase tracking-[0.08em] text-primary-500/70">
          <MetaIcon kind="seats" />
          <span>{totalCapacity} seats</span>
        </div>
      ) : null}
      <div className="flex items-center gap-2 text-xs lg:text-sm text-primary-500/70">
        <MetaIcon kind="date" />
        <span>{dateLabel}</span>
      </div>
      <div className="flex items-center gap-2 text-xs lg:text-sm text-primary-500/70">
        <MetaIcon kind="location" />
        <span>{locationLabel}</span>
      </div>
    </div>
  );

  return (
    <main data-nav-theme="light" className="relative bg-error-25 overflow-hidden">
      <section className="px-6 md:px-12 lg:px-20 xl:px-28 pt-24 md:pt-28 lg:pt-28 pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto max-w-page">
          {/* Hero image */}
          <div>
            <div
              className={`relative overflow-hidden rounded-2xl aspect-video lg:aspect-21/9 ${
                cover ? "bg-primary-500/5" : "bg-linear-to-br from-emerald-800 via-amber-700 to-emerald-900"
              }`}
            >
              {event.featured ? (
                <span className="absolute left-4 top-4 z-10 inline-flex items-center rounded-round bg-error-500/90 px-3.5 py-1.5 text-xs font-semibold text-primary-500 backdrop-blur-sm">
                  Feature
                </span>
              ) : null}
              {cover ? (
                <Image
                  src={cover.src}
                  alt={cover.alt || event.title}
                  fill
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="object-cover"
                  preload
                />
              ) : null}
            </div>
          </div>

          {/* Status + meta + title + CTA */}
          <div className="mt-6 lg:mt-8 flex flex-col gap-4 max-w-3xl">
            {statusLabel ? (
              <span className="inline-flex w-fit items-center rounded-round bg-error-200 px-3 py-1 text-xs font-semibold text-primary-500">
                {statusLabel}
              </span>
            ) : null}

            {metaRow}

            <h2 className="font-bold text-primary-500 uppercase leading-snug tracking-[0.01em] text-xl md:text-2xl lg:text-3xl">
              {event.title}
            </h2>

            <div className="mt-1">
              <EventReserveButton
                eventbriteId={event.eventbriteId}
                eventbriteUrl={event.eventbriteUrl}
                soldOut={soldOut}
              />
            </div>
          </div>

          {/* Description body */}
          {hasBody ? (
            <article className="mt-12 md:mt-16 max-w-2xl flex flex-col gap-5 lg:gap-6">
              <PortableText
                value={event.description!}
                components={bodyComponents}
              />
            </article>
          ) : event.summary ? (
            <p className="mt-12 md:mt-16 max-w-2xl text-base lg:text-lg text-primary-500/85 leading-[1.75]">
              {event.summary}
            </p>
          ) : null}

          {/* Bottom details card — mirrors the hero meta + a second CTA */}
          <div className="mt-16 md:mt-20 lg:mt-24 rounded-2xl bg-warning-100/60 p-6 md:p-8 lg:p-10 flex flex-col gap-4 max-w-3xl">
            {metaRow}
            <h3 className="font-bold text-primary-500 uppercase leading-snug tracking-[0.01em] text-lg md:text-xl max-w-2xl">
              {event.title}
            </h3>
            <div className="h-px bg-primary-500/12" />
            <EventReserveButton
              eventbriteId={event.eventbriteId}
              eventbriteUrl={event.eventbriteUrl}
              soldOut={soldOut}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
