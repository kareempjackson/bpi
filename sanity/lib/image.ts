import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

import { client } from "./client";
import type { ResolvedMedia, SanityImage } from "./types";

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export type ResolvedImage = {
  src: string;
  alt: string;
};

function resolveImageUrl(
  image: SanityImage,
  width: number | undefined,
): string | null {
  // Sanity nests the actual asset reference one level deeper because our
  // `imageWithAlt` schema names the upload field `asset` with `type: "image"`.
  const innerRef = image.asset?.asset?._ref;
  const outerRef = image.asset?._ref;
  const hasUpload = !!(innerRef || outerRef);
  if (!hasUpload) return null;
  let b = builder.image(image.asset as SanityImageSource);
  if (width) b = b.width(width);
  // `quality(75)` trims the source bytes Sanity serves per transform (it then
  // gets re-encoded by next/image). 75 is visually lossless for photos and is
  // allowlisted in next.config's `images.qualities`.
  return b.auto("format").quality(75).url();
}

/**
 * Image-only resolver used by callers that can't render video. When the
 * media is a video, returns the uploaded poster image (if any) so the
 * consumer can still render *something*.
 */
export function resolveImage(
  image: SanityImage | null | undefined,
  options?: { width?: number },
): ResolvedImage | null {
  if (!image) return null;
  const url = resolveImageUrl(image, options?.width);
  if (!url) return null;
  return { src: url, alt: image.alt ?? "" };
}

/**
 * Full media resolver — returns a discriminated union so consumers can
 * render `<Image>` for image media or `<video>` for video media.
 * `imageWithAlt` now supports both: when `kind === "video"` and a video
 * upload exists, returns a `video` result with the uploaded asset's
 * CDN URL as `src` and the (optional) image upload as `poster`.
 * Falls back to image rendering when no video is set.
 */
export function resolveMedia(
  image: SanityImage | null | undefined,
  options?: { width?: number },
): ResolvedMedia | null {
  if (!image) return null;
  const posterUrl = resolveImageUrl(image, options?.width);
  if (image.kind === "video" && image.videoUrl) {
    return {
      kind: "video",
      src: image.videoUrl,
      poster: posterUrl ?? undefined,
      alt: image.alt ?? "",
    };
  }
  if (!posterUrl) return null;
  return { kind: "image", src: posterUrl, alt: image.alt ?? "" };
}
