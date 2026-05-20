import type { SVGAttributes } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the 1200:632 aspect ratio. */
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
   * SVG `preserveAspectRatio` value for the image. Use this to control
   * which part of the photo stays visible after the slice crop. Defaults
   * to centred (`xMidYMid slice`). Use `xMidYMin slice` to anchor the
   * crop to the top of the photo (e.g. to keep a subject's face from
   * being cut off).
   */
  imagePosition?: string;
  /**
   * Fine-tune the image's vertical position inside the shape, in viewBox
   * units (full shape height is 632). Negative shifts the visible content
   * UP (crop more of the top); positive shifts it DOWN (crop more of the
   * bottom). The image's bbox is grown to keep the shape fully covered.
   */
  imageOffsetY?: number;
};

const VIEWBOX = "0 0 1200 632";
const W = 1200;
const H = 632;
const ASPECT = H / W;
const PATH_D =
  "M1164.47 0C1184.09 9.30105e-06 1200 14.988 1200 33.4766V342.299C1200 348.389 1200 354.621 1200 360.711V597.558C1200 616.046 1184.09 631.034 1164.47 631.034H694.597C674.974 631.034 659.067 616.046 659.067 597.558V415.775C659.067 393.684 641.159 375.775 619.067 375.775H35.5292C15.907 375.775 1.5739e-07 360.787 0 342.299V33.4766C0 14.988 15.907 1.95457e-07 35.5292 0H1164.47Z";

export default function UnionShape({
  size = 1200,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#cdffe6",
  imagePosition = "xMidYMid slice",
  imageOffsetY = 0,
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `union-clip-${rawId}`;
  const hasMedia = !!(imageSrc || videoSrc);
  // Grow the bbox by |offsetY| in the opposite direction so the shape
  // stays fully covered after the shift.
  const mediaY = imageOffsetY;
  const mediaHeight = H + Math.abs(imageOffsetY);

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
      </defs>
      {hasMedia ? (
        <ShapeMedia
          clipId={clipId}
          pathD={PATH_D}
          x={0}
          y={mediaY}
          width={W}
          height={mediaHeight}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
          videoSrc={videoSrc}
          imagePosition={imagePosition}
        />
      ) : (
        <path d={PATH_D} fill={fill} />
      )}
    </svg>
  );
}
