import { defineField, defineType } from "sanity";

/**
 * One editable typography style (font, size, line-height, letter-spacing,
 * weight, transform). Used once per named brand text style inside the
 * `brandSettings` singleton's Typography group. The values feed the runtime
 * `<BrandTheme>` injector, which maps them onto the `--brand-<style>-*` CSS
 * variables consumed by the `.type-<style>` classes in globals.css.
 */
export const typeStyle = defineType({
  name: "typeStyle",
  title: "Text style",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({
      name: "font",
      title: "Font",
      type: "string",
      options: {
        list: [
          { title: "Display (Albert Sans)", value: "display" },
          { title: "Body (Metropolis)", value: "sans" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "size",
      title: "Size",
      description: "CSS length, e.g. 2.25rem or 36px.",
      type: "string",
    }),
    defineField({
      name: "lineHeight",
      title: "Line height",
      description: "Unitless (1.4) or a length (1.75rem).",
      type: "string",
    }),
    defineField({
      name: "letterSpacing",
      title: "Letter spacing",
      description: "e.g. -0.02em or 0.18em.",
      type: "string",
    }),
    defineField({
      name: "weight",
      title: "Weight",
      type: "string",
      options: {
        list: [
          { title: "Light (300)", value: "300" },
          { title: "Regular (400)", value: "400" },
          { title: "Medium (500)", value: "500" },
          { title: "Semibold (600)", value: "600" },
          { title: "Bold (700)", value: "700" },
        ],
      },
    }),
    defineField({
      name: "transform",
      title: "Text transform",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "UPPERCASE", value: "uppercase" },
        ],
        layout: "radio",
      },
      initialValue: "none",
    }),
  ],
});
