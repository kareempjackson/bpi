import { defineField, defineType, type StringOptions } from "sanity";

import { VariantSelectInput } from "../../../components/VariantSelectInput";
import { i18nValue } from "../../previewI18n";

/**
 * A band of animated count-up stats — either as filled cards or a bare, rule-
 * divided row. Framed by the Zone. Reuses the shared `stat` object type (value
 * + description), so existing stat content models straight in.
 */
export const statsBlock = defineType({
  name: "statsBlock",
  title: "Stats",
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
          { title: "Filled cards", value: "filledCards" },
          { title: "Bare columns", value: "bareColumns" },
        ],
        thumbBase: "/static/blocks/statsBlock",
      } as StringOptions,
      initialValue: "filledCards",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "lead",
      title: "Lead",
      description: "Optional intro line above the stats.",
      type: "internationalizedArrayPortableText",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [{ type: "stat" }],
      validation: (Rule) => Rule.min(1).max(8),
    }),
  ],
  preview: {
    select: { title: "heading", variant: "variant", stats: "stats" },
    prepare: ({ title, variant, stats }) => ({
      title: i18nValue(title) || "Stats",
      subtitle: `Stats — ${variant ?? "filledCards"} · ${stats?.length ?? 0} items`,
    }),
  },
});
