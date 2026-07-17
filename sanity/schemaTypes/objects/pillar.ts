import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const pillar = defineType({
  name: "pillar",
  title: "Pillar",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "internationalizedArrayText",
    }),
    /**
     * `imageWithAlt` accepts either an image or a video (toggled by its
     * own "Type" radio). When set to Video, the image upload becomes
     * the poster shown while the video buffers.
     */
    defineField({
      name: "image",
      title: "Media (image or video)",
      type: "imageWithAlt",
    }),
    defineField({
      name: "bg",
      title: "Background color",
      type: "hexColor",
    }),
    defineField({
      name: "highlight",
      title: "Highlight (uses centered VisionShape layout)",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "eyebrow", subtitle: "description", media: "image.asset" },
    prepare: ({ title, subtitle, media }) => ({
      title: i18nValue(title),
      subtitle: i18nValue(subtitle),
      media,
    }),
  },
});
