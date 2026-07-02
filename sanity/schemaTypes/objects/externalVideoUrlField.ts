import { defineField } from "sanity";

import { R2AudioInput, R2VideoInput } from "../../components/R2VideoInput";

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

/**
 * Audio counterpart of {@link externalVideoUrlField}: uploads an audio file to
 * R2 (or accepts a pasted URL). Gated to the parent's `kind === "audio"`.
 */
export function externalAudioUrlField(gateByKind = true) {
  return defineField({
    name: "externalAudioUrl",
    title: "External audio URL (Cloudflare R2 / CDN)",
    type: "url",
    description:
      "Upload an audio file here to store it on Cloudflare R2. Used in place of a Sanity upload.",
    validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    components: { input: R2AudioInput },
    hidden: gateByKind
      ? ({ parent }) =>
          (parent as { kind?: string } | undefined)?.kind !== "audio"
      : undefined,
  });
}

/**
 * Legacy native-Sanity video upload, locked. New video bytes must go to
 * Cloudflare R2 via {@link externalVideoUrlField} so they never bill against
 * Sanity's bandwidth; this field is kept only so pre-R2 content still resolves
 * through the GROQ `coalesce(externalVideoUrl, video.asset->url)` fallback. It
 * is `readOnly`, and hidden unless a legacy asset already lives here (and, when
 * `gateByKind`, unless the parent's `kind` radio is "video") — so new content
 * only ever sees the R2 uploader above.
 */
export function sanityVideoField(gateByKind = true) {
  return defineField({
    name: "video",
    title: "Sanity video (legacy — locked, use the R2 field above)",
    type: "file",
    options: { accept: "video/mp4,video/webm" },
    readOnly: true,
    description:
      "Locked. Upload new videos via the Cloudflare R2 field above to keep them off Sanity's bandwidth.",
    hidden: ({ parent, value }) => {
      if (
        gateByKind &&
        (parent as { kind?: string } | undefined)?.kind !== "video"
      )
        return true;
      return !value;
    },
  });
}

/**
 * Audio counterpart of {@link sanityVideoField}: a locked, legacy native-Sanity
 * audio upload. New audio must use {@link externalAudioUrlField} (R2). Hidden
 * unless the parent's `kind` is "audio" and a legacy asset already lives here.
 */
export function sanityAudioField() {
  return defineField({
    name: "audio",
    title: "Sanity audio (legacy — locked, use the R2 field above)",
    type: "file",
    options: { accept: "audio/*" },
    readOnly: true,
    description:
      "Locked. Upload new audio via the Cloudflare R2 field above to keep it off Sanity's bandwidth.",
    hidden: ({ parent, value }) => {
      if ((parent as { kind?: string } | undefined)?.kind !== "audio")
        return true;
      return !value;
    },
  });
}
