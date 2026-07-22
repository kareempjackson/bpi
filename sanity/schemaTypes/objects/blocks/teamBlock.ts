import { defineField, defineType } from "sanity";

import { i18nValue } from "../../previewI18n";

/**
 * A responsive grid of leader portraits — image, name, role, and an optional
 * short bio. Framed by the Zone. Reuses the shared `leader` object type, so
 * existing leadership content models straight in. No variants: one clean
 * portrait grid.
 */
export const teamBlock = defineType({
  name: "teamBlock",
  title: "Team",
  type: "object",
  fields: [
    defineField({
      name: "enabled",
      title: "Show this section",
      description: "Turn the block off without deleting it.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "heading",
      title: "Heading",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "members",
      title: "Members",
      type: "array",
      of: [{ type: "leader" }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", members: "members" },
    prepare: ({ title, members }) => ({
      title: i18nValue(title) || "Team",
      subtitle: `Team — ${members?.length ?? 0} members`,
    }),
  },
});
