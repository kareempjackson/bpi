import { defineArrayMember, defineField, defineType } from "sanity";

const JOB_CATEGORIES = [
  { title: "Operations", value: "Operations" },
  { title: "Development", value: "Development" },
  { title: "Marketing", value: "Marketing" },
  { title: "Finance", value: "Finance" },
  { title: "Other", value: "Other" },
];

export const job = defineType({
  name: "job",
  title: "Job",
  type: "document",
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "details", title: "Details" },
    { name: "lists", title: "Lists" },
    { name: "apply", title: "Apply" },
  ],
  fields: [
    // ───────────────────────────────────────────────────────── Overview ──
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "overview",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "overview",
      options: { source: "title", maxLength: 96 },
      description: "URL path under /careers. Click Generate to derive from title.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      group: "overview",
      options: { list: JOB_CATEGORIES, layout: "dropdown" },
      validation: (Rule) => Rule.required(),
      initialValue: "Operations",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      group: "overview",
      description: 'e.g. "On-site", "100% Remote", "Hybrid — Bridgetown".',
      validation: (Rule) => Rule.required(),
      initialValue: "On-site",
    }),
    defineField({
      name: "schedule",
      title: "Schedule",
      type: "string",
      group: "overview",
      description: 'e.g. "Full-time", "Part-time", "Contract".',
      validation: (Rule) => Rule.required(),
      initialValue: "Full-time",
    }),
    defineField({
      name: "publishedAt",
      title: "Published date",
      type: "datetime",
      group: "overview",
      description: "Used to sort job listings — newest first.",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "active",
      title: "Active (uncheck to hide from listings)",
      type: "boolean",
      group: "overview",
      initialValue: true,
    }),

    // ────────────────────────────────────────────────────────── Details ──
    defineField({
      name: "summary",
      title: "Summary (listing row)",
      type: "text",
      rows: 2,
      group: "details",
      description: "One-line teaser shown on the careers landing list.",
      validation: (Rule) => Rule.required().max(220),
    }),
    defineField({
      name: "longSummary",
      title: "Long summary (detail page)",
      type: "text",
      rows: 5,
      group: "details",
      description: "Shown under \"Job Summary\" on the detail page.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (detail page)",
      type: "text",
      rows: 5,
      group: "details",
      description: "Opening paragraph in the \"Job Description\" row.",
      validation: (Rule) => Rule.required(),
    }),

    // ─────────────────────────────────────────────────────── Sections ──
    defineField({
      name: "sections",
      title: "Sections",
      description:
        "Titled rich-text blocks shown on the detail page (Key Responsibilities, Minimum Qualifications, etc). Add as many as you need; each one has its own title and a Portable Text body with numbered lists, bullets, bold, italic, and links.",
      type: "array",
      group: "lists",
      of: [defineArrayMember({ type: "jobSection" })],
      initialValue: [
        {
          _type: "jobSection",
          _key: "sec-responsibilities",
          title: "Key Responsibilities",
          content: [],
        },
        {
          _type: "jobSection",
          _key: "sec-min-qualifications",
          title: "Minimum Qualifications",
          content: [],
        },
        {
          _type: "jobSection",
          _key: "sec-pref-qualifications",
          title: "Preferred Qualifications",
          content: [],
        },
        {
          _type: "jobSection",
          _key: "sec-pay-benefits",
          title: "Pay & Benefits",
          content: [],
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),

    // ──────────────────────────────────────────────────────────── Apply ──
    defineField({
      name: "applyEmail",
      title: "Apply email (overrides site default)",
      type: "string",
      group: "apply",
      description:
        "Used in the \"Submit Resume\" mailto link. Defaults to hr_bpi@investbarbados.org when blank.",
    }),
    defineField({
      name: "applyUrl",
      title: "External apply URL (overrides email)",
      type: "url",
      group: "apply",
      description:
        "If set, the \"Submit Resume\" button links here instead of the mailto.",
    }),
  ],
  orderings: [
    {
      title: "Published date — newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Category, then newest",
      name: "categoryThenDate",
      by: [
        { field: "category", direction: "asc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      location: "location",
      active: "active",
    },
    prepare: ({ title, category, location, active }) => ({
      title: active ? title : `[inactive] ${title}`,
      subtitle: [category, location].filter(Boolean).join(" · "),
    }),
  },
});
