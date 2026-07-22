import { defineArrayMember, defineField, defineType } from "sanity";

import { i18nValue } from "../previewI18n";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "topNav", title: "Top nav", default: true },
    { name: "menu", title: "Modal menu" },
    { name: "footer", title: "Footer" },
    { name: "global", title: "Global bands" },
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
                    select: { title: "label", subtitle: "href" },
                    prepare: ({ title, subtitle }) => ({
                      title: i18nValue(title),
                      subtitle,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({ title: i18nValue(title) }),
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

    // ──────────────────────────────────────────────────────── Global bands ──
    // Site-wide bands rendered once by the (site) layout, so a single edit
    // updates every page. Each is gated on its own `enabled` toggle.
    defineField({
      name: "announcement",
      title: "Announcement bar",
      group: "global",
      description:
        "A thin bar pinned to the very top of every page. Turn it on to show a site-wide message (e.g. an event or a policy notice).",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "Show the announcement bar",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "text",
          title: "Message",
          type: "internationalizedArrayString",
        }),
        defineField({
          name: "link",
          title: "Link (optional)",
          description: "An optional call-to-action shown after the message.",
          type: "cta",
        }),
        defineField({
          name: "tone",
          title: "Colour tone",
          type: "string",
          options: {
            list: [
              { title: "Dark (navy)", value: "dark" },
              { title: "Green (mint)", value: "green" },
              { title: "Blue", value: "blue" },
            ],
            layout: "radio",
          },
          initialValue: "dark",
        }),
      ],
      preview: {
        select: { text: "text", enabled: "enabled" },
        prepare: ({ text, enabled }) => ({
          title: i18nValue(text) || "Announcement bar",
          subtitle: enabled ? "On" : "Off",
        }),
      },
    }),
    defineField({
      name: "globalCta",
      title: "Global CTA band",
      group: "global",
      description:
        "A call-to-action band rendered just above the footer on every page.",
      type: "object",
      fields: [
        defineField({
          name: "enabled",
          title: "Show the global CTA band",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "internationalizedArrayString",
        }),
        defineField({
          name: "body",
          title: "Body",
          type: "internationalizedArrayPortableText",
        }),
        defineField({
          name: "primaryCta",
          title: "Primary button",
          type: "cta",
        }),
        defineField({
          name: "secondaryCta",
          title: "Secondary button",
          type: "cta",
        }),
        defineField({
          name: "tone",
          title: "Colour tone",
          type: "string",
          options: {
            list: [
              { title: "Green", value: "green" },
              { title: "Blue", value: "blue" },
            ],
            layout: "radio",
          },
          initialValue: "green",
        }),
      ],
      preview: {
        select: { heading: "heading", enabled: "enabled" },
        prepare: ({ heading, enabled }) => ({
          title: i18nValue(heading) || "Global CTA band",
          subtitle: enabled ? "On" : "Off",
        }),
      },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
