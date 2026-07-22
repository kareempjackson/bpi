import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const priorityCard = defineType({
  name: "priorityCard",
  title: "Priority card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title (eyebrow)",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Card background color",
      type: "hexColor",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description", media: "image.asset" },
    prepare: ({ title, subtitle, media }) => ({
      title: i18nValue(title),
      subtitle: i18nValue(subtitle),
      media,
    }),
  },
});
