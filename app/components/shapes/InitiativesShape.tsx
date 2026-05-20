import type { SVGAttributes } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 414:551 aspect ratio. */
  size?: number;
  /** Optional image filling the shape. Without it, `fill` is used. */
  imageSrc?: string;
  /** Optional video filling the shape; takes precedence over imageSrc. */
  videoSrc?: string;
  /** Alt text used when media is provided. */
  imageAlt?: string;
  /** Solid fill when no media is provided. */
  fill?: string;
  /**
   * Apply a subtle cinematic treatment to the media: gentle teal/orange
   * colour grade, soft radial vignette, bottom scrim, and a slow Ken
   * Burns drift on the image. All layers render inside the SVG so they
   * stay clipped to the notched silhouette.
   */
  cinematic?: boolean;
};

const VIEWBOX = "0 0 414 551";
const W = 414;
const H = 551;
const ASPECT = H / W;
const PATH_D =
  "M36.5447 551.007C23.3532 551.007 16.7572 551.007 11.7737 547.423C7.92399 544.654 4.76592 540.444 2.68875 535.313C-0.000206251 528.67 -0.000186941 519.878 -0.000185403 502.294L-0.00014575 48.7128C-0.000144213 31.1291 -0.000161986 22.3369 2.6888 15.694C4.76597 10.5626 7.92404 6.35299 11.7737 3.58421C16.7573 -6.03422e-05 23.3532 -3.50501e-05 36.5448 -3.38969e-05L376.826 -4.14853e-06C390.018 -2.99529e-06 396.614 -2.71341e-05 401.597 3.58424C405.447 6.35303 408.605 10.5626 410.682 15.6941C413.371 22.337 413.371 31.1291 413.371 48.7129L413.371 396.44C413.371 412.455 413.371 420.462 410.107 426.512C407.585 431.186 403.751 435.019 399.078 437.541C393.028 440.805 385.021 440.805 369.006 440.805L309.678 440.805C297.296 440.805 287.258 454.185 287.258 470.691L287.258 506.642C287.258 522.656 287.258 530.664 283.993 536.714C281.472 541.387 277.638 545.221 272.965 547.742C266.915 551.007 258.907 551.007 242.893 551.007L36.5447 551.007Z";

export default function InitiativesShape({
  size = 414,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#E0F2FF",
  cinematic = false,
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `init-clip-${rawId}`;
  const filterId = `init-grade-${rawId}`;
  const vignetteId = `init-vignette-${rawId}`;
  const scrimId = `init-scrim-${rawId}`;
  const bloomId = `init-bloom-${rawId}`;
  const hasMedia = !!(imageSrc || videoSrc);
  const useCinematic = hasMedia && cinematic;

  return (
    <svg
      width={size}
      height={size * ASPECT}
      viewBox={VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={hasMedia ? "img" : undefined}
      aria-label={hasMedia ? imageAlt || undefined : undefined}
      {...rest}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={PATH_D} />
        </clipPath>
        {useCinematic ? (
          <>
            {/* Cinematic colour grade — gentle lift in midtones for
                clarity, a touch of warm highlights, and a whisper of
                cyan in the shadows. Tuned to keep the subject crisp
                rather than darken the frame. */}
            <filter
              id={filterId}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                type="matrix"
                values="
                  1.04 0    0    0  0.01
                  0    1.03 0    0  0.012
                  0.02 0    1.02 0  0.015
                  0    0    0    1  0"
              />
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.04" intercept="0.005" />
                <feFuncG type="linear" slope="1.04" intercept="0.005" />
                <feFuncB type="linear" slope="1.02" intercept="0.01" />
              </feComponentTransfer>
            </filter>
            <radialGradient
              id={vignetteId}
              cx="50%"
              cy="48%"
              r="82%"
              fx="50%"
              fy="48%"
            >
              <stop offset="45%" stopColor="rgba(0, 0, 54, 0)" />
              <stop offset="85%" stopColor="rgba(0, 0, 54, 0.18)" />
              <stop offset="100%" stopColor="rgba(0, 0, 54, 0.4)" />
            </radialGradient>
            <linearGradient id={scrimId} x1="0" y1="1" x2="0" y2="0.55">
              <stop offset="0%" stopColor="rgba(0, 0, 54, 0.42)" />
              <stop offset="60%" stopColor="rgba(0, 0, 54, 0.12)" />
              <stop offset="100%" stopColor="rgba(0, 0, 54, 0)" />
            </linearGradient>
            <radialGradient
              id={bloomId}
              cx="24%"
              cy="20%"
              r="55%"
            >
              <stop offset="0%" stopColor="rgba(255, 248, 220, 0.16)" />
              <stop offset="100%" stopColor="rgba(255, 248, 220, 0)" />
            </radialGradient>
          </>
        ) : null}
      </defs>
      {hasMedia ? (
        useCinematic ? (
          <g clipPath={`url(#${clipId})`}>
            {/* Slow Ken Burns — the image scales gently around its
                centre over ~20s so the photo never feels static. */}
            <g
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: "init-cinematic-drift 20s ease-in-out infinite",
              }}
            >
              <g filter={`url(#${filterId})`}>
                <ShapeMedia
                  clipId={clipId}
          pathD={PATH_D}
                  width={W}
                  height={H}
                  imageSrc={imageSrc}
                  imageAlt={imageAlt}
                  videoSrc={videoSrc}
                />
              </g>
            </g>
            {/* Soft directional bloom — a hint of warm light catching
                the upper-left of the frame. Reads as window light. */}
            <rect
              x="0"
              y="0"
              width={W}
              height={H}
              fill={`url(#${bloomId})`}
            />
            {/* Vignette — centre is clear, edges fall to a deep navy
                so the eye is drawn toward the subject. */}
            <rect
              x="0"
              y="0"
              width={W}
              height={H}
              fill={`url(#${vignetteId})`}
            />
            {/* Bottom scrim — a quiet graded floor so the lower edge
                feels weighted without dimming the subject. */}
            <rect
              x="0"
              y={H * 0.65}
              width={W}
              height={H * 0.35}
              fill={`url(#${scrimId})`}
            />
          </g>
        ) : (
          <ShapeMedia
            clipId={clipId}
          pathD={PATH_D}
            width={W}
            height={H}
            imageSrc={imageSrc}
            imageAlt={imageAlt}
            videoSrc={videoSrc}
          />
        )
      ) : (
        <path d={PATH_D} fill={fill} />
      )}
    </svg>
  );
}
