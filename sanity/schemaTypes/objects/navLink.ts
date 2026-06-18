import { defineField, defineType } from "sanity";

export const navLink = defineType({
  name: "navLink",
  title: "Nav link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "disabled",
      title: "Disabled (shown but unclickable)",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "label.0.value", subtitle: "href" },
  },
});
