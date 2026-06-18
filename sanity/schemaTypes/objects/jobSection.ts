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
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "content",
      title: "Content",
      description:
        "Use the toolbar to switch between numbered and bulleted lists, add bold / italic, and insert links.",
      type: "internationalizedArrayPortableText",
    }),
  ],
  preview: {
    select: { title: "title.0.value" },
    prepare: ({ title }) => ({ title: title ?? "Untitled section" }),
  },
});
