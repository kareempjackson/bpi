import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * Singleton for the /partners page. The header (heading, centre image, body,
 * button) plus repeatable partner-category groups (eyebrow + split heading + a
 * row of tone-coloured partner cards).
 */
export const partnersPage = defineType({
  name: "partnersPage",
  title: "Partners page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "groups", title: "Partner groups" },
  ],
  fields: [
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "internationalizedArrayString",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "internationalizedArrayText",
      group: "seo",
    }),

    defineField({
      name: "heroHeading",
      title: "Heading",
      description: "e.g. “Partners”.",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Centre image",
      type: "imageWithAlt",
      group: "hero",
    }),
    defineField({
      name: "heroBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Button",
      description: "e.g. “Partner With BPI”.",
      type: "cta",
      group: "hero",
    }),

    // ─────────────────────────────────────────────────────── Partner groups ──
    defineField({
      name: "partnerGroups",
      title: "Partner groups",
      description:
        "Each group is a category (e.g. Industry & Manufacturing) — an eyebrow, a two-line heading, and a row of partner cards.",
      type: "array",
      group: "groups",
      of: [
        defineArrayMember({
          type: "object",
          name: "partnerGroup",
          fields: [
            defineField({
              name: "eyebrow",
              title: "Eyebrow",
              description: "e.g. “What We Are Building”.",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "headingLead",
              title: "Heading — first line",
              description: "e.g. “Industry”.",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "headingTrail",
              title: "Heading — second line (indented)",
              description: "e.g. “& Manufacturing”.",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "layout",
              title: "Layout",
              description:
                "Cards = a row of colour-toned cards. List = a numbered list with descriptions, an optional button, and a full-width image below.",
              type: "string",
              options: {
                list: [
                  { title: "Cards", value: "cards" },
                  { title: "List", value: "list" },
                  { title: "Panel (green, columns)", value: "panel" },
                  { title: "Feature (image + caption)", value: "feature" },
                  { title: "Split (image + text)", value: "split" },
                ],
                layout: "radio",
              },
              initialValue: "cards",
            }),
            defineField({
              name: "cards",
              title: "Partner cards / list items",
              description:
                "In the Cards layout each is a colour card; in the List layout each is a numbered row (tone ignored).",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "partnerCard",
                  fields: [
                    defineField({
                      name: "title",
                      title: "Partner name",
                      type: "internationalizedArrayString",
                    }),
                    defineField({
                      name: "description",
                      title: "Description",
                      type: "internationalizedArrayText",
                    }),
                    defineField({
                      name: "tone",
                      title: "Tone",
                      type: "string",
                      options: {
                        list: [
                          { title: "White", value: "white" },
                          { title: "Blue", value: "blue" },
                          { title: "Green", value: "green" },
                        ],
                        layout: "radio",
                      },
                      initialValue: "white",
                    }),
                  ],
                  preview: {
                    select: { title: "title", subtitle: "description" },
                    prepare: ({ title, subtitle }) => ({
                      title: i18nValue(title),
                      subtitle: i18nValue(subtitle),
                    }),
                  },
                }),
              ],
            }),
            defineField({
              name: "cta",
              title: "Primary button",
              description:
                "Below the list (List) or top-right beside the heading (Panel).",
              type: "cta",
            }),
            defineField({
              name: "secondaryCta",
              title: "Secondary button (Panel layout)",
              description: "Outlined button beside the primary, e.g. “Explore Our Impact”.",
              type: "cta",
            }),
            defineField({
              name: "image",
              title: "Image (List / Feature layout)",
              description:
                "Full-width image below the list, or the feature photo with the first card's title + description overlaid.",
              type: "imageWithAlt",
            }),
          ],
          preview: {
            select: { title: "headingLead", subtitle: "eyebrow" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title) || "Partner group",
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Partners page" }),
  },
});
