import { defineField, defineType } from "sanity";

/**
 * A "Voices from the Ground" card — a pull-quote on a colour block, with the
 * speaker's portrait, name, and title beneath it.
 */
export const investorQuote = defineType({
  name: "investorQuote",
  title: "Quote",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "internationalizedArrayText",
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "image",
      title: "Portrait",
      type: "imageWithAlt",
    }),
    defineField({
      name: "bg",
      title: "Background color",
      type: "hexColor",
      initialValue: "#FFFFFF",
    }),
  ],
  preview: {
    select: { title: "name.0.value", subtitle: "quote.0.value", media: "image.asset" },
  },
});
