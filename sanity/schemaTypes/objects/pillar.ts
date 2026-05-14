import { defineField, defineType } from "sanity";

export const pillar = defineType({
  name: "pillar",
  title: "Pillar",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
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
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      validation: (Rule) => Rule.required(),
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
  },
});
