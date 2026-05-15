import { defineField, defineType } from "sanity";

/**
 * Sector node content. The 6 nodes' SVG positions / radii / label
 * coordinates are baked into the page code so the molecule layout
 * cannot drift. The `nodeId` selector is how the page matches Sanity
 * content back to a fixed slot in the diagram.
 */
export const sectorNode = defineType({
  name: "sectorNode",
  title: "Sector",
  type: "object",
  fields: [
    defineField({
      name: "nodeId",
      title: "Slot",
      type: "string",
      description:
        "Required to render. Sectors without a slot are silently skipped on the page.",
      options: {
        list: [
          { title: "01 — Market Access & Trade Development", value: "market-access" },
          { title: "02 — Workforce & Talent Development", value: "workforce" },
          { title: "03 — Research & Development", value: "research-development" },
          { title: "04 — Innovation & Technology", value: "innovation-technology" },
          { title: "05 — Regulatory Development & Policy", value: "regulatory-policy" },
          { title: "06 — Investment & Financing", value: "investment-financing" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "num",
      title: "Display number (e.g. 01)",
      type: "string",
      description: "Shown above the title in the label block.",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "media",
      title: "Media (image or video)",
      type: "object",
      fields: [
        defineField({
          name: "kind",
          title: "Type",
          type: "string",
          options: {
            list: [
              { title: "Image", value: "image" },
              { title: "Video", value: "video" },
            ],
            layout: "radio",
          },
          initialValue: "image",
          // Optional — defaults to "image" when missing on legacy data.
        }),
        defineField({
          name: "image",
          title: "Image",
          type: "imageWithAlt",
          hidden: ({ parent }) => parent?.kind !== "image",
        }),
        defineField({
          name: "video",
          title: "Video upload (MP4 recommended)",
          type: "file",
          options: { accept: "video/mp4,video/webm" },
          hidden: ({ parent }) => parent?.kind !== "video",
        }),
        defineField({
          name: "videoPoster",
          title: "Poster image (shown before video plays / on slow connections)",
          type: "imageWithAlt",
          hidden: ({ parent }) => parent?.kind !== "video",
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value: unknown) => {
          const m = value as
            | {
                kind?: string;
                image?: { asset?: unknown };
                video?: { asset?: unknown };
              }
            | undefined;
          const kind = m?.kind ?? "image";
          if (kind === "image") {
            if (!m?.image?.asset) return "Upload an image.";
          } else if (kind === "video") {
            if (!m?.video?.asset) return "Upload a video.";
          }
          return true;
        }),
    }),
    defineField({
      name: "href",
      title: "Link (optional — defaults to /sectors/{slot})",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "num",
      media: "media.image.asset",
      kind: "media.kind",
    },
    prepare: ({ title, subtitle, media, kind }) => ({
      title,
      subtitle: kind === "video" ? `${subtitle} · 🎬 video` : subtitle,
      media,
    }),
  },
});
