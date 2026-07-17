import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

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
      type: "internationalizedArrayString",
      group: "overview",
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
      type: "internationalizedArrayString",
      group: "overview",
      description: 'e.g. "On-site", "100% Remote", "Hybrid — Bridgetown".',
    }),
    defineField({
      name: "schedule",
      title: "Schedule",
      type: "internationalizedArrayString",
      group: "overview",
      description: 'e.g. "Full-time", "Part-time", "Contract".',
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
      type: "internationalizedArrayText",
      group: "details",
      description: "One-line teaser shown on the careers landing list.",
    }),
    defineField({
      name: "longSummary",
      title: "Long summary (detail page)",
      type: "internationalizedArrayText",
      group: "details",
      description: "Shown under \"Job Summary\" on the detail page.",
    }),
    defineField({
      name: "description",
      title: "Description (detail page)",
      type: "internationalizedArrayText",
      group: "details",
      description: "Opening paragraph in the \"Job Description\" row.",
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
      title: active ? i18nValue(title) : `[inactive] ${i18nValue(title) ?? ""}`,
      subtitle: [category, location].filter(Boolean).join(" · "),
    }),
  },
});
