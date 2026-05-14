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
  return b.auto("format").url();
}

/**
 * Image-only resolver used by callers that can't render video. When the
 * media is a video, returns the poster image (if uploaded) or the
 * `fallbackSrc` (treated as the poster fallback) so the consumer can
 * still render *something*.
 */
export function resolveImage(
  image: SanityImage | null | undefined,
  options?: { width?: number },
): ResolvedImage | null {
  if (!image) return null;
  const alt = image.alt ?? "";

  const url = resolveImageUrl(image, options?.width);
  if (url) return { src: url, alt };
  if (image.fallbackSrc) return { src: image.fallbackSrc, alt };
  return null;
}

/**
 * Full media resolver — returns a discriminated union so consumers can
 * render `<video>` for video media and `<image>` / `<Image>` for image
 * media. Returns `null` when neither an upload nor a fallback is set.
 */
export function resolveMedia(
  image: SanityImage | null | undefined,
  options?: { width?: number; posterWidth?: number },
): ResolvedMedia | null {
  if (!image) return null;
  const alt = image.alt ?? "";

  if (image.kind === "video") {
    const src = image.videoUrl || image.videoFallbackSrc || undefined;
    if (!src) {
      // No video, fall through to the image branch — editor may have picked
      // video but not yet uploaded anything; show a poster image if any.
      const url = resolveImageUrl(image, options?.width);
      const imgSrc = url ?? image.fallbackSrc ?? null;
      if (!imgSrc) return null;
      return { kind: "image", src: imgSrc, alt };
    }
    const posterUrl =
      resolveImageUrl(image, options?.posterWidth ?? options?.width) ??
      image.fallbackSrc ??
      undefined;
    return {
      kind: "video",
      src,
      ...(posterUrl ? { poster: posterUrl } : {}),
      alt,
    };
  }

  // Default: image kind (or unset)
  const url = resolveImageUrl(image, options?.width);
  if (url) return { kind: "image", src: url, alt };
  if (image.fallbackSrc) return { kind: "image", src: image.fallbackSrc, alt };
  return null;
}
