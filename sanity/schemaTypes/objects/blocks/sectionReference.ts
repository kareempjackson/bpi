import { defineField, defineType } from "sanity";

/**
 * A page-builder member that points at a `sharedSection` document — the
 * author-once/place-many primitive. In GROQ (PAGE_SECTIONS_PROJECTION) it is
 * dereferenced to its target block, so the resolved item looks exactly like a
 * normal inline block and the renderer treats the two identically. Editing the
 * referenced shared section updates every page it appears on.
 */
export const sectionReference = defineType({
  name: "sectionReference",
  title: "Reusable section",
  type: "object",
  fields: [
    defineField({
      name: "reference",
      title: "Reusable section",
      description:
        "Pick a section authored under “Reusable sections”. Editing it there updates every page it appears on.",
      type: "reference",
      to: [{ type: "sharedSection" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "reference.title" },
    prepare: ({ title }) => ({
      title: title || "Reusable section",
      subtitle: "Reusable section (reference)",
    }),
  },
});
