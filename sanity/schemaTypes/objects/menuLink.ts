import { defineArrayMember, defineField, defineType } from "sanity";

export const menuLink = defineType({
  name: "menuLink",
  title: "Menu link",
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
      title: "Media (shown when this link is hovered)",
      type: "menuMedia",
    }),
    defineField({
      name: "subItems",
      title: "Sub-links",
      description:
        "Optional. When present, hovering this link reveals these in a side panel.",
      type: "array",
      of: [defineArrayMember({ type: "menuSubLink" })],
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
