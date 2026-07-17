import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

/**
 * Singleton document driving the public /initiatives page. Every section
 * that previously held hardcoded copy is editable here. The featured
 * initiative itself is still resolved from the `initiative` collection
 * (we just render whichever initiative has `featured: true`).
 */
export const initiativesPage = defineType({
  name: "initiativesPage",
  title: "Initiatives page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "workInMotion", title: "Work in Motion" },
    { name: "featured", title: "Featured spotlight" },
    { name: "motionStories", title: "Motion Stories" },
    { name: "otherWorks", title: "Other Works" },
    { name: "buildingFuture", title: "Building the Future" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────── SEO ──
    defineField({
      name: "seoTitle",
      title: "Page title",
      type: "internationalizedArrayString",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "internationalizedArrayText",
      group: "seo",
    }),

    // ─────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "imageWithAlt",
      group: "hero",
      description:
        "Fills the notched IncentivesShape silhouette at the top of the page.",
    }),
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "hero",
      initialValue: { label: "Partner With BPI", href: "/contact" },
    }),
    defineField({
      name: "heroSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "hero",
      initialValue: { label: "Our Ecosystem", href: "/#ecosystem" },
    }),

    // ────────────────────────────────────────────────── Work in Motion ──
    defineField({
      name: "showWorkInMotion",
      title: "Show Work in Motion section",
      type: "boolean",
      group: "workInMotion",
      description:
        "Turn off to hide the entire Work in Motion section on the public page.",
      initialValue: true,
    }),
    defineField({
      name: "workInMotionHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "workInMotion",
    }),
    defineField({
      name: "workInMotionBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "workInMotion",
    }),
    defineField({
      name: "workInMotionBg",
      title: "Panel background",
      type: "hexColor",
      group: "workInMotion",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "workInMotionPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "workInMotion",
      initialValue: { label: "Partner With BPI", href: "/contact" },
    }),
    defineField({
      name: "workInMotionSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "workInMotion",
      initialValue: { label: "Our Ecosystem", href: "/#ecosystem" },
    }),
    defineField({
      name: "workInMotionImage",
      title: "Banner image",
      type: "imageWithAlt",
      group: "workInMotion",
      description:
        "Wide image shown across the bottom of the Work in Motion section.",
    }),

    // ─────────────────────────────────────────────── Featured spotlight ──
    // Pick a single initiative to feature in the banner. Underneath the
    // banner, up to three supporting cards (e.g. partnerships, related
    // research) can be configured.
    defineField({
      name: "featuredInitiative",
      title: "Featured initiative",
      type: "reference",
      group: "featured",
      to: [{ type: "initiative" }],
      // Weak reference — lets editors delete the target initiative without
      // Studio blocking on this reference. The dangling pointer is dropped
      // from queries (filtered out below) so the page just renders without
      // that featured slot until a new one is picked.
      weak: true,
      description:
        "Select which initiative appears in the banner. Its title, excerpt, cover image, and link are pulled automatically. If you delete the referenced initiative, this slot will simply be empty until a new one is selected.",
    }),
    defineField({
      name: "featuredStatBody",
      title: "Featured stat / secondary line",
      type: "internationalizedArrayText",
      group: "featured",
      description:
        "Short supporting line shown lower-right of the featured banner (e.g. \"Producing 12 million bags annually, it creates the first pharmaceutical trade route between Africa and the Caribbean.\").",
    }),
    defineField({
      name: "featuredSupportingInitiatives",
      title: "Supporting initiatives (under the banner)",
      type: "array",
      group: "featured",
      description:
        "Other initiatives shown as cards beneath the featured banner. Pick them from the initiative list — title, excerpt, and link are pulled automatically. Deleted initiatives are skipped automatically. Cards wrap across rows on a 3-column grid; add as many as you want.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "initiative" }],
          // Weak refs so an editor can delete an initiative without
          // Sanity blocking on this list.
          weak: true,
        }),
      ],
    }),

    // ─────────────────────────────────────────────────── Motion Stories ──
    defineField({
      name: "showMotionStories",
      title: "Show Motion Stories section",
      type: "boolean",
      group: "motionStories",
      description:
        "Turn off to hide the entire Motion Stories section on the public page.",
      initialValue: true,
    }),
    defineField({
      name: "motionStoriesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "motionStories",
    }),
    defineField({
      name: "motionStoriesBg",
      title: "Panel background",
      type: "hexColor",
      group: "motionStories",
      initialValue: "#CFE9FF",
    }),
    defineField({
      name: "motionStoriesViewAllHref",
      title: "View-all link",
      type: "string",
      group: "motionStories",
      initialValue: "/news",
    }),
    defineField({
      name: "motionStoriesShowCount",
      title: "Posts to show",
      type: "number",
      group: "motionStories",
      description:
        "Tiles are pulled from posts where \"Show in Initiatives\" is on, newest first.",
      initialValue: 6,
      validation: (Rule) => Rule.min(1).max(12),
    }),

    // ──────────────────────────────────────────────────── Other Works ──
    defineField({
      name: "showOtherWorks",
      title: "Show Other Works section",
      type: "boolean",
      group: "otherWorks",
      description:
        "Turn off to hide the entire Other Works section on the public page (useful when there are no projects to show yet).",
      initialValue: true,
    }),
    defineField({
      name: "otherWorksEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksBlueTitle",
      title: "Blue panel — title",
      type: "internationalizedArrayString",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksBlueBody",
      title: "Blue panel — body",
      type: "internationalizedArrayText",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksBlueCta",
      title: "Blue panel — CTA",
      type: "cta",
      group: "otherWorks",
      initialValue: {
        label: "Learn More",
        href: "/initiatives/human-capital",
      },
    }),
    defineField({
      name: "otherWorksBlueBg",
      title: "Blue panel — background",
      type: "hexColor",
      group: "otherWorks",
      initialValue: "#CFE9FF",
    }),
    defineField({
      name: "otherWorksGreenTitle",
      title: "Green panel — title",
      type: "internationalizedArrayString",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksGreenBody",
      title: "Green panel — body",
      type: "internationalizedArrayText",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksGreenBg",
      title: "Green panel — background",
      type: "hexColor",
      group: "otherWorks",
      initialValue: "#A5F9D2",
    }),
    defineField({
      name: "otherWorksTopRightImages",
      title: "Top-right image grid (up to 2)",
      type: "array",
      group: "otherWorks",
      of: [defineArrayMember({ type: "imageWithAlt" })],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: "otherWorksBottomLeftImage",
      title: "Bottom-left image",
      type: "imageWithAlt",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksInitiatives",
      title: "Other initiatives (cards)",
      type: "array",
      group: "otherWorks",
      description:
        "Initiatives shown as mint cards in the right-hand masonry. Each card pulls its tag, title, cover image, and description automatically. Pick up to ~6.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "initiative" }],
          weak: true,
        }),
      ],
    }),
    defineField({
      name: "otherWorksFeaturedTitle",
      title: "Featured tile — title",
      type: "internationalizedArrayString",
      group: "otherWorks",
      description:
        "Large dark media tile shown below the cards (e.g. a flagship story).",
    }),
    defineField({
      name: "otherWorksFeaturedImage",
      title: "Featured tile — image",
      type: "imageWithAlt",
      group: "otherWorks",
    }),
    defineField({
      name: "otherWorksFeaturedHref",
      title: "Featured tile — link",
      type: "string",
      group: "otherWorks",
    }),

    // ────────────────────────────────────────────── Building the Future ──
    defineField({
      name: "buildingFutureHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "buildingFuture",
    }),
    defineField({
      name: "buildingFutureBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "buildingFuture",
    }),
    defineField({
      name: "buildingFutureStats",
      title: "Stats",
      type: "array",
      group: "buildingFuture",
      of: [
        defineArrayMember({
          type: "object",
          name: "futureStat",
          fields: [
            defineField({
              name: "value",
              title: "Value (e.g. \"13000 +\")",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "internationalizedArrayText",
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: i18nValue(title),
              subtitle: i18nValue(subtitle),
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "buildingFutureStatBg",
      title: "Stat-card background",
      type: "hexColor",
      group: "buildingFuture",
      initialValue: "#A5F9D2",
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
    prepare: () => ({ title: "Initiatives page" }),
  },
});
