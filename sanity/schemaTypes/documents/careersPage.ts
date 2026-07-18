import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const careersPage = defineType({
  name: "careersPage",
  title: "Careers page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "why", title: "Why work with us" },
    { name: "apply", title: "How you'll apply" },
    { name: "jobs", title: "Jobs section" },
    { name: "legal", title: "Equal opportunity" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────────── SEO ──
    defineField({
      name: "seoTitle",
      title: "Page title (browser tab & SEO)",
      type: "internationalizedArrayString",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "internationalizedArrayText",
      group: "seo",
    }),

    // ─────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroHeadlineLine1",
      title: "Headline (white)",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroHeadlineHighlight",
      title: "Headline highlight (green)",
      description:
        'Accent line shown in green beside the hero image — e.g. "Be Part of our Mission".',
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroDescription",
      title: "Description",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image (clipped to CareerShape)",
      type: "imageWithAlt",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),

    // ────────────────────────────────────────────────── Why work with us ──
    defineField({
      name: "whyHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayText",
      group: "why",
    }),
    defineField({
      name: "whyImage",
      title: "Portrait image",
      type: "imageWithAlt",
      group: "why",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whySections",
      title: "Narrative blocks",
      type: "array",
      group: "why",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
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
    defineField({
      name: "whyBulletsHeading",
      title: "Bullets heading",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyBullets",
      title: "Bullet list",
      type: "array",
      group: "why",
      of: [defineArrayMember({ type: "string" })],
      initialValue: [
        "Opportunities for professional growth",
        "Collaborative and inclusive work culture",
        "Innovation-driven environment",
        "Meaningful impact on healthcare delivery",
        "Commitment to excellence and sustainability",
      ],
    }),

    // ──────────────────────────────────────────────────── How you'll apply ──
    defineField({
      name: "applyHeading",
      title: "Heading",
      description: "e.g. “How You'll Apply”.",
      type: "internationalizedArrayString",
      group: "apply",
    }),
    defineField({
      name: "applyBody",
      title: "Body",
      description:
        "Explanation shown above the jobs list. Separate paragraphs with a blank line.",
      type: "internationalizedArrayText",
      group: "apply",
    }),

    // ──────────────────────────────────────────────────────── Jobs panel ──
    defineField({
      name: "jobsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "jobs",
    }),
    defineField({
      name: "jobsDescription",
      title: "Description",
      type: "internationalizedArrayText",
      group: "jobs",
    }),
    defineField({
      name: "jobsSearchPlaceholder",
      title: "Search placeholder",
      type: "internationalizedArrayString",
      group: "jobs",
    }),
    defineField({
      name: "jobsFindButtonLabel",
      title: "Find-job button label (leave blank to hide)",
      type: "internationalizedArrayString",
      group: "jobs",
    }),
    defineField({
      name: "jobsBg",
      title: "Panel background color",
      type: "hexColor",
      group: "jobs",
      initialValue: "#CAF1FF",
    }),

    // ───────────────────────────────────────────── Equal opportunity ──
    defineField({
      name: "equalOpportunityParagraph1",
      title: "Paragraph 1",
      type: "internationalizedArrayText",
      group: "legal",
    }),
    defineField({
      name: "equalOpportunityParagraph2",
      title: "Paragraph 2",
      type: "internationalizedArrayText",
      group: "legal",
    }),
    defineField({
      name: "equalOpportunityBg",
      title: "Background color",
      type: "hexColor",
      group: "legal",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "pageSections",
      title: "Page sections",
      description:
        "Add and reorder modular sections (Call to Action, Careers) shown at the bottom of this page. Each can have its own copy, links, and image or video.",
      type: "array",
      of: [
        defineArrayMember({ type: "ctaSection" }),
        defineArrayMember({ type: "careersSection" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Careers page" }),
  },
});
