import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * Singleton for the /impact page. Four sections:
 *  - Hero (heading, centre image, body, button)
 *  - Why This Matters (eyebrow, split heading, body, pull-quote, attribution)
 *  - Facility image (full-bleed)
 *  - Trajectory ("From dependency to gateway") — narrative blocks beside a graphic
 */
export const impactPage = defineType({
  name: "impactPage",
  title: "Impact page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "why", title: "Why This Matters" },
    { name: "facility", title: "Facility image" },
    { name: "trajectory", title: "Trajectory" },
  ],
  fields: [
    // ───────────────────────────────────────────────────────────────── SEO ──
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

    // ──────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroHeading",
      title: "Heading",
      description: "e.g. “Impact”.",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Centre image",
      description: "The human-at-the-heart-of-the-supply-chain photo.",
      type: "imageWithAlt",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Button",
      description: "e.g. “Partner With BPI”.",
      type: "cta",
      group: "hero",
    }),

    // ──────────────────────────────────────────────────── Why This Matters ──
    defineField({
      name: "whyEyebrow",
      title: "Eyebrow",
      description: "e.g. “What We Are Building”.",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyHeadingLead",
      title: "Heading — first line",
      description: "e.g. “Why This”.",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyHeadingTrail",
      title: "Heading — second line (indented)",
      description: "e.g. “Matters”.",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyBody",
      title: "Body",
      description: "Paragraphs above the rule.",
      type: "internationalizedArrayPortableText",
      group: "why",
    }),
    defineField({
      name: "whyQuote",
      title: "Pull-quote",
      type: "internationalizedArrayPortableText",
      group: "why",
    }),
    defineField({
      name: "whyAttributionName",
      title: "Attribution name",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyAttributionDate",
      title: "Attribution date / role",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyPortrait",
      title: "Attribution portrait",
      description: "Round headshot beside the attribution.",
      type: "imageWithAlt",
      group: "why",
    }),

    // ─────────────────────────────────────────────────────── Facility image ──
    defineField({
      name: "facilityImage",
      title: "Full-bleed facility image",
      type: "imageWithAlt",
      group: "facility",
    }),

    // ────────────────────────────────────────────────────────── Trajectory ──
    defineField({
      name: "trajectoryBlocks",
      title: "Trajectory blocks",
      description:
        "Narrative beats beside the convergence graphic. Toggle “Highlight” on the present-day turning point.",
      type: "array",
      group: "trajectory",
      of: [
        defineArrayMember({
          type: "object",
          name: "trajectoryBlock",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "internationalizedArrayPortableText",
            }),
            defineField({
              name: "highlight",
              title: "Highlight (present-day turning point)",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "heading", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Impact page" }),
  },
});
