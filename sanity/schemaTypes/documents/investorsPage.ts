import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Investors & partners page. The hero, "The Opportunity", and "Why Barbados,
 * Why Now" are editable here; the sections below them (the investor/partner
 * tracks, "How it works", and the closing CTA) are still hardcoded in
 * app/[lang]/(site)/investors/page.tsx.
 */
export const investorsPage = defineType({
  name: "investorsPage",
  title: "Investors page",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "opportunity", title: "The Opportunity" },
    { name: "why", title: "Why Barbados" },
    { name: "how", title: "How BPI Works" },
    { name: "sites", title: "Manufacturing sites" },
    { name: "incentives", title: "Investment incentives" },
    { name: "bridge", title: "Bridge to European capital" },
    { name: "market", title: "Market access" },
    { name: "traction", title: "Traction" },
    { name: "whyNow", title: "Why now" },
    { name: "climate", title: "Investment climate" },
    { name: "voices", title: "Voices from the ground" },
    { name: "deeper", title: "Go deeper + timeline" },
    { name: "tail", title: "Page tail" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // ─────────────────────────────────────────────────────────────── Hero ──
    defineField({
      name: "heroTitle",
      title: "Title (green)",
      description:
        'The oversized word anchored to the bottom left of the hero — e.g. "Investors".',
      type: "internationalizedArrayString",
      group: "hero",
    }),
    defineField({
      name: "heroTagline",
      title: "Tagline (italic)",
      description:
        "The italic line above the button. Kept short — it sits on two lines beside the image.",
      type: "internationalizedArrayText",
      group: "hero",
    }),
    defineField({
      name: "heroCta",
      title: "Button",
      type: "cta",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      description:
        "Wide image; it bleeds off the right edge of the page, so keep the subject left of centre.",
      type: "imageWithAlt",
      group: "hero",
    }),

    // ──────────────────────────────────────────────────── The Opportunity ──
    defineField({
      name: "opportunityEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "opportunity",
    }),
    defineField({
      name: "opportunityHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "opportunity",
    }),
    defineField({
      name: "opportunityBody",
      title: "Body",
      description:
        "Wrap a phrase in **double asterisks** to make it bold — the same convention the initiative headers use.",
      type: "internationalizedArrayPortableText",
      group: "opportunity",
    }),
    defineField({
      name: "opportunityCardLead",
      title: "Card — lead line",
      type: "internationalizedArrayPortableText",
      group: "opportunity",
    }),
    defineField({
      name: "opportunityStats",
      title: "Card — stats",
      description: "Shown in a divided row. The number portion counts up on scroll.",
      type: "array",
      of: [defineArrayMember({ type: "stat" })],
      group: "opportunity",
    }),
    defineField({
      name: "opportunityCardBg",
      title: "Card background color",
      type: "hexColor",
      group: "opportunity",
      initialValue: "#06FE83",
    }),

    // ───────────────────────────────────────────── Why Barbados, Why Now ──
    defineField({
      name: "whyHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "why",
    }),
    defineField({
      name: "whyIntro",
      title: "Intro",
      type: "internationalizedArrayPortableText",
      group: "why",
    }),
    defineField({
      name: "whyCards",
      title: "Cards",
      description: "Three reads best; the row wraps to one column on mobile.",
      type: "array",
      of: [defineArrayMember({ type: "investorCard" })],
      group: "why",
    }),
    defineField({
      name: "whyClosing",
      title: "Closing paragraph",
      type: "internationalizedArrayPortableText",
      group: "why",
    }),
    defineField({
      name: "whyImage",
      title: "Image",
      description: "Wide image closing the section — full content width.",
      type: "imageWithAlt",
      group: "why",
    }),

    // ─────────────────────────────────────────────────────── How BPI Works ──
    defineField({
      name: "howHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "how",
    }),
    defineField({
      name: "howIntro",
      title: "Intro",
      type: "internationalizedArrayPortableText",
      group: "how",
    }),
    defineField({
      name: "howRoles",
      title: "Roles",
      description: "Rendered as a divided table, role against description.",
      type: "array",
      of: [defineArrayMember({ type: "investorRole" })],
      group: "how",
    }),
    defineField({
      name: "howImage",
      title: "Portrait",
      description:
        "Sits over the right-hand end of the roles table on desktop; stacks under it on mobile.",
      type: "imageWithAlt",
      group: "how",
    }),
    defineField({
      name: "howBody",
      title: "Closing paragraph",
      type: "internationalizedArrayPortableText",
      group: "how",
    }),
    defineField({
      name: "howBg",
      title: "Band background color",
      type: "hexColor",
      group: "how",
      initialValue: "#13362A",
    }),

    // ────────────────────────────────────────────── Manufacturing sites ──
    defineField({
      name: "sitesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "sites",
    }),
    defineField({
      name: "sitesBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "sites",
    }),
    defineField({
      name: "sitesList",
      title: "Sites",
      description:
        "Numbered 01, 02, 03… in order — the numbers are automatic. Not translated: these are proper names (same convention as the careers page bullets).",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      group: "sites",
    }),
    defineField({
      name: "sitesNote",
      title: "Note (italic)",
      type: "internationalizedArrayPortableText",
      group: "sites",
    }),
    defineField({
      name: "sitesImage",
      title: "Image (full-width, below)",
      type: "imageWithAlt",
      group: "sites",
    }),

    // ──────────────────────────────────────────── Investment incentives ──
    defineField({
      name: "incentivesImage",
      title: "Image (above the heading)",
      type: "imageWithAlt",
      group: "incentives",
    }),
    defineField({
      name: "incentivesHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "incentives",
    }),
    defineField({
      name: "incentivesLead",
      title: "Lead",
      type: "internationalizedArrayPortableText",
      group: "incentives",
    }),
    defineField({
      name: "incentivesItems",
      title: "Incentives",
      description: "Laid out three across; six reads best.",
      type: "array",
      of: [defineArrayMember({ type: "investorNote" })],
      group: "incentives",
    }),

    // ─────────────────────────────────────── Bridge to European capital ──
    defineField({
      name: "bridgeEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "bridge",
    }),
    defineField({
      name: "bridgeTitle",
      title: "Title (first line)",
      type: "internationalizedArrayString",
      group: "bridge",
    }),
    defineField({
      name: "bridgeTitleTail",
      title: "Title (second line, indented)",
      description: 'The offset half of the lockup — e.g. "to European Capital".',
      type: "internationalizedArrayString",
      group: "bridge",
    }),
    defineField({
      name: "bridgeBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "bridge",
    }),
    defineField({
      name: "bridgeCta",
      title: "Button",
      type: "cta",
      group: "bridge",
    }),
    defineField({
      name: "bridgeBg",
      title: "Band background color",
      type: "hexColor",
      group: "bridge",
      initialValue: "#13362A",
    }),

    // ─────────────────────────────────────────────────────── Market access ──
    defineField({
      name: "marketHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "market",
    }),
    defineField({
      name: "marketLead",
      title: "Lead",
      type: "internationalizedArrayPortableText",
      group: "market",
    }),
    defineField({
      name: "marketStats",
      title: "Markets",
      description:
        'Shown in a divided row. "Value" is the bold line (e.g. "CARICOM (16M+)"); the number portion counts up on scroll.',
      type: "array",
      of: [defineArrayMember({ type: "stat" })],
      group: "market",
    }),
    defineField({
      name: "marketClosing",
      title: "Closing line",
      type: "internationalizedArrayPortableText",
      group: "market",
    }),
    defineField({
      name: "marketImage",
      title: "Image (full-bleed, below)",
      type: "imageWithAlt",
      group: "market",
    }),

    // ─────────────────────────────────────────────────────────── Traction ──
    defineField({
      name: "tractionEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "traction",
    }),
    defineField({
      name: "tractionHeading",
      title: "Heading (italic)",
      type: "internationalizedArrayText",
      group: "traction",
    }),
    defineField({
      name: "tractionItems",
      title: "Projects",
      type: "array",
      of: [defineArrayMember({ type: "investorRole" })],
      group: "traction",
    }),

    // ──────────────────────────────────────────────────────────── Why now ──
    defineField({
      name: "whyNowHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "whyNow",
    }),
    defineField({
      name: "whyNowBody",
      title: "Body",
      type: "internationalizedArrayPortableText",
      group: "whyNow",
    }),
    defineField({
      name: "whyNowPrimaryCta",
      title: "Primary button",
      type: "cta",
      group: "whyNow",
    }),
    defineField({
      name: "whyNowSecondaryCta",
      title: "Secondary button",
      type: "cta",
      group: "whyNow",
    }),
    defineField({
      name: "whyNowImage",
      title: "Image",
      type: "imageWithAlt",
      group: "whyNow",
    }),
    defineField({
      name: "whyNowBg",
      title: "Band background color",
      type: "hexColor",
      group: "whyNow",
      initialValue: "#06FE83",
    }),

    // ───────────────────────────────────────────────── Investment climate ──
    defineField({
      name: "climateHeading",
      title: "Heading",
      type: "internationalizedArrayString",
      group: "climate",
    }),
    defineField({
      name: "climateCards",
      title: "Cards",
      type: "array",
      of: [defineArrayMember({ type: "investorCard" })],
      group: "climate",
    }),

    // ───────────────────────────────────────── Voices from the ground ──
    defineField({
      name: "voicesEyebrow",
      title: "Eyebrow",
      type: "internationalizedArrayString",
      group: "voices",
    }),
    defineField({
      name: "voicesHeading",
      title: "Heading (first line, green)",
      type: "internationalizedArrayString",
      group: "voices",
    }),
    defineField({
      name: "voicesHeadingTail",
      title: "Heading (second line, indented)",
      type: "internationalizedArrayString",
      group: "voices",
    }),
    defineField({
      name: "voicesQuotes",
      title: "Quotes",
      type: "array",
      of: [defineArrayMember({ type: "investorQuote" })],
      group: "voices",
    }),

    // ──────────────────────────────────────────── Go deeper + timeline ──
    defineField({
      name: "deeperHeading",
      title: "Go deeper — heading",
      type: "internationalizedArrayString",
      group: "deeper",
    }),
    defineField({
      name: "deeperBody",
      title: "Go deeper — body",
      type: "internationalizedArrayPortableText",
      group: "deeper",
    }),
    defineField({
      name: "deeperImage",
      title: "Go deeper — image",
      type: "imageWithAlt",
      group: "deeper",
    }),
    defineField({
      name: "timelineHeading",
      title: "Timeline — heading",
      type: "internationalizedArrayString",
      group: "deeper",
    }),
    defineField({
      name: "timelineItems",
      title: "Timeline — steps",
      description: "Rendered as a bulleted list: step name — description.",
      type: "array",
      of: [defineArrayMember({ type: "investorRole" })],
      group: "deeper",
    }),
    defineField({
      name: "deeperPrimaryCta",
      title: "Primary button",
      description: "Shown under both Go deeper and the Timeline.",
      type: "cta",
      group: "deeper",
    }),
    defineField({
      name: "deeperSecondaryCta",
      title: "Secondary button",
      type: "cta",
      group: "deeper",
    }),

    // ────────────────────────────────────────────────────────── Page tail ──
    defineField({
      name: "blogHeading",
      title: "\"Latest from BPI\" heading",
      description:
        "Leave blank to use the Home page's heading. The section hides itself when there are no posts.",
      type: "internationalizedArrayString",
      group: "tail",
    }),
    defineField({
      name: "pageSections",
      title: "Page sections",
      description:
        "Modular blocks (Call to Action, Careers) closing the page. When empty, the Home page's Careers + CTA copy is used instead, so the page never ends abruptly.",
      type: "array",
      group: "tail",
      of: [
        defineArrayMember({ type: "ctaSection" }),
        defineArrayMember({ type: "careersSection" }),
      ],
    }),

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
  ],
  preview: {
    prepare: () => ({ title: "Investors page" }),
  },
});
