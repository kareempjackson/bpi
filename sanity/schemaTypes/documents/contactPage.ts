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
      type: "string",
      group: "seo",
      initialValue: "Contact — BPI",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      group: "seo",
      initialValue:
        "Ready to partner with Barbados Pharmaceutical Inc.? Get in touch.",
      validation: (Rule) => Rule.required(),
    }),

    // ─────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroHeading",
      title: "Heading",
      type: "string",
      group: "hero",
      initialValue: "Ready to Partner with us?",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "imageWithAlt",
      group: "hero",
      initialValue: {
        fallbackSrc: "/images/A6701484.jpg",
        alt: "BPI partner ready to collaborate",
      },
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
      type: "string",
      group: "form",
      initialValue: "Contact Us",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "formDescription",
      title: "Form description",
      type: "text",
      rows: 4,
      group: "form",
      initialValue:
        "Get in touch with BPI — we're here to answer your questions, support your journey, and help you connect with opportunities in pharmaceutical innovation and supply chain excellence.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "formSubmitLabel",
      title: "Submit button label",
      type: "string",
      group: "form",
      initialValue: "Get in touch",
      validation: (Rule) => Rule.required(),
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
      initialValue: {
        fallbackSrc: "/images/DSC03039.jpg",
        alt: "BPI team meeting with partners",
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Contact page" }),
  },
});
