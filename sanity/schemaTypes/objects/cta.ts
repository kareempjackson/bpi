import { defineField, defineType } from "sanity";

export const cta = defineType({
  name: "cta",
  title: "Call to action",
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
      description:
        "Internal path (e.g. /contact) or full URL (https://...).",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "label.0.value", subtitle: "href" },
  },
});
