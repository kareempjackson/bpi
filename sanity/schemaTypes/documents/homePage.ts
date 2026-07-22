import { defineArrayMember, defineField, defineType } from "sanity";

import {
  externalVideoUrlField,
  sanityVideoField,
} from "../objects/externalVideoUrlField";
import { i18nValue } from "../previewI18n";

/**
 * Shared field set for a hero background — used by both the main hero
 * background and each slide's background so the two stay in sync. An editor
 * either uploads a Video / Image, or points the background at an existing post
 * or initiative ("Featured post or initiative"), reusing that item's cover
 * media so nothing has to be uploaded twice. Every part is optional: leaving a
 * background empty lets the hero run purely on featured slides.
 */
function heroBackgroundFields() {
  return [
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Video", value: "video" },
          { title: "Image", value: "image" },
          { title: "Featured post or initiative", value: "content" },
        ],
        layout: "radio",
      },
      initialValue: "video",
    }),
    externalVideoUrlField(),
    sanityVideoField(),
    defineField({
      name: "image",
      title: "Image",
      type: "imageWithAlt",
      hidden: ({ parent }) => parent?.kind !== "image",
    }),
    defineField({
      name: "reference",
      title: "Featured post or initiative",
      type: "reference",
      to: [{ type: "post" }, { type: "initiative" }],
      description:
        "Reuse this item's cover image or video as the background — no separate upload needed.",
      hidden: ({ parent }) => parent?.kind !== "content",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const kind = (ctx.parent as { kind?: string } | undefined)?.kind;
          if (kind === "content" && !value)
            return "Choose a post or initiative, or switch the background type.";
          return true;
        }),
    }),
  ];
}

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  groups: [
    { name: "seo", title: "SEO" },
    { name: "hero", title: "Hero", default: true },
    { name: "leader", title: "Leader" },
    { name: "architecture", title: "Priorities" },
    { name: "sectors", title: "Sectors" },
    { name: "why", title: "Why BPI" },
    { name: "initiatives", title: "Initiatives" },
    { name: "blog", title: "Blog" },
    { name: "careers", title: "Careers" },
    { name: "building", title: "Building / Footer CTA" },
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
      name: "heroHeadline",
      title: "Headline",
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "hero",
    }),
    defineField({
      name: "heroCtaHref",
      title: "Hero CTA link",
      type: "string",
      group: "hero",
      description:
        "Destination for the arrow button beside the hero body. Leave blank to keep the button non-clickable.",
    }),
    defineField({
      name: "heroBackground",
      title: "Background (optional)",
      type: "object",
      group: "hero",
      description:
        "Optional standalone background — upload a video or image, or point it at an existing post/initiative to reuse that item's cover. Leave it empty to drive the hero entirely from the Featured slides below.",
      fields: heroBackgroundFields(),
    }),
    defineField({
      name: "heroSlides",
      title: "Featured slides",
      type: "array",
      group: "hero",
      description:
        "Turn the hero into a slider. Each slide has its own background, headline, body, and CTA — the slider cycles through them. Leave empty to show a single static hero using the fields above. The first slide reuses the headline/body/background above if its own are left blank.",
      of: [
        defineArrayMember({
          name: "heroSlide",
          title: "Slide",
          type: "object",
          fields: [
            defineField({
              name: "headline",
              title: "Headline",
              type: "internationalizedArrayString",
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "internationalizedArrayPortableText",
            }),
            defineField({
              name: "ctaLink",
              title: "CTA link (arrow button)",
              type: "pageLink",
              description:
                "Destination for the arrow button — a site page, a specific initiative / blog post / job, or a custom URL.",
            }),
            defineField({
              name: "background",
              title: "Background (video, image, or featured post/initiative)",
              type: "object",
              description:
                "Upload a video or image, or point this slide at an existing post/initiative to reuse its cover — no separate upload needed.",
              fields: heroBackgroundFields(),
            }),
            defineField({
              name: "thumbnail",
              title: "Thumbnail (slider control)",
              type: "imageWithAlt",
              description:
                "Small preview shown in the bottom-left slider control. Falls back to the background image.",
            }),
          ],
          preview: {
            select: { title: "headline", media: "thumbnail" },
            prepare: ({ title, media }) => ({ title: i18nValue(title), media }),
          },
        }),
      ],
    }),
    defineField({
      name: "heroFeature",
      title: "Hero feature card (bottom-right)",
      type: "object",
      group: "hero",
      description:
        "A single fixed video callout shown in the bottom-right of the hero. It does NOT change with the slider.",
      fields: [
        defineField({
          name: "label",
          title: "Title",
          type: "internationalizedArrayString",
          description: 'e.g. "Who we are".',
        }),
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "internationalizedArrayString",
          description: 'Small label above the title. Defaults to "Feature".',
        }),
        defineField({
          name: "link",
          title: "Link",
          type: "pageLink",
          description:
            "Where the card links to — a site page, a specific initiative / blog post / job, or a custom URL.",
        }),
        externalVideoUrlField(false),
        sanityVideoField(false),
        defineField({
          name: "poster",
          title: "Poster / fallback image",
          type: "imageWithAlt",
        }),
      ],
    }),

    // ───────────────────────────────────────────────────────────── Leader ──
    defineField({
      name: "leaderQuote",
      title: "Quote",
      type: "internationalizedArrayPortableText",
      group: "leader",
    }),
    defineField({
      name: "leaderBody",
      title: "Body",
      type: "internationalizedArrayText",
      group: "leader",
    }),
    defineField({
      name: "leaderName",
      title: "Name",
      type: "internationalizedArrayString",
      group: "leader",
    }),
    defineField({
      name: "leaderTitle",
      title: "Title",
      type: "internationalizedArrayString",
      group: "leader",
    }),
    defineField({
      name: "leaderOrg",
      title: "Organisation",
      type: "internationalizedArrayString",
      group: "leader",
    }),
    defineField({
      name: "leaderQuoteImage",
      title: "Primary image (left)",
      type: "imageWithAlt",
      group: "leader",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderPortraitImage",
      title: "Portrait (right)",
      type: "imageWithAlt",
      group: "leader",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "leaderSocials",
      title: "Social links",
      type: "array",
      group: "leader",
      of: [defineArrayMember({ type: "socialLink" })],
      initialValue: [
        { _type: "socialLink", _key: "soc-1", kind: "Website", href: "#", label: "Website" },
        { _type: "socialLink", _key: "soc-2", kind: "LinkedIn", href: "#" },
        { _type: "socialLink", _key: "soc-3", kind: "X", href: "#" },
        { _type: "socialLink", _key: "soc-4", kind: "Instagram", href: "https://www.instagram.com/barbadospharmainc" },
      ],
    }),

    // ─────────────────────────────────────────────── Architecture of Care ──
    defineField({
      name: "architectureHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "architecture",
    }),
    defineField({
      name: "architectureDescription",
      title: "Description",
      type: "internationalizedArrayPortableText",
      group: "architecture",
    }),
    defineField({
      name: "architectureItems",
      title: "Priority cards",
      type: "array",
      group: "architecture",
      of: [defineArrayMember({ type: "priorityCard" })],
    }),
    defineField({
      name: "architectureFeature",
      title: "Feature media (wide, bottom of section)",
      type: "imageWithAlt",
      group: "architecture",
      description:
        "The wide video or image anchoring the bottom of the Priorities section. Choose Video and upload to Cloudflare R2 to keep it off Sanity's bandwidth.",
    }),

    // ──────────────────────────────────────────────────────────── Sectors ──
    defineField({
      name: "sectorsHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "sectors",
    }),
    defineField({
      name: "sectorsBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "sectors",
    }),
    defineField({
      name: "sectorsNodes",
      title: "Sectors (text + image only; positions are fixed)",
      type: "array",
      group: "sectors",
      of: [defineArrayMember({ type: "sectorNode" })],
      description:
        "Each entry fills a fixed position in the molecule diagram (selected via the Slot dropdown). Up to 6 — only sectors whose Slot matches a position in the diagram will render.",
      validation: (Rule) => Rule.max(6),
    }),

    // ─────────────────────────────────────────────────────────── Why BPI ──
    defineField({
      name: "whyQuote",
      title: "Quote",
      type: "internationalizedArrayPortableText",
      group: "why",
    }),
    defineField({
      name: "whyAttribution",
      title: "Attribution",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "why",
    }),
    defineField({
      name: "whyCta",
      title: "CTA",
      type: "cta",
      group: "why",
      initialValue: { label: "Why BPI?", href: "/why-bpi" },
    }),
    defineField({
      name: "whyImage",
      title: "Image",
      type: "imageWithAlt",
      group: "why",
      validation: (Rule) => Rule.required(),
    }),

    // ──────────────────────────────────────────────────────── Initiatives ──
    defineField({
      name: "initiativesEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "initiatives",
    }),
    defineField({
      name: "initiativesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "initiatives",
    }),
    defineField({
      name: "initiativesViewAllHref",
      title: "View-all link",
      type: "string",
      group: "initiatives",
      initialValue: "/initiatives",
    }),
    defineField({
      name: "initiativesDefaultImage",
      title: "Default image (when no row hovered)",
      type: "imageWithAlt",
      group: "initiatives",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "initiativesShowCount",
      title: "Number of initiatives to show",
      type: "number",
      group: "initiatives",
      description:
        "Edit individual initiatives in the Initiatives list. The latest N (featured first) are shown here.",
      initialValue: 4,
      validation: (Rule) => Rule.min(0).max(12).integer(),
    }),

    // ─────────────────────────────────────────────────────────────── Blog ──
    defineField({
      name: "blogHeading",
      title: "Section heading",
      type: "internationalizedArrayString",
      group: "blog",
    }),
    defineField({
      name: "blogShowCount",
      title: "Number of posts to show",
      type: "number",
      group: "blog",
      initialValue: 3,
      validation: (Rule) => Rule.min(0).max(12).integer(),
    }),

    // ────────────────────────────────────────────────────────── Careers ──
    defineField({
      name: "careersEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "careers",
    }),
    defineField({
      name: "careersHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "careers",
    }),
    defineField({
      name: "careersLead",
      title: "Lead (large sub-heading)",
      type: "internationalizedArrayText",
      group: "careers",
    }),
    defineField({
      name: "careersBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "careers",
    }),
    defineField({
      name: "careersImage",
      title: "Image",
      type: "imageWithAlt",
      group: "careers",
    }),
    defineField({
      name: "careersPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "careers",
      initialValue: { label: "View Jobs", href: "/careers" },
    }),
    defineField({
      name: "careersSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "careers",
      initialValue: { label: "Our initiatives", href: "/initiatives" },
    }),

    // ───────────────────────────────────────────────────────── Building ──
    defineField({
      name: "buildingHeadlineLine1",
      title: "Headline (line 1)",
      type: "internationalizedArrayString",
      group: "building",
    }),
    defineField({
      name: "buildingHeadlineLine2",
      title: "Headline (line 2)",
      type: "internationalizedArrayString",
      group: "building",
    }),
    defineField({
      name: "buildingImage",
      title: "Background image",
      type: "imageWithAlt",
      group: "building",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buildingPrimaryCta",
      title: "Primary CTA",
      type: "cta",
      group: "building",
      initialValue: { label: "Get in touch", href: "/contact" },
    }),
    defineField({
      name: "buildingSecondaryCta",
      title: "Secondary CTA",
      type: "cta",
      group: "building",
      initialValue: { label: "Our initiatives", href: "/initiatives" },
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
    prepare: () => ({ title: "Home page" }),
  },
});
