import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * One tab in a `tabsBlock` — a short tab title and a rich body panel shown
 * when the tab is active. Body is Portable Text so a panel can carry
 * paragraphs, lists, and emphasis, rendered through the shared PortableTextBody.
 */
export const tabItem = defineType({
  name: "tabItem",
  title: "Tab",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Tab title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: i18nValue(title) || "Tab",
      subtitle: "Tab panel",
    }),
  },
});
