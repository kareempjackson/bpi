import { defineArrayMember, defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
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
        "URL path under /blog. Click Generate to derive from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "internationalizedArrayText",
      description:
        "Short summary shown on the home page card. Keep it under ~200 chars.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "contentType",
      title: "Content type",
      type: "string",
      description:
        "Drives the blog filters, the card style, and how the post opens.",
      options: {
        list: [
          { title: "Article (written by BPI)", value: "article" },
          { title: "News / external article about BPI", value: "news" },
          { title: "Resource", value: "resource" },
          { title: "Report", value: "report" },
        ],
        layout: "radio",
      },
      initialValue: "article",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }], weak: true }],
      description:
        "Topical tags shown as pills on the card and used by the blog filters.",
    }),
    defineField({
      name: "wideTile",
      title: "Full-width feature tile",
      type: "boolean",
      description:
        "Render this post as a full-width, image-led feature card in the blog grid (instead of a standard column card).",
      initialValue: false,
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
        "Mainly for News: if set, clicking the post links to this source instead of opening an on-site /blog/{slug} page.",
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
      type: "internationalizedArrayString",
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
      type: "internationalizedArrayPortableText",
      description:
        "On-site page body (article copy, or the description shown above the downloads on resource/report pages). Not shown on the card.",
    }),
    defineField({
      name: "attachments",
      title: "Downloadable documents",
      type: "array",
      description:
        "Files offered for download on resource & report pages (PDF, DOCX, slides, etc.).",
      of: [
        defineArrayMember({
          type: "object",
          name: "attachment",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "file",
              title: "File",
              type: "file",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "label.0.value", subtitle: "file.asset.originalFilename" },
          },
        }),
      ],
      hidden: ({ parent }) =>
        parent?.contentType !== "resource" && parent?.contentType !== "report",
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
    select: { title: "title.0.value", subtitle: "publishedAt", media: "coverImage.asset" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle
        ? new Date(subtitle as string).toISOString().slice(0, 10)
        : undefined,
      media,
    }),
  },
});
