import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A horizontal scroll-snap carousel — a heading, intro, and a track of image
 * cards with prev/next controls. Reuses the new `carouselItem` object (title +
 * body + image). Framed by the Zone's SectionFrame. Interaction lives in the
 * client renderer (app/components/sections/CarouselBlock.tsx). No variants.
 */
export const carouselBlock = defineType({
  name: "carouselBlock",
  title: "Carousel",
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
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "slides",
      title: "Cards",
      type: "array",
      of: [{ type: "carouselItem" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", slides: "slides" },
    prepare: ({ title, slides }) => ({
      title: i18nValue(title) || "Carousel",
      subtitle: `Carousel — ${slides?.length ?? 0} cards`,
    }),
  },
});
