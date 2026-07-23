import { HighlightIcon } from "@sanity/icons";
import { defineField } from "sanity";

/**
 * Alias type for rich-text bodies, registered so the internationalized-array
 * plugin can wrap it per-language (→ `internationalizedArrayPortableText`).
 *
 * The plugin rewrites this field's `name` to `value` inside each language
 * item, so the stored shape is:
 *   body: [{ _key, language: "en", value: [<portable text blocks>] }, …]
 *
 * Block + image cover every body on the site (article copy, bios, event
 * descriptions, etc.), so a single shared alias keeps the rich-text config
 * consistent everywhere.
 */
export const portableText = defineField({
  name: "portableText",
  title: "Body",
  type: "array",
  of: [
    {
      type: "block",
      // Standard on-brand toolbar. Styles map to the brand text styles in
      // <PortableTextBody>; decorators + the link annotation cover real
      // editorial needs without inviting off-brand formatting.
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bulleted", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
          // Blue emphasis — renders as the brand accent colour in
          // <PortableTextBody>. Used e.g. for the highlighted phrase in a
          // priority's "In practice" statement.
          { title: "Accent (blue)", value: "accent", icon: HighlightIcon },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "URL",
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ["http", "https", "mailto", "tel"],
                    allowRelative: true,
                  }),
              },
            ],
          },
        ],
      },
    },
    { type: "image", options: { hotspot: true } },
  ],
});
