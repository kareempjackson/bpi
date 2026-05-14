import { defineField, defineType } from "sanity";

/**
 * Media shown in the right-hand panel of the full-screen menu, swapped
 * out per hovered link / sub-link. Pick image or video. Falls back to a
 * /public path if no asset is uploaded.
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
      name: "videoFallbackSrc",
      title: "Video fallback URL",
      type: "string",
      description: "Public URL or /public path used when no upload is provided.",
      hidden: ({ parent }) => parent?.kind !== "video",
    }),
  ],
});
