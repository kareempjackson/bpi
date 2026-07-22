import { defineArrayMember, defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "form", title: "Form section" },
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
      title: "Heading",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "imageWithAlt",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "contactRows",
      title: "Contact info rows",
      type: "array",
      group: "hero",
      of: [defineArrayMember({ type: "contactRow" })],
      initialValue: [
        {
          _type: "contactRow",
          _key: "row-partner",
          label: "Partner with us",
          value: "hr_bpi@investbarbados.org",
        },
        {
          _type: "contactRow",
          _key: "row-find",
          label: "Find us",
          value: "Trident Insurance Financial Centre Hastings, Christ",
        },
        {
          _type: "contactRow",
          _key: "row-call",
          label: "Call us",
          value: "1-246-626-2000",
        },
        {
          _type: "contactRow",
          _key: "row-email",
          label: "Email us",
          value: "adminBPI@gmai.com",
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),

    // ─────────────────────────────────────────────────────────────── Form ──
    defineField({
      name: "formHeading",
      title: "Form heading",
      type: "internationalizedArrayString",
      group: "form",
    }),
    defineField({
      name: "formDescription",
      title: "Form description",
      type: "internationalizedArrayPortableText",
      group: "form",
    }),
    defineField({
      name: "formSubmitLabel",
      title: "Submit button label",
      type: "internationalizedArrayString",
      group: "form",
    }),
    defineField({
      name: "formBg",
      title: "Section background color",
      type: "hexColor",
      group: "form",
      initialValue: "#CAF1FF",
    }),
    defineField({
      name: "formImage",
      title: "Form section image",
      type: "imageWithAlt",
      group: "form",
      validation: (Rule) => Rule.required(),
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
    prepare: () => ({ title: "Contact page" }),
  },
});
