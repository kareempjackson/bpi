import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A vertical timeline — a heading over an ordered list of steps, each a
 * connector dot on an auto-numbered rail with a label and a description.
 * Reuses the shared `investorRole` model (label + description). Framed by the
 * Zone's SectionFrame (surface + rhythm + width). No variants — the sequence
 * is the design.
 */
export const timelineBlock = defineType({
  name: "timelineBlock",
  title: "Timeline",
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
      name: "steps",
      title: "Steps",
      type: "array",
      of: [{ type: "investorRole" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", steps: "steps" },
    prepare: ({ title, steps }) => ({
      title: i18nValue(title) || "Timeline",
      subtitle: `Timeline — ${steps?.length ?? 0} steps`,
    }),
  },
});
