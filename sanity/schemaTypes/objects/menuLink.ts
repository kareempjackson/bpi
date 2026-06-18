import { defineArrayMember, defineField, defineType } from "sanity";

export const menuLink = defineType({
  name: "menuLink",
  title: "Menu link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "disableLink",
      title: "Disable main link (sub-links only)",
      type: "boolean",
      description:
        "When on, this item isn't clickable — it just reveals its sub-links. Use for parent items that only group sub-links, so you don't have to enter a link.",
      initialValue: false,
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Leave blank if “Disable main link” is on.",
      hidden: ({ parent }) => Boolean(parent?.disableLink),
    }),
    defineField({
      name: "media",
      title: "Media (shown when this link is hovered)",
      type: "menuMedia",
    }),
    defineField({
      name: "subItems",
      title: "Sub-links",
      description:
        "Optional. When present, hovering this link reveals these in a side panel.",
      type: "array",
      of: [defineArrayMember({ type: "menuSubLink" })],
    }),
  ],
  preview: {
    select: { label: "label", href: "href", disableLink: "disableLink" },
    prepare({ label, href, disableLink }) {
      return {
        title: i18nValue(label) || "Menu link",
        subtitle: disableLink ? "Sub-links only (no link)" : href || undefined,
      };
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
