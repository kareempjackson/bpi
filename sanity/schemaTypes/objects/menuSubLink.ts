import { defineField, defineType } from "sanity";

export const menuSubLink = defineType({
  name: "menuSubLink",
  title: "Sub-link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "media",
      title: "Media (shown when this sub-link is hovered)",
      type: "menuMedia",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
