import { defineField, defineType } from "sanity";

import { pageBuilderMembers, pageBuilderOptions } from "../pageBuilder";

/**
 * A reusable, author-once/place-many section. Holds a single design-language
 * block, authored here and dropped onto any page's zone via a `sectionReference`
 * (which dereferences to this document's block in GROQ). Editing it here updates
 * every page it appears on. References are excluded from its own picker so a
 * shared section can't nest another reference (GROQ dereferences one level).
 */
export const sharedSection = defineType({
  name: "sharedSection",
  title: "Reusable section",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      description:
        "For editors only — names this reusable section in lists and pickers. Not shown on the site.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "block",
      title: "Section",
      description:
        "The single block this reusable section renders. Insert one block with the visual picker.",
      type: "array",
      of: pageBuilderMembers(undefined, { includeReference: false }),
      options: pageBuilderOptions(undefined, { includeReference: false }),
      validation: (Rule) => Rule.max(1),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Reusable section",
      subtitle: "Reusable section",
    }),
  },
});
