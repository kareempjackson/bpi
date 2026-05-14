import { defineField, defineType } from "sanity";

export const priorityCard = defineType({
  name: "priorityCard",
  title: "Priority card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title (eyebrow)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
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
  },
});
