import { defineField, defineType } from "sanity";

// Internationalized-array fields preview as `[{ _key, language, value }]`; pull
// the English (or first) value out for the Studio preview title.
function i18nValue(field: unknown): string | undefined {
  if (typeof field === "string") return field;
  if (Array.isArray(field)) {
    const items = field as { language?: string; value?: string }[];
    return (items.find((i) => i?.language === "en") ?? items[0])?.value;
  }
  return undefined;
}

/**
 * Reusable "Call to action" page block (the BuildingSection layout). Added to a
 * page's `pageSections` list and configured per-instance — heading, body, two
 * buttons, an image or video, and a colour tone.
 */
export const ctaSection = defineType({
  name: "ctaSection",
  title: "Call to action",
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
      name: "body",
      title: "Body",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "media",
      title: "Image or video",
      type: "imageWithAlt",
    }),
    defineField({
      name: "primaryCta",
      title: "Primary button",
      type: "cta",
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary button",
      type: "cta",
    }),
    defineField({
      name: "tone",
      title: "Colour tone",
      type: "string",
      options: {
        list: [
          { title: "Green", value: "green" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
      initialValue: "green",
    }),
  ],
  preview: {
    select: { heading: "heading", media: "media.asset" },
    prepare: ({ heading, media }) => ({
      title: i18nValue(heading) || "Call to action",
      subtitle: "Call-to-action section",
      media,
    }),
  },
});
