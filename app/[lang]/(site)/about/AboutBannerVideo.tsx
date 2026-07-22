"use client";

import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import MediaImage from "@/app/components/MediaImage";
import { Reveal } from "@/app/components/motion";
import type { ResolvedMedia } from "@/sanity/lib/types";

/**
 * Full-width about-page banner with a magnetic play/pause control.
 *
 * On a fine pointer, a sleek circular button trails the cursor across the
 * video — a rAF lerp eases it toward the pointer so it lags smoothly rather
 * than snapping. The button holds just the play/pause icon. The whole frame is
 * the click target, so a click always toggles even while the circle is
 * mid-trail. Coarse pointers (no hover) get a static centered button instead,
 * so touch users can still pause. The media itself sits in an oversized
 * `Parallax` clipped by the frame, drifting as the page scrolls.
 */
export default function AboutBannerVideo({ media }: { media: ResolvedMedia }) {
  const reduce = useReducedMotion();
  const controlRef = useRef<HTMLButtonElement>(null);
  const followRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(true);
  const [active, setActive] = useState(false);
  // Default to the fine-pointer (magnetic) branch: desktop is the common case
  // and renders identically on server and first client paint (no flash); a
  // coarse pointer corrects to the static button after mount.
  const [finePointer, setFinePointer] = useState(true);

  const isVideo = media.kind === "video";

  // The control is a direct child of the Reveal frame, so its parent holds the
  // one <video> — reach it without threading a ref through MediaImage/LazyVideo.
  const getVideo = useCallback(
    () => controlRef.current?.parentElement?.querySelector("video") ?? null,
    [],
  );

  // Mirror real playback state so the icon can never desync from the element.
  useEffect(() => {
    if (!isVideo) return;
    const video = getVideo();
    if (!video) return;
    const sync = () => setPlaying(!video.paused);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
    return () => {
      video.removeEventListener("play", sync);
      video.removeEventListener("pause", sync);
    };
  }, [isVideo, getVideo, finePointer]);

  // Fine pointer = has hover + a precise pointer (mouse/trackpad).
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const toggle = useCallback(() => {
    const video = getVideo();
    if (!video) return;
    if (video.paused) {
      // The click is a user gesture, so it's now safe to unmute — this is where
      // the banner's audio turns on.
      video.muted = false;
      void video.play();
    } else {
      video.pause();
    }
  }, [getVideo]);

  // rAF trail: ease the circle toward the cursor. Reduced motion snaps instantly.
  const loop = useCallback(() => {
    const el = followRef.current;
    if (el) {
      const p = posRef.current;
      const t = targetRef.current;
      const ease = reduce ? 1 : 0.2;
      p.x += (t.x - p.x) * ease;
      p.y += (t.y - p.y) * ease;
      el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [reduce]);

  const stopLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const placeAt = (x: number, y: number, snap: boolean) => {
    targetRef.current = { x, y };
    if (snap) posRef.current = { x, y };
    const el = followRef.current;
    if (el && snap) {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    }
  };

  const handleEnter = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Snap to the entry point so the circle appears under the cursor rather
    // than flying in from a stale position.
    placeAt(e.clientX - rect.left, e.clientY - rect.top, true);
    setActive(true);
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop);
  };

  const handleMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    placeAt(e.clientX - rect.left, e.clientY - rect.top, false);
  };

  const handleLeave = () => {
    setActive(false);
    stopLoop();
  };

  useEffect(() => stopLoop, [stopLoop]);

  const icon = playing ? (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-9"
    >
      <rect x="7" y="5" width="3.2" height="14" rx="1.4" />
      <rect x="13.8" y="5" width="3.2" height="14" rx="1.4" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-9 translate-x-0.5"
    >
      <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );

  // A sleek circular button holding just the play/pause icon. `scaleClass` lets
  // the fine-pointer branch scale it in as it appears, for a softer entrance.
  const circle = (scaleClass = "") => (
    <div
      className={`grid size-28 place-items-center rounded-full border border-white/20 bg-primary-500/30 text-white shadow-[0_16px_48px_-12px_rgba(0,0,54,0.55)] ring-1 ring-inset ring-white/10 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-premium)] ${scaleClass}`}
    >
      {icon}
    </div>
  );

  return (
    <Reveal
      preset="fade"
      className="relative aspect-2/1 rounded-lg overflow-hidden"
    >
      {/* Static, exact-fit wrapper — no parallax overscale, so the video (and
          its burned-in captions) render at their natural scale, un-zoomed. The
          frame is a touch shorter than the 16:9 source; anchoring the cover
          crop to the bottom trims only the top, keeping the low caption whole. */}
      <div className="absolute inset-0">
        <MediaImage
          media={media}
          sizes="100vw"
          eager
          objectPositionStyle="center bottom"
        />
      </div>

      {isVideo ? (
        finePointer ? (
          // Full-frame click target; the circle trails the cursor inside it.
          <button
            ref={controlRef}
            type="button"
            onClick={toggle}
            onMouseEnter={handleEnter}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            aria-label={playing ? "Pause video" : "Play video"}
            aria-pressed={!playing}
            className="absolute inset-0 z-10 cursor-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-error-500/70"
          >
            <span
              ref={followRef}
              className={`pointer-events-none absolute left-0 top-0 will-change-transform transition-opacity duration-300 ease-[var(--ease-premium)] ${
                active ? "opacity-100" : "opacity-0"
              }`}
            >
              {circle(active ? "scale-100" : "scale-90")}
            </span>
          </button>
        ) : (
          <button
            ref={controlRef}
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            aria-pressed={!playing}
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500/70"
          >
            {circle()}
          </button>
        )
      ) : null}
    </Reveal>
  );
}
