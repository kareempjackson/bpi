import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * Event — authored entirely in Sanity, then pushed to Eventbrite on publish.
 *
 * The `content` / `schedule` / `location` / `tickets` fields are what the
 * editor fills in. On publish, the `/api/eventbrite-sync` webhook creates (or
 * updates) the matching Eventbrite event, then writes the read-only "Sync
 * status" fields (`eventbriteId`, `eventbriteUrl`, …) back into this document.
 * Editors never open Eventbrite — they just watch the Sync status group for the
 * resulting public URL or any error.
 */
export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "schedule", title: "Schedule" },
    { name: "location", title: "Location" },
    { name: "tickets", title: "Tickets" },
    { name: "sync", title: "Sync status" },
  ],
  fields: [
    // ── Content ──────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
      group: "content",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description:
        "Internal identifier. Click Generate to derive from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary (shown on the events grid card)",
      type: "internationalizedArrayText",
      group: "content",
      description: "Short blurb for the listing card. Keep it under ~240 chars.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "internationalizedArrayPortableText",
      group: "content",
      description:
        "Full event description. Pushed to Eventbrite as the event's description.",
    }),
    defineField({
      name: "image",
      title: "Event image",
      type: "imageWithAlt",
      group: "content",
      description: "Used on the grid card and as the Eventbrite event logo.",
    }),
    defineField({
      name: "featured",
      title: "Featured (shown in the large slot at the top of the page)",
      type: "boolean",
      group: "content",
      initialValue: false,
    }),

    // ── Schedule ─────────────────────────────────────────────────────────
    defineField({
      name: "startAt",
      title: "Starts at",
      type: "datetime",
      group: "schedule",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endAt",
      title: "Ends at",
      type: "datetime",
      group: "schedule",
      validation: (Rule) =>
        Rule.required().min(Rule.valueOfField("startAt")).error(
          "End time must be after the start time.",
        ),
    }),
    defineField({
      name: "timezone",
      title: "Timezone (IANA name)",
      type: "string",
      group: "schedule",
      description:
        'IANA timezone the times above are in, e.g. "America/Barbados". Used when creating the Eventbrite event and when formatting the displayed date.',
      initialValue: "America/Barbados",
      validation: (Rule) => Rule.required(),
    }),

    // ── Location ─────────────────────────────────────────────────────────
    defineField({
      name: "locationType",
      title: "Location type",
      type: "string",
      group: "location",
      options: {
        list: [
          { title: "Online", value: "online" },
          { title: "Venue", value: "venue" },
        ],
        layout: "radio",
      },
      initialValue: "online",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "venueName",
      title: "Venue name",
      type: "internationalizedArrayString",
      group: "location",
      hidden: ({ parent }) => parent?.locationType !== "venue",
    }),
    defineField({
      name: "venueAddress",
      title: "Venue address",
      type: "internationalizedArrayText",
      group: "location",
      hidden: ({ parent }) => parent?.locationType !== "venue",
    }),

    // ── Tickets ──────────────────────────────────────────────────────────
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      group: "tickets",
      description:
        "Currency for paid tickets. Eventbrite does not support BBD — USD is the default (BBD is pegged 2:1 to USD).",
      // Eventbrite only accepts currencies from its supported list; offering a
      // dropdown prevents an "event.currency INVALID" failure at publish time.
      options: {
        list: [
          { title: "USD — US Dollar", value: "USD" },
          { title: "CAD — Canadian Dollar", value: "CAD" },
          { title: "GBP — British Pound", value: "GBP" },
          { title: "EUR — Euro", value: "EUR" },
          { title: "AUD — Australian Dollar", value: "AUD" },
        ],
      },
      initialValue: "USD",
    }),
    defineField({
      name: "tickets",
      title: "Ticket tiers",
      type: "array",
      group: "tickets",
      description:
        "Each tier becomes an Eventbrite ticket class. Add at least one (free or paid).",
      of: [
        {
          type: "object",
          name: "ticketTier",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "internationalizedArrayString",
              description: 'e.g. "General Admission" or "Early Bird".',
            }),
            defineField({
              name: "kind",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Free", value: "free" },
                  { title: "Paid", value: "paid" },
                ],
                layout: "radio",
              },
              initialValue: "free",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "number",
              description:
                "Price per ticket in the event currency (e.g. 25 for $25.00).",
              hidden: ({ parent }) => parent?.kind !== "paid",
              validation: (Rule) =>
                Rule.custom((value, context) => {
                  const parent = context.parent as { kind?: string };
                  if (parent?.kind === "paid" && (value == null || value < 0)) {
                    return "A non-negative price is required for paid tiers.";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "quantityTotal",
              title: "Capacity (optional)",
              type: "number",
              description: "Total tickets available for this tier. Leave blank for unlimited.",
              validation: (Rule) => Rule.integer().min(1),
            }),
          ],
          preview: {
            select: { title: "name", kind: "kind", price: "price" },
            prepare: ({ title, kind, price }) => ({
              title: i18nValue(title) || "(unnamed tier)",
              subtitle:
                kind === "paid" ? `Paid · ${price ?? "?"}` : "Free",
            }),
          },
        },
      ],
    }),

    // ── Sync status (read-only — written by /api/eventbrite-sync) ─────────
    defineField({
      name: "eventbriteId",
      title: "Eventbrite event ID",
      type: "string",
      group: "sync",
      readOnly: true,
      description: "Set automatically once the event syncs to Eventbrite.",
    }),
    defineField({
      name: "eventbriteUrl",
      title: "Eventbrite URL",
      type: "url",
      group: "sync",
      readOnly: true,
      description: "Public Eventbrite page. Populated after a successful sync.",
    }),
    defineField({
      name: "lastSyncedAt",
      title: "Last synced",
      type: "datetime",
      group: "sync",
      readOnly: true,
    }),
    defineField({
      name: "syncError",
      title: "Last sync error",
      type: "text",
      rows: 3,
      group: "sync",
      readOnly: true,
      description:
        "If the most recent sync failed, the reason shows here (e.g. paid tickets need payout setup in Eventbrite). Empty when the last sync succeeded.",
    }),
    defineField({
      name: "syncHash",
      title: "Sync hash",
      type: "string",
      group: "sync",
      readOnly: true,
      hidden: true,
      description:
        "Internal — hash of the last-synced content, used to ignore the webhook's own write-back.",
    }),
  ],
  orderings: [
    {
      title: "Start date — soonest first",
      name: "startAtAsc",
      by: [{ field: "startAt", direction: "asc" }],
    },
    {
      title: "Start date — latest first",
      name: "startAtDesc",
      by: [{ field: "startAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      startAt: "startAt",
      featured: "featured",
      media: "image.asset",
    },
    prepare: ({ title, startAt, featured, media }) => ({
      title: featured ? `★ ${i18nValue(title) ?? ""}` : i18nValue(title),
      subtitle: startAt
        ? new Date(startAt as string).toISOString().slice(0, 16).replace("T", " ")
        : "No date set",
      media,
    }),
  },
});
