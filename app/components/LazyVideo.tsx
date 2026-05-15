"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = {
  src: string;
  poster?: string;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  /** Distance from viewport at which the video starts loading. Default "200px". */
  rootMargin?: string;
  /** Skip deferral entirely (e.g. above-the-fold). */
  eager?: boolean;
};

/**
 * `<video>` that defers loading until the element is near the viewport.
 *
 * Why: muted/autoplay videos on the page would otherwise fetch tens of
 * megabytes of MP4 on first paint even when scrolled far below the fold.
 * IntersectionObserver gates the network request — `preload="none"` until
 * the user is within `rootMargin` of the element, then we swap to
 * `preload="metadata"` and mount a `<source>` so the browser starts the
 * fetch / autoplay cycle.
 *
 * The `<video>` element itself is always in the DOM (with the `poster`)
 * so layout / aspect ratio stays stable; only the source bytes are
 * deferred.
 */
export default function LazyVideo({
  src,
  poster,
  className,
  style,
  ariaLabel,
  rootMargin = "200px",
  eager = false,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (eager || shouldLoad) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, rootMargin, shouldLoad]);

  return (
    <video
      ref={ref}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload={shouldLoad ? "metadata" : "none"}
      disableRemotePlayback
      disablePictureInPicture
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {shouldLoad ? <source src={src} /> : null}
    </video>
  );
}
