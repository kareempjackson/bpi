import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * Engagement — an external event BPI shows up at (a conference, mission, or
 * workshop it attends rather than hosts). Unlike `event`, there is no
 * Eventbrite sync and no ticketing: these are curated, text-only entries.
 *
 * The `/events` page splits engagements by `date` relative to today:
 *   • future  → "Events We're Attending Next"
 *   • past     → "Where We've Been"
 * So an upcoming engagement moves itself into the recap once its date passes —
 * editors never have to re-file it.
 */
export const engagement = defineType({
  name: "engagement",
  title: "Engagement (event BPI attends)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Event name",
      type: "internationalizedArrayString",
      description: 'The external event, e.g. "WHA79" or "BioSimilar Medicines Conference".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "internationalizedArrayString",
      description: 'City / venue, e.g. "Geneva" or "Conference, Amsterdam".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description:
        "When it takes place. Drives which section it appears in: future dates show under “Attending next”, past dates under “Where we’ve been”.",
      options: { dateFormat: "MMM D, YYYY" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "purpose",
      title: "Why we’re there",
      type: "internationalizedArrayPortableText",
      description:
        "A short purpose shown on the “Attending next” card — ideally one line. Optional for past engagements.",
    }),
    defineField({
      name: "link",
      title: "Event link (optional)",
      type: "url",
      description: "Public page for the external event, if there is one.",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"] }).error(
          "Enter a full URL starting with http:// or https://",
        ),
    }),
  ],
  orderings: [
    {
      title: "Date — soonest first",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
    {
      title: "Date — latest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      location: "location",
      date: "date",
    },
    prepare: ({ title, location, date }) => ({
      title: i18nValue(title) || "(unnamed engagement)",
      subtitle: [i18nValue(location), date].filter(Boolean).join(" · "),
    }),
  },
});
