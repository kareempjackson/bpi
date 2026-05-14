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
      type: "array",
      description:
        "Biography shown on leader detail and modal views. Supports rich text — paragraphs, bold/italic, lists, and links.",
      of: [
        {
          type: "block",
          styles: [
            { title: "Body", value: "normal" },
            { title: "Heading", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Underline", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                title: "External link",
                type: "object",
                fields: [
                  {
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  },
                ],
              },
            ],
          },
        },
      ],
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
