import { defineField } from "sanity";

import { R2VideoInput } from "../../components/R2VideoInput";

/**
 * "Host the video on Cloudflare R2 (or any CDN) instead of uploading it to
 * Sanity." Pasting a direct file URL here makes the site use it in place of a
 * Sanity upload — every GROQ projection coalesces this over `video.asset->url`
 * — so heavy video bytes are served from R2 and never bill against Sanity's
 * bandwidth. Leave blank to fall back to a Sanity-hosted upload.
 *
 * `gateByKind` hides the field unless the parent's `kind` radio is "video"
 * (for the media objects that have one); pass `false` where the parent is
 * always a video (e.g. the hero feature card).
 */
export function externalVideoUrlField(gateByKind = true) {
  return defineField({
    name: "externalVideoUrl",
    title: "External video URL (Cloudflare R2 / CDN)",
    type: "url",
    description:
      "Upload a video here to store it on Cloudflare R2 (keeps large files off Sanity's bandwidth). Used in place of a Sanity upload.",
    validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    components: { input: R2VideoInput },
    hidden: gateByKind
      ? ({ parent }) =>
          (parent as { kind?: string } | undefined)?.kind !== "video"
      : undefined,
  });
}
