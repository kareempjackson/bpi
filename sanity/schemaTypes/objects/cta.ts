import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description:
        "Internal path (e.g. /contact) or full URL (https://...).",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
    prepare: ({ title, subtitle }) => ({ title: i18nValue(title), subtitle }),
  },
});
