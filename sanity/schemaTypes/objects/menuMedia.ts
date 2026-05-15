import { defineField, defineType } from "sanity";

/**
 * Media shown in the right-hand panel of the full-screen menu, swapped
 * out per hovered link / sub-link. Pick image or video; both are
 * Sanity-hosted assets.
 */
export const menuMedia = defineType({
  name: "menuMedia",
  title: "Menu media",
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
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      hidden: ({ parent }) => parent?.kind !== "image",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const kind =
            (context.parent as { kind?: string } | undefined)?.kind ?? "image";
          if (kind === "image" && !value) return "Add an image.";
          return true;
        }),
    }),
    defineField({
      name: "video",
      title: "Video upload (MP4 recommended)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.kind !== "video",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const kind =
            (context.parent as { kind?: string } | undefined)?.kind ?? "image";
          if (kind === "video" && !value) return "Upload a video.";
          return true;
        }),
    }),
  ],
});
