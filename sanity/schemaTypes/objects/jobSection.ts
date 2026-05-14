import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Titled rich-text block used on the Job detail page. Each section gets a
 * heading + Portable Text body so editors can use numbered lists, bullets,
 * bold, italic, and inline links from the Sanity toolbar.
 */
export const jobSection = defineType({
  name: "jobSection",
  title: "Job section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Use the toolbar to switch between numbered and bulleted lists, add bold / italic, and insert links.",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [
            { title: "Numbered", value: "number" },
            { title: "Bulleted", value: "bullet" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) =>
                      Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
                  }),
                ],
              },
            ],
          },
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title ?? "Untitled section" }),
  },
});
