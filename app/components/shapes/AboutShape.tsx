import type { SVGAttributes } from "react";
import { useId } from "react";

import ShapeMedia from "./ShapeMedia";

type Props = Omit<
  SVGAttributes<SVGSVGElement>,
  "viewBox" | "xmlns" | "fill" | "width" | "height"
> & {
  /** Width in px. Height auto-derives from the source SVG's aspect ratio. */
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
   * SVG `preserveAspectRatio` value for the image. Defaults to centred
   * (`xMidYMid slice`). Use `xMidYMin slice` to anchor the crop to the
   * top of the photo (e.g. to keep a subject's face from being cut off).
   */
  imagePosition?: string;
};

const VIEWBOX = "0 0 668 420";
const W = 668;
const H = 420;
const ASPECT = H / W;
const PATH_D =
  "M668 300.617C668 307.99 662.023 313.968 654.649 313.968H369.334C361.961 313.968 355.983 319.945 355.983 327.318V405.701C355.983 413.074 350.006 419.052 342.633 419.052H13.3507C5.97731 419.052 0 413.074 0 405.701V85.3038C0 77.9304 5.9773 71.9531 13.3507 71.9531H174.028C181.402 71.9531 187.379 65.9758 187.379 58.6025V13.3507C187.379 5.9773 193.356 0 200.73 0H654.649C662.023 0 668 5.9773 668 13.3507V300.617Z";

export default function AboutShape({
  size = 668,
  imageSrc,
  videoSrc,
  imageAlt = "",
  fill = "#ffffff",
  imagePosition = "xMidYMid slice",
  className,
  ...rest
}: Props) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clipId = `about-clip-${rawId}`;
  const hasMedia = !!(imageSrc || videoSrc);

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
          width={W}
          height={H}
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
