import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const stat = defineType({
  name: "stat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      type: "internationalizedArrayString",
      description:
        "The big number, including any prefix/suffix (e.g. $31.3M, 180M, €3M). The number portion animates on scroll.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "internationalizedArrayText",
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "description" },
    prepare: ({ title, subtitle }) => ({
      title: i18nValue(title),
      subtitle: i18nValue(subtitle),
    }),
  },
});
