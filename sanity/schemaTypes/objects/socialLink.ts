import { defineField, defineType } from "sanity";

export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      title: "Network",
      type: "string",
      options: {
        list: [
          { title: "Website", value: "Website" },
          { title: "LinkedIn", value: "LinkedIn" },
          { title: "X", value: "X" },
          { title: "Instagram", value: "Instagram" },
          { title: "YouTube", value: "YouTube" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Accessible label (optional, defaults to network name)",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "kind", subtitle: "href" },
  },
});
