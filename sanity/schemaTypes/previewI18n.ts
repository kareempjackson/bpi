/**
 * Collapse an internationalized-array field to a plain string for Studio
 * previews.
 *
 * `internationalizedArray*` fields are stored as `[{ _key, language, value }]`.
 * A preview `select` path like `field.0.value` resolves fine in GROQ-backed
 * document-list previews, but the in-form preview for an array *item* does not
 * collapse it — it hands the whole array to `title`/`subtitle`, and Studio then
 * throws "The 'title' field should be a string … instead saw array".
 *
 * So any object rendered as an array item must `select` the bare field and run
 * it through this in `prepare`. Returns the English value, else the first, else
 * undefined (a valid, empty preview title).
 */
export function i18nValue(field: unknown): string | undefined {
  if (typeof field === "string") return field;
  if (Array.isArray(field)) {
    const items = field as { language?: string; value?: unknown }[];
    const value = (items.find((i) => i?.language === "en") ?? items[0])?.value;
    return flattenValue(value);
  }
  return undefined;
}

/**
 * A localized `value` is a plain string for `internationalizedArrayText`, but a
 * Portable Text block array once the field is upgraded to WYSIWYG. Collapse
 * either to a preview string (blocks → their concatenated span text) so previews
 * never hand Studio an array (which throws "should be a string … saw array").
 */
function flattenValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const text = value
      .map((block) => {
        const children = (block as { children?: { text?: string }[] })
          ?.children;
        return Array.isArray(children)
          ? children.map((span) => span?.text ?? "").join("")
          : "";
      })
      .filter(Boolean)
      .join(" ");
    return text || undefined;
  }
  return undefined;
}
