import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * A standalone paragraph in a grid — used for the Investment Incentives items.
 *
 * It's an object wrapping a single field rather than a plain string array
 * because the copy is translatable, and `internationalizedArrayText` is itself
 * an array type: Sanity can't nest an array directly inside an array.
 */
export const investorNote = defineType({
  name: "investorNote",
  title: "Note",
  type: "object",
  fields: [
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayText",
    }),
  ],
  preview: {
    select: { title: "body" },
    prepare: ({ title }) => ({ title: i18nValue(title) }),
  },
});
