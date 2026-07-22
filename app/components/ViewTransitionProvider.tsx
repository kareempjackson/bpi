"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Cinematic page navigation.
 *
 * Two modes:
 *
 *  • `zoomReveal` (the sector nodes) — a "dive through the porthole" open. A
 *    clone of the clicked node's LIVE video/image zooms from the node's
 *    on-screen circle to fill the viewport (the media keeps playing — the
 *    View Transitions API can't do this, it freezes video to a snapshot), the
 *    route loads behind the full-screen media, then the media dissolves to
 *    reveal the destination page. No flat colour field at any point.
 *
 *  • `navigate` (general links) — the native View Transitions crossfade/iris
 *    (see globals.css `::view-transition-*`). Kept for wiring the rest of the
 *    site through the same premium open.
 */

type Origin = { x: number; y: number };

type ZoomRevealOptions = {
  href: string;
  /** Centre of the clicked node in viewport px. */
  centerX: number;
  centerY: number;
  /** The node's on-screen diameter in px. */
  diameter: number;
  /** Live media to zoom — video preferred, image as fallback/poster. */
  videoSrc?: string;
  imageSrc?: string;
  /**
   * The porthole video's playback position (seconds) at click time. The zoom
   * clone seeks here on mount so the dive continues from the exact frame the
   * node was showing — no restart-from-zero flash — and the same position is
   * handed to the destination hero video so playback never breaks.
   */
  videoTime?: number;
};

type ViewTransitionContextValue = {
  /** VT crossfade/iris navigation (general links). */
  navigate: (href: string, origin?: Origin) => void;
  /** "Dive through the porthole" open from a media node. */
  zoomReveal: (opts: ZoomRevealOptions) => void;
};

const ViewTransitionContext = createContext<ViewTransitionContextValue | null>(
  null,
);

export function useViewTransitionNav() {
  return useContext(ViewTransitionContext);
}

type StartViewTransition = (
  callback: () => void | Promise<void>,
) => { finished?: Promise<void> };

const EASE = "var(--ease-premium)";
// Deliberate dive: a controlled ease-in-out from the node to full-screen.
const DIVE_EASE = "cubic-bezier(0.66, 0, 0.34, 1)";
// Weighted settle: a strong ease-out so the media lands and rests on the hero.
const LAND_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
// Zoom the node media to full-screen.
const ZOOM_MS = 780;
// Fly the full-screen media into the destination hero's rect (one shot).
const LAND_MS = 720;
// Fallback dissolve when the destination has no matching hero to land on.
const FADE_MS = 600;
// Beat after the media covers + route commits, before the reveal.
const SETTLE_MS = 80;
// Minimum time the media rests full-screen before it settles into the hero —
// so a fast (prerendered) route still gets a composed hold, not an instant land.
const HOLD_MIN_MS = 340;
// Slow "Ken Burns" push while full-screen — the held beat feels like a composed
// shot, not a frozen frame. Eases back to 1 as it lands so it matches the hero.
const KENBURNS_MS = 5200;
const KENBURNS_SCALE = 1.06;
// Deliberate, matched framing for the zoomed media AND the destination hero —
// a slight upward bias flatters most footage. Both use this exact value so the
// subject stays anchored through the whole shot and the handoff is seamless.
export const MEDIA_OBJECT_POSITION = "50% 42%";
// Safety net so a stalled route can never leave the overlay/VT stuck.
const STALL_MS = 5000;

/** The destination hero the zoomed media flies into (viewport px). */
type LandRect = { top: number; left: number; width: number; height: number };

type Phase = "idle" | "zooming" | "holding" | "revealing";

export default function ViewTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // ── Native View Transitions (general links) ───────────────────────────
  const pendingResolve = useRef<(() => void) | null>(null);
  const vtStallTimer = useRef<number | null>(null);

  const settleVT = useCallback(() => {
    if (vtStallTimer.current !== null) {
      window.clearTimeout(vtStallTimer.current);
      vtStallTimer.current = null;
    }
    const resolve = pendingResolve.current;
    pendingResolve.current = null;
    resolve?.();
  }, []);

  // Route committed → let the browser capture the new page and animate.
  useEffect(() => {
    if (pendingResolve.current) settleVT();
  }, [pathname, settleVT]);

  // Resolve any in-flight VT on unmount.
  useEffect(() => settleVT, [settleVT]);

  const navigate = useCallback(
    (href: string, origin?: Origin) => {
      const doc = document as Document & {
        startViewTransition?: StartViewTransition;
      };
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (typeof doc.startViewTransition !== "function" || reduce) {
        startTransition(() => router.push(href));
        return;
      }
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--vt-origin-x", origin ? `${origin.x}px` : "50%");
      rootStyle.setProperty("--vt-origin-y", origin ? `${origin.y}px` : "50%");
      doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            pendingResolve.current = resolve;
            vtStallTimer.current = window.setTimeout(settleVT, STALL_MS);
            startTransition(() => router.push(href));
          }),
      );
    },
    [router, settleVT],
  );

  // ── Zoom-reveal (media nodes) ─────────────────────────────────────────
  const [overlay, setOverlay] = useState<ZoomRevealOptions | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  // `armed` flips one frame after mount so the media box transitions from the
  // node's circle to full-screen (a same-render value change wouldn't animate).
  const [armed, setArmed] = useState(false);
  // The zoom clone starts hidden and is only shown — and the zoom only armed —
  // once it has actually seeked to the porthole's frame. Until then the live
  // porthole video shows straight through the transparent overlay box (they sit
  // in the exact same spot), so there's no blank-then-repaint blink when the
  // fresh <video> loads and seeks. Image nodes are ready immediately.
  const [mediaReady, setMediaReady] = useState(false);
  const mediaReadyTimer = useRef<number | null>(null);
  // The destination hero's measured rect. When set, the full-screen media flies
  // into it (the "unbroken shot"); when null, the reveal is a plain dissolve.
  const [landRect, setLandRect] = useState<LandRect | null>(null);
  const zoomDoneRef = useRef(false);
  const arrivedRef = useRef(false);
  // Gates the settle so the media rests full-screen for at least HOLD_MIN_MS.
  const minHoldRef = useRef(false);
  const zoomStartPathRef = useRef<string | null>(null);
  const zoomHrefRef = useRef("");
  // The live zoom-clone <video>, so we can (a) seek it to the porthole's
  // playback position on mount and (b) read its position at the handoff to
  // continue the destination hero video from the same frame.
  const overlayVideoRef = useRef<HTMLVideoElement | null>(null);
  const zoomStallTimer = useRef<number | null>(null);
  const minHoldTimer = useRef<number | null>(null);

  const tryReveal = useCallback(() => {
    if (zoomDoneRef.current && arrivedRef.current && minHoldRef.current) {
      setPhase((p) => (p === "idle" || p === "revealing" ? p : "revealing"));
    }
  }, []);

  const zoomReveal = useCallback(
    (opts: ZoomRevealOptions) => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduce) {
        startTransition(() => router.push(opts.href));
        return;
      }
      if (phase !== "idle") return;
      zoomDoneRef.current = false;
      arrivedRef.current = false;
      minHoldRef.current = false;
      zoomStartPathRef.current = pathname;
      zoomHrefRef.current = opts.href;
      setArmed(false);
      // Image nodes have nothing to seek, so they're ready at once; video nodes
      // flip ready from the clone's presented-frame callback (or the safety timer).
      setMediaReady(!opts.videoSrc || !opts.videoTime);
      setOverlay(opts);
      setPhase("zooming");
      // The route push fires only once the media has covered the screen (the
      // zoom-done effect), so the outgoing page stays intact behind the
      // porthole while it opens.
    },
    [phase, pathname, router],
  );

  // Safety net: never let a stalled seek block the open. If the clone hasn't
  // reported ready shortly after mount, proceed anyway (worst case a small
  // repaint, better than a hang).
  useEffect(() => {
    if (phase !== "zooming" || mediaReady) return;
    mediaReadyTimer.current = window.setTimeout(() => setMediaReady(true), 260);
    return () => {
      if (mediaReadyTimer.current !== null) {
        window.clearTimeout(mediaReadyTimer.current);
        mediaReadyTimer.current = null;
      }
    };
  }, [phase, mediaReady]);

  // Arm the box transition one paint after the clone is ready (double rAF), so
  // the zoom only begins once the clone is showing the porthole's exact frame —
  // the swap from the live porthole to the clone is then invisible.
  useEffect(() => {
    if (phase !== "zooming" || !mediaReady) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [phase, mediaReady]);

  // Media has covered the screen → push the route (it loads behind the
  // full-screen media) and start watching for the commit. Timed from `armed`
  // (the actual zoom start), not the phase change, so the delay spent waiting
  // for the clone to seek doesn't eat into the zoom's on-screen duration.
  useEffect(() => {
    if (phase !== "zooming" || !armed) return;
    const t = window.setTimeout(() => {
      zoomDoneRef.current = true;
      setPhase((p) => (p === "zooming" ? "holding" : p));
      startTransition(() => router.push(zoomHrefRef.current));
      // Compose a minimum full-screen hold before the settle is allowed.
      minHoldTimer.current = window.setTimeout(() => {
        minHoldRef.current = true;
        tryReveal();
      }, HOLD_MIN_MS);
      zoomStallTimer.current = window.setTimeout(() => {
        arrivedRef.current = true;
        minHoldRef.current = true;
        setPhase("revealing");
      }, STALL_MS);
      tryReveal();
    }, ZOOM_MS);
    return () => window.clearTimeout(t);
  }, [phase, armed, router, tryReveal]);

  // Route committed → mark arrived, maybe reveal.
  useEffect(() => {
    if (phase === "idle" || phase === "revealing") return;
    if (
      zoomStartPathRef.current !== null &&
      pathname !== zoomStartPathRef.current
    ) {
      arrivedRef.current = true;
      tryReveal();
    }
  }, [pathname, phase, tryReveal]);

  // Reveal → measure the destination hero and fly the media into it (one
  // continuous shot); if there's no hero to land on, dissolve instead. Then
  // tear the overlay down — coincident with the same-asset hero, so invisible.
  useEffect(() => {
    if (phase !== "revealing") return;
    if (zoomStallTimer.current !== null) {
      window.clearTimeout(zoomStallTimer.current);
      zoomStallTimer.current = null;
    }
    if (minHoldTimer.current !== null) {
      window.clearTimeout(minHoldTimer.current);
      minHoldTimer.current = null;
    }
    let raf1 = 0;
    let raf2 = 0;
    const timers: number[] = [];
    // Two frames so the committed destination has painted before we measure.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const hero =
          document.querySelector<HTMLElement>("[data-sector-hero]");
        let landing = false;
        if (hero) {
          const r = hero.getBoundingClientRect();
          const vh = window.innerHeight;
          // Only land if the hero is actually on-screen; else a fly to an
          // off-screen rect would look like the shot dropping away.
          if (
            r.width > 0 &&
            r.height > 0 &&
            r.top < vh * 0.9 &&
            r.bottom > vh * 0.1
          ) {
            setLandRect({
              top: r.top,
              left: r.left,
              width: r.width,
              height: r.height,
            });
            landing = true;
          }
        }

        const finish = () => {
          setPhase("idle");
          setOverlay(null);
          setArmed(false);
          setLandRect(null);
        };

        if (landing) {
          const heroVideo = hero?.querySelector<HTMLVideoElement>("video");
          const clone = overlayVideoRef.current;
          // Start the hero video playing behind the (opaque) clone during the
          // whole fly-in so it's warm and decoding by hand-off time.
          if (heroVideo) {
            const p = heroVideo.play();
            if (p && typeof p.catch === "function") p.catch(() => {});
          }

          if (heroVideo && clone) {
            // Frame-matched HARD CUT — the only seamless way to swap two copies
            // of the same clip. A crossfade would double-expose the (slightly
            // out-of-sync) frames and smear; a hard cut on identical frames is
            // invisible. Sequence, after the fly-in lands:
            //   1. Freeze the clone on its current frame N (pause).
            //   2. Seek the hero to N.
            //   3. Wait until the hero has actually PRESENTED N (rVFC).
            //   4. Start the hero, remove the clone in the same tick.
            // The clone (frozen on N) and the hero (now showing N) are pixel-
            // identical at the cut, so nothing blinks and playback continues.
            timers.push(
              window.setTimeout(() => {
                const dur = heroVideo.duration;
                const n = Number.isFinite(clone.currentTime)
                  ? dur
                    ? clone.currentTime % dur
                    : clone.currentTime
                  : 0;
                clone.pause();
                try {
                  heroVideo.currentTime = n;
                } catch {
                  /* seek not ready yet — the fallback timer still cuts */
                }
                const rvfc = (
                  heroVideo as HTMLVideoElement & {
                    requestVideoFrameCallback?: (cb: () => void) => number;
                  }
                ).requestVideoFrameCallback;
                let cut = false;
                const doCut = () => {
                  if (cut) return;
                  cut = true;
                  const p = heroVideo.play();
                  if (p && typeof p.catch === "function") p.catch(() => {});
                  finish();
                };
                if (typeof rvfc === "function") {
                  rvfc.call(heroVideo, doCut);
                }
                // Fallback if rVFC is unavailable or the seek stalls.
                timers.push(window.setTimeout(doCut, 260));
              }, LAND_MS),
            );
          } else {
            // Image hero (or no clone): the clone's resting frame and the static
            // hero are both still, so an instant cut once the fly-in lands is
            // clean — no video to sync.
            timers.push(window.setTimeout(finish, LAND_MS));
          }
        } else {
          // No hero to land on: dissolve the whole overlay, then tear down.
          timers.push(
            window.setTimeout(finish, SETTLE_MS + FADE_MS + 60),
          );
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [phase]);

  const value = useMemo(
    () => ({ navigate, zoomReveal }),
    [navigate, zoomReveal],
  );

  const revealing = phase === "revealing";
  const active = phase !== "idle" && overlay !== null;
  // Landing = flying into a measured hero; fallbackFade = revealing with no
  // hero to land on (plain dissolve).
  const landing = revealing && landRect !== null;
  const fallbackFade = revealing && landRect === null;
  // Box geometry: node circle → full-screen → hero rect.
  const box: {
    top: string;
    left: string;
    width: string;
    height: string;
    radius: string;
  } = landing
    ? {
        top: `${landRect.top}px`,
        left: `${landRect.left}px`,
        width: `${landRect.width}px`,
        height: `${landRect.height}px`,
        radius: "0px",
      }
    : armed
      ? { top: "0px", left: "0px", width: "100vw", height: "100vh", radius: "0px" }
      : {
          top: `${(overlay?.centerY ?? 0) - (overlay?.diameter ?? 0) / 2}px`,
          left: `${(overlay?.centerX ?? 0) - (overlay?.diameter ?? 0) / 2}px`,
          width: `${overlay?.diameter ?? 0}px`,
          height: `${overlay?.diameter ?? 0}px`,
          radius: "9999px",
        };
  const boxDur = landing ? LAND_MS : ZOOM_MS;
  // Deliberate easing: ease-in-out on the dive, weighted ease-out on the settle.
  const boxEase = landing ? LAND_EASE : DIVE_EASE;
  // Framing + Ken Burns: anchor the crop, slow-push while full-screen, then ease
  // the push back to 1 as it lands so the media matches the (un-pushed) hero.
  const holding = phase === "holding";
  const mediaTween: CSSProperties = {
    objectPosition: MEDIA_OBJECT_POSITION,
    transform: `scale(${landing ? 1 : holding ? KENBURNS_SCALE : 1})`,
    transformOrigin: "center",
    transition: landing
      ? `transform ${LAND_MS}ms ${LAND_EASE}`
      : `transform ${KENBURNS_MS}ms ${EASE}`,
    willChange: "transform",
  };

  return (
    <ViewTransitionContext.Provider value={value}>
      {children}
      {active && overlay ? (
        <div
          className="fixed inset-0 z-9999 overflow-hidden pointer-events-none"
          aria-hidden
          style={{
            // Landing: the media flies into the hero rect, then hands off to the
            // live hero via a frame-matched hard cut (see the reveal effect) —
            // invisible because the frames are identical, no fade to smear them.
            // With no hero to land on, dissolve the whole overlay instead.
            opacity: fallbackFade ? 0 : 1,
            transform: fallbackFade ? "scale(1.04)" : "scale(1)",
            transformOrigin: "center",
            transition: fallbackFade
              ? `opacity ${FADE_MS}ms ${EASE} ${SETTLE_MS}ms, transform ${FADE_MS}ms ${EASE} ${SETTLE_MS}ms`
              : "none",
            willChange: "opacity, transform",
          }}
        >
          {/* Theatre dim — darkens the uncovered corners as you dive in, then
              clears as the media lands so the destination shows around it. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#02120b",
              opacity: revealing ? 0 : armed ? 0.55 : 0,
              transition: `opacity ${revealing ? boxDur : ZOOM_MS}ms ${EASE}`,
            }}
          />
          {/* Media box — a live clone of the node: node circle → full-screen →
              destination hero. Interpolating the box (not a transform) carries
              the square porthole into the landscape frame naturally. */}
          <div
            className="absolute overflow-hidden"
            style={{
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
              borderRadius: box.radius,
              boxShadow:
                armed || landing
                  ? "0 0 0 rgba(140,245,184,0)"
                  : "0 0 70px rgba(140,245,184,0.4)",
              transition: [
                `top ${boxDur}ms ${boxEase}`,
                `left ${boxDur}ms ${boxEase}`,
                `width ${boxDur}ms ${boxEase}`,
                `height ${boxDur}ms ${boxEase}`,
                `border-radius ${boxDur}ms ${boxEase}`,
                `box-shadow ${boxDur}ms ${boxEase}`,
              ].join(", "),
            }}
          >
            {overlay.videoSrc ? (
              <video
                ref={overlayVideoRef}
                src={overlay.videoSrc}
                poster={overlay.imageSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                disableRemotePlayback
                disablePictureInPicture
                onLoadedMetadata={(e) => {
                  // Continue from the porthole's frame instead of restarting at
                  // zero. Kept hidden (opacity 0) until the seeked frame is
                  // actually PRESENTED (rVFC) so the seek's blank frame never
                  // shows — the live porthole behind covers it until then.
                  const t = overlay.videoTime;
                  const v = e.currentTarget as HTMLVideoElement & {
                    requestVideoFrameCallback?: (cb: () => void) => number;
                  };
                  if (t && Number.isFinite(t) && v.duration) {
                    v.currentTime = t % v.duration;
                    if (typeof v.requestVideoFrameCallback === "function") {
                      v.requestVideoFrameCallback(() => setMediaReady(true));
                    }
                  } else {
                    setMediaReady(true);
                  }
                }}
                onSeeked={() => setMediaReady(true)}
                onPlaying={() => setMediaReady(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  // Instant (no transition): once ready the clone shows the
                  // identical frame the porthole is showing, so the swap is
                  // imperceptible; a fade would double-expose the same image.
                  opacity: mediaReady ? 1 : 0,
                  ...mediaTween,
                }}
              />
            ) : overlay.imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={overlay.imageSrc}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  ...mediaTween,
                }}
              />
            ) : null}
            {/* Soft cinematic vignette on the zoomed media — cleared as it
                lands so the media matches the un-vignetted hero at handoff. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)",
                // Off until the clone is shown, so it never darkens the live
                // porthole peeking through the not-yet-ready overlay box.
                opacity: revealing || !mediaReady ? 0 : 1,
                transition: `opacity ${boxDur}ms ${EASE}`,
              }}
            />
          </div>
        </div>
      ) : null}
    </ViewTransitionContext.Provider>
  );
}
