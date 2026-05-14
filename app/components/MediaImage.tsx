import Image from "next/image";

import type { ResolvedMedia } from "../../sanity/lib/types";

/**
 * Universal renderer for a resolved media item — outputs `<Image>` for
 * image kind and a muted/looping `<video>` for video kind, with matching
 * `object-cover` / `absolute inset-0` positioning. Used wherever a page
 * previously rendered a raw `next/image` against a Sanity image; now a
 * single component handles both upload types.
 *
 * Mount inside a positioned wrapper (e.g. `relative` with `aspect-X/Y`).
 */
type Props = {
  media: ResolvedMedia;
  /** Width/height hints for next/image. */
  sizes?: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  objectPositionStyle?: string;
};

export default function MediaImage({
  media,
  sizes,
  fill = true,
  className = "object-cover",
  priority,
  objectPositionStyle,
}: Props) {
  if (media.kind === "video") {
    return (
      <video
        src={media.src}
        poster={media.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        disableRemotePlayback
        disablePictureInPicture
        aria-label={media.alt || undefined}
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
      priority={priority}
      className={className}
      style={objectPositionStyle ? { objectPosition: objectPositionStyle } : undefined}
    />
  );
}
