import { defineField, defineType } from "sanity";

export const leader = defineType({
  name: "leader",
  title: "Leader",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "image",
      title: "Portrait",
      type: "imageWithAlt",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "internationalizedArrayPortableText",
      description:
        "Biography shown on leader detail and modal views. Supports rich text — paragraphs, bold/italic, lists, and links.",
    }),
    defineField({
      name: "linkedin",
      title: "LinkedIn URL",
      type: "url",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"] }).custom((value) => {
          if (!value) return true;
          return /linkedin\.com/i.test(value)
            ? true
            : "Must be a linkedin.com URL.";
        }),
    }),
  ],
  preview: {
    select: { title: "name.0.value", subtitle: "role", media: "image.asset" },
  },
});
