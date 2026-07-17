import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * One row of the "How BPI Works" table on the Investors page — a role name
 * against what BPI actually does in it.
 */
export const investorRole = defineType({
  name: "investorRole",
  title: "Role",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Role",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "description" },
    prepare: ({ title, subtitle }) => ({
      title: i18nValue(title),
      subtitle: i18nValue(subtitle),
    }),
  },
});
