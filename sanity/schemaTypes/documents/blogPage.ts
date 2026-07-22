import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Singleton settings for the /blog index: the page SEO, the sidebar heading +
 * intro, and the editor-chosen featured post shown in the hero. When no
 * featured post is set, the page falls back to the most recent post.
 */
export const blogPage = defineType({
  name: "blogPage",
  title: "Blog page",
  type: "document",
  fields: [
    defineField({
      name: "heading",
      title: "Sidebar heading",
      type: "internationalizedArrayString",
      description: 'Shown above the filters, e.g. "Gems for BPI".',
    }),
    defineField({
      name: "intro",
      title: "Sidebar intro",
      type: "internationalizedArrayPortableText",
      description: "Short line under the heading.",
    }),
    defineField({
      name: "featuredPost",
      title: "Featured post",
      type: "reference",
      to: [{ type: "post" }],
      weak: true,
      description:
        "Shown in the large hero at the top of /blog. Leave blank to feature the most recent post.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "internationalizedArrayString",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "internationalizedArrayText",
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
    prepare: () => ({ title: "Blog page" }),
  },
});
