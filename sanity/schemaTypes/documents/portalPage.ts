import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * A rich, gated page in the portal (text, images, inline video, stat cards,
 * metrics tables). Visible only to logged-in users whose tiers intersect
 * `audiences`.
 */
export const portalPage = defineType({
  name: "portalPage",
  title: "Portal page",
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
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "audiences",
      title: "Visible to",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "grid",
        list: [
          { title: "Investors", value: "investor" },
          { title: "Partners", value: "partner" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "summary",
      title: "Summary (shown on the portal dashboard card)",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first on the dashboard.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
    }),
  ],
  preview: {
    select: { title: "title", audiences: "audiences" },
    prepare: ({ title, audiences }) => ({
      title: i18nValue(title),
      subtitle: Array.isArray(audiences) ? audiences.join(" + ") : undefined,
    }),
  },
});
