import { defineField, defineType } from "sanity";

type PageLinkParent = { linkType?: string };

/** The site's top-level pages, offered as a friendly dropdown. */
const SITE_PAGES = [
  { title: "Home", value: "/" },
  { title: "About", value: "/about" },
  { title: "Initiatives", value: "/initiatives" },
  { title: "Blog", value: "/blog" },
  { title: "Careers", value: "/careers" },
  { title: "Events", value: "/events" },
  { title: "Contact", value: "/contact" },
  { title: "Brand", value: "/brand" },
];

/**
 * Reusable link picker — point at a site page, a specific content item
 * (initiative, blog post, or job), or a custom URL. The destination URL is
 * resolved in GROQ (see the `pageLink` projection in queries.ts).
 */
export const pageLink = defineType({
  name: "pageLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "linkType",
      title: "Link to",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Site page", value: "page" },
          { title: "Initiative, blog post, or job", value: "content" },
          { title: "Custom URL", value: "custom" },
        ],
      },
      initialValue: "page",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "page",
      title: "Page",
      type: "string",
      options: { list: SITE_PAGES },
      hidden: ({ parent }) => (parent as PageLinkParent)?.linkType !== "page",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const type = (ctx.parent as PageLinkParent)?.linkType ?? "page";
          if (type === "page" && !value) return "Please choose a page";
          return true;
        }),
    }),
    defineField({
      name: "reference",
      title: "Item",
      type: "reference",
      to: [{ type: "initiative" }, { type: "post" }, { type: "job" }],
      description: "The link points to this item's page (URL resolved automatically).",
      hidden: ({ parent }) =>
        (parent as PageLinkParent)?.linkType !== "content",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const type = (ctx.parent as PageLinkParent)?.linkType ?? "page";
          if (type === "content" && !value) return "Please select an item";
          return true;
        }),
    }),
    defineField({
      name: "href",
      title: "Custom URL",
      type: "string",
      description: "An internal path (e.g. /about) or a full external URL.",
      hidden: ({ parent }) => (parent as PageLinkParent)?.linkType !== "custom",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const type = (ctx.parent as PageLinkParent)?.linkType ?? "page";
          if (type === "custom" && !value) return "Please enter a URL";
          return true;
        }),
    }),
  ],
});
