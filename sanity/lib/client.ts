import { createClient } from "next-sanity";
import type { FilterDefault } from "next-sanity";

import { apiVersion, dataset, projectId, studioUrl } from "../env";

// Field-name segments that must NEVER carry stega characters, because their
// values are used structurally (as CSS colours, links, enum discriminants, or
// keys) rather than as display text. Encoding these corrupts the rendered
// preview — a hex colour or href with invisible chars stops working. Prose
// fields (heading, body, title, subtitle, description, …) are left encoded so
// click-to-edit overlays still work on text.
const NON_TEXT_KEY =
  /^(pageColor|headingColor|bg|cardBg|color|tone|layout|kind|variant|href|url|slug|columns|hex|_type|_key|_ref|_id)$/i;

const stegaFilter: FilterDefault = (props) => {
  const path = props.resultPath?.length ? props.resultPath : props.sourcePath;
  for (const seg of path) {
    if (typeof seg === "string" && NON_TEXT_KEY.test(seg)) return false;
  }
  // Defensive value checks — never encode a hex colour or a URL/path, even if
  // the field name slips past the list above.
  if (/^#[0-9a-fA-F]{3,8}$/.test(props.value)) return false;
  if (/^(https?:\/\/|\/|mailto:|tel:)/.test(props.value)) return false;
  return props.filterDefault(props);
};

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  // Stega source-linking. Encoding stays OFF for normal published reads and is
  // switched on only in draft/preview (the live fetch), where `studioUrl` lets
  // the Presentation tool turn rendered content into click-to-edit overlays.
  // `filter` keeps stega out of non-text fields so the preview renders exactly
  // like the real site.
  stega: { studioUrl, filter: stegaFilter },
});
