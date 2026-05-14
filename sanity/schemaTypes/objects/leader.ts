import { defineField, defineType } from "sanity";

export const leader = defineType({
  name: "leader",
  title: "Leader",
  type: "object",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (Rule) => Rule.required(),
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
      type: "text",
      rows: 5,
      description: "Short biography shown on leader detail or modal views.",
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
    select: { title: "name", subtitle: "role", media: "image.asset" },
  },
});
