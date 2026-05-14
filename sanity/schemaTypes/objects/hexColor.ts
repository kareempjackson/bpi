import { defineType } from "sanity";

import { HexColorInput } from "../../components/HexColorInput";

export const hexColor = defineType({
  name: "hexColor",
  title: "Hex color",
  type: "string",
  description: "Hex color, e.g. #CAF1FF.",
  components: {
    input: HexColorInput,
  },
  validation: (Rule) =>
    Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {
      name: "hex color",
      invert: false,
    }).error("Must be a 3- or 6-digit hex color, e.g. #CAF1FF."),
});
