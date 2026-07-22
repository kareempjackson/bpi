import { defineField, defineType, type StringOptions } from "sanity";

import { VariantSelectInput } from "../../../components/VariantSelectInput";
import { i18nValue } from "../../previewI18n";

/**
 * Label / description rows — as a ruled two-column table, a stacked list, or an
 * auto-numbered list. Framed by the Zone. Reuses the shared `investorRole`
 * object type (label + description), so existing role/step content models
 * straight in. The variant is a simple CSS difference; all three are wired.
 */
export const listBlock = defineType({
  name: "listBlock",
  title: "List",
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
      name: "variant",
      title: "Layout",
      type: "string",
      components: { input: VariantSelectInput },
      options: {
        list: [
          { title: "Ruled rows", value: "ruledRows" },
          { title: "Stacked list", value: "stackedList" },
          { title: "Numbered list", value: "numberedList" },
        ],
        thumbBase: "/static/blocks/listBlock",
      } as StringOptions,
      initialValue: "ruledRows",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      description: "Optional intro line above the list.",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "investorRole" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", variant: "variant", items: "items" },
    prepare: ({ title, variant, items }) => ({
      title: i18nValue(title) || "List",
      subtitle: `List — ${variant ?? "ruledRows"} · ${items?.length ?? 0} items`,
    }),
  },
});
