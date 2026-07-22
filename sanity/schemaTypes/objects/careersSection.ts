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
 * Reusable "Careers" page block (the CareersSection layout). Added to a page's
 * `pageSections` list and configured per-instance — eyebrow, heading, lead,
 * body, two buttons, an image or video, and a colour tone.
 */
export const careersSection = defineType({
  name: "careersSection",
  title: "Careers",
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
      name: "eyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayPortableText",
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
          { title: "Mint", value: "mint" },
          { title: "Blue", value: "blue" },
        ],
        layout: "radio",
      },
      initialValue: "mint",
    }),
  ],
  preview: {
    select: { heading: "heading", media: "media.asset" },
    prepare: ({ heading, media }) => ({
      title: i18nValue(heading) || "Careers",
      subtitle: "Careers section",
      media,
    }),
  },
});
