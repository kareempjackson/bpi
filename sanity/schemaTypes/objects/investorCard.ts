import { defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * One of the "Why Barbados, Why Now" cards on the Investors page — a title
 * pinned to the top of a colour block with the body copy anchored to its
 * bottom. Colour is per-card so the row can alternate (white / mint blue /
 * green in the approved design).
 */
export const investorCard = defineType({
  name: "investorCard",
  title: "Investor card",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "bg",
      title: "Background color",
      type: "hexColor",
      initialValue: "#FFFFFF",
    }),
    defineField({
      name: "watermark",
      title: "Show BPI icon watermark",
      description:
        "Adds the faint molecule mark behind the card. Reads best on the green card only.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body" },
    prepare: ({ title, subtitle }) => ({
      title: i18nValue(title),
      subtitle: i18nValue(subtitle),
    }),
  },
});
