import { defineField, defineType } from "sanity";

/**
 * Universal media field — image OR video, with a /public fallback. The
 * upload field is named `asset` (Sanity image type, so an uploaded image
 * exposes a nested asset ref at `asset.asset._ref`). When `kind === "video"`,
 * the image upload doubles as the video poster.
 */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image or video",
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
      // Optional — when missing on legacy data, the renderer treats it as
      // "image" automatically. Forcing it to be required here trips
      // documents created before this field existed.
    }),
    defineField({
      name: "asset",
      title: "Image upload",
      description:
        "When type is Video, this image (if provided) is used as the video poster.",
      type: "image",
      options: { hotspot: true },
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
      description:
        "Public URL or /public path used when no video upload is provided.",
      hidden: ({ parent }) => parent?.kind !== "video",
    }),
    defineField({
      name: "fallbackSrc",
      title: "Image fallback /public path",
      type: "string",
      description:
        "Path under /public (e.g. /images/A6701522.jpg). Used when no image upload is provided. Also serves as the video poster fallback.",
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "Recommended for accessibility and SEO. Describe what's in the image / video so screen readers can announce it.",
    }),
  ],
  preview: {
    select: {
      media: "asset",
      title: "alt",
      subtitle: "fallbackSrc",
      kind: "kind",
    },
    prepare: ({ media, title, subtitle, kind }) => ({
      media,
      title,
      subtitle: kind === "video" ? `🎬 video · ${subtitle ?? ""}` : subtitle,
    }),
  },
});
