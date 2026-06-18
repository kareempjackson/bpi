import { defineField, defineType } from "sanity";

/**
 * A single headline metric (e.g. "Revenue · $4.2M · +18% YoY"), placed inline
 * in a portal page body for the data/metrics need.
 */
export const statCard = defineType({
  name: "statCard",
  title: "Stat card",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "string",
      description: 'e.g. "$4.2M", "18%", "1,204"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "delta",
      title: "Change (optional)",
      type: "string",
      description: 'e.g. "+18% YoY". Leading +/- tints it green/red.',
    }),
    defineField({
      name: "note",
      title: "Note (optional)",
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    select: { title: "label.0.value", value: "value", delta: "delta" },
    prepare: ({ title, value, delta }) => ({
      title: `${title}: ${value}`,
      subtitle: delta || undefined,
    }),
  },
});
