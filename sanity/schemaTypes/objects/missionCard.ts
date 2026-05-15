import { defineField, defineType } from "sanity";

export const missionCard = defineType({
  name: "missionCard",
  title: "Mission card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      title: "Link (optional)",
      type: "string",
      description:
        "If set, the card links to this URL. Leave blank to render the card as a plain block (no link).",
    }),
    defineField({
      name: "eyebrow",
      title: "Eyebrow (next to logo)",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
    }),
    defineField({
      name: "bg",
      title: "Background color",
      type: "hexColor",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "href", media: "image.asset" },
  },
});
