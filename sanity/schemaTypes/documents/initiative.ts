import { defineArrayMember, defineField, defineType } from "sanity";

export const initiative = defineType({
  name: "initiative",
  title: "Initiative",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "URL path under /initiatives. Click Generate to derive from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle (shown on the About page list)",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "tag",
      title: "Tag / label",
      type: "internationalizedArrayString",
      description:
        "Short custom label shown as the eyebrow on the initiative card (e.g. \"Initiative\", \"Partnership\", \"Research\").",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / description",
      type: "internationalizedArrayText",
      description:
        "Short summary shown on the home and about page rows. Keep it under ~240 chars.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      description:
        "Used as the sort tiebreaker when two initiatives have the same Order — newest first.",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Controls the display order on the home page and initiatives list. Lower numbers appear first (e.g. 1 first, 10 last). Leave blank to fall back to publish-date order.",
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: "featured",
      title: "Featured (shows the FEATURED badge on the home page)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "hasDetailPage",
      title: "Has detail page",
      type: "boolean",
      description:
        "When ON, the row links to /initiatives/{slug} (or the External link if set). When OFF, the initiative shows in lists but isn't clickable — use for display-only cards that don't have a longer write-up yet.",
      initialValue: true,
    }),
    defineField({
      name: "coverImage",
      title: "Cover image (shown on hover in the section list)",
      type: "imageWithAlt",
    }),
    defineField({
      name: "externalLink",
      title: "External link (optional)",
      type: "url",
      description:
        "If set, the row links here instead of /initiatives/{slug}. Takes precedence over the Has detail page toggle.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
      description:
        "Full detail content shown on the /initiatives/{slug} page. Only used when Has detail page is ON.",
    }),
    defineField({
      name: "pageColor",
      title: "Detail page colour",
      type: "hexColor",
      description:
        "Base colour for the whole detail page (hero, section bands, footer). Lighter shades are derived automatically. Pick a deep colour for best contrast with the white text. Defaults to navy blue.",
      initialValue: "#0B2F64",
    }),

    // ─────────────────────────────────────────────────── Quote section ──
    defineField({
      name: "showQuote",
      title: "Show quote section",
      type: "boolean",
      description:
        "Toggle the pull-quote section (with portrait) on the detail page.",
      initialValue: false,
    }),
    defineField({
      name: "quoteSupporting",
      title: "Quote — supporting paragraph",
      type: "internationalizedArrayText",
      description: "Small intro text shown top-left of the quote section.",
    }),
    defineField({
      name: "quoteText",
      title: "Quote — pull quote",
      type: "internationalizedArrayText",
      description:
        "The large quote. Wrap the phrase you want highlighted white in **double asterisks**, e.g. \"Barbados sees **Nigeria as a strategic partner** in advancing…\".",
    }),
    defineField({
      name: "quoteAttribution",
      title: "Quote — attribution",
      type: "internationalizedArrayString",
      description: 'e.g. "Barbados’ Senior Minister of Health Dr Jerome Walcott".',
    }),
    defineField({
      name: "quoteImage",
      title: "Quote — portrait image",
      type: "imageWithAlt",
    }),

    // ────────────────────────────────────────────────── Why It Matters ──
    defineField({
      name: "whyMattersHeading",
      title: "Why It Matters — heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "whyMattersBody",
      title: "Why It Matters — body",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "whyMattersImage",
      title: "Why It Matters — image",
      type: "imageWithAlt",
    }),

    // ──────────────────────────────────────────── Further Projected Impact ──
    defineField({
      name: "impactHeading",
      title: "Projected Impact — heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "impactBody",
      title: "Projected Impact — body",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "impactStats",
      title: "Projected Impact — stat cards",
      type: "array",
      description:
        "Up to ~4 cards. Card colours cycle automatically (white, light blue, green).",
      of: [
        defineArrayMember({
          type: "object",
          name: "impactStat",
          fields: [
            defineField({
              name: "value",
              title: "Value (e.g. \"USD $29 Million\", \"200+\")",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "internationalizedArrayString",
            }),
          ],
          preview: {
            select: { title: "value.0.value", subtitle: "label.0.value" },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Manual order (low → high)",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
    {
      title: "Published date — newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Featured first, then newest",
      name: "featuredDesc",
      by: [
        { field: "featured", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title.0.value",
      subtitle: "publishedAt",
      featured: "featured",
      media: "coverImage.asset",
    },
    prepare: ({ title, subtitle, featured, media }) => ({
      title: featured ? `★ ${title}` : title,
      subtitle: subtitle
        ? new Date(subtitle as string).toISOString().slice(0, 10)
        : undefined,
      media,
    }),
  },
});
