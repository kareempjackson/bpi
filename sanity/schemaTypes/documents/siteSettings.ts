import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "topNav", title: "Top nav", default: true },
    { name: "menu", title: "Modal menu" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    // ─────────────────────────────────────────────────────────── Top nav ──
    defineField({
      name: "navLinks",
      title: "Top-nav links",
      group: "topNav",
      description:
        "Shared by the hero notch nav (where they render in caps) and the global sticky top nav (where they render in title case). Disabled links are shown but unclickable in both.",
      type: "array",
      of: [defineArrayMember({ type: "navLink" })],
      validation: (Rule) => Rule.min(1),
    }),

    // ──────────────────────────────────────────────────────── Modal menu ──
    defineField({
      name: "menuLinks",
      title: "Primary menu links",
      group: "menu",
      description:
        "Big links in the full-screen menu (the one launched by the hamburger). Hovering a link can reveal sub-links and swap the right-hand media panel.",
      type: "array",
      of: [defineArrayMember({ type: "menuLink" })],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "menuLegalLinks",
      title: "Legal / footer links",
      group: "menu",
      description:
        "Shown at the bottom-left of the menu (Terms of Use, Media Assets, etc).",
      type: "array",
      of: [defineArrayMember({ type: "navLink" })],
    }),
    defineField({
      name: "menuSocialLinks",
      title: "Social icons",
      group: "menu",
      description:
        "Shown at the bottom-right of the menu. Add LinkedIn, X, Instagram, YouTube as needed.",
      type: "array",
      of: [defineArrayMember({ type: "socialLink" })],
    }),
    defineField({
      name: "menuBackground",
      title: "Right-panel background (when nothing is hovered)",
      group: "menu",
      description:
        "Default media for the right-hand video/image panel of the menu. Hovering a link with its own media overrides this.",
      type: "menuMedia",
    }),

    // ──────────────────────────────────────────────────────────── Footer ──
    defineField({
      name: "footerTagline",
      title: "Footer tagline",
      group: "footer",
      description:
        "Short line of copy shown in the footer (e.g. beside or beneath the logo).",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "footerNavGroups",
      title: "Footer navigation columns",
      group: "footer",
      description:
        "Columns of links shown in the footer. Each column has a heading and its own list of links.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerNavGroup",
          title: "Column",
          fields: [
            defineField({
              name: "title",
              title: "Column heading",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "footerNavLink",
                  title: "Link",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Label",
                      type: "internationalizedArrayString",
                    }),
                    defineField({
                      name: "href",
                      title: "Link",
                      type: "string",
                    }),
                  ],
                  preview: {
                    select: { title: "label.0.value", subtitle: "href" },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title.0.value" },
          },
        }),
      ],
    }),
    defineField({
      name: "footerLegalLinks",
      title: "Footer legal links",
      group: "footer",
      description:
        "Legal / utility links shown in the footer (Privacy Policy, Terms of Use, etc).",
      type: "array",
      of: [defineArrayMember({ type: "navLink" })],
    }),
    defineField({
      name: "footerRights",
      title: "Copyright / rights line",
      group: "footer",
      description:
        'The rights line at the bottom of the footer (e.g. "All rights reserved").',
      type: "internationalizedArrayString",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
