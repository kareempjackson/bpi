import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * One card in a `carouselBlock` — an image over a title and a short body,
 * shown in a horizontal scroll-snap track. Image is the universal
 * `imageWithAlt` (accepts an image or a video poster) so cards stay on-brand.
 */
export const carouselItem = defineType({
  name: "carouselItem",
  title: "Carousel card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body", media: "image.asset" },
    prepare: ({ title, subtitle, media }) => ({
      title: i18nValue(title) || "Carousel card",
      subtitle: i18nValue(subtitle),
      media,
    }),
  },
});
