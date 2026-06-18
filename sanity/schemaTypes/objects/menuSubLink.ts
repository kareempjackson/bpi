import { defineField, defineType } from "sanity";

type SubLinkParent = { linkType?: string };

export const menuSubLink = defineType({
  name: "menuSubLink",
  title: "Sub-link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "linkType",
      title: "Link to",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Custom URL / page", value: "custom" },
          { title: "Initiative", value: "initiative" },
          { title: "Blog post", value: "post" },
          { title: "Job", value: "job" },
        ],
      },
      initialValue: "custom",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "An internal path (e.g. /about) or a full URL.",
      hidden: ({ parent }) =>
        !!(parent as SubLinkParent)?.linkType &&
        (parent as SubLinkParent).linkType !== "custom",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const type = (ctx.parent as SubLinkParent)?.linkType ?? "custom";
          if (type === "custom" && !value) return "Link is required";
          return true;
        }),
    }),
    defineField({
      name: "reference",
      title: "Referenced item",
      type: "reference",
      to: [{ type: "initiative" }, { type: "post" }, { type: "job" }],
      description:
        "The sub-link points to this item's page. The URL is resolved automatically.",
      hidden: ({ parent }) => {
        const type = (parent as SubLinkParent)?.linkType;
        return !type || type === "custom";
      },
      options: {
        // Only offer documents of the chosen type.
        filter: ({ parent }) => {
          const type = (parent as SubLinkParent)?.linkType;
          if (type === "initiative" || type === "post" || type === "job") {
            return { filter: "_type == $type", params: { type } };
          }
          return {};
        },
      },
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const type = (ctx.parent as SubLinkParent)?.linkType ?? "custom";
          if (type !== "custom" && !value) return "Please select an item";
          return true;
        }),
    }),
    defineField({
      name: "media",
      title: "Media (shown when this sub-link is hovered)",
      type: "menuMedia",
    }),
  ],
  preview: {
    select: {
      label: "label",
      linkType: "linkType",
      href: "href",
      refTitle: "reference.title",
    },
    prepare({ label, linkType, href, refTitle }) {
      const subtitle =
        linkType && linkType !== "custom"
          ? `${linkType}: ${i18nValue(refTitle) ?? "—"}`
          : href;
      return { title: i18nValue(label) || "Sub-link", subtitle };
    },
  },
});

// Internationalized-array fields are stored as `[{ _key, language, value }]`;
// the Studio preview's `select` doesn't collapse that to a string, so pull the
// English (or first) value out here.
function i18nValue(field: unknown): string | undefined {
  if (typeof field === "string") return field;
  if (Array.isArray(field)) {
    const items = field as { language?: string; value?: string }[];
    return (items.find((i) => i?.language === "en") ?? items[0])?.value;
  }
  return undefined;
}
