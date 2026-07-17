import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const contactRow = defineType({
  name: "contactRow",
  title: "Contact row",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
      description: 'e.g. "Partner with us", "Find us".',
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "internationalizedArrayString",
      description: "Shown on the page.",
    }),
    defineField({
      name: "copyValue",
      title: "Copy value (optional)",
      type: "internationalizedArrayString",
      description:
        'If set, the "Copy" button copies this instead of the display value (e.g. show a friendly address but copy a phone number).',
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "value" },
    prepare: ({ title, subtitle }) => ({ title: i18nValue(title), subtitle }),
  },
});
