import { defineArrayMember, defineField, defineType } from "sanity";

export const careersPage = defineType({
  name: "careersPage",
  title: "Careers page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "why", title: "Why work with us" },
    { name: "jobs", title: "Jobs section" },
    { name: "legal", title: "Equal opportunity" },
  ],
  fields: [
    // ──────────────────────────────────────────────────────────────── SEO ──
    defineField({
      name: "seoTitle",
      title: "Page title (browser tab & SEO)",
      type: "string",
      group: "seo",
      initialValue: "Careers — BPI",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      initialValue:
        "We are hiring. Join the team building the Caribbean's pharmaceutical gateway.",
      validation: (Rule) => Rule.required(),
    }),

    // ─────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroHeadlineLine1",
      title: "Headline",
      type: "string",
      group: "hero",
      initialValue: "We are hiring. Be Part of our Mission",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroDescription",
      title: "Description",
      type: "text",
      rows: 4,
      group: "hero",
      initialValue:
        "Be Part of our Mission. We are looking for passionate people to join us on our mission. We value you and the work we can do together.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image (clipped to CareerShape)",
      type: "imageWithAlt",
      group: "hero",
      initialValue: {
        fallbackSrc: "/images/A6701522.jpg",
        alt: "The BPI team",
      },
      validation: (Rule) => Rule.required(),
    }),

    // ────────────────────────────────────────────────── Why work with us ──
    defineField({
      name: "whyHeading",
      title: "Heading",
      type: "string",
      group: "why",
      initialValue: "Why work with us?",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whyIntro",
      title: "Intro paragraph",
      type: "text",
      rows: 3,
      group: "why",
      initialValue:
        "Our approach to innovation and growth is guided by clear priorities that shape impact and direction. Built to strengthen systems, people, and long-term success.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "whyImage",
      title: "Portrait image",
      type: "imageWithAlt",
      group: "why",
      initialValue: {
        fallbackSrc: "/images/A6701488.jpg",
        alt: "A BPI team member",
      },
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
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "heading", subtitle: "body" } },
        }),
      ],
      initialValue: [
        {
          _key: "wb-1",
          heading: "Building the Future of Healthcare Together",
          body: "At Barbados Pharmaceuticals Inc. (BPI), we believe innovation in healthcare starts with people who are passionate about making a difference. Joining our team means becoming part of a mission-driven organization committed to advancing pharmaceutical excellence, improving lives, and shaping the future of healthcare across the Caribbean and beyond.",
        },
        {
          _key: "wb-2",
          heading: "A Culture of Growth & Innovation",
          body: "We foster an environment where talent is nurtured, ideas are valued, and continuous learning is encouraged. From research and development to manufacturing, operations, and corporate leadership, every role at BPI contributes to meaningful impact and industry progress.",
        },
        {
          _key: "wb-3",
          heading: "Purpose-Driven Opportunities",
          body: "At BPI, your work goes beyond business — it supports healthier communities, stronger healthcare systems, and greater access to quality pharmaceutical solutions. We are building a future powered by integrity, collaboration, and innovation.",
        },
      ],
    }),
    defineField({
      name: "whyBulletsHeading",
      title: "Bullets heading",
      type: "string",
      group: "why",
      initialValue: "What You'll Find at BPI",
      validation: (Rule) => Rule.required(),
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

    // ──────────────────────────────────────────────────────── Jobs panel ──
    defineField({
      name: "jobsHeading",
      title: "Heading",
      type: "string",
      group: "jobs",
      initialValue: "Jobs",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "jobsDescription",
      title: "Description",
      type: "text",
      rows: 3,
      group: "jobs",
      initialValue:
        "Our approach to innovation and growth is guided by clear priorities that shape impact and direction. Built to strengthen systems, people, and long-term success.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "jobsSearchPlaceholder",
      title: "Search placeholder",
      type: "string",
      group: "jobs",
      initialValue: "Search",
    }),
    defineField({
      name: "jobsFindButtonLabel",
      title: "Find-job button label (leave blank to hide)",
      type: "string",
      group: "jobs",
      initialValue: "Find Job",
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
      type: "text",
      rows: 4,
      group: "legal",
      initialValue:
        "Barbados Pharmaceuticals Inc. (BPI) is an equal opportunity employer committed to creating an inclusive and diverse workplace. We celebrate diversity and are dedicated to providing fair employment opportunities to all qualified applicants regardless of background, identity, or personal circumstances.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "equalOpportunityParagraph2",
      title: "Paragraph 2",
      type: "text",
      rows: 4,
      group: "legal",
      initialValue:
        "At BPI, we believe innovation thrives when different perspectives, experiences, and ideas come together to shape the future of healthcare.",
    }),
    defineField({
      name: "equalOpportunityBg",
      title: "Background color",
      type: "hexColor",
      group: "legal",
      initialValue: "#CAF1FF",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Careers page" }),
  },
});
