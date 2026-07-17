import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * A simple tabular block for portal pages — column headers plus rows of cells.
 * Rendered as a styled <table> behind the login.
 */
export const metricsTable = defineType({
  name: "metricsTable",
  title: "Metrics table",
  type: "object",
  fields: [
    defineField({
      name: "caption",
      title: "Caption (optional)",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "columns",
      title: "Column headers",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "row",
          fields: [
            defineField({
              name: "cells",
              title: "Cells",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { layout: "tags" },
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare: ({ cells }) => ({
              title: Array.isArray(cells) ? cells.join("  ·  ") : "(empty row)",
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { caption: "caption", columns: "columns" },
    prepare: ({ caption, columns }) => ({
      title: i18nValue(caption) || "Metrics table",
      subtitle: Array.isArray(columns) ? columns.join(", ") : undefined,
    }),
  },
});
