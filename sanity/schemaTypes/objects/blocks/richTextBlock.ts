import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * The content workhorse — an optional heading over a rich WYSIWYG body. Framed
 * by the Zone's SectionFrame (surface + rhythm + width), so it just carries
 * content. No variants: one clean, on-brand prose block.
 */
export const richTextBlock = defineType({
  name: "richTextBlock",
  title: "Rich text",
  type: "object",
  fields: [
    defineField({
      name: "enabled",
      title: "Show this section",
      description: "Turn the block off without deleting it.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "heading",
      title: "Heading",
      description: "Optional. Leave empty for a body-only block.",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
    }),
  ],
  preview: {
    select: { title: "heading", body: "body" },
    prepare: ({ title, body }) => ({
      title: i18nValue(title) || "Rich text",
      subtitle: "Content — rich text",
      media: undefined,
      body,
    }),
  },
});
