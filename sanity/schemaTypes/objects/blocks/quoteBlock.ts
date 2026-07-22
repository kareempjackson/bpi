import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A single pull-quote spotlight in its own colour band (self-framed) — eyebrow,
 * the quote, an attribution (name + title), and an optional portrait. Band
 * colour is a brand hex (default deep green). One clean variant; more quote
 * families can fold in later behind the same content model.
 */
export const quoteBlock = defineType({
  name: "quoteBlock",
  title: "Quote",
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
      name: "quote",
      title: "Quote",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "attributionName",
      title: "Attribution — name",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "attributionTitle",
      title: "Attribution — title / role",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "imageWithAlt",
    }),
    defineField({
      name: "bg",
      title: "Band colour",
      description: "The background of the quote band.",
      type: "hexColor",
      initialValue: "#13362A",
    }),
  ],
  preview: {
    select: { title: "quote", name: "attributionName", media: "portrait.asset" },
    prepare: ({ title, name, media }) => ({
      title: i18nValue(title) || "Quote",
      subtitle: i18nValue(name) || "Quote",
      media,
    }),
  },
});
