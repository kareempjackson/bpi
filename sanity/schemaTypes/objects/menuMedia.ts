import { defineField, defineType } from "sanity";

import { externalVideoUrlField } from "./externalVideoUrlField";

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
    externalVideoUrlField(),
    defineField({
      name: "video",
      title: "Sanity video (legacy — unlocked for cleanup, use the R2 field above)",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      readOnly: false,
      description:
        "Legacy Sanity upload. Unlocked so you can delete it — upload new videos via the Cloudflare R2 field above to keep them off Sanity's bandwidth.",
      hidden: ({ parent, value }) => parent?.kind !== "video" || !value,
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as
            | { kind?: string; externalVideoUrl?: string }
            | undefined;
          const kind = parent?.kind ?? "image";
          // Either a Sanity upload OR an external (R2) URL satisfies a video.
          if (kind === "video" && !value && !parent?.externalVideoUrl)
            return "Upload a video or paste an external video URL.";
          return true;
        }),
    }),
  ],
});
