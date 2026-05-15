import { defineField, defineType } from "sanity";

/**
 * Universal media object — interchangeable between still image and
 * looping video. Editors flip the "Type" radio to choose. The `asset`
 * (image) field stays visible in both modes: when type=image it's the
 * rendered media; when type=video it becomes the poster shown while the
 * video buffers. All site fields that use `imageWithAlt` automatically
 * support video this way without further schema changes.
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
    }),
    defineField({
      name: "asset",
      title: "Image / poster upload",
      type: "image",
      options: { hotspot: true },
      description:
        "Used as the rendered media when Type is Image, or as the poster while the video buffers when Type is Video.",
    }),
    defineField({
      name: "video",
      title: "Video upload (MP4 recommended)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.kind !== "video",
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
      kind: "kind",
    },
    prepare: ({ media, title, kind }) => ({
      media,
      title:
        (title || "(no alt text)") +
        (kind === "video" ? " · 🎬 video" : ""),
    }),
  },
});
