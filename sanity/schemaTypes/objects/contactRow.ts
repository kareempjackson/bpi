import { defineField, defineType } from "sanity";

export const contactRow = defineType({
  name: "contactRow",
  title: "Contact row",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'e.g. "Partner with us", "Find us".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      description: "Shown on the page.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "copyValue",
      title: "Copy value (optional)",
      type: "string",
      description:
        'If set, the "Copy" button copies this instead of the display value (e.g. show a friendly address but copy a phone number).',
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "value" },
  },
});
