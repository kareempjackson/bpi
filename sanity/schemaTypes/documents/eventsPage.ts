import { defineField, defineType } from "sanity";

/**
 * Events page — the singleton that drives the copy on /events. The three
 * sections it labels are populated from other document types:
 *   • "Upcoming BPI events"        → `event` docs (hosted, ticketed via Eventbrite)
 *   • "Events we're attending next" → future-dated `engagement` docs
 *   • "Where we've been"            → past-dated `engagement` docs
 *
 * This document owns only the surrounding copy (title + each section's heading,
 * intro, and the "attending next" empty state); the cards themselves come from
 * `event` / `engagement`.
 */
export const eventsPage = defineType({
  name: "eventsPage",
  title: "Events page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "header", title: "Header", default: true },
    { name: "upcoming", title: "Upcoming BPI events" },
    { name: "attending", title: "Attending next" },
    { name: "past", title: "Where we've been" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────────── SEO ──
    defineField({
      name: "seoTitle",
      title: "Page title (browser tab & SEO)",
      type: "internationalizedArrayString",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "internationalizedArrayText",
      group: "seo",
    }),

    // ───────────────────────────────────────────────────────────── Header ──
    defineField({
      name: "title",
      title: "Page title (H1)",
      type: "internationalizedArrayString",
      description: 'The big heading at the top, e.g. "Events at BPI".',
      group: "header",
    }),

    // ───────────────────────────────────────────── Upcoming BPI events ──
    defineField({
      name: "upcomingHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "upcoming",
    }),
    defineField({
      name: "upcomingIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayPortableText",
      group: "upcoming",
    }),

    // ───────────────────────────────────────────── Events attending next ──
    defineField({
      name: "attendingHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "attending",
    }),
    defineField({
      name: "attendingIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayPortableText",
      group: "attending",
    }),
    defineField({
      name: "attendingEmptyState",
      title: "Empty-state message",
      type: "internationalizedArrayPortableText",
      description:
        "Shown when there are no upcoming engagements yet, e.g. “Stay tuned — we'll share where to meet BPI next.”",
      group: "attending",
    }),

    // ─────────────────────────────────────────────────── Where we've been ──
    defineField({
      name: "pastHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "past",
    }),
    defineField({
      name: "pastIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayPortableText",
      group: "past",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Events page" }),
  },
});
