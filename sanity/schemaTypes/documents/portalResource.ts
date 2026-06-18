import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A downloadable gated resource — a report/deck/spreadsheet, a private video,
 * or a dataset. The file lives in the PRIVATE R2 bucket (see `portalFile`); the
 * site never exposes a public URL, only the auth-checked download route.
 */
export const portalResource = defineType({
  name: "portalResource",
  title: "Portal resource",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "File / document", value: "file" },
          { title: "Video", value: "video" },
          { title: "Dataset", value: "dataset" },
        ],
      },
      initialValue: "file",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "audiences",
      title: "Visible to",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "grid",
        list: [
          { title: "Investors", value: "investor" },
          { title: "Partners", value: "partner" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "order",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
    defineField({
      name: "file",
      title: "File (private storage)",
      type: "portalFile",
      validation: (Rule) =>
        Rule.custom((file: { key?: string } | undefined) =>
          file?.key ? true : "Upload a file.",
        ),
    }),
  ],
  preview: {
    select: { title: "title.0.value", kind: "kind", audiences: "audiences" },
    prepare: ({ title, kind, audiences }) => ({
      title,
      subtitle: `${kind ?? "file"} · ${
        Array.isArray(audiences) ? audiences.join(" + ") : "—"
      }`,
    }),
  },
});
