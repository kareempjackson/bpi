import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The /sectors landing page (singleton). Controls the hero, the "The Six"
 * intro, the Latest-from-BPI heading, and the modular blocks at the foot of the
 * page. The six sector cards themselves are separate `sector` documents; this
 * document only frames them.
 */
export const sectorsPage = defineType({
  name: "sectorsPage",
  title: "Sectors page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "six", title: "The Six" },
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
      name: "heroHeading",
      title: "Headline",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroBody",
      title: "Intro paragraph",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Button",
      description:
        "Defaults to an “Explore Sectors” button that jumps to the list below.",
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

    // ──────────────────────────────────────────────────────────── The Six ──
    defineField({
      name: "sixHeading",
      title: "Heading",
      description: "e.g. “The Six”.",
      type: "internationalizedArrayString",
      group: "six",
    }),
    defineField({
      name: "sixIntro",
      title: "Intro paragraph",
      type: "internationalizedArrayText",
      group: "six",
    }),

    // ─────────────────────────────────────────────────── Latest from BPI ──
    defineField({
      name: "latestHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "latest",
    }),

    // ──────────────────────────────────────────────────────── Page sections ──
    defineField({
      name: "pageSections",
      title: "Page sections",
      description:
        "Add and reorder modular sections (Call to Action, Careers) shown at the bottom of this page. When empty, the page falls back to the Home page's Careers + Call-to-action blocks.",
      type: "array",
      group: "sections",
      of: [
        defineArrayMember({ type: "ctaSection" }),
        defineArrayMember({ type: "careersSection" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Sectors page" }),
  },
});
