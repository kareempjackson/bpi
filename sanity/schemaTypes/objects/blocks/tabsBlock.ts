import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A tabbed panel — a heading over a row of tab buttons; clicking a tab reveals
 * its rich body. Reuses the new `tabItem` object (title + Portable Text body).
 * Framed by the Zone's SectionFrame. Interaction lives in the client renderer
 * (app/components/sections/TabsBlock.tsx). No variants.
 */
export const tabsBlock = defineType({
  name: "tabsBlock",
  title: "Tabs",
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
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "tabs",
      title: "Tabs",
      type: "array",
      of: [{ type: "tabItem" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", tabs: "tabs" },
    prepare: ({ title, tabs }) => ({
      title: i18nValue(title) || "Tabs",
      subtitle: `Tabs — ${tabs?.length ?? 0} panels`,
    }),
  },
});
