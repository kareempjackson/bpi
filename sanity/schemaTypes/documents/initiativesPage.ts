import { defineArrayMember, defineField, defineType } from "sanity";

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
      type: "string",
      group: "seo",
      initialValue: "Initiatives — BPI",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      initialValue:
        "The deliberate projects building the Caribbean's pharmaceutical gateway. Manufacturing, supply, regulation, and partnership.",
      validation: (Rule) => Rule.required(),
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
      type: "string",
      group: "hero",
      initialValue: "Pushing from investment to impact.",
    }),
    defineField({
      name: "heroBody",
      title: "Body",
      type: "text",
      rows: 3,
      group: "hero",
      initialValue:
        "Each one a real investment, contributing to sector development across BPI's four strategic priorities.",
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
      type: "string",
      group: "workInMotion",
      initialValue: "Work in Motion",
    }),
    defineField({
      name: "workInMotionBody",
      title: "Body",
      type: "text",
      rows: 5,
      group: "workInMotion",
      initialValue:
        "BPI develops catalytic projects across pharmaceutical manufacturing, supply chain, regulatory development, and regional trade. Each project is structured from concept to bankability to execution, with the partnerships, financing, and government alignment to make it last.",
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
      name: "featuredSupportingInitiatives",
      title: "Supporting initiatives (under the banner)",
      type: "array",
      group: "featured",
      description:
        "Up to three other initiatives shown as cards beneath the featured banner. Pick them from the initiative list — title, excerpt, and link are pulled automatically. Deleted initiatives are skipped automatically.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "initiative" }],
          // Weak refs so an editor can delete an initiative without
          // Sanity blocking on this list.
          weak: true,
        }),
      ],
      validation: (Rule) => Rule.max(3),
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
      type: "string",
      group: "motionStories",
      initialValue: "Motion Stories",
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
      type: "string",
      group: "otherWorks",
      initialValue: "Initiatives",
    }),
    defineField({
      name: "otherWorksHeading",
      title: "Heading",
      type: "string",
      group: "otherWorks",
      initialValue: "Other Works",
    }),
    defineField({
      name: "otherWorksBody",
      title: "Body",
      type: "text",
      rows: 4,
      group: "otherWorks",
      initialValue:
        "Our mission is to create a pharmaceutical ecosystem where every person in the Caribbean has access to healthy, innovative, and affordable medicines while building regional manufacturing excellence.",
    }),
    defineField({
      name: "otherWorksBlueTitle",
      title: "Blue panel — title",
      type: "string",
      group: "otherWorks",
      initialValue: "Human Capital Development",
    }),
    defineField({
      name: "otherWorksBlueBody",
      title: "Blue panel — body",
      type: "text",
      rows: 3,
      group: "otherWorks",
      initialValue:
        "Building world-class pharmaceutical talent through education, training, and skills development programs",
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
      type: "string",
      group: "otherWorks",
      initialValue: "Human Capital Development",
    }),
    defineField({
      name: "otherWorksGreenBody",
      title: "Green panel — body",
      type: "text",
      rows: 3,
      group: "otherWorks",
      initialValue:
        "Building world-class pharmaceutical talent through education, training, and skills development programs",
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

    // ────────────────────────────────────────────── Building the Future ──
    defineField({
      name: "buildingFutureHeading",
      title: "Heading",
      type: "string",
      group: "buildingFuture",
      initialValue: "Building The Future Of Pharmaceutical Access",
    }),
    defineField({
      name: "buildingFutureBody",
      title: "Body",
      type: "text",
      rows: 4,
      group: "buildingFuture",
      initialValue:
        "Barbados Pharmaceuticals Inc. was established with a vision to strengthen pharmaceutical capacity within the region while supporting global healthcare advancement. We operate at the intersection of pharmaceutical production, education, research, and strategic healthcare development.",
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
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "body" },
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
  ],
  preview: {
    prepare: () => ({ title: "Initiatives page" }),
  },
});
