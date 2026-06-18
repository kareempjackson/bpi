import { defineField, defineType } from "sanity";

import {
  externalAudioUrlField,
  externalVideoUrlField,
} from "./externalVideoUrlField";

/**
 * Universal media object — interchangeable between still image, looping video,
 * and audio. Editors flip the "Type" radio to choose. The `asset` (image) field
 * stays visible in every mode: when type=image it's the rendered media; when
 * type=video/audio it becomes the poster shown alongside the player. All site
 * fields that use `imageWithAlt` automatically support these without further
 * schema changes.
 */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image, video or audio",
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
          { title: "Audio", value: "audio" },
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
        "Used as the rendered media when Type is Image, or as the poster shown alongside the player when Type is Video or Audio.",
    }),
    externalVideoUrlField(),
    externalAudioUrlField(),
    defineField({
      name: "video",
      title: "Video upload (MP4 recommended)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.kind !== "video",
    }),
    defineField({
      name: "audio",
      title: "Audio upload (MP3 recommended)",
      type: "file",
      options: { accept: "audio/*" },
      hidden: ({ parent }) => parent?.kind !== "audio",
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "internationalizedArrayString",
      description:
        "Recommended for accessibility and SEO. Describe what's in the image / video so screen readers can announce it.",
    }),
  ],
  preview: {
    select: {
      media: "asset",
      title: "alt.0.value",
      kind: "kind",
    },
    prepare: ({ media, title, kind }) => ({
      media,
      title:
        (title || "(no alt text)") +
        (kind === "video" ? " · 🎬 video" : kind === "audio" ? " · 🎧 audio" : ""),
    }),
  },
});
