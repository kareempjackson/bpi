import { defineArrayMember, defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "vision", title: "Vision" },
    { name: "difference", title: "Difference We Make" },
    { name: "mission", title: "Mission" },
    { name: "stats", title: "By the Numbers" },
    { name: "banner", title: "Banner" },
    { name: "initiatives", title: "Initiatives" },
    { name: "leadership", title: "Leadership" },
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
      name: "heroImage",
      title: "Hero image",
      type: "imageWithAlt",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "internationalizedArrayText",
      group: "hero",
      description: "Line breaks are preserved.",
    }),
    defineField({
      name: "heroSubheading",
      title: "Subheading",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Hero CTA",
      type: "cta",
      group: "hero",
      initialValue: { label: "Partner with BPI", href: "/contact" },
    }),

    // ───────────────────────────────────────────────────────────── Vision ──
    defineField({
      name: "visionHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "vision",
    }),
    defineField({
      name: "visionDescription",
      title: "Description",
      type: "internationalizedArrayText",
      group: "vision",
    }),
    defineField({
      name: "visionPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "vision",
      initialValue: { label: "Partner With BPI", href: "/contact" },
    }),
    defineField({
      name: "visionSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "vision",
      initialValue: { label: "Explore Our Impact", href: "/#initiative" },
    }),
    defineField({
      name: "visionBg",
      title: "Section background color",
      type: "hexColor",
      group: "vision",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "pillars",
      title: "Pillars",
      type: "array",
      group: "vision",
      of: [defineArrayMember({ type: "pillar" })],
      validation: (Rule) => Rule.min(1),
    }),

    // ───────────────────────────────────────────── Difference We Make ──
    defineField({
      name: "differenceEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "difference",
    }),
    defineField({
      name: "differenceHeading",
      title: "Heading",
      description:
        "Use line breaks to control the staircase: the first line is left-aligned, every line after it is pushed to the right.",
      type: "internationalizedArrayText",
      group: "difference",
    }),
    defineField({
      name: "differenceBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "difference",
    }),
    defineField({
      name: "differenceTagline",
      title: "Tagline (smaller line below a divider)",
      type: "internationalizedArrayText",
      group: "difference",
    }),

    // ──────────────────────────────────────────────────────────── Mission ──
    defineField({
      name: "missionHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "mission",
    }),
    defineField({
      name: "missionDescription",
      title: "Description",
      type: "internationalizedArrayText",
      group: "mission",
    }),
    defineField({
      name: "missionCards",
      title: "Mission cards",
      type: "array",
      group: "mission",
      of: [defineArrayMember({ type: "missionCard" })],
    }),

    // ──────────────────────────────────────────── Stats / By the Numbers ──
    defineField({
      name: "statsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "stats",
    }),
    defineField({
      name: "statsDescription",
      title: "Description",
      type: "internationalizedArrayText",
      group: "stats",
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "stats",
      of: [defineArrayMember({ type: "stat" })],
    }),

    // ───────────────────────────────────────────────────────────── Banner ──
    defineField({
      name: "bannerImage",
      title: "Mid-page banner image",
      type: "imageWithAlt",
      group: "banner",
    }),

    // ──────────────────────────────────────────────────────── Initiatives ──
    defineField({
      name: "initiativesEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "initiatives",
    }),
    defineField({
      name: "initiativesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "initiatives",
    }),
    defineField({
      name: "initiativesShowCount",
      title: "Number of initiatives to show",
      type: "number",
      group: "initiatives",
      description:
        "Edit individual initiatives in the Initiatives list. The latest N (featured first) are shown here.",
      initialValue: 4,
      validation: (Rule) => Rule.min(0).max(12).integer(),
    }),

    // ───────────────────────────────────────────────────────── Leadership ──
    defineField({
      name: "leadershipHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "leadership",
    }),
    defineField({
      name: "leadershipDescription",
      title: "Description",
      type: "internationalizedArrayText",
      group: "leadership",
    }),
    defineField({
      name: "leadershipBg",
      title: "Section background color",
      type: "hexColor",
      group: "leadership",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "leaders",
      title: "Leaders",
      type: "array",
      group: "leadership",
      of: [defineArrayMember({ type: "leader" })],
    }),
    defineField({
      name: "leadershipContactHeading",
      title: "Contact card heading",
      type: "internationalizedArrayString",
      group: "leadership",
    }),
    defineField({
      name: "leadershipContactDescription",
      title: "Contact card description",
      type: "internationalizedArrayText",
      group: "leadership",
    }),
    defineField({
      name: "leadershipContactPrimaryCta",
      title: "Contact card primary CTA",
      type: "cta",
      group: "leadership",
      initialValue: { label: "Contact Us", href: "/contact" },
    }),
    defineField({
      name: "leadershipContactSecondaryCta",
      title: "Contact card secondary CTA",
      type: "cta",
      group: "leadership",
      initialValue: { label: "Our initiatives", href: "/#initiative" },
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
    prepare: () => ({ title: "About page" }),
  },
});
