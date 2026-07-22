import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const prioritiesPage = defineType({
  name: "prioritiesPage",
  title: "Priorities page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "stats", title: "Impact stats" },
    { name: "priorities", title: "Strategic priorities" },
    { name: "latest", title: "Latest from BPI" },
    { name: "sections", title: "Page sections" },
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
      name: "heroBody",
      title: "Intro paragraph",
      type: "internationalizedArrayPortableText",
      group: "hero",
    }),
    defineField({
      name: "heroHeadlineLine1",
      title: "Headline line 1 (white)",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroHeadlineLine2",
      title: "Headline line 2 (green)",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Button",
      type: "cta",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      description:
        "Team / feature image beside the headline. Falls back to the Home page's narrative image when empty.",
      type: "imageWithAlt",
      group: "hero",
    }),

    // ──────────────────────────────────────────────────────── Impact stats ──
    defineField({
      name: "showStats",
      title: "Show impact stats section",
      description:
        "Off by default. Turn on to show the green impact-stats band below the hero.",
      type: "boolean",
      group: "stats",
      initialValue: false,
    }),
    defineField({
      name: "statsIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayPortableText",
      group: "stats",
    }),
    defineField({
      name: "statsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "stats",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "stats",
      of: [defineArrayMember({ type: "stat" })],
      validation: (Rule) => Rule.max(5),
    }),

    // ────────────────────────────────────────────── Strategic priorities ──
    defineField({
      name: "prioritiesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "priorities",
    }),
    defineField({
      name: "prioritiesIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayPortableText",
      group: "priorities",
    }),
    defineField({
      name: "priorities",
      title: "Priorities (numbered list)",
      type: "array",
      group: "priorities",
      of: [
        defineArrayMember({
          type: "object",
          name: "priorityItem",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "internationalizedArrayString",
            }),
          ],
          preview: {
            select: { title: "label" },
            prepare: ({ title }) => ({ title: i18nValue(title) }),
          },
        }),
      ],
    }),
    defineField({
      name: "prioritiesCta",
      title: "Button",
      type: "cta",
      group: "priorities",
    }),
    defineField({
      name: "prioritiesImage",
      title: "Wide facility image",
      description:
        "Full-width image beneath the list. Falls back to the Home page's building image when empty.",
      type: "imageWithAlt",
      group: "priorities",
    }),

    // ─────────────────────────────────────────────────── Latest from BPI ──
    defineField({
      name: "latestHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "latest",
    }),
    defineField({
      name: "latestShowCount",
      title: "Number of posts to show",
      description:
        "Pulls the newest published posts. The first is shown as the large feature card. Set to 0 to hide the section.",
      type: "number",
      group: "latest",
      initialValue: 3,
      validation: (Rule) => Rule.min(0).max(9).integer(),
    }),

    // ──────────────────────────────────────────────────────── Page sections ──
    defineField({
      name: "pageSections",
      title: "Page sections",
      description:
        "Add and reorder modular sections (Call to Action, Careers) shown at the bottom of this page. Each can have its own copy, links, and image or video.",
      type: "array",
      group: "sections",
      of: [
        defineArrayMember({ type: "ctaSection" }),
        defineArrayMember({ type: "careersSection" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Priorities page" }),
  },
});
