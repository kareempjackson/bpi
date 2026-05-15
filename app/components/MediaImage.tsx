import Image from "next/image";

import LazyVideo from "./LazyVideo";
import type { ResolvedMedia } from "../../sanity/lib/types";

/**
 * Universal renderer for a resolved media item — outputs `<Image>` for
 * image kind and a lazy `<LazyVideo>` for video kind, with matching
 * `object-cover` / `absolute inset-0` positioning.
 *
 * Mount inside a positioned wrapper (e.g. `relative` with `aspect-X/Y`).
 */
type Props = {
  media: ResolvedMedia;
  /** Responsive sizes hint for next/image (e.g. "(max-width: 768px) 100vw, 50vw"). */
  sizes: string;
  fill?: boolean;
  className?: string;
  /** Preload the image (Next 16). Use for above-the-fold / LCP candidates only. */
  preload?: boolean;
  /** Skip IntersectionObserver gating for the video branch (above-fold). */
  eager?: boolean;
  objectPositionStyle?: string;
};

export default function MediaImage({
  media,
  sizes,
  fill = true,
  className = "object-cover",
  preload,
  eager,
  objectPositionStyle,
}: Props) {
  if (media.kind === "video") {
    return (
      <LazyVideo
        src={media.src}
        poster={media.poster}
        eager={eager}
        ariaLabel={media.alt || undefined}
        className={
          fill ? `absolute inset-0 w-full h-full ${className}` : className
        }
        style={objectPositionStyle ? { objectPosition: objectPositionStyle } : undefined}
      />
    );
  }
  return (
    <Image
      src={media.src}
      alt={media.alt}
      fill={fill}
      sizes={sizes}
      preload={preload}
      className={className}
      style={objectPositionStyle ? { objectPosition: objectPositionStyle } : undefined}
    />
  );
}
