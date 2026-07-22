import { defineField, defineType, type StringOptions } from "sanity";

import { VariantSelectInput } from "../../../components/VariantSelectInput";
import { i18nValue } from "../../previewI18n";

/**
 * A full-bleed image or a banner video with an optional caption. Self-framed:
 * it paints its own full-width band. The `media` field (imageWithAlt) carries
 * either an image or an uploaded/linked video; the variant only sets the
 * band's proportions.
 */
export const mediaBlock = defineType({
  name: "mediaBlock",
  title: "Media",
  type: "object",
  fields: [
    defineField({
      name: "enabled",
      title: "Show this section",
      description: "Turn the block off without deleting it.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "variant",
      title: "Layout",
      type: "string",
      components: { input: VariantSelectInput },
      options: {
        list: [
          { title: "Full-bleed image", value: "fullBleedImage" },
          { title: "Banner video", value: "bannerVideo" },
        ],
        thumbBase: "/static/blocks/mediaBlock",
      } as StringOptions,
      initialValue: "fullBleedImage",
    }),
    defineField({
      name: "media",
      title: "Image or video",
      type: "imageWithAlt",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    select: { caption: "caption", variant: "variant", media: "media.asset" },
    prepare: ({ caption, variant, media }) => ({
      title: i18nValue(caption) || "Media",
      subtitle: `Media — ${variant ?? "fullBleedImage"}`,
      media,
    }),
  },
});
