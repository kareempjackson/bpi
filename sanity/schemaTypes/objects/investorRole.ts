import { defineField, defineType } from "sanity";

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
    select: { title: "label.0.value", subtitle: "description.0.value" },
  },
});
