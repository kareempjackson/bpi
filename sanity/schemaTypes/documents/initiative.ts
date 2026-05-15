import { defineField, defineType } from "sanity";

export const initiative = defineType({
  name: "initiative",
  title: "Initiative",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
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
      type: "string",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt / description",
      type: "text",
      rows: 3,
      description:
        "Short summary shown on the home and about page rows. Keep it under ~240 chars.",
      validation: (Rule) => Rule.required().max(280),
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
      name: "coverImage",
      title: "Cover image (shown on hover in the section list)",
      type: "imageWithAlt",
    }),
    defineField({
      name: "externalLink",
      title: "External link (optional)",
      type: "url",
      description:
        "If set, the row links here instead of /initiatives/{slug}.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
      description: "Full detail content (for the future /initiatives/{slug} page).",
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
      title: "title",
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
