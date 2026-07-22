import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A two-column editorial statement — an eyebrow + heading on the left, a rich
 * body, an optional emphasized pull-line, and a button on the right. Framed by
 * the Zone's SectionFrame (surface + rhythm + width), so it just carries
 * content. No variants: one clean, on-brand statement block.
 */
export const statementSplitBlock = defineType({
  name: "statementSplitBlock",
  title: "Statement split",
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
      name: "eyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "statement",
      title: "Pull statement",
      description: "Optional emphasized takeaway line beneath the body.",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "primaryCta",
      title: "Button",
      type: "cta",
    }),
  ],
  preview: {
    select: { title: "heading", eyebrow: "eyebrow" },
    prepare: ({ title, eyebrow }) => ({
      title: i18nValue(title) || "Statement split",
      subtitle: i18nValue(eyebrow) || "Content — statement",
    }),
  },
});
