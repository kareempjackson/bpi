import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * Managed blog taxonomy. Posts reference these, and the /blog sidebar's filter
 * checkboxes + the card pills are generated from the tag list — so editors get
 * a consistent, typo-free set of tags they can reorder and recolor.
 */
export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Pill color (optional)",
      type: "hexColor",
      description:
        "Tints the tag pill on cards. Leave blank to use the default brand color.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
    prepare: ({ title, subtitle }) => ({ title: i18nValue(title), subtitle }),
  },
});
