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
      initialValue: [
        {
          _type: "navLink",
          _key: "nav-about",
          label: "About",
          href: "/about",
          disabled: false,
        },
        {
          _type: "navLink",
          _key: "nav-ecosystem",
          label: "Ecosystem",
          href: "#ecosystem",
          disabled: true,
        },
        {
          _type: "navLink",
          _key: "nav-initiatives",
          label: "Initiatives",
          href: "#initiative",
          disabled: false,
        },
      ],
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
      initialValue: [
        { _type: "menuLink", _key: "ml-home", label: "Home", href: "/" },
        {
          _type: "menuLink",
          _key: "ml-about",
          label: "About BPI",
          href: "/about",
          media: {
            _type: "menuMedia",
            kind: "image",
            image: {
              _type: "imageWithAlt",
              fallbackSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
              alt: "BPI team",
            },
          },
        },
        {
          _type: "menuLink",
          _key: "ml-initiatives",
          label: "Initiatives",
          href: "/initiatives",
          media: {
            _type: "menuMedia",
            kind: "image",
            image: {
              _type: "imageWithAlt",
              fallbackSrc: "/images/katherine-hanlon-pNxzedQ5qyU-unsplash.jpg",
              alt: "BPI initiatives",
            },
          },
        },
        {
          _type: "menuLink",
          _key: "ml-news",
          label: "News & Media",
          href: "/news",
          media: {
            _type: "menuMedia",
            kind: "image",
            image: {
              _type: "imageWithAlt",
              fallbackSrc: "/images/DSC03249.jpg",
              alt: "BPI news and media",
            },
          },
        },
        {
          _type: "menuLink",
          _key: "ml-careers",
          label: "Careers",
          href: "/careers",
          media: {
            _type: "menuMedia",
            kind: "image",
            image: {
              _type: "imageWithAlt",
              fallbackSrc: "/images/olawale-munna-_ObjhzjnMmc-unsplash.jpg",
              alt: "Join the BPI team",
            },
          },
        },
        {
          _type: "menuLink",
          _key: "ml-contact",
          label: "Contact",
          href: "/contact",
          media: {
            _type: "menuMedia",
            kind: "image",
            image: {
              _type: "imageWithAlt",
              fallbackSrc: "/images/A6701225.jpg",
              alt: "Contact BPI",
            },
          },
        },
      ],
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
      initialValue: [
        {
          _type: "navLink",
          _key: "lg-terms",
          label: "Terms of Use",
          href: "/terms",
          disabled: false,
        },
        {
          _type: "navLink",
          _key: "lg-media",
          label: "Media Assets",
          href: "/media-assets",
          disabled: false,
        },
      ],
    }),
    defineField({
      name: "menuSocialLinks",
      title: "Social icons",
      group: "menu",
      description:
        "Shown at the bottom-right of the menu. Add LinkedIn, X, Instagram, YouTube as needed.",
      type: "array",
      of: [defineArrayMember({ type: "socialLink" })],
      initialValue: [
        {
          _type: "socialLink",
          _key: "sm-linkedin",
          kind: "LinkedIn",
          href: "#",
        },
        { _type: "socialLink", _key: "sm-x", kind: "X", href: "#" },
        {
          _type: "socialLink",
          _key: "sm-instagram",
          kind: "Instagram",
          href: "#",
        },
        { _type: "socialLink", _key: "sm-youtube", kind: "YouTube", href: "#" },
      ],
    }),
    defineField({
      name: "menuBackground",
      title: "Right-panel background (when nothing is hovered)",
      group: "menu",
      description:
        "Default media for the right-hand video/image panel of the menu. Hovering a link with its own media overrides this.",
      type: "menuMedia",
      initialValue: {
        kind: "video",
        videoFallbackSrc:
          "/videos/Procur%20%20Motion%20animation%20V3%20SD.mp4",
      },
    }),

    // ──────────────────────────────────────────────────────────── Footer ──
    defineField({
      name: "showFooterPartners",
      title: "Show partner marquee in footer",
      type: "boolean",
      group: "footer",
      description:
        "Toggle to hide the auto-scrolling partner marquee in the footer. When OFF the entire partner row is removed.",
      initialValue: true,
    }),
    defineField({
      name: "footerPartners",
      title: "Footer partner logos (marquee)",
      group: "footer",
      description:
        "Logos shown in the auto-scrolling partner marquee in the footer. PNG/SVG with a transparent background works best; logos are rendered at ~32–40px tall and tinted to white at 60% opacity to sit on the dark footer.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "partner",
          title: "Partner",
          fields: [
            defineField({
              name: "name",
              title: "Partner name",
              type: "string",
              description: "Used for the image alt text and accessibility.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "logo",
              title: "Logo",
              type: "image",
              options: { hotspot: false },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Link (optional)",
              type: "url",
              description:
                "If provided, the logo links to this URL in a new tab.",
              validation: (Rule) =>
                Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
            }),
          ],
          preview: {
            select: { title: "name", media: "logo" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
