import type { PortableTextBlock } from "@/sanity/lib/types";

/**
 * Coerce a value that may be Portable Text (rich text), a plain string, or
 * null/undefined into a safe plain string for rendering as a raw React child.
 *
 * Why this exists: several inline fields are typed `string` but are backed by
 * `loc()` in GROQ, which returns whatever is stored. If the WYSIWYG rollout
 * switches such a field to a Portable Text type in Sanity, the raw `{field}`
 * render becomes an object and React throws "Objects are not valid as a React
 * child … {_key,_type,children,markDefs,style}", which aborts the static build.
 * Wrapping the render in `plainText()` makes that impossible — a block array is
 * flattened to its text (marks dropped); a string passes through unchanged.
 *
 * For fields that are meant to render rich formatting, use `PortableTextBody`
 * instead — this helper is only for genuinely inline / single-line contexts.
 */
export function plainText(
  value: PortableTextBlock[] | string | null | undefined,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => {
      const children = (block as { children?: { text?: string }[] } | null)
        ?.children;
      if (!Array.isArray(children)) return "";
      return children.map((span) => span?.text ?? "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}
