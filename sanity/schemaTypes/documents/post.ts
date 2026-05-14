import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
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
        "URL path under /blog. Click Generate to derive from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description:
        "Short summary shown on the home page card. Keep it under ~200 chars.",
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "imageWithAlt",
    }),
    defineField({
      name: "externalLink",
      title: "External link (optional)",
      type: "url",
      description:
        "If set, clicking the post links here instead of /blog/{slug}.",
    }),
    defineField({
      name: "showInInitiatives",
      title: "Show in Initiatives → Motion Stories",
      type: "boolean",
      description:
        "Toggle on to surface this post in the Motion Stories grid on /initiatives. Posts without this flag appear only on the blog.",
      initialValue: false,
    }),
    defineField({
      name: "initiativeEyebrow",
      title: "Initiatives eyebrow (optional)",
      type: "string",
      description:
        "Label shown above the post title in the Motion Stories tile (e.g. \"Alliance\", \"Research & Development\"). Falls back to the first 24 characters of the title.",
      hidden: ({ parent }) => !parent?.showInInitiatives,
    }),
    defineField({
      name: "initiativeTileSize",
      title: "Initiatives tile size",
      type: "string",
      description:
        "Large tiles span two grid columns (image-led, overlay copy). Compact tiles are one column (text-led with thumbnail).",
      options: {
        list: [
          { title: "Large (image-led)", value: "large" },
          { title: "Compact (text + thumbnail)", value: "compact" },
        ],
        layout: "radio",
      },
      initialValue: "compact",
      hidden: ({ parent }) => !parent?.showInInitiatives,
    }),
    defineField({
      name: "initiativeTileAccent",
      title: "Use brand-green accent on compact tile",
      type: "boolean",
      description:
        "Compact tiles default to a white background. Turn this on to punctuate the grid with a BPI-green tile.",
      initialValue: false,
      hidden: ({ parent }) =>
        !parent?.showInInitiatives || parent?.initiativeTileSize !== "compact",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
      description: "Full article body (used by /blog/{slug}, not the card).",
    }),
  ],
  orderings: [
    {
      title: "Published date — newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage.asset" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle
        ? new Date(subtitle as string).toISOString().slice(0, 10)
        : undefined,
      media,
    }),
  },
});
